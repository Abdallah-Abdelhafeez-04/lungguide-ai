"""Public-web source lookup for diagnostic intake (search results + links)."""

from __future__ import annotations

import re
from html import unescape
from urllib.parse import parse_qs, unquote, urlparse

import httpx

from app.schemas import WebSource

TRUSTED_HOSTS = (
    "uspreventiveservicestaskforce.org",
    "cancer.gov",
    "cdc.gov",
    "nih.gov",
    "medlineplus.gov",
    "cancer.org",
    "lung.org",
    "who.int",
    "mayoclinic.org",
    "nhs.uk",
    "jama.com",
    "jamanetwork.com",
)

USER_AGENT = (
    "Mozilla/5.0 (compatible; LungGuideAI/0.1; educational retrieval; +http://localhost)"
)


def _unwrap_ddg_url(href: str) -> str:
    href = unescape(href).replace("&amp;", "&")
    if href.startswith("//"):
        href = "https:" + href
    parsed = urlparse(href)
    if "duckduckgo.com" in parsed.netloc and parsed.path.startswith("/l/"):
        uddg = parse_qs(parsed.query).get("uddg", [])
        if uddg:
            return unquote(uddg[0])
    return href


def _host(url: str) -> str:
    return urlparse(url).netloc.lower().removeprefix("www.")


def _is_trusted(url: str) -> bool:
    host = _host(url)
    return any(host == trusted or host.endswith("." + trusted) for trusted in TRUSTED_HOSTS)


def search_public_sources(query: str, limit: int = 5) -> list[WebSource]:
    """Search DuckDuckGo HTML and return titled links with snippets."""
    try:
        with httpx.Client(timeout=12.0, follow_redirects=True, headers={"User-Agent": USER_AGENT}) as client:
            response = client.post(
                "https://html.duckduckgo.com/html/",
                data={"q": query, "kl": "us-en"},
            )
            response.raise_for_status()
            html = response.text
    except Exception:
        return []

    results: list[WebSource] = []
    pattern = re.compile(
        r'<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>(.*?)</a>'
        r'.*?<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>(.*?)</a>',
        re.I | re.S,
    )
    fallback = re.compile(
        r'<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
        re.I | re.S,
    )

    matches = list(pattern.finditer(html))
    if not matches:
        matches = list(fallback.finditer(html))

    seen: set[str] = set()
    for match in matches:
        url = _unwrap_ddg_url(match.group(1))
        if not url.startswith("http"):
            continue
        if url in seen or "duckduckgo.com" in url:
            continue
        seen.add(url)
        title = re.sub(r"<[^>]+>", "", unescape(match.group(2))).strip()
        snippet = ""
        if match.lastindex and match.lastindex >= 3:
            snippet = re.sub(r"<[^>]+>", "", unescape(match.group(3))).strip()
        results.append(WebSource(title=title or _host(url), url=url, snippet=snippet[:400]))

    trusted = [item for item in results if _is_trusted(item.url)]
    other = [item for item in results if not _is_trusted(item.url)]
    ranked = trusted + other
    return ranked[:limit]


def format_web_sources(sources: list[WebSource]) -> str:
    if not sources:
        return "No additional public web sources were retrieved."
    lines = []
    for index, source in enumerate(sources, start=1):
        lines.append(
            f"[Web {index}] {source.title}\nURL: {source.url}\nSnippet: {source.snippet or 'N/A'}"
        )
    return "\n\n".join(lines)

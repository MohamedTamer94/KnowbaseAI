import time
import logging
from collections import deque
from urllib.parse import urlparse, urljoin, urldefrag

import requests
from bs4 import BeautifulSoup

MAX_PAGES = 25

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)


def normalize_url(url: str) -> str:
    url, _ = urldefrag(url)  # remove fragments
    parsed = urlparse(url)
    scheme = parsed.scheme or "http"
    netloc = parsed.netloc
    path = parsed.path.rstrip("/")
    return f"{scheme}://{netloc}{path}"


def extract_clean_text(soup: BeautifulSoup) -> str:
    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()

    text = soup.get_text(separator="\n")
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)


def crawl_website(
    start_url: str,
    max_depth: int = 2,
    delay: float = 0.5,
):
    visited = set()
    collected_blocks = []

    start_url = normalize_url(start_url)
    base_domain = urlparse(start_url).netloc

    queue = deque([(start_url, 0)])

    session = requests.Session()
    session.headers.update(
        {"User-Agent": "Mozilla/5.0 (compatible; SimpleCrawler/1.0)"}
    )

    logging.info("Starting crawl at %s", start_url)

    while queue:
        url, depth = queue.popleft()

        if depth > max_depth or url in visited:
            continue

        

        if len(visited) >= MAX_PAGES:
            logging.info("Page limit reached, stopping crawl")
            break


        visited.add(url)
        logging.info("Crawling (%d/%d): %s", depth, max_depth, url)

        try:
            response = session.get(url, timeout=5)
            response.raise_for_status()
        except requests.RequestException as e:
            logging.warning("Request failed for %s: %s", url, e)
            continue

        content_type = response.headers.get("Content-Type", "")
        if "text/html" not in content_type:
            logging.debug("Skipping non-HTML content: %s", url)
            continue

        soup = BeautifulSoup(response.text, "html.parser")
        text = extract_clean_text(soup)

        if text:
            collected_blocks.append(
                {"text": text, "source": {"url": url}}
            )
            logging.debug("Collected %d characters from %s", len(text), url)

        for link in soup.find_all("a", href=True):
            absolute_url = normalize_url(urljoin(url, link["href"]))
            parsed = urlparse(absolute_url)

            if parsed.netloc == base_domain and absolute_url not in visited:
                queue.append((absolute_url, depth + 1))

        time.sleep(delay)

    logging.info(
        "Crawl finished. Visited %d pages, collected %d blocks",
        len(visited),
        len(collected_blocks),
    )

    return collected_blocks

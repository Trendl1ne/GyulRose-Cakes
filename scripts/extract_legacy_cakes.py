"""Extract the existing live catalogue into a CMS-editable JSON array.

This is a one-time migration helper. It does not fetch or modify production.
"""

from __future__ import annotations

import json
import re
import unicodedata
from html import unescape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "legacy" / "index.html"
OUTPUT = ROOT / "src" / "data" / "cakes.json"
CONTENT_DIR = ROOT / "src" / "content" / "cakes"


def text(fragment: str) -> str:
    value = re.sub(r"<[^>]+>", " ", fragment)
    value = unescape(value)
    value = value.replace("Â£", "£").replace("â€™", "'").replace("â€“", "-")
    return re.sub(r"\s+", " ", value).strip()


def slugify(value: str) -> str:
    ascii_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")
    return slug or "cake"


def main() -> None:
    source = SOURCE.read_text(encoding="utf-8", errors="replace")
    section_match = re.search(
        r'<div class="catalog-grid">(?P<body>.*?)</section>\s*<!-- Order Section -->',
        source,
        flags=re.S,
    )
    if not section_match:
        raise SystemExit("Could not locate the legacy catalogue section")

    body = section_match.group("body")
    starts = list(re.finditer(r'<div class="catalog-item" data-category="([^"]+)">', body))
    cakes: list[dict[str, object]] = []
    seen: dict[str, int] = {}

    for index, start in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else len(body)
        block = body[start.start():end]

        def capture(pattern: str, default: str = "") -> str:
            match = re.search(pattern, block, flags=re.S | re.I)
            return text(match.group(1)) if match else default

        image_match = re.search(r'<img\s+src="([^"]+)"\s+alt="([^"]*)"', block, flags=re.I)
        if not image_match:
            continue

        title = capture(r"<h3>(.*?)</h3>")
        if not title:
            continue

        base_slug = slugify(title)
        seen[base_slug] = seen.get(base_slug, 0) + 1
        slug = base_slug if seen[base_slug] == 1 else f"{base_slug}-{seen[base_slug]}"
        category = start.group(1).strip().lower()
        if category in {"baby", "themed", "kids"}:
            category = "children-themed"

        price_raw = capture(r'<div class="price">(.*?)</div>')
        price_match = re.search(r"([0-9]+(?:\.[0-9]{1,2})?)", price_raw)
        price = float(price_match.group(1)) if price_match else 0

        description_matches = re.findall(r"<p(?![^>]*class=)[^>]*>(.*?)</p>", block, flags=re.S | re.I)
        description = text(description_matches[0]) if description_matches else "Made to order and personalised for your celebration."

        cakes.append(
            {
                "slug": slug,
                "title": title,
                "category": category,
                "image": "/" + image_match.group(1).replace("\\", "/"),
                "imageAlt": text(image_match.group(2)) or f"{title} by GyulRose Cakes",
                "flavour": capture(r'<p class="flavor">(.*?)</p>'),
                "description": description,
                "ingredients": capture(r'<div class="ingredients">(.*?)</div>').removeprefix("Contains: "),
                "priceFrom": price,
                "featured": len(cakes) < 9,
                "published": True,
            }
        )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(cakes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    for old_file in CONTENT_DIR.glob("*.json"):
        old_file.unlink()
    for cake in cakes:
        (CONTENT_DIR / f"{cake['slug']}.json").write_text(
            json.dumps(cake, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    print(f"Extracted {len(cakes)} cakes to {OUTPUT}")


if __name__ == "__main__":
    main()

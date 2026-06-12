#!/usr/bin/env python3
"""Generate city-specific landing pages from index.html template.

Each page is tailored for SEO targeting "dumpster rental [city]" searches:
unique title, meta description, h1, hero copy, schema locality, and canonical.
Run from the repo root: python3 generate-cities.py
"""
import os
import re

CITIES = [
    {"name": "Augusta", "state": "GA", "slug": "augusta-ga",
     "blurb": "From historic downtown to West Lake and beyond, we deliver to homes, contractors, and job sites across the CSRA"},
    {"name": "Aiken", "state": "SC", "slug": "aiken-sc",
     "blurb": "Whether you're cleaning out a barn in Aiken's horse country or remodeling near downtown, we're a quick call away"},
    {"name": "North Augusta", "state": "SC", "slug": "north-augusta-sc",
     "blurb": "Just across the Savannah River from Augusta, we deliver across every neighborhood in North Augusta"},
    {"name": "Grovetown", "state": "GA", "slug": "grovetown-ga",
     "blurb": "We serve Grovetown's fast-growing neighborhoods near Fort Eisenhower with fast drop-offs and 24hr service"},
    {"name": "Thomson", "state": "GA", "slug": "thomson-ga",
     "blurb": "Serving McDuffie County's residents and contractors throughout the Thomson area"},
    {"name": "Edgefield", "state": "SC", "slug": "edgefield-sc",
     "blurb": "Delivering throughout historic Edgefield County for cleanouts, renovations, and job sites"},
    {"name": "Trenton", "state": "SC", "slug": "trenton-sc",
     "blurb": "Serving Trenton and the surrounding Edgefield County communities west of Aiken"},
    {"name": "Beech Island", "state": "SC", "slug": "beech-island-sc",
     "blurb": "We deliver to Beech Island and the surrounding Aiken County area along the South Carolina side of the river"},
    {"name": "Appling", "state": "GA", "slug": "appling-ga",
     "blurb": "Serving Appling and the surrounding Columbia County area north of I-20"},
    {"name": "Dearing", "state": "GA", "slug": "dearing-ga",
     "blurb": "Serving Dearing and western McDuffie County along the I-20 corridor"},
]

BASE_URL = "https://rynodumps.com"


def transform_template(html, city):
    name, state, slug, blurb = city["name"], city["state"], city["slug"], city["blurb"]
    full_city = f"{name}, {state}"
    page_url = f"{BASE_URL}/dumpster-rental-{slug}/"

    # Title
    html = html.replace(
        "<title>RYNO Roll Off Dumpster Rental | Same Day Delivery & 24hr Service</title>",
        f"<title>Dumpster Rental {full_city} | RYNO Roll Off | Same Day Delivery & 24hr Service</title>"
    )

    # Meta description (replace whole content attribute)
    html = re.sub(
        r'content="RYNO Roll Off Dumpster Rental offers[^"]+"',
        f'content="Dumpster rental in {full_city}. RYNO Roll Off delivers 15, 20, and 30 yard roll off dumpsters across {name} with same day delivery and 24hr service. Call 706-339-3900 for a quote."',
        html
    )

    # Canonical
    html = html.replace(
        '<link rel="canonical" href="https://rynodumps.com/" />',
        f'<link rel="canonical" href="{page_url}" />'
    )

    # Schema fields
    html = html.replace('"@id": "https://rynodumps.com/#business"', f'"@id": "{page_url}#business"')
    html = html.replace('"url": "https://rynodumps.com/"', f'"url": "{page_url}"')
    html = html.replace(
        '"description": "Reliable roll off dumpster rental for homes, businesses, and job sites. 15, 20, and 30 yard dumpsters with same day delivery and 24hr service."',
        f'"description": "Dumpster rental in {full_city}. 15, 20, and 30 yard roll off dumpsters with same day delivery and 24hr service across {name} and the surrounding CSRA."'
    )
    html = html.replace(
        '"addressLocality": "Augusta",\n        "addressRegion": "GA",',
        f'"addressLocality": "{name}",\n        "addressRegion": "{state}",'
    )

    # Hero h1
    html = html.replace(
        'Reliable Roll Off <span class="text-ryno-orange">Dumpster Rental</span> for Homes, Businesses &amp; Job Sites.',
        f'Roll Off <span class="text-ryno-orange">Dumpster Rental</span> in {full_city}'
    )

    # Hero subtitle paragraph
    html = html.replace(
        "RYNO delivers clean 15, 20, and 30 yard dumpsters with fast drop-off, easy pickup, and dependable local service.\n            Call now to reserve your container today.",
        f"RYNO delivers clean 15, 20, and 30 yard roll off dumpsters across {full_city} with fast drop-off, easy pickup, and dependable local service. {blurb}. Call now to reserve your container today."
    )

    # Service Area section heading
    html = html.replace(
        "Serving the CSRA &amp; Surrounding Areas",
        f"Also Serving Areas Around {name}"
    )

    # The homepage links every city in the service area list; on a city's own
    # page, swap its link for a highlighted "(you are here)" marker
    c_full = f"{name}, {state}"
    linked_li = f'<li class="flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-ryno-orange"></span><a class="transition hover:text-ryno-orange" href="/dumpster-rental-{slug}/">{c_full}</a></li>'
    here_li = f'<li class="flex items-center gap-2 font-semibold text-ryno-orange"><span class="h-1.5 w-1.5 rounded-full bg-ryno-orange"></span>{c_full} (you are here)</li>'
    html = html.replace(linked_li, here_li)

    # Asset paths to absolute (so they resolve from subdirectories)
    html = html.replace('href="favicon.png"', 'href="/favicon.png"')
    html = html.replace('href="apple-touch-icon.png"', 'href="/apple-touch-icon.png"')
    html = html.replace('href="styles.css"', 'href="/styles.css"')
    html = html.replace('src="script.js"', 'src="/script.js"')
    html = html.replace('src="Ryno Logos/', 'src="/Ryno%20Logos/')
    html = html.replace('src="Ryno Photos/', 'src="/Ryno%20Photos/')

    # Header brand link goes to home root, not page anchor
    html = html.replace(
        '<a href="#home" class="flex items-center gap-3">',
        '<a href="/" class="flex items-center gap-3">'
    )

    return html


def main():
    with open('index.html') as f:
        template = f.read()

    for city in CITIES:
        dir_path = f"dumpster-rental-{city['slug']}"
        os.makedirs(dir_path, exist_ok=True)
        out_path = f"{dir_path}/index.html"
        with open(out_path, 'w') as f:
            f.write(transform_template(template, city))
        print(f"wrote {out_path}")


if __name__ == '__main__':
    main()

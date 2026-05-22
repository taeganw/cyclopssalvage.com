#!/usr/bin/env python3
"""
Fetches all active listings for the cyclopssalvage eBay store
via the Apify delicious_zebu/ebay-store-scraper Actor and writes
them to listings.json.

Required GitHub Secret:
  APIFY_API_TOKEN — Apify personal API token (Settings > Integrations)
"""

import json
import os
import sys
import time
import requests
from datetime import datetime, timezone

EBAY_SELLER    = "cyclopssalvage"
LISTINGS_FILE  = "listings.json"
ACTOR_ID       = "automation-lab~ebay-scraper"
APIFY_BASE     = "https://api.apify.com/v2"


def run_actor(api_token: str) -> str:
    """Start the actor run and return the run ID."""
    url = f"{APIFY_BASE}/acts/{ACTOR_ID}/runs"
    resp = requests.post(
        url,
        params={"token": api_token},
        json={
            "searchQueries": [f"seller:{EBAY_SELLER}"],
            "maxItems": 500,
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["data"]["id"]


def wait_for_run(run_id: str, api_token: str, poll_interval: int = 10) -> None:
    """Poll until the run reaches a terminal status."""
    url = f"{APIFY_BASE}/actor-runs/{run_id}"
    while True:
        resp = requests.get(url, params={"token": api_token}, timeout=30)
        resp.raise_for_status()
        status = resp.json()["data"]["status"]
        if status == "SUCCEEDED":
            return
        if status in ("FAILED", "TIMED-OUT", "ABORTED"):
            sys.exit(f"ERROR: Apify run {run_id} ended with status {status}.")
        print(f"  run status: {status} — waiting {poll_interval}s…")
        time.sleep(poll_interval)


def fetch_dataset(run_id: str, api_token: str) -> list[dict]:
    """Download all items from the run's default dataset."""
    url = f"{APIFY_BASE}/actor-runs/{run_id}/dataset/items"
    resp = requests.get(
        url,
        params={"token": api_token, "format": "json", "clean": "true"},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()


def normalise(item: dict) -> dict:
    """Map automation-lab/ebay-scraper output fields to the shape the front end expects."""
    price_raw = item.get("price", {})
    if isinstance(price_raw, dict):
        price_val = price_raw.get("value", "0.00")
        currency  = price_raw.get("currency", "USD")
    else:
        price_val = str(price_raw).lstrip("$").replace(",", "")
        currency  = "USD"

    buying_options = []
    if item.get("buyingFormat", "").upper() == "AUCTION":
        buying_options = ["AUCTION"]
    elif item.get("buyingFormat"):
        buying_options = ["FIXED_PRICE"]

    return {
        "id":             str(item.get("itemId", "")),
        "title":          item.get("title", ""),
        "price":          str(price_val),
        "currency":       currency,
        "condition":      item.get("condition", ""),
        "image":          item.get("thumbnail", item.get("image", "")),
        "url":            item.get("url", ""),
        "category":       item.get("category", ""),
        "category_id":    item.get("categoryId", ""),
        "buying_options": buying_options,
        "seller":         item.get("seller", {}).get("username", EBAY_SELLER) if isinstance(item.get("seller"), dict) else EBAY_SELLER,
    }


def main() -> None:
    api_token = os.environ.get("APIFY_API_TOKEN")
    if not api_token:
        print("ERROR: APIFY_API_TOKEN must be set.")
        sys.exit(1)

    print("Starting Apify eBay store scraper…")
    run_id = run_actor(api_token)
    print(f"  run ID: {run_id}")

    print("Waiting for run to complete…")
    wait_for_run(run_id, api_token)

    print("Downloading results…")
    raw_items = fetch_dataset(run_id, api_token)
    listings  = [normalise(i) for i in raw_items]

    output = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "seller":     "cyclopssalvage",
        "total":      len(listings),
        "listings":   listings,
    }

    with open(LISTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Done. {len(listings)} listings written to {LISTINGS_FILE}.")


if __name__ == "__main__":
    main()

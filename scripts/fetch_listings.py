#!/usr/bin/env python3
"""
Fetches all active listings for the cyclopssalvage eBay store
using the eBay Browse API and writes them to listings.json.

Required GitHub Secrets:
  EBAY_CLIENT_ID     — eBay App ID (Client ID)
  EBAY_CLIENT_SECRET — eBay Cert ID (Client Secret)
"""

import json
import os
import sys
import requests
from datetime import datetime, timezone

EBAY_SELLER   = "cyclopssalvage"
LISTINGS_FILE = "listings.json"

TOKEN_URL  = "https://api.ebay.com/identity/v1/oauth2/token"
SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search"
PAGE_SIZE  = 200


def get_access_token(client_id: str, client_secret: str) -> str:
    response = requests.post(
        TOKEN_URL,
        data={"grant_type": "client_credentials", "scope": "https://api.ebay.com/oauth/api_scope"},
        auth=(client_id, client_secret),
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def fetch_page(headers: dict, query: str, offset: int) -> dict:
    params = {
        "q":           query,
        "filter":      f"sellers:{{{EBAY_SELLER}}}",
        "limit":       PAGE_SIZE,
        "offset":      offset,
        "fieldgroups": "EXTENDED",
    }
    response = requests.get(SEARCH_URL, headers=headers, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def normalise(item: dict) -> dict:
    price_obj  = item.get("price", {})
    image_obj  = item.get("image", {})
    categories = item.get("categories", [{}])
    return {
        "id":             item.get("itemId", ""),
        "title":          item.get("title", ""),
        "price":          price_obj.get("value", "0.00"),
        "currency":       price_obj.get("currency", "USD"),
        "condition":      item.get("condition", ""),
        "image":          image_obj.get("imageUrl", ""),
        "url":            item.get("itemWebUrl", ""),
        "category":       categories[0].get("categoryName", "") if categories else "",
        "category_id":    categories[0].get("categoryId", "")   if categories else "",
        "buying_options": item.get("buyingOptions", []),
        "seller":         item.get("seller", {}).get("username", EBAY_SELLER),
    }


def fetch_all_listings(token: str) -> list[dict]:
    headers = {
        "Authorization":           f"Bearer {token}",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        "Content-Type":            "application/json",
    }

    seen    = {}  # id -> normalised item, deduplicates across queries
    queries = list("abcdefghijklmnopqrstuvwxyz0123456789")

    for query in queries:
        offset = 0
        while True:
            data  = fetch_page(headers, query, offset)
            items = data.get("itemSummaries", [])
            if not items:
                break
            for item in items:
                n = normalise(item)
                seen[n["id"]] = n
            total      = data.get("total", 0)
            new_offset = offset + PAGE_SIZE
            if new_offset >= total:
                break
            offset = new_offset
        print(f"  query '{query}' done — {len(seen)} unique listings so far…")

    return list(seen.values())


def main() -> None:
    client_id     = os.environ.get("EBAY_CLIENT_ID")
    client_secret = os.environ.get("EBAY_CLIENT_SECRET")

    if not client_id or not client_secret:
        print("ERROR: EBAY_CLIENT_ID and EBAY_CLIENT_SECRET must be set.")
        sys.exit(1)

    print("Fetching eBay OAuth token…")
    token = get_access_token(client_id, client_secret)

    print("Fetching listings…")
    listings = fetch_all_listings(token)

    output = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "seller":     EBAY_SELLER,
        "total":      len(listings),
        "listings":   listings,
    }

    with open(LISTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Done. {len(listings)} listings written to {LISTINGS_FILE}.")


if __name__ == "__main__":
    main()

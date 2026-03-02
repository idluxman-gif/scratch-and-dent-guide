#!/usr/bin/env python3
"""Merge Outscraper CSV into existing stores.js with aggressive cleaning."""

import csv
import re
import json
import os

CSV_PATH = r"C:\Claude Projects\Directories\Scratchanddentguide\Outscraper\Outscraper-20260302094311s52.csv"
STORES_JS = r"C:\Claude Projects\Directories\Scratchanddentguide\scratch-dent-guide\scratch-dent-guide\src\data\stores.js"

# ── BIG-BOX / CHAIN / NON-APPLIANCE BLOCKLIST (case-insensitive partial match) ──
BLOCKLIST_NAMES = [
    # Big-box retailers
    "home depot", "lowe's", "lowes", "best buy", "bestbuy", "walmart",
    "costco", "sam's club", "sams club", "target", "sears", "kmart",
    "jcpenney", "jc penney", "kohl's", "kohls", "menards",
    # Rent-to-own chains
    "aaron's", "aarons", "rent-a-center", "rent a center", "rentacenter",
    "flexshopper", "progressive leasing",
    # General discount / dollar stores
    "dollar tree", "dollar general", "big lots", "ollie's", "ollies",
    "five below", "family dollar", "99 cents",
    # Electronics stores
    "micro center", "fry's electronics", "frys electronics",
    # Mattress-only chains
    "mattress firm", "sleep number", "casper",
    # Furniture-only chains
    "ashley furniture", "ashley homestore", "rooms to go",
    "wayfair", "la-z-boy", "lazy boy", "ethan allen", "pottery barn",
    "crate & barrel", "crate and barrel", "pier 1", "ikea", "restoration hardware",
    "bob's discount furniture", "bobs discount furniture",
    "city furniture", "havertys", "bassett furniture",
    # Restaurant / commercial equipment
    "restaurant supply", "restaurant equipment", "commercial kitchen",
    "foodservice", "food service equipment", "bar supply",
    "webstaurant", "katom", "quill",
    # HVAC-only
    "hvac", "heating and cooling", "heating & cooling",
    "air conditioning", "furnace",
    # Plumbing supply
    "plumbing supply", "plumbing wholesale", "ferguson enterprises",
    "ferguson bath", "supply house",
    # Hardware / home improvement
    "ace hardware", "true value", "do it best", "tractor supply",
    # Pawn shops
    "pawn shop", "pawn broker", "pawnshop", "pawnbroker",
    "ez pawn", "ezpawn", "first cash",
    # Thrift / goodwill / salvation army (not specifically appliance)
    "goodwill", "salvation army", "savers", "value village",
    "habitat for humanity restore", "habitat restore",
    # General merchandise / variety
    "tuesday morning", "marshalls", "tj maxx", "tjmaxx",
    "ross dress", "burlington",
    # Moving / storage
    "u-haul", "uhaul", "public storage", "extra space storage",
    # Auto parts / tires
    "autozone", "advance auto", "o'reilly auto", "napa auto",
    # Home services (not retail stores)
    "mr. appliance", "mr appliance", "sears home services",
    "sears home service", "a&e factory service",
    # Closed permanently indicator
    "permanently closed",
]

# Subtypes / categories that indicate NON-appliance businesses
BAD_CATEGORIES = [
    "furniture store", "mattress store", "thrift store", "pawn shop",
    "restaurant supply", "plumbing", "hvac", "hardware store",
    "home improvement store", "department store", "electronics store",
    "mobile phone shop", "cell phone store", "computer store",
    "building materials", "flooring", "carpet", "tile store",
    "lighting store", "cabinet store", "countertop", "granite",
    "moving company", "storage facility", "auto parts",
    "general contractor", "electrician", "handyman",
    "junk removal", "cleaning service", "pest control",
    "lawn care", "landscaping", "pool", "spa",
]

# Categories that CONFIRM it's an appliance store
GOOD_CATEGORIES = [
    "appliance store", "appliance repair", "used appliance",
    "appliance parts", "refrigerator", "washer", "dryer",
    "dishwasher", "stove", "oven", "range", "microwave",
]

# Name keywords that strongly suggest NOT an appliance store
BAD_NAME_KEYWORDS = [
    "tire", "tyre", "auto body", "car wash", "oil change",
    "barber", "salon", "spa ", "nail ", "beauty",
    "dental", "medical", "clinic", "hospital", "pharmacy",
    "veterinary", "vet ", "pet ", "grooming",
    "daycare", "school", "church", "temple",
    "law office", "attorney", "accountant", "tax service",
    "insurance", "real estate", "realty",
    "gym", "fitness", "yoga", "crossfit",
    "restaurant", "cafe", "coffee", "pizza", "burger",
    "bar ", "tavern", "pub ", "brewery", "winery",
    "hotel", "motel", "inn ", "resort",
    "gas station", "convenience store",
    "laundromat", "laundry", "dry cleaner",
    "florist", "flower",
    "jeweler", "jewelry",
    "tailor", "alteration",
    "print shop", "copy center",
    "liquor", "wine shop", "tobacco", "vape",
    "gun shop", "firearm",
    "boat", "marine", "rv ", "recreational vehicle",
    "trailer", "mobile home dealer",
]

def is_blocklisted(name_lower):
    """Check if name matches any blocklist entry."""
    for blocked in BLOCKLIST_NAMES:
        if blocked in name_lower:
            return True
    return False

def has_bad_name_keyword(name_lower):
    """Check if name contains non-appliance keywords."""
    for kw in BAD_NAME_KEYWORDS:
        if kw in name_lower:
            return True
    return False

def is_bad_category(subtypes_lower, category_lower):
    """Check if the category/subtypes suggest non-appliance."""
    combined = subtypes_lower + " " + category_lower
    # If it explicitly says "appliance" somewhere, it's probably OK
    if "appliance" in combined:
        return False
    # Check for bad categories
    for bad in BAD_CATEGORIES:
        if bad in combined:
            return True
    return False

def has_good_category(subtypes_lower, category_lower):
    """Check if explicitly an appliance store."""
    combined = subtypes_lower + " " + category_lower
    for good in GOOD_CATEGORIES:
        if good in combined:
            return True
    return False

def is_closed(row):
    """Check if the business is permanently closed."""
    status = row.get("business_status", "").strip().upper()
    return status == "CLOSED_PERMANENTLY"

def get_price_tier(name):
    """Determine price tier from name."""
    nl = name.lower()
    budget_keywords = ["discount", "budget", "bargain", "liquidat", "outlet",
                       "warehouse", "clearance", "scratch", "dent", "4 less",
                       "4less", "for less", "surplus", "salvage", "overstock"]
    premium_keywords = ["premium", "luxury", "designer", "high end", "high-end"]
    for kw in budget_keywords:
        if kw in nl:
            return "$"
    for kw in premium_keywords:
        if kw in nl:
            return "$$$"
    return "$$"

def normalize_phone(phone):
    """Strip phone to digits only for dedup comparison."""
    if not phone:
        return ""
    return re.sub(r'\D', '', phone)

def normalize_name(name):
    """Normalize name for dedup: lowercase, strip punctuation, collapse whitespace."""
    n = name.lower().strip()
    n = re.sub(r'[^a-z0-9 ]', '', n)
    n = re.sub(r'\s+', ' ', n)
    return n

def escape_js_string(s):
    """Escape single quotes and backslashes for JS single-quoted strings."""
    s = s.replace("\\", "\\\\")
    s = s.replace("'", "\\'")
    return s


# ── STEP 1: Parse existing stores.js ──
print("Reading existing stores.js...")
with open(STORES_JS, "r", encoding="utf-8") as f:
    content = f.read()

# Extract the array content between [ and ];
match = re.search(r'export const stores = \[(.*)\];', content, re.DOTALL)
if not match:
    raise ValueError("Could not parse stores.js")

array_content = match.group(1)

# Parse each store object using regex
existing_stores = []
# Match each {…} block
store_pattern = re.compile(r"\{([^}]+)\}")
for m in store_pattern.finditer(array_content):
    block = m.group(1)
    store = {}
    # Extract key:value pairs
    # n:'...',c:'...',...
    kv_pattern = re.compile(r"(\w+):'((?:[^'\\]|\\.)*)'|(\w+):([\d.]+)")
    for kv in kv_pattern.finditer(block):
        if kv.group(1):
            key = kv.group(1)
            val = kv.group(2).replace("\\'", "'").replace("\\\\", "\\")
            store[key] = val
        elif kv.group(3):
            key = kv.group(3)
            val = kv.group(4)
            if '.' in val:
                store[key] = float(val)
            else:
                store[key] = int(val)
    existing_stores.append(store)

print(f"  Existing stores: {len(existing_stores)}")

# Build dedup sets from existing data
existing_name_city_state = set()
existing_phones = set()
for s in existing_stores:
    key = (normalize_name(s.get('n', '')), s.get('c', '').lower().strip(), s.get('s', '').upper().strip())
    existing_name_city_state.add(key)
    phone = normalize_phone(s.get('p', ''))
    if phone and len(phone) >= 10:
        existing_phones.add(phone)

print(f"  Existing dedup keys: {len(existing_name_city_state)} name+city+state, {len(existing_phones)} phones")

# ── STEP 2: Parse new CSV ──
print("\nReading new Outscraper CSV...")
new_rows = []
with open(CSV_PATH, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        new_rows.append(row)

print(f"  Raw CSV rows: {len(new_rows)}")

# ── STEP 3: Clean and filter ──
print("\nCleaning and filtering...")
rejected = {
    "closed": [],
    "0_reviews": [],
    "no_reviews": [],
    "blocklisted": [],
    "bad_name": [],
    "bad_category": [],
    "duplicate_name_city": [],
    "duplicate_phone": [],
    "no_state": [],
    "no_name": [],
}

cleaned = []
# Track new entries for internal dedup too
new_name_city_state = set()
new_phones = set()

for row in new_rows:
    name = row.get("name", "").strip()
    city = row.get("city", "").strip()
    state = row.get("state_code", "").strip().upper()
    address = row.get("address", "").strip()
    phone = row.get("phone", "").strip()
    website = row.get("website", "").strip()
    rating_str = row.get("rating", "").strip()
    reviews_str = row.get("reviews", "").strip()
    subtypes = row.get("subtypes", "").strip()
    category = row.get("category", "").strip()

    # Skip if no name
    if not name:
        rejected["no_name"].append(name or "(empty)")
        continue

    # Skip if no state
    if not state or len(state) != 2:
        rejected["no_state"].append(name)
        continue

    # Skip permanently closed
    if is_closed(row):
        rejected["closed"].append(f"{name} ({city}, {state})")
        continue

    # Parse reviews
    try:
        reviews = int(float(reviews_str)) if reviews_str and reviews_str != "None" else 0
    except (ValueError, TypeError):
        reviews = 0

    # Skip 0 reviews
    if reviews == 0:
        rejected["0_reviews"].append(f"{name} ({city}, {state})")
        continue

    # Parse rating
    try:
        rating = round(float(rating_str), 1) if rating_str and rating_str != "None" else 0
    except (ValueError, TypeError):
        rating = 0

    name_lower = name.lower()
    subtypes_lower = subtypes.lower()
    category_lower = category.lower()

    # Blocklist check
    if is_blocklisted(name_lower):
        rejected["blocklisted"].append(f"{name} ({city}, {state})")
        continue

    # Bad name keywords check (only if not explicitly an appliance store)
    if has_bad_name_keyword(name_lower) and not has_good_category(subtypes_lower, category_lower):
        rejected["bad_name"].append(f"{name} ({city}, {state})")
        continue

    # Category check: if explicitly bad category and NOT also an appliance store
    if is_bad_category(subtypes_lower, category_lower) and not has_good_category(subtypes_lower, category_lower):
        rejected["bad_category"].append(f"{name} ({city}, {state})")
        continue

    # Additional heuristic: if name has NO mention of appliance-related words
    # AND category doesn't say appliance, it's likely junk from broad search
    appliance_signals = [
        "appliance", "refrigerat", "washer", "dryer", "dishwash", "stove",
        "oven", "range", "microwave", "freezer", "laundry", "kitchen",
        "scratch", "dent", "outlet", "discount", "warehouse", "liquidat",
        "surplus", "clearance", "overstock", "salvage", "bargain",
        "deals", "wholesale", "budget", "used appliance", "recondition",
        "refurbish", "scratch and dent", "scratch & dent", "scratch n dent",
    ]
    has_signal_in_name = any(sig in name_lower for sig in appliance_signals)
    has_signal_in_category = has_good_category(subtypes_lower, category_lower)

    if not has_signal_in_name and not has_signal_in_category:
        rejected["bad_category"].append(f"{name} ({city}, {state}) [no appliance signal]")
        continue

    # Dedup against existing stores
    dedup_key = (normalize_name(name), city.lower().strip(), state)
    if dedup_key in existing_name_city_state:
        rejected["duplicate_name_city"].append(f"{name} ({city}, {state})")
        continue

    # Dedup against other new entries
    if dedup_key in new_name_city_state:
        rejected["duplicate_name_city"].append(f"{name} ({city}, {state}) [intra-batch dup]")
        continue

    # Phone dedup
    phone_norm = normalize_phone(phone)
    if phone_norm and len(phone_norm) >= 10:
        if phone_norm in existing_phones or phone_norm in new_phones:
            rejected["duplicate_phone"].append(f"{name} ({city}, {state}) phone={phone}")
            continue
        new_phones.add(phone_norm)

    new_name_city_state.add(dedup_key)

    # Build store entry
    price = get_price_tier(name)
    store_entry = {
        'n': name,
        'c': city,
        's': state,
        'a': address,
        'p': phone,
        'w': website,
        'r': rating,
        'v': reviews,
        'pr': price,
    }
    cleaned.append(store_entry)

# ── STEP 4: Print rejection report ──
print("\n=== REJECTION REPORT ===")
total_rejected = 0
for reason, items in rejected.items():
    if items:
        print(f"\n  {reason.upper()} ({len(items)}):")
        for item in items[:15]:
            print(f"    - {item}")
        if len(items) > 15:
            print(f"    ... and {len(items) - 15} more")
        total_rejected += len(items)

print(f"\n  TOTAL REJECTED: {total_rejected}")
print(f"  TOTAL PASSING: {len(cleaned)}")

# ── STEP 5: Clean existing stores of empty/invalid entries ──
print(f"\n=== CLEANING EXISTING DATA ===")
valid_existing = [s for s in existing_stores if s.get('n', '').strip() and s.get('v', 0) > 0]
removed_existing = len(existing_stores) - len(valid_existing)
if removed_existing:
    print(f"  Removed {removed_existing} empty/invalid entries from existing data")
print(f"  Valid existing stores: {len(valid_existing)}")

# ── STEP 6: Merge ──
print(f"\n=== MERGE ===")
all_stores = valid_existing + cleaned
print(f"  Before merge: {len(valid_existing)} existing + {len(cleaned)} new = {len(all_stores)} total")

# Sort by review count descending
all_stores.sort(key=lambda s: s.get('v', 0), reverse=True)

# Re-index
for idx, store in enumerate(all_stores, 1):
    store['i'] = idx

# Count states
states = set(s.get('s', '') for s in all_stores)
print(f"  States: {len(states)}")

# New states
existing_states = set(s.get('s', '') for s in valid_existing)
new_states = states - existing_states
if new_states:
    print(f"  NEW states: {sorted(new_states)}")
else:
    print(f"  No new states")

# ── STEP 6: Extract tail content (stateNames + helper functions) from original file ──
print(f"\nExtracting tail content from original stores.js...")
# Find the end of the stores array ("];") and keep everything after it
tail_marker = "];\n"
marker_pos = content.find(tail_marker)
if marker_pos == -1:
    raise ValueError("Could not find ]; marker in stores.js")
tail_content = content[marker_pos + len(tail_marker):]

# Add new states to stateNames if needed
# Insert alphabetically: ME after MD, NH after NE
new_state_insertions = [
    ("MD:'Maryland',", "  ME:'Maine',"),
    ("NE:'Nebraska',", "  NH:'New Hampshire',"),
]
for after_line, new_line in new_state_insertions:
    if new_line.strip().split(":")[0] + ":'" not in tail_content:
        if after_line in tail_content:
            print(f"  Adding new state to stateNames: {new_line.strip()}")
            tail_content = tail_content.replace(
                f"  {after_line}",
                f"  {after_line}\n{new_line}"
            )

# ── STEP 7: Write stores.js ──
print(f"\nWriting stores.js with {len(all_stores)} stores...")
lines = ["export const stores = [\n"]
for store in all_stores:
    n = escape_js_string(store.get('n', ''))
    c = escape_js_string(store.get('c', ''))
    s = store.get('s', '')
    a = escape_js_string(store.get('a', ''))
    p = escape_js_string(store.get('p', ''))
    w = escape_js_string(store.get('w', ''))
    r = store.get('r', 0)
    v = store.get('v', 0)
    pr = store.get('pr', '$$')
    i = store.get('i', 0)

    # Format rating: always use decimal for consistency
    r_str = f"{r:.1f}" if r != int(r) or True else str(int(r))

    line = f"{{n:'{n}',c:'{c}',s:'{s}',a:'{a}',p:'{p}',w:'{w}',r:{r_str},v:{v},pr:'{pr}',i:{i}}},\n"
    lines.append(line)

lines.append("];\n")
# Append the preserved tail content
lines.append(tail_content)

with open(STORES_JS, "w", encoding="utf-8") as f:
    f.writelines(lines)

print(f"\nDone! Final store count: {len(all_stores)} across {len(states)} states")
print(f"Net new stores added: {len(cleaned)}")

# Print new stores list
if cleaned:
    print(f"\n=== NEW STORES ADDED ({len(cleaned)}) ===")
    for s in sorted(cleaned, key=lambda x: x['v'], reverse=True):
        print(f"  {s['n']} - {s['c']}, {s['s']} ({s['v']} reviews, {s['r']})")

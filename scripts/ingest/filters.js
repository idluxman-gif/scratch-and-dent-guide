/**
 * Filtering logic for store ingestion.
 * Determines whether a raw listing should be included or rejected.
 */

// ── Blocklist: chain names / non-appliance businesses ─────────────────────────
const BLOCKLIST_NAMES = [
  // Big-box retailers
  'home depot',"lowe's",'lowes','best buy','bestbuy','walmart',
  'costco',"sam's club",'sams club','target','sears','kmart',
  'jcpenney','jc penney',"kohl's",'kohls','menards',
  // Rent-to-own chains
  "aaron's",'aarons','rent-a-center','rent a center','rentacenter',
  // General discount / dollar stores
  'dollar tree','dollar general','big lots',"ollie's",'ollies',
  'five below','family dollar','99 cents',
  // Electronics chains
  'micro center',"fry's electronics",'frys electronics',
  // Mattress-only
  'mattress firm','sleep number','casper',
  // Furniture-only
  'ashley furniture','ashley homestore','rooms to go',
  'wayfair','la-z-boy','lazy boy','ethan allen','pottery barn',
  'crate & barrel','crate and barrel','pier 1','ikea','restoration hardware',
  "bob's discount furniture",'bobs discount furniture',
  'city furniture','havertys','bassett furniture',
  // Restaurant / commercial
  'restaurant supply','restaurant equipment','commercial kitchen',
  'foodservice','food service equipment','bar supply',
  'webstaurant','katom',
  // HVAC-only
  'hvac','heating and cooling','heating & cooling',
  'air conditioning','furnace',
  // Plumbing
  'plumbing supply','plumbing wholesale','ferguson enterprises',
  'ferguson bath','supply house',
  // Hardware
  'ace hardware','true value','do it best','tractor supply',
  // Pawn
  'pawn shop','pawn broker','pawnshop','pawnbroker',
  'ez pawn','ezpawn','first cash',
  // Thrift / charity
  'goodwill','salvation army','savers','value village',
  'habitat for humanity restore','habitat restore',
  // General merchandise
  'tuesday morning','marshalls','tj maxx','tjmaxx',
  'ross dress','burlington',
  // Moving / storage
  'u-haul','uhaul','public storage','extra space storage',
  // Auto
  'autozone','advance auto',"o'reilly auto",'napa auto',
  // Home services (not retail)
  'mr. appliance','mr appliance','sears home services','sears home service',
  'a&e factory service',
  // Closed
  'permanently closed',
];

const BAD_CATEGORIES = [
  'furniture store','mattress store','thrift store','pawn shop',
  'restaurant supply','plumbing','hvac','hardware store',
  'home improvement store','department store','electronics store',
  'mobile phone shop','cell phone store','computer store',
  'building materials','flooring','carpet','tile store',
  'lighting store','cabinet store','countertop','granite',
  'moving company','storage facility','auto parts',
  'general contractor','electrician','handyman',
  'junk removal','cleaning service','pest control',
  'lawn care','landscaping','pool','spa',
];

const GOOD_CATEGORIES = [
  'appliance store','appliance repair','used appliance',
  'appliance parts','refrigerator','washer','dryer',
  'dishwasher','stove','oven','range','microwave',
];

const BAD_NAME_KEYWORDS = [
  'tire ','tyre ','auto body','car wash','oil change',
  'barber','salon','nail ','beauty',
  'dental','medical','clinic','hospital','pharmacy',
  'veterinary','vet ','pet ','grooming',
  'daycare','school','church','temple',
  'law office','attorney','accountant','tax service',
  'insurance','real estate','realty',
  'gym','fitness','yoga','crossfit',
  'restaurant','cafe','coffee','pizza','burger',
  'bar ','tavern','pub ','brewery','winery',
  'hotel','motel','inn ','resort',
  'gas station','convenience store',
  'laundromat','laundry','dry cleaner',
  'florist','flower',
  'jeweler','jewelry',
  'tailor','alteration',
  'print shop','copy center',
  'liquor','wine shop','tobacco','vape',
  'gun shop','firearm',
  'boat','marine','rv ','recreational vehicle',
  'trailer','mobile home dealer',
];

const APPLIANCE_NAME_SIGNALS = [
  'appliance','refrigerat','washer','dryer','dishwash','stove',
  'oven','range','microwave','freezer','laundry','kitchen',
  'scratch','dent','outlet','discount','warehouse','liquidat',
  'surplus','clearance','overstock','salvage','bargain',
  'deals','wholesale','budget','used appliance','recondition',
  'refurbish','scratch and dent','scratch & dent','scratch n dent',
];

function isBlocklisted(nameLower) {
  return BLOCKLIST_NAMES.some(b => nameLower.includes(b));
}

function hasBadNameKeyword(nameLower) {
  return BAD_NAME_KEYWORDS.some(kw => nameLower.includes(kw));
}

function hasGoodCategory(subtypesLower, categoryLower) {
  const combined = subtypesLower + ' ' + categoryLower;
  return GOOD_CATEGORIES.some(g => combined.includes(g));
}

function hasBadCategory(subtypesLower, categoryLower) {
  const combined = subtypesLower + ' ' + categoryLower;
  if (combined.includes('appliance')) return false;
  return BAD_CATEGORIES.some(b => combined.includes(b));
}

function hasApplianceSignalInName(nameLower) {
  return APPLIANCE_NAME_SIGNALS.some(sig => nameLower.includes(sig));
}

function isPermanentlyClosed(businessStatus) {
  return (businessStatus || '').toUpperCase().trim() === 'CLOSED_PERMANENTLY';
}

/**
 * Run all filters against a raw record.
 * Returns { pass: true } or { pass: false, reason: string }.
 */
function applyFilters(record) {
  const nameLower = (record.name || '').toLowerCase();
  const subtypesLower = (record.subtypes || '').toLowerCase();
  const categoryLower = (record.category || '').toLowerCase();

  if (isPermanentlyClosed(record.businessStatus)) {
    return { pass: false, reason: 'closed' };
  }
  if (!record.name || record.name.trim().length < 3) {
    return { pass: false, reason: 'no_name' };
  }
  if (!record.state || record.state.length !== 2) {
    return { pass: false, reason: 'no_state' };
  }
  if ((Number(record.reviewCount) || 0) === 0) {
    return { pass: false, reason: '0_reviews' };
  }
  if (isBlocklisted(nameLower)) {
    return { pass: false, reason: 'blocklisted' };
  }
  if (hasBadNameKeyword(nameLower) && !hasGoodCategory(subtypesLower, categoryLower)) {
    return { pass: false, reason: 'bad_name' };
  }
  if (hasBadCategory(subtypesLower, categoryLower) && !hasGoodCategory(subtypesLower, categoryLower)) {
    return { pass: false, reason: 'bad_category' };
  }
  if (!hasApplianceSignalInName(nameLower) && !hasGoodCategory(subtypesLower, categoryLower)) {
    return { pass: false, reason: 'no_appliance_signal' };
  }

  return { pass: true };
}

module.exports = { applyFilters, isBlocklisted, hasGoodCategory, hasBadCategory, hasApplianceSignalInName, isPermanentlyClosed };

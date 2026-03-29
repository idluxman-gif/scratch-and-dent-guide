/**
 * Site configuration — change these values to launch a new niche directory.
 * All niche-specific strings, branding, and SEO settings live here.
 */
export const siteConfig = {
  // ── Core identity ──────────────────────────────────────────────────────────
  domain: "https://www.scratchanddentguide.com",
  name: "ScratchAndDentGuide",
  displayName: "Scratch & Dent Guide",
  tagline: "Find Scratch & Dent Appliance Stores Near You",
  niche: "scratch and dent appliances",

  // ── Branding ───────────────────────────────────────────────────────────────
  icon: "🏷️",
  primaryColor: "#0F172A",
  accentColor: "#10B981",
  heroGradient: "linear-gradient(160deg,#0F172A,#1E293B 50%,#334155)",

  // ── SEO ────────────────────────────────────────────────────────────────────
  seo: {
    title: "Scratch & Dent Appliance Stores Near You | ScratchAndDentGuide.com",
    description:
      "Find 728+ verified scratch and dent appliance stores across 51 states. Save 30-70% on brand-new refrigerators, washers, dryers, and more from Samsung, LG, Whirlpool, GE, and Bosch.",
    keywords:
      "scratch and dent appliances, discount appliances, appliance outlet, scratch dent refrigerator, cheap appliances near me, appliance warehouse, dented appliances",
    // Google Search Console verification token
    googleVerification: "MMCWOmMd6heImivTRL_XmCORuQTI8hTX-0vxIagrgJE",
    // OG/Twitter card defaults
    ogTitle: "Scratch & Dent Appliance Stores | Save 30-70%",
    ogDescription:
      "The largest directory of scratch & dent appliance stores in the US. Find deals near you.",
  },

  // ── Analytics / Ads ────────────────────────────────────────────────────────
  analytics: {
    ga4Id: "G-97K1EQN5XQ",
    adsenseClient: "ca-pub-6583010255692976",
  },

  // ── Listing copy ───────────────────────────────────────────────────────────
  listing: {
    // Singular / plural labels for the things being listed
    singular: "store",
    plural: "stores",
    // Used in hero badge and stat bar
    savingsBadge: "💰 Save 30-70% on Major Appliances",
    savingsRange: "30-70%",
    avgRating: "4.6",
    // Used in hero subtext and stat bar
    heroSubtext: "verified stores across",
    // Schema.org @type for individual listings
    schemaBusinessType: "LocalBusiness",
    // Human-readable category name used in page titles
    categoryLabel: "Scratch & Dent Appliance",
    // Short phrase appended to city/state meta descriptions
    metaSavings: "Save 30-70% on refrigerators, washers, dryers and more.",
    // Quote form items
    quoteFormItems: [
      "Refrigerator",
      "Washer",
      "Dryer",
      "Dishwasher",
      "Range",
    ],
  },

  // ── Route prefix ───────────────────────────────────────────────────────────
  // URL prefix for listing pages, e.g. /stores/california/los-angeles
  listingsRoute: "stores",

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    description:
      "The largest directory of scratch & dent appliance stores in the US.",
    copyright: "ScratchAndDentGuide.com",
  },
};

export default siteConfig;

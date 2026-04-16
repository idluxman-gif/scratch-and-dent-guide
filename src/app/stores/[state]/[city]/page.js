import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { stores, stateNames, findStateCode, getStateSlug, getCitySlug, getStorePath, getStatePath, getCityPath } from '@/data/stores';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import PageNav from '@/components/PageNav';
import { cityEditorial } from '@/data/cityEditorial';
import { isPremium } from '@/lib/premium';

export const dynamic = 'force-dynamic';

const { listing, domain, displayName, icon } = siteConfig;

export function generateStaticParams() {
  const combos = new Set();
  const params = [];
  for (const s of stores) {
    const key = `${s.s}-${s.c}`;
    if (!combos.has(key)) {
      combos.add(key);
      params.push({ state: getStateSlug(s.s), city: getCitySlug(s.c) });
    }
  }
  return params;
}

export function generateMetadata({ params }) {
  const stateCode = findStateCode(params.state);
  if (!stateCode) return {};
  const stateName = stateNames[stateCode];
  const cityStores = stores.filter(s => s.s === stateCode && getCitySlug(s.c) === params.city);
  if (cityStores.length === 0) return {};
  const cityName = cityStores[0].c;
  const isThin = cityStores.length < 3;
  return {
    title: `${listing.categoryLabel} ${listing.plural} in ${cityName}, ${stateName} (${cityStores.length} ${listing.plural})`,
    description: `Find ${cityStores.length} ${listing.categoryLabel.toLowerCase()} ${listing.plural} in ${cityName}, ${stateName}. ${listing.metaSavings}`,
    ...(isThin && { robots: { index: false, follow: true } }),
    alternates: {
      canonical: `/${siteConfig.listingsRoute}/${params.state}/${params.city}`,
    },
    openGraph: {
      title: `${listing.categoryLabel} ${listing.plural} in ${cityName}, ${stateName}`,
      description: `${cityStores.length} ${listing.singular} locations in ${cityName}. ${listing.metaSavings}`,
    },
  };
}

export default async function CityPage({ params }) {
  const stateCode = findStateCode(params.state);
  if (!stateCode) notFound();
  const stateName = stateNames[stateCode];
  let cityStores = stores.filter(s => s.s === stateCode && getCitySlug(s.c) === params.city);
  if (cityStores.length === 0) notFound();
  const cityName = cityStores[0].c;

  // Premium-aware sort: premium first, then by review count
  const premiumChecks = await Promise.all(cityStores.map(s => isPremium(s.i)));
  const premiumSet = new Set(cityStores.filter((s, idx) => premiumChecks[idx]).map(s => s.i));
  cityStores = [...cityStores].sort((a, b) => {
    const aPrem = premiumSet.has(a.i) ? 1 : 0;
    const bPrem = premiumSet.has(b.i) ? 1 : 0;
    if (bPrem !== aPrem) return bPrem - aPrem;
    return b.v - a.v;
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${listing.categoryLabel} ${listing.plural} in ${cityName}, ${stateName}`,
    "numberOfItems": cityStores.length,
    "itemListElement": cityStores.map((store, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `${domain}${getStorePath(store)}`,
      "name": store.n,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#F9FAFB', minHeight: '100vh' }}>
        <PageNav />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px' }}>
          {/* Breadcrumbs */}
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            <Link href="/" style={{ color: '#10B981', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href={getStatePath(stateCode)} style={{ color: '#10B981', textDecoration: 'none' }}>{stateName}</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#333' }}>{cityName}</span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '16px 0 8px' }}>
            {listing.categoryLabel} {listing.plural} in {cityName}, {stateName}
          </h1>
          <p style={{ color: '#666', fontSize: 16, margin: '0 0 32px' }}>
            {cityStores.length} verified {cityStores.length === 1 ? listing.singular : listing.plural}. {listing.metaSavings}
          </p>

          {/* Editorial intro block */}
          {cityEditorial[`${stateCode}-${cityName}`] && (
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '24px 28px', marginBottom: 36 }}>
              {cityEditorial[`${stateCode}-${cityName}`].split('\n\n').map((paragraph, i) => (
                <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: '#374151', margin: '0 0 16px' }}
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
            </div>
          )}

          {/* Store cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
            {cityStores.map((store, idx) => {
              const isPrem = premiumSet.has(store.i);
              return (
                <Link key={store.i} href={getStorePath(store)}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: isPrem ? '2px solid #10B981' : '1px solid #E2E8F0',
                  }}>
                  <div style={{ background: isPrem ? 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)' : '#F0FDF4', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <svg width="28" height="42" viewBox="0 0 36 52" fill="none">
                      <rect x="2" y="2" width="32" height="48" rx="4" stroke="#10B981" strokeWidth="2.5" fill="none"/>
                      <line x1="2" y1="20" x2="34" y2="20" stroke="#10B981" strokeWidth="2"/>
                      <rect x="9" y="11" width="9" height="2.5" rx="1.25" fill="#10B981"/>
                      <rect x="9" y="33" width="9" height="2.5" rx="1.25" fill="#10B981"/>
                    </svg>
                    <span style={{ position: 'absolute', top: 8, right: 8, background: store.pr === '$' ? '#10B981' : '#3B82F6', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                      {store.pr === '$' ? '$ Budget' : '$$ Mid-Range'}
                    </span>
                    {isPrem && (
                      <span style={{ position: 'absolute', top: 8, left: 8, background: '#10B981', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                        ★ FEATURED LISTING
                      </span>
                    )}
                    {!isPrem && idx === 0 && (
                      <span style={{ position: 'absolute', top: 8, left: 8, background: '#10B981', color: '#fff', padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>★ Top Rated</span>
                    )}
                  </div>
                  <div style={{ padding: '14px 16px 18px' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#0F172A' }}>{store.n}</h3>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} color="#64748B"/>{store.a}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: '#F59E0B' }}>{'★'.repeat(Math.round(store.r))}</span>
                      <span style={{ color: '#64748B' }}>{store.r} ({store.v.toLocaleString()})</span>
                    </div>
                    {store.p && <p style={{ fontSize: 13, color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} color="#64748B"/>{store.p}</p>}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Back links */}
          <div style={{ textAlign: 'center', padding: '24px 0 48px', display: 'flex', justifyContent: 'center', gap: 24 }}>
            <Link href={getStatePath(stateCode)} style={{ color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>
              &larr; All {stateName} {listing.plural}
            </Link>
            <Link href="/" style={{ color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>
              &larr; Back to Directory
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

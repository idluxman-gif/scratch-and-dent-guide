import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { stores, stateNames, findStateCode, getStoresByCity, getCitySlug, getStateSlug, getStorePath, getCityPath } from '@/data/stores';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import PageNav from '@/components/PageNav';

const { listing, domain, displayName, icon } = siteConfig;

export function generateStaticParams() {
  const states = [...new Set(stores.map(s => s.s))];
  return states.map(s => ({ state: getStateSlug(s) }));
}

export function generateMetadata({ params }) {
  const stateCode = findStateCode(params.state);
  if (!stateCode) return {};
  const stateName = stateNames[stateCode];
  const stateStores = stores.filter(s => s.s === stateCode);
  return {
    title: `${listing.categoryLabel} ${listing.plural} in ${stateName} (${stateStores.length} ${listing.plural}) | ${displayName}`,
    description: `Find ${stateStores.length} verified ${listing.niche || listing.categoryLabel.toLowerCase()} ${listing.plural} in ${stateName}. ${listing.metaSavings}`,
    alternates: {
      canonical: `/${siteConfig.listingsRoute}/${params.state}`,
    },
    openGraph: {
      title: `${listing.categoryLabel} ${listing.plural} in ${stateName}`,
      description: `Browse ${stateStores.length} discount ${listing.singular} locations in ${stateName}. ${listing.metaSavings}`,
    },
  };
}

export default function StatePage({ params }) {
  const stateCode = findStateCode(params.state);
  if (!stateCode) notFound();
  const stateName = stateNames[stateCode];
  const cityEntries = getStoresByCity(stateCode);
  const totalStores = stores.filter(s => s.s === stateCode).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${listing.categoryLabel} ${listing.plural} in ${stateName}`,
    "numberOfItems": totalStores,
    "itemListElement": stores.filter(s => s.s === stateCode).map((store, idx) => ({
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

        {/* Breadcrumbs */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#333' }}>{stateName}</span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '16px 0 8px' }}>
            {listing.categoryLabel} {listing.plural} in {stateName}
          </h1>
          <p style={{ color: '#666', fontSize: 16, margin: '0 0 32px' }}>
            {totalStores} verified {listing.plural} across {cityEntries.length} cities. {listing.metaSavings}
          </p>

          {/* Cities grid */}
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Cities in {stateName}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 40 }}>
            {cityEntries.map(([cityName, cityStores]) => (
              <Link key={cityName} href={getCityPath(stateCode, cityName)}
                style={{ background: '#fff', padding: '12px 16px', borderRadius: 8, textDecoration: 'none', color: '#0F172A', border: '1px solid #E2E8F0', fontWeight: 500, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{cityName}</span>
                <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{cityStores.length}</span>
              </Link>
            ))}
          </div>

          {/* All listings */}
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>All {listing.plural} in {stateName}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
            {stores.filter(s => s.s === stateCode).sort((a, b) => b.v - a.v).map(store => (
              <Link key={store.i} href={getStorePath(store)}
                style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: 'inherit', border: '1px solid #E2E8F0', transition: 'box-shadow 0.2s' }}>
                <div style={{ background: '#F0FDF4', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <svg width="28" height="42" viewBox="0 0 36 52" fill="none">
                    <rect x="2" y="2" width="32" height="48" rx="4" stroke="#10B981" strokeWidth="2.5" fill="none"/>
                    <line x1="2" y1="20" x2="34" y2="20" stroke="#10B981" strokeWidth="2"/>
                    <rect x="9" y="11" width="9" height="2.5" rx="1.25" fill="#10B981"/>
                    <rect x="9" y="33" width="9" height="2.5" rx="1.25" fill="#10B981"/>
                  </svg>
                  <span style={{ position: 'absolute', top: 8, right: 8, background: store.pr === '$' ? '#10B981' : '#3B82F6', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                    {store.pr === '$' ? '$ Budget' : '$$ Mid-Range'}
                  </span>
                </div>
                <div style={{ padding: '14px 16px 18px' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#0F172A' }}>{store.n}</h3>
                  <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} color="#64748B"/>{store.c}, {store.s}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: '#F59E0B' }}>{'★'.repeat(Math.round(store.r))}</span>
                    <span style={{ color: '#64748B' }}>{store.r} ({store.v.toLocaleString()})</span>
                  </div>
                  {store.p && <p style={{ fontSize: 13, color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} color="#64748B"/>{store.p}</p>}
                </div>
              </Link>
            ))}
          </div>

          {/* Back link */}
          <div style={{ textAlign: 'center', padding: '24px 0 48px' }}>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              &larr; Back to All {listing.plural}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

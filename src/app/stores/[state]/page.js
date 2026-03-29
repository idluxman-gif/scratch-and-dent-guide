import Link from 'next/link';
import { stores, stateNames, findStateCode, getStoresByCity, getCitySlug, getStateSlug, getStorePath, getCityPath } from '@/data/stores';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';

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
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{ background: '#1a2332', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}>
            <span style={{ color: '#f59e0b' }}>{icon}</span> {displayName}
          </Link>
          <nav style={{ display: 'flex', gap: 16 }}>
            <Link href="/" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14 }}>Browse</Link>
            <Link href="/#about" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14 }}>About</Link>
          </nav>
        </header>

        {/* Breadcrumbs */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#333' }}>{stateName}</span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1a2332', margin: '16px 0 8px' }}>
            {listing.categoryLabel} {listing.plural} in {stateName}
          </h1>
          <p style={{ color: '#666', fontSize: 16, margin: '0 0 32px' }}>
            {totalStores} verified {listing.plural} across {cityEntries.length} cities. {listing.metaSavings}
          </p>

          {/* Cities grid */}
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a2332', marginBottom: 16 }}>Cities in {stateName}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 40 }}>
            {cityEntries.map(([cityName, cityStores]) => (
              <Link key={cityName} href={getCityPath(stateCode, cityName)}
                style={{ background: '#fff', padding: '12px 16px', borderRadius: 8, textDecoration: 'none', color: '#1a2332', border: '1px solid #e5e7eb', fontWeight: 500, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{cityName}</span>
                <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{cityStores.length}</span>
              </Link>
            ))}
          </div>

          {/* All listings */}
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a2332', marginBottom: 16 }}>All {listing.plural} in {stateName}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
            {stores.filter(s => s.s === stateCode).sort((a, b) => b.v - a.v).map(store => (
              <Link key={store.i} href={getStorePath(store)}
                style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: 'inherit', border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s' }}>
                <div style={{ background: '#1e3a5f', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ fontSize: 32, opacity: 0.3 }}>&#x1f3e2;</span>
                  <span style={{ position: 'absolute', top: 8, right: 8, background: store.pr === '$' ? '#16a34a' : '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                    {store.pr === '$' ? '$ Budget' : '$$ Mid-Range'}
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#1a2332' }}>{store.n}</h3>
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 6px' }}>&#x1f4cd; {store.c}, {store.s}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(store.r))}</span>
                    <span style={{ color: '#666' }}>{store.r} ({store.v.toLocaleString()})</span>
                  </div>
                  {store.p && <p style={{ fontSize: 13, color: '#2563eb', margin: 0 }}>&#x1f4de; {store.p}</p>}
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

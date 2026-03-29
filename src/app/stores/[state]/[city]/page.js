import Link from 'next/link';
import { stores, stateNames, findStateCode, getStateSlug, getCitySlug, getStorePath, getStatePath, getCityPath } from '@/data/stores';
import { notFound } from 'next/navigation';

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
  return {
    title: `Scratch & Dent Appliance Stores in ${cityName}, ${stateName} (${cityStores.length} Stores)`,
    description: `Find ${cityStores.length} scratch and dent appliance stores in ${cityName}, ${stateName}. Save 30-70% on refrigerators, washers, dryers and more.`,
    alternates: {
      canonical: `/stores/${params.state}/${params.city}`,
    },
    openGraph: {
      title: `Scratch & Dent Stores in ${cityName}, ${stateName}`,
      description: `${cityStores.length} discount appliance stores in ${cityName}. Save 30-70%.`,
    },
  };
}

export default function CityPage({ params }) {
  const stateCode = findStateCode(params.state);
  if (!stateCode) notFound();
  const stateName = stateNames[stateCode];
  const cityStores = stores.filter(s => s.s === stateCode && getCitySlug(s.c) === params.city).sort((a, b) => b.v - a.v);
  if (cityStores.length === 0) notFound();
  const cityName = cityStores[0].c;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Scratch & Dent Appliance Stores in ${cityName}, ${stateName}`,
    "numberOfItems": cityStores.length,
    "itemListElement": cityStores.map((store, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://www.scratchanddentguide.com${getStorePath(store)}`,
      "name": store.n,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#f8f9fa', minHeight: '100vh' }}>
        <header style={{ background: '#1a2332', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}>
            <span style={{ color: '#f59e0b' }}>&#x1f4a7;</span> Scratch&DentGuide
          </Link>
          <nav style={{ display: 'flex', gap: 16 }}>
            <Link href="/" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14 }}>Browse</Link>
          </nav>
        </header>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px' }}>
          {/* Breadcrumbs */}
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href={getStatePath(stateCode)} style={{ color: '#2563eb', textDecoration: 'none' }}>{stateName}</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#333' }}>{cityName}</span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1a2332', margin: '16px 0 8px' }}>
            Scratch & Dent Appliance Stores in {cityName}, {stateName}
          </h1>
          <p style={{ color: '#666', fontSize: 16, margin: '0 0 32px' }}>
            {cityStores.length} verified {cityStores.length === 1 ? 'store' : 'stores'}. Save 30-70% on brand-name appliances.
          </p>

          {/* Store cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
            {cityStores.map(store => (
              <Link key={store.i} href={getStorePath(store)}
                style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: 'inherit', border: '1px solid #e5e7eb' }}>
                <div style={{ background: '#1e3a5f', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ fontSize: 32, opacity: 0.3 }}>&#x1f3e2;</span>
                  <span style={{ position: 'absolute', top: 8, right: 8, background: store.pr === '$' ? '#16a34a' : '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                    {store.pr === '$' ? '$ Budget' : '$$ Mid-Range'}
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#1a2332' }}>{store.n}</h3>
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 6px' }}>&#x1f4cd; {store.a}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(store.r))}</span>
                    <span style={{ color: '#666' }}>{store.r} ({store.v.toLocaleString()})</span>
                  </div>
                  {store.p && <p style={{ fontSize: 13, color: '#2563eb', margin: 0 }}>&#x1f4de; {store.p}</p>}
                </div>
              </Link>
            ))}
          </div>

          {/* Back links */}
          <div style={{ textAlign: 'center', padding: '24px 0 48px', display: 'flex', justifyContent: 'center', gap: 24 }}>
            <Link href={getStatePath(stateCode)} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              &larr; All {stateName} Stores
            </Link>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              &larr; Back to Directory
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

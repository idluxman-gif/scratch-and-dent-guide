import Link from 'next/link';
import { stores, stateNames, findStateCode, getStateSlug, getCitySlug, getStoreSlug, getStorePath, getStatePath, getCityPath } from '@/data/stores';
import { notFound } from 'next/navigation';
import QuoteForm from './QuoteForm';

export function generateStaticParams() {
  return stores.map(s => ({
    state: getStateSlug(s.s),
    city: getCitySlug(s.c),
    slug: getStoreSlug(s),
  }));
}

export function generateMetadata({ params }) {
  const store = stores.find(s =>
    getStateSlug(s.s) === params.state &&
    getCitySlug(s.c) === params.city &&
    getStoreSlug(s) === params.slug
  );
  if (!store) return {};
  const stateName = stateNames[store.s];
  return {
    title: `${store.n} - Scratch & Dent Appliances in ${store.c}, ${stateName}`,
    description: `Save 30-70% on brand-name appliances at ${store.n} in ${store.c}, ${stateName}. Shop scratch and dent refrigerators, washers, dryers and more. Rated ${store.r}/5 from ${store.v.toLocaleString()} reviews.`,
    openGraph: {
      title: `${store.n} - Scratch & Dent Appliances`,
      description: `Save 30-70% at ${store.n} in ${store.c}, ${stateName}. ${store.r}★ rating.`,
    },
  };
}

export default function StorePage({ params }) {
  const store = stores.find(s =>
    getStateSlug(s.s) === params.state &&
    getCitySlug(s.c) === params.city &&
    getStoreSlug(s) === params.slug
  );
  if (!store) notFound();

  const stateName = stateNames[store.s];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.n + ' ' + store.a)}`;
  const otherStores = stores.filter(s => s.c === store.c && s.s === store.s && s.i !== store.i).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": store.n,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": store.a.split(',')[0],
      "addressLocality": store.c,
      "addressRegion": store.s,
      "addressCountry": "US",
    },
    "telephone": store.p,
    "url": store.w || `https://www.scratchanddentguide.com${getStorePath(store)}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": store.r,
      "reviewCount": store.v,
    },
    "priceRange": store.pr,
    "image": "",
    "description": `Scratch and dent appliance store in ${store.c}, ${stateName}. Save 30-70% on brand-name appliances.`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.scratchanddentguide.com" },
      { "@type": "ListItem", "position": 2, "name": stateName, "item": `https://www.scratchanddentguide.com${getStatePath(store.s)}` },
      { "@type": "ListItem", "position": 3, "name": store.c, "item": `https://www.scratchanddentguide.com${getCityPath(store.s, store.c)}` },
      { "@type": "ListItem", "position": 4, "name": store.n },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{ background: '#1a2332', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}>
            <span style={{ color: '#f59e0b' }}>&#x1f4a7;</span> Scratch&DentGuide
          </Link>
          <nav style={{ display: 'flex', gap: 16 }}>
            <Link href="/" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14 }}>Browse</Link>
          </nav>
        </header>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 24px' }}>
          {/* Breadcrumbs */}
          <div style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href={getStatePath(store.s)} style={{ color: '#2563eb', textDecoration: 'none' }}>{stateName}</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href={getCityPath(store.s, store.c)} style={{ color: '#2563eb', textDecoration: 'none' }}>{store.c}</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#333' }}>{store.n}</span>
          </div>

          {/* Store Hero */}
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 24 }}>
            <div style={{ background: 'linear-gradient(135deg, #1a2332 0%, #1e3a5f 100%)', padding: '32px 24px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>{store.n}</h1>
                  <p style={{ margin: '0 0 4px', opacity: 0.9, fontSize: 15 }}>&#x1f4cd; {store.a}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <span style={{ color: '#f59e0b', fontSize: 16 }}>{'★'.repeat(Math.round(store.r))}</span>
                    <span style={{ fontWeight: 600 }}>{store.r}</span>
                    <span style={{ opacity: 0.7 }}>({store.v.toLocaleString()} reviews)</span>
                    <span style={{ background: store.pr === '$' ? '#16a34a' : '#2563eb', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, marginLeft: 8 }}>
                      {store.pr === '$' ? '$ Budget' : '$$ Mid-Range'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              {/* CTAs */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                {store.p && (
                  <a href={`tel:${store.p.replace(/[^+\d]/g, '')}`}
                    style={{ background: '#16a34a', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    &#x1f4de; Call Now: {store.p}
                  </a>
                )}
                {store.w && (
                  <a href={store.w} target="_blank" rel="noopener noreferrer"
                    style={{ background: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                    &#x1f310; Visit Website
                  </a>
                )}
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#f59e0b', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                  &#x1f4cd; Get Directions
                </a>
              </div>

              {/* Store Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Address</div>
                  <div style={{ fontSize: 14, color: '#1a2332' }}>{store.a}</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Phone</div>
                  <div style={{ fontSize: 14, color: '#1a2332' }}>{store.p || 'Not available'}</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Rating</div>
                  <div style={{ fontSize: 14, color: '#1a2332' }}>{store.r}/5 ({store.v.toLocaleString()} reviews)</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Price Range</div>
                  <div style={{ fontSize: 14, color: '#1a2332' }}>{store.pr === '$' ? 'Budget-Friendly' : 'Mid-Range'}</div>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Location</h2>
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(store.a)}&output=embed`}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map showing ${store.n} location`}
                  />
                </div>
              </div>

              {/* About */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>About {store.n}</h2>
                <p style={{ fontSize: 15, color: '#444', lineHeight: 1.6 }}>
                  {store.n} is a scratch and dent appliance store located in {store.c}, {stateName}.
                  They offer discounted brand-name appliances including refrigerators, washers, dryers, dishwashers,
                  and more at 30-70% off retail prices. With a {store.r}-star rating from {store.v.toLocaleString()} reviews,
                  this store is {store.r >= 4.5 ? 'one of the highest-rated' : 'a well-reviewed'} appliance
                  {store.pr === '$' ? ' budget' : ''} store in the {store.c} area.
                </p>
              </div>

              {/* Quote Form */}
              <QuoteForm storeName={store.n} storeCity={store.c} storeState={stateName} />
            </div>
          </div>

          {/* Other stores in city */}
          {otherStores.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a2332', marginBottom: 16 }}>
                Other Stores in {store.c}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                {otherStores.map(other => (
                  <Link key={other.i} href={getStorePath(other)}
                    style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: 'inherit', border: '1px solid #e5e7eb' }}>
                    <div style={{ padding: 16 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#1a2332' }}>{other.n}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(other.r))}</span>
                        <span style={{ color: '#666' }}>{other.r} ({other.v.toLocaleString()})</span>
                      </div>
                      {other.p && <p style={{ fontSize: 13, color: '#2563eb', margin: 0 }}>&#x1f4de; {other.p}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ textAlign: 'center', padding: '24px 0 48px', display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <Link href={getCityPath(store.s, store.c)} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              &larr; All {store.c} Stores
            </Link>
            <Link href={getStatePath(store.s)} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              All {stateName} Stores
            </Link>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              Full Directory
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

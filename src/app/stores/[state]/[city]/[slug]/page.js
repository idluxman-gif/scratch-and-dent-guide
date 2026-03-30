import Link from 'next/link';
import { MapPin, Phone, Globe } from 'lucide-react';
import { stores, stateNames, findStateCode, getStateSlug, getCitySlug, getStoreSlug, getStorePath, getStatePath, getCityPath } from '@/data/stores';
import { notFound } from 'next/navigation';
import QuoteForm from './QuoteForm';
import { siteConfig } from '@/config/site';
import PageNav from '@/components/PageNav';

const { listing, domain, displayName, icon } = siteConfig;

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
    title: `${store.n} - ${listing.categoryLabel} in ${store.c}, ${stateName}`,
    description: `${listing.metaSavings} at ${store.n} in ${store.c}, ${stateName}. Rated ${store.r}/5 from ${store.v.toLocaleString()} reviews.`,
    openGraph: {
      title: `${store.n} - ${listing.categoryLabel}`,
      description: `${store.n} in ${store.c}, ${stateName}. ${store.r}★ rating.`,
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
    "url": store.w || `${domain}${getStorePath(store)}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": store.r,
      "reviewCount": store.v,
    },
    "priceRange": store.pr,
    "image": "",
    "description": `${listing.categoryLabel} ${listing.singular} in ${store.c}, ${stateName}. ${listing.metaSavings}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": domain },
      { "@type": "ListItem", "position": 2, "name": stateName, "item": `${domain}${getStatePath(store.s)}` },
      { "@type": "ListItem", "position": 3, "name": store.c, "item": `${domain}${getCityPath(store.s, store.c)}` },
      { "@type": "ListItem", "position": 4, "name": store.n },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#F9FAFB', minHeight: '100vh' }}>
        <PageNav />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 24px' }}>
          {/* Breadcrumbs */}
          <div style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
            <Link href="/" style={{ color: '#10B981', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href={getStatePath(store.s)} style={{ color: '#10B981', textDecoration: 'none' }}>{stateName}</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href={getCityPath(store.s, store.c)} style={{ color: '#10B981', textDecoration: 'none' }}>{store.c}</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#333' }}>{store.n}</span>
          </div>

          {/* Store Hero */}
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 24 }}>
            <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #0F172A 100%)', padding: '32px 24px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>{store.n}</h1>
                  <p style={{ margin: '0 0 4px', opacity: 0.9, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} color="rgba(255,255,255,0.9)"/> {store.a}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <span style={{ color: '#f59e0b', fontSize: 16 }}>{'★'.repeat(Math.round(store.r))}</span>
                    <span style={{ fontWeight: 600 }}>{store.r}</span>
                    <span style={{ opacity: 0.7 }}>({store.v.toLocaleString()} reviews)</span>
                    <span style={{ background: store.pr === '$' ? '#16a34a' : '#10B981', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, marginLeft: 8 }}>
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
                    style={{ background: '#10B981', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={16} color="#fff"/> Call Now: {store.p}
                  </a>
                )}
                {store.w && (
                  <a href={store.w} target="_blank" rel="noopener noreferrer"
                    style={{ background: '#0F172A', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Globe size={16} color="#fff"/> Visit Website
                  </a>
                )}
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#F59E0B', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={16} color="#fff"/> Get Directions
                </a>
              </div>

              {/* Store Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Address</div>
                  <div style={{ fontSize: 14, color: '#0F172A' }}>{store.a}</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Phone</div>
                  <div style={{ fontSize: 14, color: '#0F172A' }}>{store.p || 'Not available'}</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Rating</div>
                  <div style={{ fontSize: 14, color: '#0F172A' }}>{store.r}/5 ({store.v.toLocaleString()} reviews)</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Price Range</div>
                  <div style={{ fontSize: 14, color: '#0F172A' }}>{store.pr === '$' ? 'Budget-Friendly' : 'Mid-Range'}</div>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Location</h2>
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
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>About {store.n}</h2>
                <p style={{ fontSize: 15, color: '#444', lineHeight: 1.6 }}>
                  {store.n} is a {listing.categoryLabel.toLowerCase()} {listing.singular} located in {store.c}, {stateName}.
                  {listing.metaSavings} With a {store.r}-star rating from {store.v.toLocaleString()} reviews,
                  this {listing.singular} is {store.r >= 4.5 ? 'one of the highest-rated' : 'a well-reviewed'}
                  {store.pr === '$' ? ' budget' : ''} {listing.singular} in the {store.c} area.
                </p>
              </div>

              {/* Quote Form */}
              <QuoteForm storeName={store.n} storeCity={store.c} storeState={stateName} />
            </div>
          </div>

          {/* Other stores in city */}
          {otherStores.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>
                Other {listing.plural} in {store.c}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                {otherStores.map(other => (
                  <Link key={other.i} href={getStorePath(other)}
                    style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: 'inherit', border: '1px solid #e5e7eb' }}>
                    <div style={{ padding: 16 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#0F172A' }}>{other.n}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(other.r))}</span>
                        <span style={{ color: '#666' }}>{other.r} ({other.v.toLocaleString()})</span>
                      </div>
                      {other.p && <p style={{ fontSize: 13, color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} color="#64748B"/>{other.p}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ textAlign: 'center', padding: '24px 0 48px', display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <Link href={getCityPath(store.s, store.c)} style={{ color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>
              &larr; All {store.c} {listing.plural}
            </Link>
            <Link href={getStatePath(store.s)} style={{ color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>
              All {stateName} {listing.plural}
            </Link>
            <Link href="/" style={{ color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>
              Full Directory
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

import Link from 'next/link';
import { stores, getStorePath, getStoreSlug, getCitySlug, getStateSlug } from '@/data/stores';

export default function UpgradeSuccessPage({ searchParams }) {
  const shopId = searchParams?.shopId ? parseInt(searchParams.shopId, 10) : null;
  const shopName = searchParams?.shopName ? decodeURIComponent(searchParams.shopName) : '';
  const store = shopId ? stores.find(s => s.i === shopId) : null;

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#F9FAFB', minHeight: '100vh' }}>
      <div style={{ background: '#0F172A', padding: '12px 24px' }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}>
          🏷️ Scratch & Dent Guide
        </Link>
      </div>

      <div style={{ maxWidth: 560, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '0 0 12px' }}>
          You&apos;re now Premium!
        </h1>
        <p style={{ fontSize: 17, color: '#64748B', margin: '0 0 32px' }}>
          {shopName || 'Your listing'} has been upgraded to Premium.
          Your featured badge and top placement are now active — it may take up to 1 hour to fully propagate.
        </p>

        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 24, marginBottom: 32, textAlign: 'left' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#166534', margin: '0 0 12px' }}>What happens next:</h3>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#166534', lineHeight: 2 }}>
            <li>Your listing now shows a ⭐ Premium badge</li>
            <li>You appear at the top of city search results</li>
            <li>Customers see a highlighted contact form</li>
            <li>You&apos;ll receive a confirmation email from Stripe</li>
          </ul>
        </div>

        {store && (
          <Link
            href={getStorePath(store)}
            style={{
              display: 'inline-block',
              background: '#10B981',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 16,
            }}
          >
            View Your Premium Listing →
          </Link>
        )}
        <br />
        <Link href="/" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
          Back to directory
        </Link>
      </div>
    </div>
  );
}

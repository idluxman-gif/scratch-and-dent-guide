"use client";
import { useState } from "react";

export default function QuoteForm({ storeName, storeCity, storeState }) {
  const [fields, setFields] = useState({ name: '', email: '', phone: '', applianceType: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  function handleChange(e) {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, storeName, storeCity, storeState, site: 'scratchanddentguide' }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2332', marginTop: 0, marginBottom: 8 }}>
        &#x1f4e9; Get a Quote from {storeName}
      </h2>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Interested in scratch &amp; dent deals? Fill out the form below and the store may contact you.
      </p>
      {status === 'success' ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#x2705;</div>
          <h3 style={{ color: '#16a34a', margin: '0 0 8px' }}>Request Sent!</h3>
          <p style={{ color: '#666', fontSize: 14 }}>We&rsquo;ve received your inquiry. We recommend calling the store directly for the fastest response.</p>
        </div>
      ) : status === 'error' ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#x26a0;&#xfe0f;</div>
          <h3 style={{ color: '#dc2626', margin: '0 0 8px' }}>Submission Failed</h3>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>Something went wrong. Please try calling the store directly.</p>
          <button onClick={() => setStatus('idle')}
            style={{ background: '#0F172A', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input type="text" name="name" placeholder="Your Name" required value={fields.name} onChange={handleChange}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }} />
          <input type="email" name="email" placeholder="Email Address" required value={fields.email} onChange={handleChange}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }} />
          <input type="tel" name="phone" placeholder="Phone Number" value={fields.phone} onChange={handleChange}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }} />
          <select name="applianceType" value={fields.applianceType} onChange={handleChange}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', background: '#fff' }}>
            <option value="">Appliance Type</option>
            <option>Refrigerator</option>
            <option>Washer</option>
            <option>Dryer</option>
            <option>Dishwasher</option>
            <option>Range / Oven</option>
            <option>Microwave</option>
            <option>Other</option>
          </select>
          <textarea name="message" placeholder="Tell us what you're looking for..." rows={3} value={fields.message} onChange={handleChange}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', gridColumn: '1 / -1', resize: 'vertical' }} />
          <button type="submit" disabled={status === 'submitting'}
            style={{ gridColumn: '1 / -1', background: status === 'submitting' ? '#6b7280' : '#16a34a', color: '#fff', padding: '12px 24px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 15, cursor: status === 'submitting' ? 'not-allowed' : 'pointer' }}>
            {status === 'submitting' ? 'Sending...' : 'Request Quote'}
          </button>
        </form>
      )}
    </div>
  );
}

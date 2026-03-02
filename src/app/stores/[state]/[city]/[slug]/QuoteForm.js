"use client";
import { useState } from "react";

export default function QuoteForm({ storeName, storeCity, storeState }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2332', marginTop: 0, marginBottom: 8 }}>
        &#x1f4e9; Get a Quote from {storeName}
      </h2>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Interested in scratch & dent deals? Fill out the form below and the store may contact you.
      </p>
      {submitted ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#x2705;</div>
          <h3 style={{ color: '#16a34a', margin: '0 0 8px' }}>Request Submitted!</h3>
          <p style={{ color: '#666', fontSize: 14 }}>Thank you for your interest. We recommend calling the store directly for the fastest response.</p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input type="text" placeholder="Your Name" required
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }} />
          <input type="email" placeholder="Email Address" required
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }} />
          <input type="tel" placeholder="Phone Number"
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }} />
          <select style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', background: '#fff' }}>
            <option value="">Appliance Type</option>
            <option>Refrigerator</option>
            <option>Washer</option>
            <option>Dryer</option>
            <option>Dishwasher</option>
            <option>Range / Oven</option>
            <option>Microwave</option>
            <option>Other</option>
          </select>
          <textarea placeholder="Tell us what you're looking for..." rows={3}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', gridColumn: '1 / -1', resize: 'vertical' }} />
          <button type="submit"
            style={{ gridColumn: '1 / -1', background: '#16a34a', color: '#fff', padding: '12px 24px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Request Quote
          </button>
        </form>
      )}
    </div>
  );
}

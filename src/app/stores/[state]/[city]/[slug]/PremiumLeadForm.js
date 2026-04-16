"use client";
import { useState } from "react";

export default function PremiumLeadForm({ storeName, storeCity, storeState, storeSlug }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", applianceType: "", message: "",
  });

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          shop_name: storeName,
          shop_city: storeCity,
          shop_state: storeState,
          shop_slug: storeSlug,
          site: "scratchanddentguide",
          submitted_at: new Date().toISOString(),
        }),
      });
    } catch (_) {
      // never surface errors to user
    }
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 12, padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
        <h3 style={{ color: '#065F46', margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Request Sent!</h3>
        <p style={{ color: '#047857', fontSize: 14, margin: 0 }}>
          {storeName} will be in touch with you shortly.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: '#ECFDF5', border: '2px solid #10B981', borderRadius: 16, padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 22 }}>📦</span>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#065F46', margin: 0 }}>
          Request Info from {storeName}
        </h2>
      </div>
      <p style={{ fontSize: 13, color: '#047857', marginBottom: 18, marginTop: 4 }}>
        This is a featured store — fill out the form and they&apos;ll respond directly to you.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input
            name="name" type="text" placeholder="Your full name" required
            value={form.name} onChange={handleChange}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #6EE7B7', fontSize: 14, outline: 'none', background: '#fff' }}
          />
          <input
            name="email" type="email" placeholder="Email address" required
            value={form.email} onChange={handleChange}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #6EE7B7', fontSize: 14, outline: 'none', background: '#fff' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input
            name="phone" type="tel" placeholder="(555) 000-0000"
            value={form.phone} onChange={handleChange}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #6EE7B7', fontSize: 14, outline: 'none', background: '#fff' }}
          />
          <select
            name="applianceType" required
            value={form.applianceType} onChange={handleChange}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #6EE7B7', fontSize: 14, outline: 'none', background: '#fff' }}
          >
            <option value="">Appliance Type</option>
            <option>Refrigerator</option>
            <option>Washer</option>
            <option>Dryer</option>
            <option>Dishwasher</option>
            <option>Range / Oven</option>
          </select>
        </div>
        <textarea
          name="message" placeholder="Brand preference, size, budget, or anything else…" rows={3}
          value={form.message} onChange={handleChange}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #6EE7B7', fontSize: 14, outline: 'none', resize: 'vertical', background: '#fff' }}
        />
        <button
          type="submit" disabled={submitting}
          style={{
            background: '#10B981', color: '#fff', padding: '13px 24px', borderRadius: 10,
            border: 'none', fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Sending…' : '📦 Get Availability & Pricing'}
        </button>
      </form>
    </div>
  );
}

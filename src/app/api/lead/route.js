import { NextResponse } from 'next/server';
import { getPremiumRecord } from '@/lib/premium';

export async function POST(request) {
  try {
    const data = await request.json();

    // Accept both field naming conventions:
    // - QuoteForm uses: storeName, storeCity, storeState
    // - PremiumLeadForm uses: shop_name, shop_city, shop_state, shop_slug, site, submitted_at
    const {
      name,
      email,
      phone,
      applianceType,
      message,
      // QuoteForm keys
      storeName,
      storeCity,
      storeState,
      // PremiumLeadForm keys
      shop_name,
      shop_city,
      shop_state,
      shop_slug,
      site,
      submitted_at,
    } = data;

    const resolvedStoreName = storeName || shop_name || '';
    const resolvedCity = storeCity || shop_city || '';
    const resolvedState = storeState || shop_state || '';
    const submittedAt = submitted_at || new Date().toISOString();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_SAD;
    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL_SAD;

    const payload = {
      name,
      email,
      phone: phone || '',
      applianceType: applianceType || '',
      message: message || '',
      storeName: resolvedStoreName,
      storeCity: resolvedCity,
      storeState: resolvedState,
      submittedAt,
    };

    // Forward to Google Sheets via Apps Script webhook
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Timestamp: submittedAt,
            Site: site || 'scratchanddentguide',
            'Shop Name': resolvedStoreName,
            City: resolvedCity,
            State: resolvedState,
            Name: name,
            Email: email,
            Phone: phone || '',
            'Appliance Type': applianceType || '',
            Message: message || '',
          }),
        });
      } catch (err) {
        console.error('[lead] webhook error:', err);
      }
    }

    const leadHtml = `
      <h2>New Lead — ScratchAndDentGuide.com</h2>
      <table cellpadding="6" cellspacing="0">
        <tr><td><strong>Store</strong></td><td>${resolvedStoreName}, ${resolvedCity}, ${resolvedState}</td></tr>
        <tr><td><strong>Name</strong></td><td>${name}</td></tr>
        <tr><td><strong>Email</strong></td><td>${email}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${phone || '—'}</td></tr>
        <tr><td><strong>Appliance</strong></td><td>${applianceType || '—'}</td></tr>
        <tr><td><strong>Message</strong></td><td>${message || '—'}</td></tr>
        <tr><td><strong>Submitted</strong></td><td>${submittedAt}</td></tr>
      </table>
    `;

    // Send email notification via Resend
    if (resendKey && notifyEmail) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'leads@scratchanddentguide.com',
            to: [notifyEmail],
            subject: `New Lead: ${name} — ${applianceType || 'appliance'} at ${resolvedStoreName}`,
            html: leadHtml,
          }),
        });
      } catch (err) {
        console.error('[lead] resend error:', err);
      }
    }

    // Forward lead to store owner if they have a premium record with ownerEmail
    if (resendKey && shop_slug) {
      try {
        // Derive store ID from slug — PremiumLeadForm passes shop_slug which maps to store.i
        // We look up premium record by shop_slug (store ID)
        const premiumRecord = await getPremiumRecord(shop_slug);
        if (premiumRecord?.active && premiumRecord?.ownerEmail) {
          const ownerForwardHtml = `
            <h2>New Customer Inquiry for ${resolvedStoreName}</h2>
            <p>A customer found your listing on <strong>ScratchAndDentGuide.com</strong> and submitted an inquiry:</p>
            <table cellpadding="6" cellspacing="0">
              <tr><td><strong>Name</strong></td><td>${name}</td></tr>
              <tr><td><strong>Email</strong></td><td>${email}</td></tr>
              <tr><td><strong>Phone</strong></td><td>${phone || '—'}</td></tr>
              <tr><td><strong>Appliance Type</strong></td><td>${applianceType || '—'}</td></tr>
              <tr><td><strong>Message</strong></td><td>${message || '—'}</td></tr>
              <tr><td><strong>Submitted</strong></td><td>${submittedAt}</td></tr>
            </table>
            <p style="margin-top:16px;color:#666;font-size:13px;">
              This lead was forwarded to you because your listing is a Premium Partner on ScratchAndDentGuide.com.
            </p>
          `;
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'leads@scratchanddentguide.com',
              to: [premiumRecord.ownerEmail],
              reply_to: email,
              subject: `New inquiry from ${name} — ${applianceType || 'appliance'}`,
              html: ownerForwardHtml,
            }),
          });
        }
      } catch (err) {
        console.error('[lead] owner forward error:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[lead] error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

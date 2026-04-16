'use client';

export function PhoneLink({ href, style, children }) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click_to_call', {
        event_category: 'conversion',
        event_label: href,
      });
    }
  };
  return <a href={href} onClick={handleClick} style={style}>{children}</a>;
}

export function OutboundLink({ href, style, children }) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'outbound_click', {
        event_category: 'engagement',
        event_label: href,
      });
    }
  };
  return <a href={href} onClick={handleClick} style={style} target="_blank" rel="noopener noreferrer">{children}</a>;
}

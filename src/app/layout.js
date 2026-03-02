import Script from 'next/script';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: "Scratch & Dent Appliance Stores Near You | ScratchAndDentGuide.com",
  description: "Find 529+ verified scratch and dent appliance stores across 35 states. Save 30-70% on brand-new refrigerators, washers, dryers, and more from Samsung, LG, Whirlpool, GE, and Bosch.",
  keywords: "scratch and dent appliances, discount appliances, appliance outlet, scratch dent refrigerator, cheap appliances near me, appliance warehouse, dented appliances",
  verification: {
    google: "MMCWOmMd6heImivTRL_XmCORuQTI8hTX-0vxIagrgJE",
  },
  openGraph: {
    title: "Scratch & Dent Appliance Stores | Save 30-70%",
    description: "The largest directory of scratch & dent appliance stores in the US. Find deals near you.",
    type: "website",
    url: "https://scratchanddentguide.com",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-97K1EQN5XQ"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-97K1EQN5XQ');
          `}
        </Script>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6583010255692976"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body style={{ margin: 0 }}>
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}

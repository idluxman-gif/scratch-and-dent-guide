import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: "Scratch & Dent Appliance Stores Near You | ScratchAndDentGuide.com",
  description: "Find 437+ verified scratch and dent appliance stores across 33 states. Save 30-70% on brand-new refrigerators, washers, dryers, and more from Samsung, LG, Whirlpool, GE, and Bosch.",
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
      <body style={{ margin: 0 }}>
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}

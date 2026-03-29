import Link from "next/link";
import PageNav from "@/components/PageNav";

export const metadata = {
  title: "Privacy Policy | Scratch & Dent Guide",
  description: "Read the ScratchAndDentGuide.com privacy policy covering data collection, cookies, Google AdSense, Analytics, and your rights under CCPA and GDPR.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{minHeight:"100vh",background:"#F9FAFB",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <PageNav />
      <div style={{maxWidth:680,margin:"0 auto",padding:"32px 20px 48px"}}>
        <nav style={{marginBottom:20,fontSize:12,color:"#94A3B8"}}>
          <Link href="/" style={{color:"#94A3B8",textDecoration:"none"}}>Home</Link>{" / "}
          <span style={{color:"#64748B"}}>Privacy Policy</span>
        </nav>
        <h1 style={{margin:"0 0 6px",fontSize:28,fontWeight:900,color:"#0F172A"}}>Privacy Policy</h1>
        <p style={{fontSize:13,color:"#94A3B8",margin:"0 0 24px"}}><strong>Last Updated:</strong> March 2, 2026</p>

        <div style={{fontSize:15,color:"#374151",lineHeight:1.8}}>
          <p>ScratchAndDentGuide.com (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website located at www.scratchanddentguide.com. This Privacy Policy explains how we collect, use, and protect your information when you visit our website.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>Information We Collect</h2>
          <h3 style={{fontSize:16,fontWeight:700,color:"#0F172A",margin:"16px 0 8px"}}>Information You Provide</h3>
          <p>When you contact us through our website or via email, we may collect your name, email address, and any other information you choose to include in your message.</p>
          <h3 style={{fontSize:16,fontWeight:700,color:"#0F172A",margin:"16px 0 8px"}}>Information Collected Automatically</h3>
          <p>When you visit our website, we automatically collect certain technical information, including device and browser information, usage data, IP address, and cookies and similar technologies.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>How We Use Your Information</h2>
          <p>We use the information we collect to operate, maintain, and improve ScratchAndDentGuide.com, respond to your inquiries, analyze website traffic, display relevant advertising through third-party ad networks, detect and prevent fraud, and comply with legal obligations.</p>
          <p>We do not sell your personal information to third parties.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>Third-Party Services</h2>
          <p>We use Google AdSense to display advertisements and Google Analytics to understand how visitors interact with our website. You can opt out of personalized advertising by visiting Google&rsquo;s Ads Settings.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>Cookies</h2>
          <p>We use essential cookies for basic functionality, analytics cookies via Google Analytics, and advertising cookies used by Google AdSense. Most web browsers allow you to control cookies through their settings.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>Data Retention</h2>
          <p>We retain automatically collected data for up to 26 months, after which it is aggregated or deleted. If you contact us via email, we retain your correspondence for as long as necessary to address your inquiry.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>Your Rights</h2>
          <p><strong>For California Residents (CCPA):</strong> You have the right to know what personal information we collect, request deletion, and opt out of the sale of your personal information (note: we do not sell personal information).</p>
          <p><strong>For European Visitors (GDPR):</strong> You have the right to access, correct, delete, restrict, and port your personal data, and to withdraw consent at any time.</p>
          <p>To exercise any of these rights, contact us at info@scratchanddentguide.com.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>Children&rsquo;s Privacy</h2>
          <p>ScratchAndDentGuide.com is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>Security</h2>
          <p>We take reasonable measures to protect the information collected through our website. However, no method of transmission over the internet is completely secure.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last Updated&rdquo; date at the top of this page.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:info@scratchanddentguide.com" style={{color:"#10B981"}}>info@scratchanddentguide.com</a>.</p>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import PageNav from "@/components/PageNav";

export const metadata = {
  title: "Terms of Service | Scratch & Dent Guide",
  description: "Read the ScratchAndDentGuide.com terms of service. Understand the terms governing your use of our scratch and dent appliance store directory.",
};

export default function TermsPage() {
  return (
    <div style={{minHeight:"100vh",background:"#F9FAFB",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <PageNav />
      <div style={{maxWidth:680,margin:"0 auto",padding:"32px 20px 48px"}}>
        <nav style={{marginBottom:20,fontSize:12,color:"#94A3B8"}}>
          <Link href="/" style={{color:"#94A3B8",textDecoration:"none"}}>Home</Link>{" / "}
          <span style={{color:"#64748B"}}>Terms of Service</span>
        </nav>
        <h1 style={{margin:"0 0 6px",fontSize:28,fontWeight:900,color:"#0F172A"}}>Terms of Service</h1>
        <p style={{fontSize:13,color:"#94A3B8",margin:"0 0 24px"}}><strong>Last Updated:</strong> March 2, 2026</p>

        <div style={{fontSize:15,color:"#374151",lineHeight:1.8}}>
          <p>Welcome to ScratchAndDentGuide.com. These Terms of Service govern your access to and use of the website located at www.scratchanddentguide.com, operated by ScratchAndDentGuide.com. By accessing or using the Site, you agree to be bound by these Terms.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>1. About the Site</h2>
          <p>ScratchAndDentGuide.com is a free online directory that helps consumers locate scratch and dent appliance stores across the United States. We aggregate and publish store information as a public resource.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>2. Use of the Site</h2>
          <p>You may use the Site for lawful, personal, non-commercial purposes. You agree not to scrape or crawl data without written consent, interfere with the Site&rsquo;s functionality, reproduce content for commercial purposes, or transmit spam or unwanted communications.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>3. Store Listing Information &mdash; Disclaimer</h2>
          <p>The store listings are provided <strong>&ldquo;as is&rdquo;</strong> and <strong>&ldquo;as available.&rdquo;</strong> We make reasonable efforts to verify accuracy but do not guarantee that any listing information is accurate, complete, current, or reliable. <strong>Before visiting any store, we strongly recommend contacting the store directly to confirm current information.</strong></p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>4. No Endorsement</h2>
          <p>Inclusion of a store in our directory does not constitute an endorsement, recommendation, or guarantee of that store&rsquo;s products, services, quality, or business practices.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>5. Intellectual Property</h2>
          <p>All content on the Site is the property of ScratchAndDentGuide.com or its licensors and is protected by United States and international intellectual property laws.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>6. Third-Party Links</h2>
          <p>The Site contains links to third-party websites. We do not control, endorse, or assume responsibility for the content or practices of third-party websites.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>7. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, ScratchAndDentGuide.com shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your use of the Site, inaccuracies in store listings, or any interactions with listed stores.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>8. Disclaimer of Warranties</h2>
          <p>The Site is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis, without warranties of any kind, either express or implied.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>9. Changes to These Terms</h2>
          <p>We reserve the right to modify these Terms at any time. Your continued use of the Site after changes constitutes acceptance of the revised Terms.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>10. Contact Us</h2>
          <p>If you have questions about these Terms of Service, please contact us at <a href="mailto:info@scratchanddentguide.com" style={{color:"#10B981"}}>info@scratchanddentguide.com</a>.</p>
        </div>
      </div>
    </div>
  );
}

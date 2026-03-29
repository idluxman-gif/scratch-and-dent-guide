import Link from "next/link";
import PageNav from "@/components/PageNav";

export const metadata = {
  title: "Contact Us | Scratch & Dent Guide",
  description: "Get in touch with ScratchAndDentGuide.com. Report issues, suggest new stores, or request listing updates.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div style={{minHeight:"100vh",background:"#F9FAFB",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <PageNav />
      <div style={{maxWidth:680,margin:"0 auto",padding:"32px 20px 48px"}}>
        <nav style={{marginBottom:20,fontSize:12,color:"#94A3B8"}}>
          <Link href="/" style={{color:"#94A3B8",textDecoration:"none"}}>Home</Link>{" / "}
          <span style={{color:"#64748B"}}>Contact</span>
        </nav>
        <h1 style={{margin:"0 0 20px",fontSize:28,fontWeight:900,color:"#0F172A"}}>Contact Us</h1>

        <div style={{fontSize:15,color:"#374151",lineHeight:1.8}}>
          <p>We&rsquo;d love to hear from you. Whether you&rsquo;re a shopper with a question, a store owner who wants to be listed, or someone who spotted an error &mdash; your message helps us make Scratch &amp; Dent Guide better for everyone.</p>

          <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:12,padding:24,margin:"20px 0"}}>
            <h2 style={{fontSize:18,fontWeight:800,color:"#0F172A",margin:"0 0 8px"}}>Get in Touch</h2>
            <p style={{margin:"0 0 4px"}}><strong>Email:</strong> <a href="mailto:info@scratchanddentguide.com" style={{color:"#10B981"}}>info@scratchanddentguide.com</a></p>
            <p style={{margin:0,fontSize:13,color:"#94A3B8"}}>We typically respond within 1&ndash;2 business days.</p>
          </div>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>For Shoppers</h2>
          <p>Found outdated information for a store? Notice a listing that doesn&rsquo;t seem right? Let us know. Just send us an email with the store name and what needs to be corrected, and we&rsquo;ll look into it.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>For Store Owners</h2>
          <h3 style={{fontSize:16,fontWeight:700,color:"#0F172A",margin:"16px 0 8px"}}>Want Your Store Added?</h3>
          <p>If you operate a scratch and dent appliance store and don&rsquo;t see your business listed, send us an email with your store name, address, phone number, website (if applicable), and business hours. We&rsquo;ll verify the information and add your listing.</p>
          <h3 style={{fontSize:16,fontWeight:700,color:"#0F172A",margin:"16px 0 8px"}}>Want Your Store Removed?</h3>
          <p>If your store is currently listed and you&rsquo;d like it removed, just send us an email requesting removal. We&rsquo;ll process removal requests promptly, typically within 2&ndash;3 business days.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>Report a Problem</h2>
          <p>If something on the site isn&rsquo;t working properly &mdash; a broken link, a search issue, or anything else &mdash; please let us know at <a href="mailto:info@scratchanddentguide.com" style={{color:"#10B981"}}>info@scratchanddentguide.com</a> so we can fix it.</p>

          <p style={{marginTop:24,fontSize:13,color:"#94A3B8",fontStyle:"italic"}}>Thank you for helping us build the best scratch and dent appliance directory on the web.</p>
        </div>
      </div>
    </div>
  );
}

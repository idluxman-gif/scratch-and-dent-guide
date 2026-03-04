import Link from "next/link";
import PageNav from "@/components/PageNav";

export const metadata = {
  title: "About Scratch & Dent Guide | Our Mission",
  description: "Learn how ScratchAndDentGuide.com helps shoppers find 726+ verified scratch and dent appliance stores across 51 states. Free directory, no sign-up required.",
};

export default function AboutPage() {
  return (
    <div style={{minHeight:"100vh",background:"#F9FAFB",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <PageNav />
      <div style={{maxWidth:680,margin:"0 auto",padding:"32px 20px 48px"}}>
        <nav style={{marginBottom:20,fontSize:12,color:"#94A3B8"}}>
          <Link href="/" style={{color:"#94A3B8",textDecoration:"none"}}>Home</Link>{" / "}
          <span style={{color:"#64748B"}}>About</span>
        </nav>
        <h1 style={{margin:"0 0 8px",fontSize:28,fontWeight:900,color:"#0F172A"}}>About Scratch &amp; Dent Guide</h1>
        <h2 style={{margin:"0 0 20px",fontSize:16,fontWeight:600,color:"#64748B",lineHeight:1.5}}>The Easiest Way to Find Scratch &amp; Dent Appliance Deals Near You</h2>

        <div style={{fontSize:15,color:"#374151",lineHeight:1.8}}>
          <p>Buying a brand-new refrigerator, washer, or dishwasher at full retail price can be a major hit to your budget. But here&rsquo;s something most people don&rsquo;t realize: thousands of appliances across the country are sold at steep discounts simply because they have a minor cosmetic imperfection &mdash; a small scratch on the side panel, a dent on the back, or a scuff that&rsquo;ll be hidden the moment it&rsquo;s pushed against your kitchen wall. These appliances work perfectly. They just can&rsquo;t be sold as &ldquo;new.&rdquo;</p>
          <p>That&rsquo;s where Scratch &amp; Dent Guide comes in.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>What We Do</h2>
          <p>ScratchAndDentGuide.com is a free, searchable directory of <strong>726+ verified scratch and dent appliance stores across 51 US states.</strong> We built this site for one reason: to make it easy for everyday shoppers to find nearby stores that sell discounted appliances &mdash; without spending hours searching Google, calling around, or driving to stores that turned out to be something else entirely.</p>
          <p>Every listing in our directory includes the store name, address, phone number, customer ratings, and a link to the store&rsquo;s location on Google Maps. You can search by state, city, or zip code, and filter by the type of store you&rsquo;re looking for.</p>
          <p>It&rsquo;s all free. No sign-ups, no paywalls, no catches.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>How We Build and Verify Our Directory</h2>
          <p>We take the accuracy of our listings seriously. We start by gathering business data from publicly available sources, primarily Google Maps. We run every listing through multiple rounds of filtering to remove businesses that don&rsquo;t actually sell scratch and dent appliances. We check business categories, descriptions, reviews, and websites to confirm that each store genuinely belongs in our directory.</p>
          <p>Store information changes &mdash; businesses move, close, or update their hours. We periodically review and refresh our listings to keep the directory as current as possible. If you notice outdated information, we encourage you to <Link href="/contact" style={{color:"#10B981"}}>let us know</Link>.</p>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>By the Numbers</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,margin:"16px 0"}}>
            {[["726+","Verified store listings"],["51","US states covered"],["100%","Free to use"],["0","Sponsored or paid listings"]].map(([n,l])=>(
              <div key={l} style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:16,textAlign:"center"}}>
                <div style={{fontSize:24,fontWeight:900,color:"#0F172A"}}>{n}</div>
                <div style={{fontSize:12,color:"#64748B"}}>{l}</div>
              </div>
            ))}
          </div>

          <h2 style={{fontSize:22,fontWeight:800,color:"#0F172A",margin:"32px 0 12px"}}>Contact Us</h2>
          <p>Have a question? Want to suggest a store we missed? Found outdated information? We&rsquo;d love to hear from you.</p>
          <p><strong>Email:</strong> info@scratchanddentguide.com</p>
          <p>We&rsquo;re a small operation, but we read every message and typically respond within 1&ndash;2 business days.</p>
        </div>
      </div>
    </div>
  );
}

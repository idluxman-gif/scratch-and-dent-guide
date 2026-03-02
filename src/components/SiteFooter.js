import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer style={{background:"#0B1120",borderTop:"1px solid rgba(255,255,255,.06)",padding:"18px 20px",textAlign:"center"}}>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:16,marginBottom:10}}>
        <Link href="/about" style={{fontSize:11,color:"rgba(255,255,255,.4)",textDecoration:"none"}}>About</Link>
        <Link href="/contact" style={{fontSize:11,color:"rgba(255,255,255,.4)",textDecoration:"none"}}>Contact</Link>
        <Link href="/blog" style={{fontSize:11,color:"rgba(255,255,255,.4)",textDecoration:"none"}}>Blog</Link>
        <Link href="/privacy-policy" style={{fontSize:11,color:"rgba(255,255,255,.4)",textDecoration:"none"}}>Privacy Policy</Link>
        <Link href="/terms" style={{fontSize:11,color:"rgba(255,255,255,.4)",textDecoration:"none"}}>Terms of Service</Link>
      </div>
      <p style={{fontSize:10,color:"rgba(255,255,255,.25)",margin:0}}>
        &copy; {new Date().getFullYear()} ScratchAndDentGuide.com. All rights reserved.
      </p>
    </footer>
  );
}

import Link from "next/link";

export default function PageNav() {
  return (
    <nav style={{background:"#0F172A",padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
      <Link href="/" style={{textDecoration:"none"}}>
        <span style={{fontSize:15,fontWeight:800,color:"#fff"}}>
          \u{1F3F7}\uFE0F Scratch<span style={{color:"#10B981"}}>&amp;</span>Dent<span style={{color:"#94A3B8",fontWeight:400}}>Guide</span>
        </span>
      </Link>
      <div style={{display:"flex",gap:14,fontSize:12}}>
        <Link href="/" style={{color:"rgba(255,255,255,.6)",textDecoration:"none"}}>Directory</Link>
        <Link href="/blog" style={{color:"rgba(255,255,255,.6)",textDecoration:"none"}}>Blog</Link>
        <Link href="/about" style={{color:"rgba(255,255,255,.6)",textDecoration:"none"}}>About</Link>
        <Link href="/contact" style={{color:"rgba(255,255,255,.6)",textDecoration:"none"}}>Contact</Link>
      </div>
    </nav>
  );
}

"use client";
import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { stores as D, getStorePath, getStatePath, getCityPath, stateNames, getStateSlug } from "@/data/stores";

const S = D.map(d=>({id:d.i,name:d.n,city:d.c,state:d.s,address:d.a,phone:d.p,website:d.w,rating:d.r,reviews:d.v,price:d.pr}));
const AC=[...new Set(S.map(s=>s.city))].sort();
const AS=[...new Set(S.map(s=>s.state))].sort();

const Star=({f})=><svg width={13} height={13} viewBox="0 0 24 24" fill={f?"#F59E0B":"none"} stroke="#F59E0B" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const Stars=({r,n})=><div style={{display:"flex",alignItems:"center",gap:2}}>{[1,2,3,4,5].map(i=><Star key={i} f={i<=Math.round(r)}/>)}<span style={{fontSize:11,color:"#94A3B8",marginLeft:3}}>{r>0?r:"New"}{n>0?` (${n})`:""}</span></div>;
const PT=({p})=>{const m={"$":["Budget","#10B981"],"$$":["Mid-Range","#3B82F6"],"$$$":["Premium","#8B5CF6"]};const[l,c]=m[p]||m["$$"];return <span style={{padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:600,color:c,background:c+"15"}}>{p} {l}</span>;};

const Card=({s,onClick})=>(
<Link href={getStorePath({n:s.name,c:s.city,s:s.state})} style={{textDecoration:"none",color:"inherit"}} onClick={(e)=>{e.preventDefault();onClick(s);}}><div style={{background:"#fff",borderRadius:12,border:"1px solid #E2E8F0",cursor:"pointer",transition:"all .2s",overflow:"hidden"}}
onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.07)";}}
onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
<div style={{height:100,background:"linear-gradient(135deg,#0F172A,#1E293B)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
<span style={{fontSize:26,opacity:.1}}>🏭</span>
<div style={{position:"absolute",top:8,right:8}}><PT p={s.price}/></div>
</div>
<div style={{padding:"10px 12px 13px"}}>
<h3 style={{margin:0,fontSize:13,fontWeight:700,color:"#0F172A",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</h3>
<div style={{marginTop:3,color:"#64748B",fontSize:11}}>📍 {s.city}, {s.state}</div>
<div style={{marginTop:4}}><Stars r={s.rating} n={s.reviews}/></div>
{s.phone&&<div style={{marginTop:4,fontSize:10,color:"#94A3B8"}}>📞 {s.phone}</div>}
</div></div></Link>);

const Modal=({s,onClose})=>{
const[sf,setSf]=useState(false);
if(!s)return null;
return(<div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)"}}/>
<div onClick={e=>e.stopPropagation()} style={{position:"relative",background:"#fff",borderRadius:16,maxWidth:520,width:"100%",maxHeight:"85vh",overflow:"auto"}}>
<div style={{height:130,background:"linear-gradient(135deg,#0F172A,#1E293B,#334155)",padding:20,display:"flex",alignItems:"flex-end",borderRadius:"16px 16px 0 0",position:"relative"}}>
<button onClick={onClose} style={{position:"absolute",top:10,right:10,background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:14}}>✕</button>
<div><h2 style={{margin:0,color:"#fff",fontSize:20,fontWeight:800}}>{s.name}</h2>
<p style={{color:"rgba(255,255,255,.6)",fontSize:12,margin:"3px 0 0"}}>📍 {s.address||s.city+", "+s.state}</p></div></div>
<div style={{padding:18}}>
<div style={{display:"flex",gap:6,marginBottom:12}}><PT p={s.price}/></div>
<Stars r={s.rating} n={s.reviews}/>
{s.phone&&<div style={{marginTop:10,padding:10,background:"#F8FAFC",borderRadius:8}}><span style={{fontSize:10,color:"#94A3B8",fontWeight:600}}>PHONE</span><div style={{fontSize:13,color:"#334155",fontWeight:600}}>{s.phone}</div></div>}
{s.website&&<a href={s.website} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:8,fontSize:12,color:"#3B82F6",textDecoration:"none"}}>🔗 Visit Website</a>}
<div style={{display:"flex",gap:8,marginTop:14}}>
{s.phone&&<a href={"tel:"+s.phone.replace(/\D/g,"")} style={{flex:1,padding:"11px",background:"#0F172A",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:700,textAlign:"center",textDecoration:"none"}}>📞 Call Now</a>}
<button onClick={()=>setSf(!sf)} style={{flex:1,padding:"11px",background:"#E8F5E9",color:"#2E7D32",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer"}}>✉️ Get Quote</button>
</div>
{sf&&<div style={{marginTop:12,padding:14,background:"#F8FAFC",borderRadius:10,border:"1px solid #E2E8F0"}}>
<h4 style={{margin:"0 0 8px",fontSize:13}}>Request a Free Quote</h4>
<div style={{display:"flex",flexDirection:"column",gap:6}}>
{["Name","Email","Phone"].map(p=><input key={p} placeholder={p} style={{padding:"7px 10px",borderRadius:7,border:"1px solid #CBD5E1",fontSize:12,outline:"none"}}/>)}
<select style={{padding:"7px 10px",borderRadius:7,border:"1px solid #CBD5E1",fontSize:12,color:"#64748B"}}><option>Looking for...</option><option>Refrigerator</option><option>Washer</option><option>Dryer</option><option>Dishwasher</option><option>Range</option></select>
<button style={{padding:"9px",background:"#10B981",color:"#fff",border:"none",borderRadius:7,fontSize:13,fontWeight:700,cursor:"pointer"}}>Send</button>
</div></div>}
</div></div></div>);};

export default function App(){
const[q,setQ]=useState("");const[sel,setSel]=useState(null);const[fS,setFS]=useState("");const[fC,setFC]=useState("");const[fP,setFP]=useState("");const rr=useRef(null);const[pg,setPg]=useState(1);
const filtered=useMemo(()=>{let l=S;if(fS)l=l.filter(s=>s.state===fS);if(fC)l=l.filter(s=>s.city===fC);if(fP)l=l.filter(s=>s.price===fP);if(q){const ql=q.toLowerCase();l=l.filter(s=>s.name.toLowerCase().includes(ql)||s.city.toLowerCase().includes(ql)||s.state.toLowerCase().includes(ql));}return l;},[fS,fC,fP,q]);
const paged=filtered.slice(0,pg*24);
const ciInSt=useMemo(()=>fS?[...new Set(S.filter(s=>s.state===fS).map(s=>s.city))].sort():AC,[fS]);
const stSt=useMemo(()=>{const m={};S.forEach(s=>{if(!m[s.state])m[s.state]={n:0,c:new Set()};m[s.state].n++;m[s.state].c.add(s.city);});return Object.entries(m).map(([k,v])=>({st:k,n:v.n,c:v.c.size})).sort((a,b)=>b.n-a.n);},[]);
const ciSt=useMemo(()=>{const m={};S.forEach(s=>{const k=s.city+"|"+s.state;if(!m[k])m[k]={city:s.city,state:s.state,n:0};m[k].n++;});return Object.values(m).sort((a,b)=>b.n-a.n);},[]);
const clr=()=>{setFS("");setFC("");setFP("");setQ("");setPg(1);};
const ss={padding:"8px 10px",borderRadius:7,border:"1px solid #E2E8F0",fontSize:12,color:"#0F172A",background:"#fff",cursor:"pointer",outline:"none",minWidth:110};

return(<div style={{minHeight:"100vh",background:"#F9FAFB",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<nav style={{background:"#0F172A",padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
<div style={{cursor:"pointer"}} onClick={clr}><span style={{fontSize:15,fontWeight:800,color:"#fff"}}>🏷️ Scratch<span style={{color:"#10B981"}}>&</span>Dent<span style={{color:"#94A3B8",fontWeight:400}}>Guide</span></span></div>
<div style={{display:"flex",gap:14,fontSize:12}}><a href="#" onClick={e=>{e.preventDefault();rr.current?.scrollIntoView({behavior:"smooth"});}} style={{color:"rgba(255,255,255,.6)",textDecoration:"none"}}>Browse</a><a href="/blog" style={{color:"rgba(255,255,255,.6)",textDecoration:"none"}}>Blog</a><a href="#about" style={{color:"rgba(255,255,255,.6)",textDecoration:"none"}}>About</a></div>
</nav>

<div style={{background:"linear-gradient(160deg,#0F172A,#1E293B 50%,#334155)",padding:"55px 20px 44px",textAlign:"center",position:"relative"}}>
<div style={{position:"absolute",inset:0,opacity:.025,backgroundImage:"radial-gradient(circle,rgba(255,255,255,.3) 1px,transparent 1px)",backgroundSize:"22px 22px"}}/>
<div style={{position:"relative",maxWidth:580,margin:"0 auto"}}>
<div style={{display:"inline-block",padding:"4px 12px",background:"rgba(16,185,129,.12)",borderRadius:18,marginBottom:12}}><span style={{fontSize:12,fontWeight:600,color:"#10B981"}}>💰 Save 30-70% on Major Appliances</span></div>
<h1 style={{margin:"0 0 10px",fontSize:"clamp(24px,5vw,40px)",fontWeight:900,color:"#fff",lineHeight:1.1}}>Find Scratch & Dent<br/><span style={{background:"linear-gradient(135deg,#10B981,#34D399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Appliance Stores</span> Near You</h1>
<p style={{fontSize:14,color:"rgba(255,255,255,.45)",maxWidth:400,margin:"0 auto 20px",lineHeight:1.6}}>{S.length}+ verified stores across {AS.length} states.</p>
<div style={{display:"flex",maxWidth:440,margin:"0 auto",background:"#fff",borderRadius:12,padding:3,boxShadow:"0 12px 40px rgba(0,0,0,.25)"}}>
<input value={q} onChange={e=>{setQ(e.target.value);setPg(1);}} onKeyDown={e=>{if(e.key==="Enter")rr.current?.scrollIntoView({behavior:"smooth"});}} placeholder="City, state, or store..." style={{flex:1,border:"none",outline:"none",fontSize:14,padding:"10px 12px",color:"#0F172A",borderRadius:9}}/>
<button onClick={()=>rr.current?.scrollIntoView({behavior:"smooth"})} style={{padding:"10px 18px",background:"#0F172A",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer"}}>Search</button>
</div>
<div style={{marginTop:12,display:"flex",flexWrap:"wrap",justifyContent:"center",gap:4}}>
{ciSt.slice(0,6).map(c=><button key={c.city+c.state} onClick={()=>{setFS(c.state);setFC(c.city);setPg(1);setTimeout(()=>rr.current?.scrollIntoView({behavior:"smooth"}),50);}} style={{fontSize:10,color:"rgba(255,255,255,.45)",background:"rgba(255,255,255,.07)",border:"none",padding:"2px 8px",borderRadius:5,cursor:"pointer"}}>{c.city}, {c.state}</button>)}
</div></div></div>

<div style={{background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"10px 20px"}}>
<div style={{maxWidth:600,margin:"0 auto",display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
{[{n:S.length+"+",l:"Stores"},{n:AS.length,l:"States"},{n:"30-70%",l:"Savings"},{n:"4.6",l:"Avg Rating"}].map(x=><div key={x.l} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:"#0F172A"}}>{x.n}</div><div style={{fontSize:10,color:"#94A3B8"}}>{x.l}</div></div>)}
</div></div>

<div ref={rr} style={{maxWidth:1060,margin:"0 auto",padding:"20px 16px"}}>
<div style={{background:"#fff",borderRadius:10,border:"1px solid #E5E7EB",padding:"10px 12px",marginBottom:14,display:"flex",flexWrap:"wrap",alignItems:"center",gap:6}}>
<span style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>Filter:</span>
<select value={fS} onChange={e=>{setFS(e.target.value);setFC("");setPg(1);}} style={ss}><option value="">All States</option>{AS.map(s=><option key={s} value={s}>{s}</option>)}</select>
<select value={fC} onChange={e=>{setFC(e.target.value);setPg(1);}} style={ss}><option value="">All Cities</option>{ciInSt.map(c=><option key={c} value={c}>{c}</option>)}</select>
<select value={fP} onChange={e=>{setFP(e.target.value);setPg(1);}} style={ss}><option value="">Any Price</option><option value="$">$ Budget</option><option value="$$">$$ Mid-Range</option><option value="$$$">$$$ Premium</option></select>
{(fS||fC||fP||q)&&<button onClick={clr} style={{fontSize:11,color:"#EF4444",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>✕ Clear</button>}
<span style={{marginLeft:"auto",fontSize:12,color:"#94A3B8"}}>{filtered.length}</span>
</div>
<h2 style={{margin:"0 0 12px",fontSize:17,fontWeight:800,color:"#0F172A"}}>{fC?`${fC}, ${fS}`:fS?`Stores in ${fS}`:"All Scratch & Dent Stores"}</h2>
{filtered.length===0?<div style={{textAlign:"center",padding:"36px",background:"#fff",borderRadius:12,border:"1px solid #E5E7EB"}}><p style={{color:"#64748B"}}>No stores found</p><button onClick={clr} style={{padding:"7px 18px",background:"#0F172A",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontWeight:600,fontSize:12}}>Show All</button></div>
:<><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>{paged.map(s=><Card key={s.id} s={s} onClick={setSel}/>)}</div>
{paged.length<filtered.length&&<div style={{textAlign:"center",marginTop:16}}><button onClick={()=>setPg(p=>p+1)} style={{padding:"9px 24px",background:"#0F172A",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer"}}>Load More ({filtered.length-paged.length} left)</button></div>}</>}
</div>

<div style={{padding:"36px 20px",background:"#fff",borderTop:"1px solid #E5E7EB"}}>
<div style={{maxWidth:780,margin:"0 auto",textAlign:"center"}}>
<h2 style={{fontSize:20,fontWeight:800,color:"#0F172A",margin:"0 0 20px"}}>How It Works</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
{[["🔍","Search","Find stores near you"],["📊","Compare","Filter by price & rating"],["💰","Save","30-70% off retail prices"]].map(([e,t,d],i)=><div key={i} style={{padding:18,background:"#F9FAFB",borderRadius:12}}><div style={{fontSize:24,marginBottom:6}}>{e}</div><h3 style={{fontSize:13,fontWeight:700,color:"#0F172A",margin:"0 0 3px"}}>{t}</h3><p style={{fontSize:11,color:"#64748B",margin:0}}>{d}</p></div>)}
</div></div></div>

<div style={{padding:"36px 20px",background:"#F9FAFB"}}>
<div style={{maxWidth:780,margin:"0 auto"}}>
<h2 style={{fontSize:17,fontWeight:800,color:"#0F172A",margin:"0 0 14px",textAlign:"center"}}>Browse by State</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:7}}>
{stSt.map(st=><Link key={st.st} href={getStatePath(st.st)} onClick={(e)=>{e.preventDefault();setFS(st.st);setFC("");setPg(1);rr.current?.scrollIntoView({behavior:"smooth"});}} style={{padding:"9px 10px",background:"#fff",border:"1px solid #E5E7EB",borderRadius:7,cursor:"pointer",textAlign:"left",transition:"all .15s",textDecoration:"none",display:"block"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#10B981"} onMouseLeave={e=>e.currentTarget.style.borderColor="#E5E7EB"}><div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>{st.st}</div><div style={{fontSize:10,color:"#64748B"}}>{st.n} stores</div></Link>)}
</div></div></div>

<div id="about" style={{padding:"36px 20px",maxWidth:640,margin:"0 auto"}}>
<h2 style={{fontSize:18,fontWeight:800,color:"#0F172A",marginBottom:8}}>What Are Scratch & Dent Appliances?</h2>
<p style={{fontSize:13,color:"#475569",lineHeight:1.7}}>Brand-new appliances from Samsung, LG, Whirlpool, GE, and Bosch with minor cosmetic imperfections sold at 30-70% off retail. Fully functional, often with manufacturer warranties. Our directory helps you find the best deals near you.</p>
</div>

<div style={{padding:"36px 20px",background:"#fff",borderTop:"1px solid #E5E7EB"}}>
<div style={{maxWidth:780,margin:"0 auto"}}>
<div style={{textAlign:"center",marginBottom:20}}>
<h2 style={{fontSize:20,fontWeight:800,color:"#0F172A",margin:"0 0 4px"}}>Latest Articles</h2>
<p style={{fontSize:13,color:"#64748B",margin:0}}>Tips and guides to help you save on appliances</p>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14}}>
{[
{slug:"best-scratch-and-dent-stores-atlanta",title:"Best S&D Stores in Atlanta, GA",desc:"Atlanta's distribution hub status and booming housing market create one of the best scratch and dent scenes in the Southeast.",date:"Mar 3, 2026"},
{slug:"best-scratch-and-dent-stores-houston",title:"Best S&D Stores in Houston, TX",desc:"Houston's massive metro, constant construction, and fierce dealer competition mean great scratch and dent deals across the city.",date:"Mar 3, 2026"},
{slug:"best-scratch-and-dent-stores-phoenix",title:"Best S&D Stores in Phoenix, AZ",desc:"Phoenix's explosive growth and strong construction pipeline make it one of the best cities in the Southwest for S&D shopping.",date:"Mar 3, 2026"},
].map(a=><a key={a.slug} href={"/blog/"+a.slug} style={{textDecoration:"none",color:"inherit",background:"#F9FAFB",borderRadius:12,border:"1px solid #E5E7EB",padding:18,transition:"all .2s",display:"block"}}
onMouseEnter={e=>{e.currentTarget.style.borderColor="#10B981";e.currentTarget.style.transform="translateY(-2px)";}}
onMouseLeave={e=>{e.currentTarget.style.borderColor="#E5E7EB";e.currentTarget.style.transform="none";}}>
<div style={{fontSize:10,color:"#10B981",fontWeight:600,marginBottom:6}}>{a.date}</div>
<h3 style={{margin:"0 0 6px",fontSize:14,fontWeight:700,color:"#0F172A",lineHeight:1.3}}>{a.title}</h3>
<p style={{margin:0,fontSize:12,color:"#64748B",lineHeight:1.5}}>{a.desc}</p>
<span style={{display:"inline-block",marginTop:8,fontSize:11,fontWeight:600,color:"#10B981"}}>Read article →</span>
</a>)}
</div>
<div style={{textAlign:"center",marginTop:16}}><a href="/blog" style={{fontSize:13,fontWeight:700,color:"#0F172A",textDecoration:"none",padding:"9px 22px",border:"1px solid #E2E8F0",borderRadius:9,display:"inline-block",transition:"all .15s"}}
onMouseEnter={e=>e.currentTarget.style.borderColor="#10B981"}
onMouseLeave={e=>e.currentTarget.style.borderColor="#E2E8F0"}>View All Articles →</a></div>
</div></div>

<footer style={{background:"#0F172A",padding:"24px 20px 16px",color:"rgba(255,255,255,.35)"}}>
<div style={{maxWidth:700,margin:"0 auto",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
<div><div style={{fontSize:14,fontWeight:800,color:"#fff",marginBottom:3}}>🏷️ Scratch<span style={{color:"#10B981"}}>&</span>DentGuide</div><p style={{fontSize:10,maxWidth:220,lineHeight:1.4}}>The largest directory of scratch & dent appliance stores in the US.</p></div>
<div><div style={{fontSize:10,fontWeight:600,color:"#fff",marginBottom:4}}>TOP CITIES</div>{ciSt.slice(0,6).map(c=><div key={c.city+c.state} style={{fontSize:10}}>{c.city}, {c.state}</div>)}</div>
</div>
<div style={{borderTop:"1px solid rgba(255,255,255,.06)",marginTop:12,paddingTop:10,fontSize:9,textAlign:"center"}}>© 2026 ScratchAndDentGuide.com</div>
</footer>

{sel&&<Modal s={sel} onClose={()=>setSel(null)}/>}
</div>);}

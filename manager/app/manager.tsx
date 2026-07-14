"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Cake = { slug:string; title:string; category:string; image:string; imageAlt:string; flavour:string; description:string; ingredients:string; priceFrom:number; featured:boolean; published:boolean };

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const max = 1800;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not prepare photograph")), "image/webp", .84));
  bitmap.close();
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = ""; for (let i = 0; i < buffer.length; i += 8192) binary += String.fromCharCode(...buffer.subarray(i, i + 8192));
  return { imageBase64: btoa(binary), imageType: "image/webp", preview: URL.createObjectURL(blob) };
}

export default function Manager() {
  const [cakes, setCakes] = useState<Cake[]>([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(""); const [error, setError] = useState(""); const [search, setSearch] = useState(""); const [tab, setTab] = useState<"add"|"manage">("add"); const [preview, setPreview] = useState("");
  const load = async () => { setLoading(true); const response=await fetch("/api/cakes",{cache:"no-store"}); const data=await response.json(); if(response.ok)setCakes(data.cakes); else setError(data.error); setLoading(false); };
  useEffect(()=>{load();},[]);
  const visible = useMemo(()=>cakes.filter(c=>c.title.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>Number(b.published)-Number(a.published)||a.title.localeCompare(b.title)),[cakes,search]);
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("Preparing the photograph…");
    const form=event.currentTarget; const data=new FormData(form); const file=data.get("image") as File;
    try {
      if(!file?.size) throw new Error("Please choose a cake photograph.");
      const image=await compressImage(file); setPreview(image.preview); setNotice("Publishing the cake to the website…");
      const body=Object.fromEntries(data.entries()); delete body.image;
      const response=await fetch("/api/cakes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,...image,featured:data.get("featured")==="on"})});
      const result=await response.json(); if(!response.ok) throw new Error(result.error);
      setNotice(`Published ${result.cake.title}. The live website is rebuilding now and normally updates within two minutes.`); form.reset(); await load(); setTab("manage");
    } catch(e) { setError(e instanceof Error?e.message:"The cake could not be published."); setNotice(""); }
    finally { setBusy(false); }
  }
  async function toggle(cake:Cake) {
    const action=cake.published?"remove this cake from the public website":"restore this cake to the public website";
    if(!confirm(`Are you sure you want to ${action}?`))return;
    setBusy(true); setError(""); setNotice(cake.published?"Removing the cake safely…":"Restoring the cake…");
    const response=await fetch(`/api/cakes/${cake.slug}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({published:!cake.published})}); const result=await response.json();
    if(response.ok){setNotice(`${cake.title} was ${cake.published?"removed":"restored"}. The live website is rebuilding now.`); await load();}else{setError(result.error);setNotice("");} setBusy(false);
  }
  return <main className="shell">
    <header><div><p className="eyebrow">Private owner tool</p><h1>GyulRose Cake Manager</h1><p>Publish a new cake or safely remove an old one.</p></div><button className="quiet" onClick={async()=>{await fetch("/api/logout",{method:"POST"});location.href="/login"}}>Sign out</button></header>
    <nav><button className={tab==="add"?"active":""} onClick={()=>setTab("add")}>＋ Add new cake</button><button className={tab==="manage"?"active":""} onClick={()=>setTab("manage")}>Manage cakes <span>{cakes.filter(c=>c.published).length}</span></button></nav>
    {(notice||error)&&<div className={error?"notice error":"notice success"} role="status">{error||notice}</div>}
    {tab==="add"?<section className="panel"><div className="section-title"><h2>Add a cake</h2><p>Complete the essential details. The cake publishes automatically.</p></div><form onSubmit={add}>
      <label className="photo">Cake photograph *<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>{const f=e.target.files?.[0];if(f)setPreview(URL.createObjectURL(f));}} />{preview&&<img src={preview} alt="Selected cake preview" />}</label>
      <div className="two"><label>Cake name *<input name="title" required minLength={3} maxLength={100} placeholder="Pink floral 30th birthday cake" /></label><label>Price from (£) *<input name="priceFrom" type="number" min="0" max="5000" step="1" required /></label></div>
      <div className="two"><label>Category *<select name="category" required defaultValue=""><option value="" disabled>Choose category</option><option value="birthday">Birthday cakes</option><option value="children-themed">Children's and themed cakes</option><option value="celebration">Celebration cakes</option><option value="corporate">Corporate cakes</option></select></label><label>Flavour *<input name="flavour" required maxLength={120} placeholder="Vanilla and strawberry" /></label></div>
      <label>Short description *<textarea name="description" required minLength={30} maxLength={350} rows={3} placeholder="Describe the design, colours and occasion." /></label>
      <label>Ingredients shown *<textarea name="ingredients" required minLength={5} maxLength={500} rows={3} placeholder="Sponge, filling, buttercream and decorations shown" /></label>
      <label>Photo description *<input name="imageAlt" required minLength={8} maxLength={180} placeholder="Pink floral birthday cake with gold details" /><small>Describe what people can see in the photograph.</small></label>
      <label className="check"><input name="featured" type="checkbox" /> Feature this cake near the top of the homepage</label>
      <button className="primary" disabled={busy}>{busy?"Publishing…":"Publish cake to website"}</button>
    </form></section>:<section className="panel"><div className="manage-head"><div className="section-title"><h2>Manage cakes</h2><p>Removed cakes stay safely archived and can be restored.</p></div><input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search cakes…" /></div>
      {loading?<p>Loading cakes…</p>:<div className="cake-list">{visible.map(cake=><article key={cake.slug} className={!cake.published?"archived":""}><img src={`https://gyulrosecakes.com${cake.image}`} alt="" /><div><h3>{cake.title}</h3><p>From £{cake.priceFrom.toFixed(0)} · {cake.category.replace("-"," ")}</p><span className={cake.published?"live":"archive"}>{cake.published?"Live":"Removed"}</span></div><button className={cake.published?"danger":"restore"} disabled={busy} onClick={()=>toggle(cake)}>{cake.published?"Remove":"Restore"}</button></article>)}</div>}
    </section>}
    <footer>Changes are saved to GitHub and deployed automatically. Removed cakes remain recoverable.</footer>
  </main>;
}

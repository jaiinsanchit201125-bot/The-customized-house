/* The Customized House - shop page */
(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const CATS=window.TCH_CATEGORIES, CAT=window.TCH_CATALOG;
const WA='https://wa.me/918431573282?text=';
const SIZES=['S','M','L','XL','XXL'];
const FABRIC={tshirt:'180 GSM cotton',oversized:'240 GSM cotton',hoodie:'320 GSM fleece',sweatshirt:'320 GSM fleece',jacket:'320 GSM fleece'};
const money=n=>'₹'+n.toLocaleString('en-IN');
const off=p=>Math.round((1-p.price/p.mrp)*100);
const qs=new URLSearchParams(location.search);
let cat=(CATS[qs.get('c')]||qs.get('c')==='fav')?qs.get('c'):'tshirt', chip='all', sort='feat';
/* favourites (saved on this device) */
let favs=new Set(); try{ favs=new Set(JSON.parse(localStorage.getItem('tch_favs')||'[]')); }catch(e){}
const saveFavs=()=>{ try{ localStorage.setItem('tch_favs',JSON.stringify([...favs])); }catch(e){} const c=document.querySelector('#favCount'); if(c) c.textContent=favs.size; };
const ALL=Object.entries(CAT).flatMap(([k,l])=>l.map(p=>({...p,cat:k})));
const HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.2 3.4 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.6 0 5.5 3.7 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z"/></svg>';
const FAVCAT={name:'Saved designs',blurb:'Your favourite designs, saved on this device. Add them to your bag whenever you are ready.',studio:'tshirt'};
function toast(t){const e=$('#toast'); e.textContent=t; e.classList.add('on'); clearTimeout(e._t); e._t=setTimeout(()=>e.classList.remove('on'),2200);}

/* header bits shared with the homepage */
const hdr=$('#hdr'); const onScroll=()=>hdr&&hdr.classList.toggle('scrolled',scrollY>20); addEventListener('scroll',onScroll,{passive:true}); onScroll();
$('#menuBtn')&&$('#menuBtn').addEventListener('click',()=>$('#links').classList.toggle('open'));
$('#yr')&&($('#yr').textContent=new Date().getFullYear());


/* category tabs */
$('#catTabs').innerHTML=Object.entries(CATS).map(([k,c])=>`<a href="?c=${k}" data-c="${k}">${c.name}${CAT[k].length?`<span>${CAT[k].length}</span>`:''}</a>`).join('')
  +`<a href="?c=fav" data-c="fav" class="fav-tab"><i>${HEART}</i>Saved<span id="favCount">${favs.size}</span></a>`;
$('#catTabs').addEventListener('click',e=>{const a=e.target.closest('a'); if(!a) return; e.preventDefault(); cat=a.dataset.c; chip='all'; history.replaceState(null,'','?c='+cat); renderAll(); scrollTo({top:0,behavior:'smooth'});});

function chipsFor(list){
  const names={all:'All',black:'Black',white:'White',beige:'Beige',plain:'Plain tees',graphic:'Graphic',minimal:'Minimal',retro:'Retro',streetwear:'Streetwear'};
  const used=['all',...new Set(list.flatMap(p=>p.tags||[]))].filter(t=>names[t]);
  return used.map(t=>`<button data-t="${t}" class="${t===chip?'on':''}">${names[t]}</button>`).join('');
}
function renderAll(){
  const c=cat==='fav'?FAVCAT:CATS[cat], list=cat==='fav'?ALL.filter(p=>favs.has(p.id)):(CAT[cat]||[]);
  document.title=c.name+' - The Customized House';
  $('#crumb').textContent=c.name; $('#catTitle').textContent=c.name; $('#catBlurb').textContent=c.blurb;
  $$('#catTabs a').forEach(a=>a.classList.toggle('on',a.dataset.c===cat));
  $('.offer').style.display=(list.length&&cat!=='fav')?'':'none';
  if(list.length){ const p=list[0]; $('.offer span').innerHTML=`Every design ${money(p.price)} <s>${money(p.mrp)}</s>`; }
  $('#ownBtn').href='studio.html?p='+c.studio;
  $('#chips').innerHTML=list.length?chipsFor(list):'';
  renderGrid();
}
function renderGrid(){
  const base=cat==='fav'?ALL.filter(p=>favs.has(p.id)):(CAT[cat]||[]);
  let list=base.filter(p=>chip==='all'||(p.tags||[]).includes(chip));
  if(sort==='az') list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==='za') list=[...list].sort((a,b)=>b.name.localeCompare(a.name));
  $('#count').textContent=list.length?list.length+' design'+(list.length>1?'s':''):'';
  if(cat==='fav'&&!base.length){
    $('#pgrid').innerHTML=`<div class="pempty"><h3>No saved designs yet</h3><p>Tap the heart on any design to save it here for later.</p>
      <div class="acts"><a class="btn btn-primary" href="?c=hoodie" data-go="hoodie">Browse hoodies</a><a class="btn btn-ghost" href="?c=tshirt" data-go="tshirt">Browse T-Shirts</a></div></div>`;
    $$('[data-go]').forEach(g=>g.addEventListener('click',e=>{e.preventDefault(); cat=g.dataset.go; history.replaceState(null,'','?c='+cat); renderAll();}));
    return;
  }
  if(!base.length){
    $('#pgrid').innerHTML=`<div class="pempty"><h3>${CATS[cat].name} designs are coming soon</h3><p>Our designs for this range are on the way. You can still design your own right now.</p>
      <div class="acts"><a class="btn btn-primary" href="studio.html?p=${CATS[cat].studio}">Design your own</a><a class="btn btn-ghost" href="?c=tshirt" data-go="tshirt">Shop T-Shirts</a></div></div>`;
    const g=$('[data-go]'); g&&g.addEventListener('click',e=>{e.preventDefault(); cat='tshirt'; history.replaceState(null,'','?c=tshirt'); renderAll();});
    return;
  }
  $('#pgrid').innerHTML=list.map(p=>{ const kind=CATS[p.cat||cat].name.replace(/s$/,'');
    return `<div class="pc" data-id="${p.id}" role="button" tabindex="0" aria-label="${p.name} ${kind}">
    <div class="ph"><img src="${p.img}" alt="${p.name}" loading="lazy"><span class="badge">${off(p)}% OFF</span><span class="quick">Quick view</span>
      <button class="fav${favs.has(p.id)?' on':''}" data-fav="${p.id}" aria-pressed="${favs.has(p.id)}" aria-label="Save ${p.name} to favourites">${HEART}</button></div>
    <span class="nm">${p.name}</span><span class="sub">${cat==='fav'?kind+' · ':''}${p.colour} · ${p.print}</span>
    <span class="pr"><b>${money(p.price)}</b><s>${money(p.mrp)}</s><em>Save ${money(p.mrp-p.price)}</em></span>
    <div class="qa"><button class="qa-btn" data-qa="${p.id}">Add to bag</button>
      <div class="qa-sizes" hidden><span>Pick a size</span><div>${SIZES.map(s=>`<button data-qs="${s}" data-id="${p.id}">${s}</button>`).join('')}</div></div></div></div>`; }).join('');
}
$('#chips').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; chip=b.dataset.t; $$('#chips button').forEach(x=>x.classList.toggle('on',x===b)); renderGrid();});
$('#sort').addEventListener('change',e=>{sort=e.target.value; renderGrid();});
$('#pgrid').addEventListener('click',e=>{
  const f=e.target.closest('[data-fav]');
  if(f){ e.stopPropagation(); const id=f.dataset.fav, on=!favs.has(id); on?favs.add(id):favs.delete(id); saveFavs();
    f.classList.toggle('on',on); f.setAttribute('aria-pressed',on); f.classList.remove('pulse'); void f.offsetWidth; f.classList.add('pulse');
    toast(on?'Saved to favourites':'Removed from favourites'); if(cat==='fav'&&!on) renderGrid(); return; }
  const q=e.target.closest('[data-qa]');
  if(q){ e.stopPropagation(); $$('.qa').forEach(x=>{ if(x!==q.parentElement){ x.querySelector('.qa-btn').hidden=false; x.querySelector('.qa-sizes').hidden=true; } });
    q.hidden=true; q.parentElement.querySelector('.qa-sizes').hidden=false; return; }
  const s=e.target.closest('[data-qs]');
  if(s){ e.stopPropagation(); const p=find(s.dataset.id); addToBag(p,s.dataset.qs,1); toast(`Added to bag - ${p.name} (${s.dataset.qs})`);
    const qa=s.closest('.qa'); qa.querySelector('.qa-sizes').hidden=true; const btn=qa.querySelector('.qa-btn'); btn.hidden=false; btn.textContent='Added ✓'; btn.classList.add('done');
    setTimeout(()=>{ btn.textContent='Add to bag'; btn.classList.remove('done'); },1600); return; }
  if(e.target.closest('.qa')) return;
  const b=e.target.closest('.pc'); if(b) openProduct(b.dataset.id);});
$('#pgrid').addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.classList.contains('pc')) openProduct(e.target.dataset.id); });

/* product modal */
let cur=null, size=null, qty=1;
function find(id){ for(const [k,l] of Object.entries(CAT)){ const p=l.find(x=>x.id===id); if(p) return {...p,cat:k}; } return null; }
function openProduct(id){
  const p=find(id); if(!p) return; cur=p; size=null; qty=1;
  window.tchTrack&&tchTrack('ViewContent',{content_ids:[p.id],content_name:p.name,content_type:'product',value:p.price,currency:'INR'});
  $('#pmImg').src=p.img; $('#pmImg').alt=p.name; $('#pmBadge').textContent=off(p)+'% OFF';
  $('#pmCat').textContent=CATS[p.cat].name.replace(/s$/,''); $('#pmName').textContent=p.name;
  { const lv=$('#pmLive'); lv.hidden=!p.art; if(p.art) lv.href='live-try.html?id='+encodeURIComponent(p.id); }
  if(window.TCH_TRYON_LIVE || qs.get('tryon')==='1'){ const t=$('#pmTry'); t.hidden=false;
    const g=new URL(p.img, location.href).href, back=/back/i.test(p.print)&&!/front/i.test(p.print);
    t.href=`try-on.html?garment=${encodeURIComponent(g)}&name=${encodeURIComponent(p.name+' '+CATS[p.cat].name.replace(/s$/,''))}${back?'&view=back':''}`; } $('#pmFav').classList.toggle('on',favs.has(p.id)); $('#pmFav').setAttribute('aria-pressed',favs.has(p.id));
  $('#pmPrice').textContent=money(p.price); $('#pmMrp').textContent=money(p.mrp); $('#pmSave').textContent=`${off(p)}% off · Save ${money(p.mrp-p.price)}`;
  $('#pmDesc').textContent=p.desc; $('.pm-meta span:last-child').textContent=FABRIC[p.cat]||''; $('#pmColour').textContent=p.colour; $('#pmPrint').textContent=p.print;
  $('#pmSizes').innerHTML=SIZES.map(s=>`<button data-s="${s}">${s}</button>`).join(''); $('#pmSizes').classList.remove('err');
  $('#qVal').textContent=qty;
  const colourName=(p.colour.split(/[ /]/)[0]||'');
  const st=$('#pmStudio');
  if(p.art){ st.style.display='block'; st.href=`studio.html?p=${CATS[p.cat].studio}&c=${encodeURIComponent(colourName)}&art=${encodeURIComponent(p.art)}`; st.textContent='Customise this design in the Design Studio →'; }
  else { st.style.display='block'; st.href=`studio.html?p=${CATS[p.cat].studio}&c=${encodeURIComponent(colourName)}`; st.textContent='Want your own print on this? Open the Design Studio →'; }
  $('.pm-card').scrollTop=0; $('#pm').classList.add('on'); $('#pm').setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  history.replaceState(null,'','?c='+cat+'#'+p.id);
}
function closeProduct(){ $('#pm').classList.remove('on'); $('#pm').setAttribute('aria-hidden','true'); document.body.style.overflow=''; history.replaceState(null,'','?c='+cat); }
$('#pmClose').addEventListener('click',closeProduct);
$('#pmFav').addEventListener('click',()=>{ const id=cur.id, on=!favs.has(id); on?favs.add(id):favs.delete(id); saveFavs();
  $('#pmFav').classList.toggle('on',on); $('#pmFav').setAttribute('aria-pressed',on); toast(on?'Saved to favourites':'Removed from favourites');
  const cf=document.querySelector(`[data-fav="${id}"]`); if(cf){ cf.classList.toggle('on',on); } if(cat==='fav') renderGrid(); });
$('#pm').addEventListener('click',e=>{ if(e.target.id==='pm') closeProduct(); });
addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeProduct(); closeBag(); } });
$('#pmSizes').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; size=b.dataset.s; $$('#pmSizes button').forEach(x=>x.classList.toggle('on',x===b)); $('#pmSizes').classList.remove('err');});
$('#qMinus').addEventListener('click',()=>{qty=Math.max(1,qty-1); $('#qVal').textContent=qty;});
$('#qPlus').addEventListener('click',()=>{qty=Math.min(99,qty+1); $('#qVal').textContent=qty;});
function needSize(){ if(size) return false; const z=$('#pmSizes'); z.classList.remove('err'); void z.offsetWidth; z.classList.add('err'); toast('Please select a size'); return true; }
$('#addBag').addEventListener('click',()=>{ if(needSize()) return; addToBag(cur,size,qty); closeProduct(); toast(`Added to bag - ${cur.name} (${size})`); });
function waProduct(){
  const msg=['Hi The Customized House, I want to order:',`${cur.name} ${CATS[cur.cat].name.replace(/s$/,'')}`,`Colour: ${cur.colour}`,`Size: ${size}`,`Quantity: ${qty}`,`Price: ${money(cur.price)} each (MRP ${money(cur.mrp)})`,`Total: ${money(cur.price*qty)}`].join('\n');
  window.open(WA+encodeURIComponent(msg),'_blank'); }
function upiLines(lines){ return lines.map(l=>{ const p=find(l.id); return {id:l.id,size:l.size,qty:l.qty,name:p.name+' '+CATS[p.cat].name.replace(/s$/,''),colour:p.colour,price:p.price}; }); }
async function payOnline(btn, lines, fallback, onPaid){
  if(!window.TCHStore || !TCHStore.canPay(lines)){
    if(window.TCHUpi){ closeProduct(); closeBag(); TCHUpi.open(upiLines(lines), onPaid); } else fallback();
    return; }
  const label=btn.textContent; btn.classList.add('busy'); btn.textContent='Opening secure checkout...';
  try{ await TCHStore.checkout(lines); }
  catch(e){ btn.classList.remove('busy'); btn.textContent=label; toast('Online payment is unavailable right now - opening WhatsApp'); setTimeout(fallback,900); }
}
$('#buyNow').addEventListener('click',()=>{ if(needSize()) return; payOnline($('#buyNow'),[{id:cur.id,size,qty}],waProduct); });
$('#buyWa').addEventListener('click',e=>{ e.preventDefault(); if(needSize()) return; waProduct(); });

/* bag (saved on this device) */
let bag=[];
try{ bag=JSON.parse(localStorage.getItem('tch_bag')||'[]')||[]; }catch(e){ bag=[]; }
const saveBag=()=>{ try{ localStorage.setItem('tch_bag',JSON.stringify(bag)); }catch(e){} renderBag(); };
function addToBag(p,s,q){ const ex=bag.find(i=>i.id===p.id&&i.size===s); if(ex) ex.qty+=q; else bag.push({id:p.id,size:s,qty:q}); saveBag(); const b=$('#bagBtn'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
function renderBag(){
  const items=bag.map(i=>({...i,p:find(i.id)})).filter(i=>i.p);
  const n=items.reduce((a,i)=>a+i.qty,0), mrp=items.reduce((a,i)=>a+i.p.mrp*i.qty,0), tot=items.reduce((a,i)=>a+i.p.price*i.qty,0);
  $('#bagCount').textContent=n; $('#bagBtn').style.display=n?'grid':'none';
  $('#drItems').innerHTML=items.length?items.map((i,k)=>`<div class="dri"><img src="${i.p.img}" alt=""><div><b>${i.p.name}</b><span>${i.p.colour} · Size ${i.size}</span>
     <div class="q"><button data-k="${k}" data-d="-1">−</button><span>${i.qty}</span><button data-k="${k}" data-d="1">+</button><button class="rm" data-k="${k}" data-d="x">Remove</button></div></div>
     <div class="amt">${money(i.p.price*i.qty)}</div></div>`).join(''):'<div class="dr-empty">Your bag is empty.</div>';
  $('#drMrp').textContent=money(mrp); $('#drSave').textContent='- '+money(mrp-tot); $('#drTot').textContent=money(tot);
  $('#checkout').disabled=!items.length;
}
$('#drItems').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; const k=+b.dataset.k;
  if(b.dataset.d==='x') bag.splice(k,1); else { bag[k].qty+= +b.dataset.d; if(bag[k].qty<1) bag.splice(k,1); } saveBag();});
const openBag=()=>{ $('#drawer').classList.add('on'); document.body.style.overflow='hidden'; };
function closeBag(){ $('#drawer').classList.remove('on'); if(!$('#pm').classList.contains('on')) document.body.style.overflow=''; }
$('#bagBtn').addEventListener('click',openBag); $('#drClose').addEventListener('click',closeBag);
$('#drawer').addEventListener('click',e=>{ if(e.target.id==='drawer') closeBag(); });
function waBag(){
  const items=bag.map(i=>({...i,p:find(i.id)})).filter(i=>i.p); if(!items.length) return;
  const lines=items.map((i,k)=>`${k+1}. ${i.p.name} - ${i.p.colour} - Size ${i.size} x ${i.qty} = ${money(i.p.price*i.qty)}`);
  const tot=items.reduce((a,i)=>a+i.p.price*i.qty,0);
  window.open(WA+encodeURIComponent(['Hi The Customized House, I want to order:',...lines,`Total: ${money(tot)}`,'','Please confirm availability and delivery.'].join('\n')),'_blank');
}
$('#checkout').addEventListener('click',()=>{ const lines=bag.filter(i=>find(i.id)).map(i=>({id:i.id,size:i.size,qty:i.qty})); if(lines.length) payOnline($('#checkout'),lines,waBag,()=>{ bag=[]; saveBag(); }); });
$('#checkoutWa').addEventListener('click',waBag);


/* card payments (Razorpay) are off until connected: checkout is by UPI */
if(!(window.TCHStore && TCHStore.live)){
  $('.pay-note').innerHTML='Pay by UPI: GPay, PhonePe, Paytm &nbsp;·&nbsp; <a href="#" id="buyWa">or order on WhatsApp</a>';
  $('#buyWa').addEventListener('click',e=>{ e.preventDefault(); if(needSize()) return; waProduct(); });
  $('#checkout').textContent='Checkout & pay by UPI';
  $('.dr-foot small').textContent='Pay by UPI (GPay, PhonePe, Paytm). Free delivery across India. Prices include GST.';
}
renderAll(); renderBag();
if(qs.get('checkout')==='cancelled'){ toast('Payment cancelled - your bag is saved'); history.replaceState(null,'','?c='+cat); }
if(location.hash){ const id=location.hash.slice(1); if(find(id)) openProduct(id); }
})();

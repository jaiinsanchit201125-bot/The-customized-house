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
let cat=CATS[qs.get('c')]?qs.get('c'):'tshirt', chip='all', sort='feat';
function toast(t){const e=$('#toast'); e.textContent=t; e.classList.add('on'); clearTimeout(e._t); e._t=setTimeout(()=>e.classList.remove('on'),2200);}

/* header bits shared with the homepage */
const hdr=$('#hdr'); const onScroll=()=>hdr&&hdr.classList.toggle('scrolled',scrollY>20); addEventListener('scroll',onScroll,{passive:true}); onScroll();
$('#menuBtn')&&$('#menuBtn').addEventListener('click',()=>$('#links').classList.toggle('open'));
$('#yr')&&($('#yr').textContent=new Date().getFullYear());
const fw=$('.float-wa'); if(fw) fw.style.display='none';

/* category tabs */
$('#catTabs').innerHTML=Object.entries(CATS).map(([k,c])=>`<a href="?c=${k}" data-c="${k}">${c.name}${CAT[k].length?`<span>${CAT[k].length}</span>`:''}</a>`).join('');
$('#catTabs').addEventListener('click',e=>{const a=e.target.closest('a'); if(!a) return; e.preventDefault(); cat=a.dataset.c; chip='all'; history.replaceState(null,'','?c='+cat); renderAll(); scrollTo({top:0,behavior:'smooth'});});

function chipsFor(list){
  const names={all:'All',black:'Black',white:'White',beige:'Beige',plain:'Plain tees',graphic:'Graphic',minimal:'Minimal',retro:'Retro',streetwear:'Streetwear'};
  const used=['all',...new Set(list.flatMap(p=>p.tags||[]))].filter(t=>names[t]);
  return used.map(t=>`<button data-t="${t}" class="${t===chip?'on':''}">${names[t]}</button>`).join('');
}
function renderAll(){
  const c=CATS[cat], list=CAT[cat]||[];
  document.title=c.name+' - The Customized House';
  $('#crumb').textContent=c.name; $('#catTitle').textContent=c.name; $('#catBlurb').textContent=c.blurb;
  $$('#catTabs a').forEach(a=>a.classList.toggle('on',a.dataset.c===cat));
  $('.offer').style.display=list.length?'':'none';
  if(list.length){ const p=list[0]; $('.offer span').innerHTML=`Every design ${money(p.price)} <s>${money(p.mrp)}</s>`; }
  $('#ownBtn').href='studio.html?p='+c.studio;
  $('#chips').innerHTML=list.length?chipsFor(list):'';
  renderGrid();
}
function renderGrid(){
  let list=(CAT[cat]||[]).filter(p=>chip==='all'||(p.tags||[]).includes(chip));
  if(sort==='az') list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==='za') list=[...list].sort((a,b)=>b.name.localeCompare(a.name));
  $('#count').textContent=list.length?list.length+' design'+(list.length>1?'s':''):'';
  if(!(CAT[cat]||[]).length){
    $('#pgrid').innerHTML=`<div class="pempty"><h3>${CATS[cat].name} designs are coming soon</h3><p>Our designs for this range are on the way. You can still design your own right now.</p>
      <div class="acts"><a class="btn btn-primary" href="studio.html?p=${CATS[cat].studio}">Design your own</a><a class="btn btn-ghost" href="?c=tshirt" data-go="tshirt">Shop T-Shirts</a></div></div>`;
    const g=$('[data-go]'); g&&g.addEventListener('click',e=>{e.preventDefault(); cat='tshirt'; history.replaceState(null,'','?c=tshirt'); renderAll();});
    return;
  }
  $('#pgrid').innerHTML=list.map(p=>`<button class="pc" data-id="${p.id}">
    <div class="ph"><img src="${p.img}" alt="${p.name}" loading="lazy"><span class="badge">${off(p)}% OFF</span><span class="quick">Quick view</span></div>
    <span class="nm">${p.name}</span><span class="sub">${p.colour} · ${p.print}</span>
    <span class="pr"><b>${money(p.price)}</b><s>${money(p.mrp)}</s><em>Save ${money(p.mrp-p.price)}</em></span></button>`).join('');
}
$('#chips').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; chip=b.dataset.t; $$('#chips button').forEach(x=>x.classList.toggle('on',x===b)); renderGrid();});
$('#sort').addEventListener('change',e=>{sort=e.target.value; renderGrid();});
$('#pgrid').addEventListener('click',e=>{const b=e.target.closest('.pc'); if(b) openProduct(b.dataset.id);});

/* product modal */
let cur=null, size=null, qty=1;
function find(id){ for(const [k,l] of Object.entries(CAT)){ const p=l.find(x=>x.id===id); if(p) return {...p,cat:k}; } return null; }
function openProduct(id){
  const p=find(id); if(!p) return; cur=p; size=null; qty=1;
  $('#pmImg').src=p.img; $('#pmImg').alt=p.name; $('#pmBadge').textContent=off(p)+'% OFF';
  $('#pmCat').textContent=CATS[p.cat].name.replace(/s$/,''); $('#pmName').textContent=p.name;
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
$('#pm').addEventListener('click',e=>{ if(e.target.id==='pm') closeProduct(); });
addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeProduct(); closeBag(); } });
$('#pmSizes').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; size=b.dataset.s; $$('#pmSizes button').forEach(x=>x.classList.toggle('on',x===b)); $('#pmSizes').classList.remove('err');});
$('#qMinus').addEventListener('click',()=>{qty=Math.max(1,qty-1); $('#qVal').textContent=qty;});
$('#qPlus').addEventListener('click',()=>{qty=Math.min(99,qty+1); $('#qVal').textContent=qty;});
function needSize(){ if(size) return false; const z=$('#pmSizes'); z.classList.remove('err'); void z.offsetWidth; z.classList.add('err'); toast('Please select a size'); return true; }
$('#addBag').addEventListener('click',()=>{ if(needSize()) return; addToBag(cur,size,qty); closeProduct(); toast(`Added to bag - ${cur.name} (${size})`); });
$('#buyNow').addEventListener('click',()=>{ if(needSize()) return;
  const msg=['Hi The Customized House, I want to order:',`${cur.name} ${CATS[cur.cat].name.replace(/s$/,'')}`,`Colour: ${cur.colour}`,`Size: ${size}`,`Quantity: ${qty}`,`Price: ${money(cur.price)} each (MRP ${money(cur.mrp)})`,`Total: ${money(cur.price*qty)}`].join('\n');
  window.open(WA+encodeURIComponent(msg),'_blank'); });

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
$('#checkout').addEventListener('click',()=>{
  const items=bag.map(i=>({...i,p:find(i.id)})).filter(i=>i.p); if(!items.length) return;
  const lines=items.map((i,k)=>`${k+1}. ${i.p.name} - ${i.p.colour} - Size ${i.size} x ${i.qty} = ${money(i.p.price*i.qty)}`);
  const tot=items.reduce((a,i)=>a+i.p.price*i.qty,0);
  window.open(WA+encodeURIComponent(['Hi The Customized House, I want to order:',...lines,`Total: ${money(tot)}`,'','Please confirm availability and delivery.'].join('\n')),'_blank');
});

renderAll(); renderBag();
if(location.hash){ const id=location.hash.slice(1); if(find(id)) openProduct(id); }
})();

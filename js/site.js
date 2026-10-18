/* The Customized House - homepage */
(function(){
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const WA = 'https://wa.me/918431573282?text=';

/* ===== trending T-shirts (from js/catalog.js) ===== */
(function(){
  const money=n=>'₹'+n.toLocaleString('en-IN');
  $$('.trend-grid').forEach(box=>{ const cat=box.dataset.cat, list=((window.TCH_CATALOG||{})[cat]||[]).slice(0,4);
  box.innerHTML=list.map(p=>`<a class="pc reveal" href="shop.html?c=${cat}#${p.id}">
    <div class="ph"><img src="${p.img}" alt="${p.name}" loading="lazy"><span class="badge">${Math.round((1-p.price/p.mrp)*100)}% OFF</span><span class="quick">Choose size</span></div>
    <span class="nm">${p.name}</span><span class="sub">${p.colour} · ${p.print}</span>
    <span class="pr"><b>${money(p.price)}</b><s>${money(p.mrp)}</s><em>Save ${money(p.mrp-p.price)}</em></span></a>`).join(''); });
})();
document.addEventListener('click',e=>{ const im=e.target.closest('[data-lb]'); if(im){ $('#lightboxImg').src=im.src; $('#lightbox').classList.add('on'); } });
$('#lightbox').addEventListener('click',()=>$('#lightbox').classList.remove('on'));

/* order form -> WhatsApp */
$('#orderForm').addEventListener('submit',e=>{
  e.preventDefault();
  const v=id=>document.getElementById(id).value.trim();
  const msg=['Hi The Customized House, I want to place an order.','Name: '+v('fName'),'Phone: '+(v('fPhone')||'-'),'Product: '+v('fProd'),'Quantity: '+v('fQty'),'Colour: '+(v('fColour')||'-'),'Size(s): '+(v('fSize')||'-'),'Idea: '+(v('fIdea')||'-')].join('\n');
  window.open(WA+encodeURIComponent(msg),'_blank');
});

/* header + menu */
const hdr=$('#hdr'); const onScroll=()=>hdr.classList.toggle('scrolled',scrollY>20); addEventListener('scroll',onScroll,{passive:true}); onScroll();
$('#menuBtn').addEventListener('click',()=>$('#links').classList.toggle('open'));
$$('#links a').forEach(a=>a.addEventListener('click',()=>$('#links').classList.remove('open')));
$('#yr').textContent=new Date().getFullYear();

/* reveal on scroll */
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}}),{threshold:.06,rootMargin:'0px 0px -40px 0px'});
  $$('.reveal').forEach(el=>io.observe(el));
} else $$('.reveal').forEach(el=>el.classList.add('in'));
const sweep=()=>{ const lim=innerHeight*1.05; $$('.reveal:not(.in)').forEach(el=>{ if(el.getBoundingClientRect().top<lim) el.classList.add('in'); }); };
addEventListener('scroll',()=>requestAnimationFrame(sweep),{passive:true}); addEventListener('load',sweep);

/* ===== live preview showcase ===== */
const M=window.TCHMock; const cv=$('#scCanvas'); if(!M||!cv) return;
const ctx=cv.getContext('2d');
const S={product:'hoodie', view:'front', color:'#1F2A44', auto:true};
const logos={};
['logo-cream','logo-navy'].forEach(n=>{const im=new Image(); im.onload=()=>draw(); im.src='assets/'+n+'.png'; logos[n]=im;});
function light(h){const [r,g,b]=M.hexRgb(h); return (r*299+g*587+b*114)/1000>150;}
function sample(c,a){
  const lt=light(S.color), ink=lt?'#1F2A44':'#F3EBD9', gold=lt?'#a8823c':'#C9A35A', logo=logos[lt?'logo-navy':'logo-cream'];
  const cx=a[0]+a[2]/2;
  c.textAlign='center'; c.fillStyle=ink;
  if(S.view==='front'){
    if(logo&&logo.complete&&logo.naturalWidth){ const w=a[2]*.34, h=w*logo.naturalHeight/logo.naturalWidth; c.drawImage(logo,cx-w/2,a[1]+a[3]*.12,w,h); }
  } else {
    let y=a[1]+a[3]*.12;
    if(logo&&logo.complete&&logo.naturalWidth){ const w=a[2]*.42, h=w*logo.naturalHeight/logo.naturalWidth; c.drawImage(logo,cx-w/2,y,w,h); y+=h+a[3]*.08; }
    c.font=`600 ${a[2]*.115}px "Cormorant Garamond", Georgia, serif`; c.fillText('THE CUSTOMIZED',cx,y+a[2]*.08);
    c.fillText('HOUSE',cx,y+a[2]*.2);
    c.fillStyle=gold; c.font=`700 ${a[2]*.045}px "DM Sans", sans-serif`;
    if('letterSpacing' in c) c.letterSpacing=(a[2]*.02)+'px';
    c.fillText('WEAR YOUR STORY',cx,y+a[2]*.3); if('letterSpacing' in c) c.letterSpacing='0px';
  }
}
let drawing=false, pending=false;
async function draw(){
  if(drawing){pending=true;return;} drawing=true;
  try{ await M.render(ctx,{product:S.product,view:S.view,color:S.color,drawPrint:sample}); }catch(e){}
  drawing=false; if(pending){pending=false; draw();}
}
const box=$('#scColors');
box.innerHTML=M.COLORS.map(c=>`<button data-c="${c.h}" title="${c.n}" aria-label="${c.n}" style="background:${c.h}"></button>`).join('');
const mark=()=>{ $$('#scColors button').forEach(b=>b.classList.toggle('on',b.dataset.c===S.color)); $$('#scTabs button').forEach(b=>b.classList.toggle('on',b.dataset.p===S.product)); $$('#scView button').forEach(b=>b.classList.toggle('on',b.dataset.v===S.view)); };
const stop=()=>{S.auto=false;};
box.addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; stop(); S.color=b.dataset.c; mark(); draw();});
$('#scTabs').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; stop(); S.product=b.dataset.p; mark(); draw();});
$('#scView').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; stop(); S.view=b.dataset.v; mark(); draw();});
cv.addEventListener('click',()=>{ location.href='studio.html?p='+S.product+'&c='+encodeURIComponent((M.COLORS.find(c=>c.h===S.color)||{}).n||''); });
cv.style.cursor='pointer';
const cycle=['#1F2A44','#B3202D','#EEE6D6','#1F4A38','#1B1B1E','#A9C7E6','#6B1E2A','#D8C6A6'];
const prodCycle=['hoodie','hoodie','oversized','oversized','sweatshirt','sweatshirt','jacket','tshirt'];
let k=0, visible=false;
new IntersectionObserver(es=>{visible=es[0].isIntersecting;},{threshold:.2}).observe(cv);
setInterval(()=>{ if(!S.auto||!visible||document.hidden) return; k=(k+1)%cycle.length; S.color=cycle[k]; S.product=prodCycle[k]; S.view=k%4===3?'back':'front'; mark(); draw(); },2600);
mark(); draw();
})();

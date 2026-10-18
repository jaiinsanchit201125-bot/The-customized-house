/* The Customized House - Design Studio */
(function(){
const M = window.TCHMock, P = M.PRODUCTS;
const WA_NUM = '918431573282';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const cv = $('#cv'), ctx = cv.getContext('2d');
const ui = $('#ui'), uctx = ui.getContext('2d');
const SIZES = ['XS','S','M','L','XL','XXL','3XL'];

const qs = new URLSearchParams(location.search);
const st = {
  product: P[qs.get('p')] ? qs.get('p') : 'hoodie',
  color: (M.COLORS.find(c=>c.n.toLowerCase()===(qs.get('c')||'').toLowerCase()) || M.COLORS[5]).h,
  view: 'front',
  layers: {front:[], back:[]},
  sel: null,
  qty: {M:1},
  guides: true,
  uploads: []
};
let uid = 1;
const area = () => P[st.product].areas[st.view];
const colorName = h => (M.COLORS.find(c=>c.h===h)||{n:'Custom'}).n;
const money = n => '₹' + n.toLocaleString('en-IN');
function toast(t){const e=$('#toast'); e.textContent=t; e.classList.add('on'); clearTimeout(e._t); e._t=setTimeout(()=>e.classList.remove('on'),2200);}

/* ---------- rendering ---------- */
function drawLayers(c, layers){
  for(const L of layers){
    const h = L.w * L.src.height / L.src.width;
    c.save(); c.translate(L.x, L.y); c.rotate(L.rot); if(L.flip) c.scale(-1,1);
    c.drawImage(L.src, -L.w/2, -h/2, L.w, h); c.restore();
  }
}
let busy=false, again=false;
async function render(){
  if(busy){again=true; return;} busy=true;
  try{
    await M.render(ctx,{product:st.product, view:st.view, color:st.color, drawPrint:c=>drawLayers(c, st.layers[st.view])});
    $('#loading').style.display='none';
  }catch(e){ $('#loading').textContent='Preview could not load. Please refresh.'; }
  busy=false; drawUI();
  if(again){again=false; requestAnimationFrame(render);} else scheduleThumbs();
}
let raf=0; function update(){ if(!raf) raf=requestAnimationFrame(()=>{raf=0; render();}); updateSummary(); }

/* view thumbnails */
const off = document.createElement('canvas'); off.width=M.W; off.height=M.H; const octx = off.getContext('2d');
let thumbT=0;
function scheduleThumbs(){ clearTimeout(thumbT); thumbT=setTimeout(drawThumbs, 260); }
async function drawThumbs(){
  for(const b of $$('.vt')){
    const v=b.dataset.view, tc=b.querySelector('canvas').getContext('2d');
    if(v===st.view){ tc.drawImage(cv,0,0,250,310); continue; }
    await M.render(octx,{product:st.product, view:v, color:st.color, drawPrint:c=>drawLayers(c, st.layers[v])});
    tc.drawImage(off,0,0,250,310);
  }
}

/* ---------- selection UI overlay ---------- */
let snapX=false, snapY=false;
function layerBox(L){ const h=L.w*L.src.height/L.src.width; return {w:L.w,h}; }
function corners(L){
  const {w,h}=layerBox(L), c=Math.cos(L.rot), s=Math.sin(L.rot);
  return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([x,y])=>[L.x+x*c-y*s, L.y+x*s+y*c]);
}
function rotHandle(L){ const {h}=layerBox(L), d=h/2+22; return [L.x+Math.sin(L.rot)*d, L.y-Math.cos(L.rot)*d]; }
function drawUI(){
  const R=M.RES; uctx.setTransform(1,0,0,1,0,0); uctx.clearRect(0,0,M.W,M.H); uctx.setTransform(R,0,0,R,0,0);
  const a=area(), sel=st.layers[st.view].find(l=>l.id===st.sel);
  if(st.guides){
    uctx.save(); uctx.setLineDash([5,4]); uctx.lineWidth=1;
    uctx.strokeStyle = isDark(st.color)?'rgba(255,255,255,.55)':'rgba(31,42,68,.4)';
    uctx.strokeRect(a[0]+.5,a[1]+.5,a[2],a[3]); uctx.restore();
    if(!st.layers[st.view].length){
      uctx.fillStyle = isDark(st.color)?'rgba(255,255,255,.75)':'rgba(31,42,68,.6)';
      uctx.font='600 10px "DM Sans",sans-serif'; uctx.textAlign='center';
      uctx.fillText('PRINT AREA', a[0]+a[2]/2, a[1]+a[3]/2-4);
      uctx.font='500 8.5px "DM Sans",sans-serif'; uctx.fillText('Upload a design or add text', a[0]+a[2]/2, a[1]+a[3]/2+9);
    }
  }
  if(snapX){ uctx.strokeStyle='#e0457b'; uctx.lineWidth=1; uctx.beginPath(); uctx.moveTo(a[0]+a[2]/2,a[1]); uctx.lineTo(a[0]+a[2]/2,a[1]+a[3]); uctx.stroke(); }
  if(snapY){ uctx.strokeStyle='#e0457b'; uctx.lineWidth=1; uctx.beginPath(); uctx.moveTo(a[0],a[1]+a[3]/2); uctx.lineTo(a[0]+a[2],a[1]+a[3]/2); uctx.stroke(); }
  if(sel){
    const c=corners(sel);
    uctx.strokeStyle='#C9A35A'; uctx.lineWidth=1.2; uctx.beginPath(); c.forEach((p,i)=>i?uctx.lineTo(p[0],p[1]):uctx.moveTo(p[0],p[1])); uctx.closePath(); uctx.stroke();
    const rh=rotHandle(sel), top=[(c[0][0]+c[1][0])/2,(c[0][1]+c[1][1])/2];
    uctx.beginPath(); uctx.moveTo(top[0],top[1]); uctx.lineTo(rh[0],rh[1]); uctx.stroke();
    for(const p of c){ uctx.fillStyle='#fff'; uctx.beginPath(); uctx.arc(p[0],p[1],5,0,7); uctx.fill(); uctx.stroke(); }
    uctx.fillStyle='#C9A35A'; uctx.beginPath(); uctx.arc(rh[0],rh[1],6,0,7); uctx.fill();
    uctx.strokeStyle='#fff'; uctx.lineWidth=1.3; uctx.beginPath(); uctx.arc(rh[0],rh[1],3,-.4,4.2); uctx.stroke();
  }
  $('#toolFloat').classList.toggle('on', !!sel);
  checkDpi();
}
function isDark(h){const [r,g,b]=M.hexRgb(h); return (r*299+g*587+b*114)/1000<140;}
function checkDpi(){
  let low=false;
  for(const L of st.layers[st.view]){
    if(L.type!=='image') continue;
    const inches = L.w/area()[2]*P[st.product].inches[st.view];
    if(L.natW/inches < 110) low=true;
  }
  $('#warn').classList.toggle('on', low);
}

/* ---------- pointer interaction ---------- */
function toLogical(e){ const r=ui.getBoundingClientRect(); return [(e.clientX-r.left)/r.width*500, (e.clientY-r.top)/r.height*620]; }
function hitLayer(p){
  const ls=st.layers[st.view];
  for(let i=ls.length-1;i>=0;i--){
    const L=ls[i], {w,h}=layerBox(L), dx=p[0]-L.x, dy=p[1]-L.y, c=Math.cos(-L.rot), s=Math.sin(-L.rot);
    const lx=dx*c-dy*s, ly=dx*s+dy*c; if(Math.abs(lx)<=w/2+4 && Math.abs(ly)<=h/2+4) return L;
  }
  return null;
}
const ptrs=new Map(); let drag=null;
ui.addEventListener('pointerdown',e=>{
  ui.setPointerCapture(e.pointerId); const p=toLogical(e); ptrs.set(e.pointerId,p);
  const sel=st.layers[st.view].find(l=>l.id===st.sel);
  if(ptrs.size===2 && sel){ const [a,b]=[...ptrs.values()]; drag={mode:'pinch',L:sel,d0:Math.hypot(a[0]-b[0],a[1]-b[1]),a0:Math.atan2(b[1]-a[1],b[0]-a[0]),w0:sel.w,r0:sel.rot}; return; }
  const tol = e.pointerType==='touch'?14:9;
  if(sel){
    const rh=rotHandle(sel);
    if(Math.hypot(p[0]-rh[0],p[1]-rh[1])<tol){ drag={mode:'rot',L:sel,a0:Math.atan2(p[1]-sel.y,p[0]-sel.x),r0:sel.rot}; return; }
    for(const c of corners(sel)) if(Math.hypot(p[0]-c[0],p[1]-c[1])<tol){ drag={mode:'scale',L:sel,d0:Math.hypot(p[0]-sel.x,p[1]-sel.y),w0:sel.w}; return; }
  }
  const L=hitLayer(p);
  if(L){ st.sel=L.id; drag={mode:'move',L,ox:p[0]-L.x,oy:p[1]-L.y}; refreshLayerList(); syncTextPanel(); }
  else { st.sel=null; drag=null; refreshLayerList(); }
  drawUI();
});
ui.addEventListener('pointermove',e=>{
  if(!ptrs.has(e.pointerId)) { hover(e); return; }
  const p=toLogical(e); ptrs.set(e.pointerId,p); if(!drag) return;
  const L=drag.L, a=area();
  if(drag.mode==='pinch' && ptrs.size===2){
    const [q,r]=[...ptrs.values()]; const d=Math.hypot(q[0]-r[0],q[1]-r[1]), an=Math.atan2(r[1]-q[1],r[0]-q[0]);
    L.w=Math.max(12,Math.min(a[2]*2.2,drag.w0*d/drag.d0)); L.rot=drag.r0+an-drag.a0;
  } else if(drag.mode==='move'){
    let x=p[0]-drag.ox, y=p[1]-drag.oy; const cx=a[0]+a[2]/2, cy=a[1]+a[3]/2;
    snapX=Math.abs(x-cx)<3; snapY=Math.abs(y-cy)<3; if(snapX)x=cx; if(snapY)y=cy;
    L.x=Math.max(a[0]-a[2]*.4,Math.min(a[0]+a[2]*1.4,x)); L.y=Math.max(a[1]-a[3]*.4,Math.min(a[1]+a[3]*1.4,y));
  } else if(drag.mode==='scale'){
    const d=Math.hypot(p[0]-L.x,p[1]-L.y); L.w=Math.max(12,Math.min(a[2]*2.2,drag.w0*d/drag.d0));
  } else if(drag.mode==='rot'){
    let r=drag.r0+Math.atan2(p[1]-L.y,p[0]-L.x)-drag.a0; const deg=r*180/Math.PI, near=Math.round(deg/45)*45;
    if(Math.abs(deg-near)<4) r=near*Math.PI/180; L.rot=r;
  }
  update();
});
function endPtr(e){ ptrs.delete(e.pointerId); if(ptrs.size<2 && drag && drag.mode==='pinch') drag=null; if(!ptrs.size){ drag=null; snapX=snapY=false; drawUI(); scheduleThumbs(); } }
ui.addEventListener('pointerup',endPtr); ui.addEventListener('pointercancel',endPtr);
function hover(e){
  const p=toLogical(e), sel=st.layers[st.view].find(l=>l.id===st.sel); let cur='default';
  if(sel){ const rh=rotHandle(sel); if(Math.hypot(p[0]-rh[0],p[1]-rh[1])<9) cur='grab';
    else if(corners(sel).some(c=>Math.hypot(p[0]-c[0],p[1]-c[1])<9)) cur='nwse-resize'; }
  if(cur==='default' && hitLayer(p)) cur='move';
  ui.style.cursor=cur;
}
document.addEventListener('keydown',e=>{
  if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  const L=st.layers[st.view].find(l=>l.id===st.sel); if(!L) return;
  const k={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
  if(k){ const m=e.shiftKey?10:2; L.x+=k[0]*m; L.y+=k[1]*m; update(); e.preventDefault(); }
  if(e.key==='Delete'||e.key==='Backspace'){ act('del'); e.preventDefault(); }
});

/* ---------- layers ---------- */
function addLayer(L, fitFrac){
  const a=area(), ar=L.src.height/L.src.width;
  let w=a[2]*(fitFrac||.72); if(w*ar>a[3]*.8) w=a[3]*.8/ar;
  Object.assign(L,{id:uid++, x:a[0]+a[2]/2, y:a[1]+Math.min(a[3]/2, w*ar/2+a[3]*.08), w, rot:0, flip:false});
  st.layers[st.view].push(L); st.sel=L.id; update(); refreshLayerList();
}
function act(kind){
  const ls=st.layers[st.view], i=ls.findIndex(l=>l.id===st.sel); if(i<0) return; const L=ls[i], a=area();
  if(kind==='del'){ ls.splice(i,1); st.sel=null; }
  if(kind==='center'){ L.x=a[0]+a[2]/2; }
  if(kind==='flip'){ L.flip=!L.flip; }
  if(kind==='dup'){ const c={...L,id:uid++,x:L.x+12,y:L.y+12}; ls.push(c); st.sel=c.id; }
  if(kind==='up' && i<ls.length-1){ ls.splice(i,1); ls.splice(i+1,0,L); }
  if(kind==='down' && i>0){ ls.splice(i,1); ls.splice(i-1,0,L); }
  update(); refreshLayerList();
}
$('#toolFloat').addEventListener('click',e=>{const b=e.target.closest('button'); if(b) act(b.dataset.act);});
function refreshLayerList(){
  const ls=st.layers[st.view], box=$('#layerList');
  $('#lySide').textContent=st.view; $('#upSide').textContent=st.view;
  if(!ls.length){ box.innerHTML='<div class="empty">Nothing here yet. Upload a design or add text.</div>'; }
  else box.innerHTML=[...ls].reverse().map(L=>`<div class="layer ${L.id===st.sel?'on':''}" data-id="${L.id}">
    <div class="th" style="${L.type==='image'?`background-image:url(${L.thumb})`:''}">${L.type==='text'?'T':''}</div>
    <b>${L.type==='text'?esc(L.text.replace(/\n/g,' ')):'Image'}</b>
    <button data-a="up" title="Bring forward"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg></button>
    <button data-a="down" title="Send back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
    <button data-a="del" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="#b3261e" stroke-width="2"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/></svg></button></div>`).join('');
  $('#imgTools').style.display = (ls.find(l=>l.id===st.sel)||{}).type==='image' ? 'block':'none';
}
$('#layerList').addEventListener('click',e=>{
  const row=e.target.closest('.layer'); if(!row) return; st.sel=+row.dataset.id;
  const b=e.target.closest('button'); if(b) act(b.dataset.a); else { refreshLayerList(); drawUI(); syncTextPanel(); }
});
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- upload ---------- */
function readFile(f){
  if(!f || !/^image\//.test(f.type)) return toast('Please choose an image file');
  const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>{
    const src=normalise(im); const thumb=thumbOf(src);
    st.uploads.unshift({src,thumb,natW:im.naturalWidth}); renderUploads();
    addLayer({type:'image',src,thumb,natW:im.naturalWidth}); toast('Design added - drag to move, corners to resize');
  }; im.src=r.result; }; r.readAsDataURL(f);
}
function normalise(im){ // cap very large images for speed, keep quality
  const max=2400, s=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight));
  const c=document.createElement('canvas'); c.width=Math.round(im.naturalWidth*s); c.height=Math.round(im.naturalHeight*s);
  c.getContext('2d').drawImage(im,0,0,c.width,c.height); return c;
}
function thumbOf(src){ const c=document.createElement('canvas'), s=120/Math.max(src.width,src.height); c.width=src.width*s; c.height=src.height*s; c.getContext('2d').drawImage(src,0,0,c.width,c.height); return c.toDataURL(); }
function renderUploads(){
  $('#uploads').innerHTML=st.uploads.map((u,i)=>`<button data-i="${i}" title="Use again" style="background-image:url(${u.thumb})"></button>`).join('');
}
$('#uploads').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; const u=st.uploads[+b.dataset.i]; addLayer({type:'image',src:u.src,thumb:u.thumb,natW:u.natW});});
$('#file').addEventListener('change',e=>{readFile(e.target.files[0]); e.target.value='';});
const drop=$('#drop');
['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add('over');}));
['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove('over');}));
drop.addEventListener('drop',e=>readFile(e.dataTransfer.files[0]));
$('#stage').addEventListener('dragover',e=>e.preventDefault());
$('#stage').addEventListener('drop',e=>{e.preventDefault(); readFile(e.dataTransfer.files[0]);});

/* remove white background: flood fill from the edges */
$('#rmBg').addEventListener('click',()=>{
  const L=st.layers[st.view].find(l=>l.id===st.sel); if(!L||L.type!=='image') return;
  const c=document.createElement('canvas'); c.width=L.src.width; c.height=L.src.height; const x=c.getContext('2d');
  x.drawImage(L.src,0,0); const im=x.getImageData(0,0,c.width,c.height), d=im.data, w=c.width, h=c.height;
  const seen=new Uint8Array(w*h), stack=[]; const near=i=>{const r=d[i*4],g=d[i*4+1],b=d[i*4+2]; return d[i*4+3]>0 && r>215&&g>215&&b>215 && Math.max(r,g,b)-Math.min(r,g,b)<30;};
  for(let i=0;i<w;i++){stack.push(i, (h-1)*w+i);} for(let j=0;j<h;j++){stack.push(j*w, j*w+w-1);}
  let n=0;
  while(stack.length){ const i=stack.pop(); if(seen[i]) continue; seen[i]=1; if(!near(i)) continue; d[i*4+3]=0; n++;
    const px=i%w; if(px>0)stack.push(i-1); if(px<w-1)stack.push(i+1); if(i>=w)stack.push(i-w); if(i<w*(h-1))stack.push(i+w); }
  // soften the edge
  for(let i=0;i<w*h;i++){ if(d[i*4+3]&&!seen[i]){ const px=i%w; const nb=[i-1,i+1,i-w,i+w].some(k=>k>=0&&k<w*h&&d[k*4+3]===0); if(nb){ const l=(d[i*4]+d[i*4+1]+d[i*4+2])/3; if(l>170) d[i*4+3]=Math.min(d[i*4+3],Math.round((255-l)*3)); } } }
  x.putImageData(im,0,0); L.src=c; L.thumb=thumbOf(c); update(); refreshLayerList();
  toast(n?'White background removed':'No white background found');
});

/* ---------- text ---------- */
const FONTS=[
  {f:'Anton',w:400,l:'Anton'},{f:'Bebas Neue',w:400,l:'Bebas'},{f:'Montserrat',w:900,l:'Montserrat'},{f:'Poppins',w:800,l:'Poppins'},
  {f:'Graduate',w:400,l:'Varsity'},{f:'UnifrakturMaguntia',w:400,l:'Gothic'},{f:'Playfair Display',w:800,l:'Playfair'},{f:'Oswald',w:600,l:'Oswald'},
  {f:'Pacifico',w:400,l:'Pacifico'},{f:'Permanent Marker',w:400,l:'Marker'},{f:'Caveat',w:700,l:'Caveat'},{f:'Rubik Mono One',w:400,l:'Mono'}
];
const TCOLS=['#FFFFFF','#111111','#1F2A44','#C9A35A','#B3202D','#F2C14E','#2E7D4F','#2348B0','#E86A9A','#8B5CF6','#F28C28','#7A7A7A'];
const tp={text:'CLASS OF 2026',font:0,color:'#FFFFFF',outline:'#111111',ow:0,curve:0,spacing:2};
$('#fonts').innerHTML=FONTS.map((f,i)=>`<button data-i="${i}" class="${i?'':'on'}" style="font-family:'${f.f}',sans-serif;font-weight:${f.w}">${f.l}</button>`).join('');
const swHTML=(arr,cls)=>arr.map(c=>`<button class="sw" data-c="${c}" style="background:${c}" title="${c}"></button>`).join('')+`<label class="sw" style="background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)" title="Any colour"><input type="color" data-k="${cls}"></label>`;
$('#tColors').innerHTML=swHTML(TCOLS,'color'); $('#oColors').innerHTML=swHTML(['#111111','#FFFFFF','#1F2A44','#C9A35A','#B3202D'],'outline');
function markSw(box,c){ $$(box+' .sw').forEach(s=>s.classList.toggle('on',s.dataset.c===c)); }
markSw('#tColors',tp.color); markSw('#oColors',tp.outline);

async function makeText(p){
  const F=FONTS[p.font], size=180, fam=`${F.w} ${size}px "${F.f}", sans-serif`;
  try{ await document.fonts.load(`${F.w} ${size}px "${F.f}"`, p.text); }catch(e){}
  const c=document.createElement('canvas'), x=c.getContext('2d'); x.font=fam;
  const lines=p.text.split('\n').filter((l,i,a)=>l.length||a.length===1);
  const sp=p.spacing*size/60, lw=p.ow*size/40;
  const widthOf=l=>[...l].reduce((s,ch)=>s+x.measureText(ch).width+sp,0)-sp;
  const lh=size*1.12, pad=lw+size*.12;
  if(p.curve && lines.length===1){
    const line=lines[0], tw=widthOf(line), ang=p.curve/100*Math.PI*0.9, R=tw/Math.abs(ang);
    const hgt=R-R*Math.cos(Math.abs(ang)/2)+size*1.25, wid=2*R*Math.sin(Math.min(Math.abs(ang)/2,Math.PI/2))+size;
    c.width=Math.ceil(Math.max(wid,size)+pad*2); c.height=Math.ceil(hgt+pad*2);
    x.font=fam; x.textBaseline='alphabetic'; x.lineJoin='round';
    const up=p.curve>0, cx=c.width/2, cy=up? pad+size*.95+R : c.height-pad-size*.25-R;
    let a=-ang/2;
    const chars=[...line];
    for(const ch of chars){
      const cw=x.measureText(ch).width; const mid=a+(cw/2)/R*Math.sign(ang);
      x.save();
      if(up){ x.translate(cx+R*Math.sin(mid), cy-R*Math.cos(mid)); x.rotate(mid); }
      else { x.translate(cx+R*Math.sin(-mid), cy+R*Math.cos(-mid)); x.rotate(mid); }
      if(lw){x.strokeStyle=p.outline; x.lineWidth=lw*2; x.strokeText(ch,-cw/2,0);}
      x.fillStyle=p.color; x.fillText(ch,-cw/2,0); x.restore();
      a+=(cw+sp)/R*Math.sign(ang);
    }
    return trimCanvas(c);
  }
  const tw=Math.max(...lines.map(widthOf));
  c.width=Math.ceil(tw+pad*2); c.height=Math.ceil(lh*lines.length+pad*2);
  x.font=fam; x.textBaseline='alphabetic'; x.lineJoin='round';
  lines.forEach((l,i)=>{
    let px=pad+(tw-widthOf(l))/2; const py=pad+size*.95+i*lh;
    for(const ch of l){ if(lw){x.strokeStyle=p.outline; x.lineWidth=lw*2; x.strokeText(ch,px,py);} x.fillStyle=p.color; x.fillText(ch,px,py); px+=x.measureText(ch).width+sp; }
  });
  return trimCanvas(c);
}
function trimCanvas(c){
  const x=c.getContext('2d'), d=x.getImageData(0,0,c.width,c.height).data; let x0=c.width,y0=c.height,x1=-1,y1=-1;
  for(let y=0;y<c.height;y++) for(let i=0;i<c.width;i++) if(d[(y*c.width+i)*4+3]>8){ if(i<x0)x0=i; if(i>x1)x1=i; if(y<y0)y0=y; if(y>y1)y1=y; }
  if(x1<0) return c; const m=6, o=document.createElement('canvas'); o.width=x1-x0+1+m*2; o.height=y1-y0+1+m*2;
  o.getContext('2d').drawImage(c,x0-m,y0-m,o.width,o.height,0,0,o.width,o.height); return o;
}
function selText(){ return st.layers[st.view].find(l=>l.id===st.sel && l.type==='text'); }
let txtT=0;
function textChanged(){ const L=selText(); if(!L) return; clearTimeout(txtT); txtT=setTimeout(async()=>{
  const p={...tp}; const src=await makeText(p); const oldW=L.w, oldH=L.w*L.src.height/L.src.width;
  // keep the same letter height when text changes
  const scale = oldH / L.src.height; L.src=src; L.w=Math.min(area()[2]*1.6, src.width*scale); Object.assign(L,{text:p.text,props:p});
  if(!isFinite(L.w)||L.w<10) L.w=oldW; update(); refreshLayerList(); },120); }
$('#addTxt').addEventListener('click',async()=>{
  tp.text=$('#txt').value.trim()||'YOUR TEXT'; if(isDark(st.color)===false && tp.color==='#FFFFFF'){ tp.color='#111111'; markSw('#tColors',tp.color); }
  const src=await makeText(tp); addLayer({type:'text',src,text:tp.text,props:{...tp}},.8);
});
$('#txt').addEventListener('input',()=>{ tp.text=$('#txt').value||' '; textChanged(); });
$('#fonts').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; $$('#fonts button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); tp.font=+b.dataset.i; textChanged();});
function swClick(box,key){ $(box).addEventListener('click',e=>{const b=e.target.closest('button.sw'); if(!b) return; tp[key]=b.dataset.c; markSw(box,tp[key]); textChanged();});
  $(box).addEventListener('input',e=>{ if(e.target.type==='color'){ tp[key]=e.target.value; markSw(box,''); textChanged(); }}); }
swClick('#tColors','color'); swClick('#oColors','outline');
[['#oWidth','ow','#oWOut'],['#curve','curve','#cOut'],['#spacing','spacing','#sOut']].forEach(([id,k,o])=>$(id).addEventListener('input',e=>{tp[k]=+e.target.value; $(o).textContent=e.target.value; textChanged();}));
function syncTextPanel(){
  const L=selText(); refreshLayerList(); if(!L) return; Object.assign(tp,L.props);
  $('#txt').value=tp.text; $$('#fonts button').forEach((b,i)=>b.classList.toggle('on',i===tp.font));
  markSw('#tColors',tp.color); markSw('#oColors',tp.outline);
  $('#oWidth').value=tp.ow; $('#oWOut').textContent=tp.ow; $('#curve').value=tp.curve; $('#cOut').textContent=tp.curve; $('#spacing').value=tp.spacing; $('#sOut').textContent=tp.spacing;
  if(window.innerWidth>980) showPane('text');
}

/* ---------- panels, product, colour, sizes ---------- */
function showPane(n){ $$('#rail button').forEach(b=>b.classList.toggle('on',b.dataset.pane===n)); $$('.pane').forEach(p=>p.classList.toggle('on',p.id==='pane-'+n)); }
$('#rail').addEventListener('click',e=>{const b=e.target.closest('button'); if(b) showPane(b.dataset.pane);});

$('#prodList').innerHTML=Object.entries(P).map(([k,p])=>`<button class="prod" data-p="${k}"><img src="assets/mockups/thumb-${k}.webp" alt="" width="64" height="79" style="width:64px;height:79px;border-radius:10px;background:#f4f1eb;object-fit:contain"><div><b>${p.name}</b><span>${p.fabric}</span></div><em>${money(p.price)}</em></button>`).join('');
$('#prodList').addEventListener('click',e=>{const b=e.target.closest('.prod'); if(b) setProduct(b.dataset.p);});
function setProduct(k){
  const old=P[st.product].areas, nw=P[k].areas;
  for(const v of ['front','back']) for(const L of st.layers[v]){ const o=old[v], n=nw[v];
    L.x=n[0]+(L.x-o[0])/o[2]*n[2]; L.y=n[1]+(L.y-o[1])/o[3]*n[3]; L.w=L.w*n[2]/o[2]; }
  st.product=k; $$('.prod').forEach(b=>b.classList.toggle('on',b.dataset.p===k)); $('#fabric').textContent=P[k].fabric;
  $('#loading').style.display='grid'; $('#loading').textContent='Loading preview…';
  M.loadGarment(k,'back'); update(); history.replaceState(null,'','?p='+k);
}
$('#colors').innerHTML=M.COLORS.map(c=>`<button data-c="${c.h}" title="${c.n}" aria-label="${c.n}" style="background:${c.h}"></button>`).join('');
$('#colors').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; st.color=b.dataset.c; markColor(); update();});
$('#mcolors').innerHTML=$('#colors').innerHTML;
$('#mcolors').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; st.color=b.dataset.c; markColor(); update(); toast(colorName(st.color));});
function markColor(){ $$('#mcolors button').forEach(b=>b.classList.toggle('on',b.dataset.c===st.color)); $$('#colors button').forEach(b=>b.classList.toggle('on',b.dataset.c===st.color)); $('#cName').textContent=colorName(st.color); }

$('#sizes').innerHTML=SIZES.map(s=>`<label class="${st.qty[s]?'has':''}">${s}<input type="number" min="0" inputmode="numeric" data-s="${s}" value="${st.qty[s]||''}" placeholder="0"></label>`).join('');
$('#sizes').addEventListener('input',e=>{ const s=e.target.dataset.s; const v=Math.max(0,parseInt(e.target.value)||0); if(v) st.qty[s]=v; else delete st.qty[s]; e.target.parentNode.classList.toggle('has',!!v); updateSummary(); });

function totals(){ const pcs=Object.values(st.qty).reduce((a,b)=>a+b,0); return {pcs, each:P[st.product].price, tot:pcs*P[st.product].price}; }
function updateSummary(){
  const t=totals(), p=P[st.product], prints=['front','back'].filter(v=>st.layers[v].length);
  $('#tProd').textContent=p.name; $('#tSub').textContent=colorName(st.color)+' · '+money(p.price);
  $('#sProd').textContent=p.short; $('#sEach').textContent=money(t.each)+' each'; $('#sQty').textContent=t.pcs||'0';
  $('#sPrints').textContent=prints.length?prints.map(v=>v[0].toUpperCase()+v.slice(1)).join(' + '):'None yet';
  $('#sTot').textContent=money(t.tot); $('#mTot').textContent=money(t.tot||p.price); $('#mSub').textContent=(t.pcs||1)+' piece'+((t.pcs||1)>1?'s':'')+' · '+p.short;
}

/* view switch */
$$('.vt').forEach(b=>b.addEventListener('click',()=>{ st.view=b.dataset.view; st.sel=null; $$('.vt').forEach(x=>x.classList.toggle('on',x===b)); refreshLayerList(); update(); }));
$('#zoomBtn').addEventListener('click',e=>{ const z=$('#stage').classList.toggle('zoom'); e.currentTarget.classList.toggle('on',z); if(z){ const s=$('#scroll'); requestAnimationFrame(()=>{ s.scrollTop=(s.scrollHeight-s.clientHeight)*.3; s.scrollLeft=(s.scrollWidth-s.clientWidth)/2; }); } });
$('#guideBtn').addEventListener('click',e=>{ st.guides=!st.guides; e.currentTarget.classList.toggle('on',st.guides); drawUI(); });

/* ---------- export + order ---------- */
async function sideCanvas(view){ const c=document.createElement('canvas'); c.width=M.W; c.height=M.H; await M.render(c.getContext('2d'),{product:st.product,view,color:st.color,drawPrint:x=>drawLayers(x,st.layers[view])}); return c; }
async function composite(){
  const f=await sideCanvas('front'), b=await sideCanvas('back');
  const c=document.createElement('canvas'); c.width=2000; c.height=1400; const x=c.getContext('2d');
  x.fillStyle='#f3f0ea'; x.fillRect(0,0,2000,1400); x.drawImage(f,0,0); x.drawImage(b,1000,0);
  x.fillStyle='#1F2A44'; x.fillRect(0,1240,2000,160);
  x.fillStyle='#C9A35A'; x.font='700 38px "DM Sans",sans-serif'; x.fillText('THE CUSTOMIZED HOUSE',60,1310);
  x.fillStyle='#ffffff'; x.font='500 30px "DM Sans",sans-serif';
  x.fillText(`${P[st.product].name} · ${colorName(st.color)} · Front + Back`,60,1360);
  x.textAlign='right'; x.fillText('WhatsApp +91 84315 73282',1940,1335); return c;
}
function download(c,name){ c.toBlob(b=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); },'image/png'); }
$('#dlBtn').addEventListener('click',()=>{ download(cv,`TCH-${st.product}-${st.view}.png`); toast('Mockup downloaded'); });
$('#dlBoth').addEventListener('click',async()=>{ download(await composite(),`TCH-${st.product}-mockup.png`); toast('Front + back mockup downloaded'); });
function orderText(){
  const t=totals(), p=P[st.product];
  const sizes=Object.entries(st.qty).map(([s,q])=>`${s} x ${q}`).join(', ')||'Not decided yet';
  const desc=v=>st.layers[v].length?st.layers[v].map(L=>L.type==='text'?`text "${L.text.replace(/\n/g,' ')}"`:'my image').join(' + '):'blank';
  return ['Hi The Customized House, I designed this in your Design Studio:', `Product: ${p.name}`, `Colour: ${colorName(st.color)}`,
    `Front: ${desc('front')}`, `Back: ${desc('back')}`, `Sizes: ${sizes}`, `Pieces: ${t.pcs||1}`, `Estimated total: ${money((t.pcs||1)*p.price)}`,
    '', 'I am sending my mockup image and design files here.'].join('\n');
}
async function order(){
  const text=orderText();
  try{
    const c=await composite(); const blob=await new Promise(r=>c.toBlob(r,'image/png'));
    const file=new File([blob],'TCH-my-design.png',{type:'image/png'});
    if(navigator.canShare && navigator.canShare({files:[file]}) && /Mobi|Android|iPhone/i.test(navigator.userAgent)){
      await navigator.share({files:[file], text}); return;
    }
    download(c,'TCH-my-design.png');
  }catch(e){ if(e && e.name==='AbortError') return; }
  window.open('https://wa.me/'+WA_NUM+'?text='+encodeURIComponent(text),'_blank');
  toast('Mockup saved - attach it in WhatsApp');
}
['#orderTop','#orderSide','#orderMob'].forEach(id=>$(id).addEventListener('click',order));

/* mobile: move colour/size/summary panel into the "Sizes" tab */
const mq=matchMedia('(max-width:980px)');
function placeSide(){ const side=$('.st-side'), pane=$('#pane-order');
  if(mq.matches){ while(side.firstChild) pane.appendChild(side.firstChild); }
  else { while(pane.firstChild) side.appendChild(pane.firstChild); if($('#pane-order').classList.contains('on')) showPane('product'); } drawUI(); }
mq.addEventListener('change',placeSide); placeSide();
/* ---------- start ---------- */
setProduct(st.product); markColor(); refreshLayerList(); updateSummary();
if(qs.get('pane')) showPane(qs.get('pane'));
const art=qs.get('art');
if(art && /^assets\/[\w\/.-]+\.(png|webp|jpg)$/.test(art)){
  const im=new Image(); im.onload=()=>{ const src=normalise(im), thumb=thumbOf(src); st.uploads.unshift({src,thumb,natW:im.naturalWidth}); renderUploads();
    addLayer({type:'image',src,thumb,natW:im.naturalWidth},.85); toast('Design loaded - make it yours'); }; im.src=art;
}
window.addEventListener('resize',drawUI);
})();

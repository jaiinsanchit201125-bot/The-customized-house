/* The Customized House - photo-real mockup engine
   Each garment is a greyscale shading map (128 = flat fabric) + alpha mask.
   We fill the garment with any colour, draw the customer's design on the flat
   fabric, then multiply by the shading so prints follow every fold and seam. */
(function(){
const W = 1000, H = 1240, RES = 2;           // canvas pixels; logical space is 500 x 620

const PRODUCTS = {
  tshirt:     {name:'Classic T-Shirt',  short:'T-Shirt',    price:699, fabric:'180 GSM 100% cotton, regular fit',
               areas:{front:[155,176,189,300], back:[155,162,189,320]}, inches:{front:12, back:12}},
  oversized:  {name:'Oversized T-Shirt', short:'Oversized', price:759, fabric:'240 GSM cotton, drop shoulder',
               areas:{front:[139,178,214,310], back:[139,166,214,322]}, inches:{front:13, back:14}},
  hoodie:     {name:'Premium Hoodie',   short:'Hoodie',     price:899, fabric:'320 GSM brushed fleece',
               areas:{front:[172,180,156,162], back:[146,190,208,296]}, inches:{front:10, back:12}},
  sweatshirt: {name:'Crewneck Sweatshirt', short:'Sweatshirt', price:899, fabric:'320 GSM brushed fleece',
               areas:{front:[149,176,202,296], back:[146,168,208,312]}, inches:{front:12, back:12}},
  jacket:     {name:'Zip Hoodie Jacket', short:'Zip Jacket', price:999, fabric:'320 GSM fleece, metal zip',
               areas:{front:[172,190,150,150], back:[146,190,208,296]}, inches:{front:9, back:12}, trim:{front:true}}
};

const COLORS = [
  {n:'White',h:'#F2F2F0'},{n:'Off-White',h:'#EEE6D6'},{n:'Black',h:'#1B1B1E'},{n:'Charcoal',h:'#3A3C42'},
  {n:'Grey Melange',h:'#BDBDBD'},{n:'Navy',h:'#1F2A44'},{n:'Royal Blue',h:'#2348B0'},{n:'Sky Blue',h:'#A9C7E6'},
  {n:'Maroon',h:'#6B1E2A'},{n:'Red',h:'#B3202D'},{n:'Bottle Green',h:'#1F4A38'},{n:'Olive',h:'#5E6247'},
  {n:'Beige',h:'#D8C6A6'},{n:'Mustard',h:'#D4A12A'},{n:'Lavender',h:'#B7A6D4'},{n:'Baby Pink',h:'#F1C6D0'}
];

const cache = {};
function loadImage(src){
  return new Promise((res,rej)=>{const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=src;});
}
async function loadGarment(prod, view, base){
  const key = prod+'-'+view;
  if(cache[key]) return cache[key];
  const p = (async()=>{
    base = base || 'assets/mockups/';
    const im = await loadImage(base+key+'.webp');
    const c = document.createElement('canvas'); c.width=W; c.height=H;
    const x = c.getContext('2d',{willReadFrequently:true}); x.drawImage(im,0,0,W,H);
    const d = x.getImageData(0,0,W,H).data;
    const n=W*H, S=new Float32Array(n), A=new Uint8ClampedArray(n);
    let x0=W,y0=H,x1=0,y1=0;
    for(let i=0;i<n;i++){
      const a=d[i*4+3]; A[i]=a; S[i]=d[i*4]/128;
      if(a){const px=i%W, py=(i/W)|0; if(px<x0)x0=px; if(px>x1)x1=px; if(py<y0)y0=py; if(py>y1)y1=py;}
    }
    let trim=null;
    if(PRODUCTS[prod].trim && PRODUCTS[prod].trim[view]){ try{ trim = await loadImage(base+key+'-trim.webp'); }catch(e){} }
    return {S,A,trim,box:[x0,y0,x1+1,y1+1]};
  })();
  cache[key]=p; return p;
}
function hexRgb(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}

const FLAT = document.createElement('canvas'); FLAT.width=W; FLAT.height=H;
const FCTX = FLAT.getContext('2d',{willReadFrequently:true});

function drawBackdrop(ctx, style){
  if(style==='none'){ctx.clearRect(0,0,W,H); return;}
  const g=ctx.createLinearGradient(0,0,0,H);
  if(style==='dark'){g.addColorStop(0,'#2a3350'); g.addColorStop(1,'#151b2c');}
  else {g.addColorStop(0,'#f7f5f1'); g.addColorStop(1,'#ebe6dd');}
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const sh=ctx.createRadialGradient(500,1185,10,500,1185,420);
  sh.addColorStop(0,style==='dark'?'rgba(0,0,0,.45)':'rgba(60,45,25,.20)'); sh.addColorStop(1,'rgba(0,0,0,0)');
  ctx.save(); ctx.translate(500,1185); ctx.scale(1,.12); ctx.translate(-500,-1185);
  ctx.fillStyle=sh; ctx.beginPath(); ctx.arc(500,1185,420,0,Math.PI*2); ctx.fill(); ctx.restore();
}

/* render(ctx, {product, view, color, backdrop, drawPrint(flatCtx, area)}) */
async function render(ctx, o){
  const g = await loadGarment(o.product, o.view, o.base);
  const area = PRODUCTS[o.product].areas[o.view];
  const [r,gc,b] = hexRgb(o.color);
  FCTX.setTransform(1,0,0,1,0,0);
  FCTX.fillStyle=o.color; FCTX.fillRect(0,0,W,H);
  if(o.drawPrint){
    FCTX.save(); FCTX.scale(RES,RES);
    FCTX.beginPath(); FCTX.rect(area[0],area[1],area[2],area[3]); FCTX.clip();
    o.drawPrint(FCTX, area);
    FCTX.restore();
  }
  const [x0,y0,x1,y1]=g.box, bw=x1-x0, bh=y1-y0;
  const img = FCTX.getImageData(x0,y0,bw,bh), d=img.data, S=g.S, A=g.A;
  for(let yy=0;yy<bh;yy++){
    let i=(yy+y0)*W+x0, j=yy*bw*4;
    for(let xx=0;xx<bw;xx++,i++,j+=4){
      const a=A[i]; if(!a){d[j+3]=0; continue;}
      const s=S[i], k=s*0.93, hl=s>1?(s-1)*45:0;
      let v0=d[j]*k+hl, v1=d[j+1]*k+hl, v2=d[j+2]*k+hl;
      if(v0>225)v0=225+30*Math.tanh((v0-225)/30);
      if(v1>225)v1=225+30*Math.tanh((v1-225)/30);
      if(v2>225)v2=225+30*Math.tanh((v2-225)/30);
      d[j]=v0; d[j+1]=v1; d[j+2]=v2; d[j+3]=a;
    }
  }
  FCTX.putImageData(img,x0,y0);
  ctx.setTransform(1,0,0,1,0,0);
  drawBackdrop(ctx, o.backdrop||'light');
  ctx.drawImage(FLAT,x0,y0,bw,bh,x0,y0,bw,bh);
  if(g.trim) ctx.drawImage(g.trim,0,0,W,H);
  return area;
}

window.TCHMock = {W,H,RES,PRODUCTS,COLORS,render,loadGarment,drawBackdrop,hexRgb};
})();

// node render_mockups.js <outdir>   (run a static server at the repo root on port 8777 first: python3 -m http.server 8777)
// Edit JOBS for colours, batch text, section and sample names. Output: hoodie-<name>.png (1000x1240, light backdrop).
const {chromium}=require('playwright'); const fs=require('fs'); const out=process.argv[2]||'.';
const NAMES=['AARAV','DIYA','KABIR','SANA','VIHAAN','ANAYA','ISHAAN','MEERA','RIYA','ARJUN','TARA','DEV'];
const JOBS=[['navy','#1F2A44','#F2E9D8','2027','10 - B'],['maroon','#6B1E2A','#F2E9D8','2027','12 - A'],['black','#1B1B1E','#C9A35A','2027','10 - C'],['green','#1F4A38','#F2E9D8','2027','12 - SCIENCE'],['lavender','#B7A6D4','#1F2A44','2027','10 - A'],['white','#F2F2F0','#1F2A44','2027','12 - COMMERCE']];
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('http://localhost:8777/studio-tools/mock.html'); await p.evaluate(()=>document.fonts.ready);
for(const [n,c,ink,bt,sec] of JOBS){const d=await p.evaluate(([c,ink,bt,sec,names])=>renderBatch(c,ink,bt,sec,names,'light'),[c,ink,bt,sec,NAMES]);
fs.writeFileSync(out+'/hoodie-'+n+'.png',Buffer.from(d.split(',')[1],'base64'));}
await b.close();})();

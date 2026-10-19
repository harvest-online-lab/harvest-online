const canvas=document.getElementById('game');let ctx=canvas.getContext('2d'),status=document.getElementById('status'),count=document.getElementById('players');
const W=20,H=14,T=32;let id=null,players={},crops={},socket=null,connected=false,selected='plant',self={x:10,y:7,dir:'down'};
const obstacles=new Set(['4,4','5,4','6,4','14,9','15,9','2,2','3,2','2,3','3,3']);const plots=new Set();for(let y=8;y<=11;y++)for(let x=5;x<=9;x++)plots.add(x+','+y);
const keys=new Set();document.querySelectorAll('[data-d]').forEach(b=>{const d=b.dataset.d;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(d)});['pointerup','pointercancel','lostpointercapture'].forEach(k=>b.addEventListener(k,()=>keys.delete(d)))});
const keymap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
window.addEventListener('keydown',e=>{const d=keymap[e.key];if(d){e.preventDefault();keys.add(d)}});window.addEventListener('keyup',e=>{const d=keymap[e.key];if(d)keys.delete(d)});
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.tool;document.querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('active',x===b))}));document.querySelector('[data-tool="plant"]').classList.add('active');
canvas.addEventListener('pointerdown',e=>{if(!connected||!id)return;const r=canvas.getBoundingClientRect(),sx=(e.clientX-r.left)*canvas.width/r.width,sy=(e.clientY-r.top)*canvas.height/r.height;const q=(sx-320)/16, v=(sy-55)/8;const x=Math.floor((q+v)/2),y=Math.floor((v-q)/2);if(!plots.has(x+','+y)){status.textContent='แตะที่แปลงดินเพื่อทำฟาร์ม';return}if(Math.abs(x-self.x)+Math.abs(y-self.y)>2){status.textContent='เดินเข้าไปใกล้แปลงก่อน';return}socket.send(JSON.stringify({type:'farm',action:selected,x,y}))});
function connect(){const base=window.WORKER_URL;if(!base||base.includes('REPLACE-ME')){status.textContent='ตั้งค่า WORKER_URL ใน config.js ก่อน';return}socket=new WebSocket(base.replace(/^http/,'ws').replace(/\/$/,'')+'/room/farm1');socket.onopen=()=>{connected=true;status.textContent='ออนไลน์ — ห้อง farm1';socket.send(JSON.stringify({type:'join'}))};socket.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}if(m.type==='welcome'){id=m.id;players=m.players||{};crops=m.crops||{};if(players[id])self={...players[id]}}if(m.type==='state'){players=m.players||{};crops=m.crops||{}}if(m.type==='error')status.textContent=m.message;count.textContent='ผู้เล่นออนไลน์: '+Object.keys(players).length};socket.onclose=()=>{connected=false;id=null;players={};count.textContent='ผู้เล่นออนไลน์: —';status.textContent='หลุดการเชื่อมต่อ กำลังลองใหม่';setTimeout(connect,3000)};socket.onerror=()=>status.textContent='เชื่อมต่อไม่ได้: ตรวจ URL Worker'}
let last=0;function update(t){if(t-last<145)return;last=t;if(!connected||!id)return;let x=self.x,y=self.y,dir=self.dir;if(keys.has('up')){y--;dir='up'}else if(keys.has('down')){y++;dir='down'}else if(keys.has('left')){x--;dir='left'}else if(keys.has('right')){x++;dir='right'};if(x>=0&&x<W&&y>=0&&y<H&&!obstacles.has(x+','+y)&&(x!==self.x||y!==self.y)){self={x,y,dir};socket.send(JSON.stringify({type:'move',x,y,dir}))}}


const IW=32,IH=16,OX=320,OY=55;
function iso(x,y,z=0){return [OX+(x-y)*IW/2,OY+(x+y)*IH/2-z]}
function polygon(p,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(...p[0]);for(let i=1;i<p.length;i++)ctx.lineTo(...p[i]);ctx.closePath();ctx.fill()}
function block(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function diamond(x,y,top,right,bottom,left){const [sx,sy]=iso(x,y);polygon([[sx,sy-8],[sx+16,sy],[sx,sy+8],[sx-16,sy]],top);if(right)polygon([[sx+16,sy],[sx,sy+8],[sx,sy+12],[sx+16,sy+4]],right);if(left)polygon([[sx-16,sy],[sx,sy+8],[sx,sy+12],[sx-16,sy+4]],left)}
function pine(x,y){const [sx,sy]=iso(x+.5,y+.5);block(sx-3,sy-19,6,20,'#67402b');polygon([[sx-21,sy-15],[sx,sy-57],[sx+21,sy-15]],'#214f39');polygon([[sx-17,sy-29],[sx,sy-65],[sx+17,sy-29]],'#397f4d');polygon([[sx-12,sy-43],[sx,sy-75],[sx+12,sy-43]],'#5b9c56');polygon([[sx-4,sy-68],[sx,sy-74],[sx+5,sy-64]],'#a0c77b')}
function building(x,y){const [sx,sy]=iso(x+.5,y+.5);polygon([[sx-50,sy-16],[sx,sy+8],[sx+50,sy-16],[sx,sy-42]],'#b48b5a');polygon([[sx-50,sy-16],[sx,sy+8],[sx,sy-49],[sx-50,sy-73]],'#e7c58a');polygon([[sx,sy+8],[sx+50,sy-16],[sx+50,sy-73],[sx,sy-49]],'#ba8757');polygon([[sx-57,sy-71],[sx,sy-112],[sx+57,sy-71],[sx,sy-42]],'#824332');polygon([[sx-57,sy-71],[sx,sy-112],[sx,sy-78],[sx-47,sy-50]],'#b75f41');polygon([[sx,sy-78],[sx,sy-112],[sx+57,sy-71],[sx+47,sy-50]],'#8c3d33');polygon([[sx-32,sy-43],[sx-12,sy-34],[sx-12,sy-12],[sx-32,sy-21]],'#6b4635');polygon([[sx+15,sy-34],[sx+32,sy-42],[sx+32,sy-25],[sx+15,sy-17]],'#ffe7a2');polygon([[sx+18,sy-33],[sx+29,sy-38],[sx+29,sy-27],[sx+18,sy-22]],'#73b8c0')}
function fence(x,y){const [sx,sy]=iso(x,y);block(sx-3,sy-18,6,20,'#8b5b36');block(sx-2,sy-17,3,14,'#d5a36b');polygon([[sx-17,sy-12],[sx+16,sy+4],[sx+16,sy+8],[sx-17,sy-8]],'#a97645')}
function plant(x,y,c){const [sx,sy]=iso(x+.5,y+.5);if(!c)return;const stage=c.stage||0;block(sx-2,sy-19-stage*3,4,18+stage*3,'#377747');polygon([[sx,sy-19-stage*3],[sx-12,sy-27-stage*3],[sx-7,sy-15-stage*3]],'#64a64c');polygon([[sx,sy-23-stage*3],[sx+12,sy-31-stage*3],[sx+8,sy-17-stage*3]],'#8abf60');if(stage>=2){block(sx-5,sy-20,10,11,stage>=3?'#e79b45':'#b6b45a')}if(c.watered)block(sx+9,sy-2,5,3,'#6bb3ca')}
function avatar(p,pid,t){const [sx,sy]=iso(p.x+.5,p.y+.5);const own=pid===id;polygon([[sx-10,sy],[sx,sy+5],[sx+10,sy],[sx,sy-5]],'#456a47');const bob=Math.sin(t/130)*1.5;block(sx-7,sy-26+bob,14,18,own?'#507eaf':'#a56c56');block(sx-6,sy-41+bob,12,14,'#e9bb91');block(sx-9,sy-43+bob,18,5,own?'#3e6596':'#77533c');block(sx-11,sy-39+bob,22,3,own?'#4d81ad':'#916341');block(sx-5,sy-8,4,8,'#504641');block(sx+2,sy-8,4,8,'#504641');ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff4d6';ctx.fillText(own?'YOU':pid.slice(0,4),sx,sy-47)}

function flower(x,y,kind=0){const [sx,sy]=iso(x+.5,y+.5);block(sx,sy-9,2,10,'#42763b');for(const [dx,dy] of [[-4,-10],[3,-10],[-1,-14],[-1,-7]])block(sx+dx,sy+dy,5,4,kind?'#ffca69':'#f5a5bf');block(sx-1,sy-11,3,3,'#ffe99a')}
function barrel(x,y){const [sx,sy]=iso(x+.5,y+.5);block(sx-10,sy-18,20,17,'#855332');block(sx-9,sy-17,18,4,'#c69256');block(sx-10,sy-11,20,3,'#4c443a');block(sx-9,sy-4,18,3,'#4c443a')}
function stone(x,y){const [sx,sy]=iso(x+.5,y+.5);polygon([[sx-12,sy-3],[sx-7,sy-14],[sx+7,sy-16],[sx+14,sy-5],[sx+7,sy+2],[sx-8,sy+2]],'#697a6c');polygon([[sx-7,sy-14],[sx+7,sy-16],[sx+2,sy-7],[sx-11,sy-5]],'#a7b5a1')}
function gardenTree(x,y,pink=false){const [sx,sy]=iso(x+.5,y+.5);block(sx-5,sy-29,10,30,'#75503a');for(const [dx,dy,r] of [[-17,-53,21],[14,-49,24],[0,-67,23],[-4,-39,23]]){ctx.fillStyle=pink?'#dc8eab':'#3c7950';ctx.beginPath();ctx.arc(sx+dx,sy+dy,r,0,Math.PI*2);ctx.fill();ctx.fillStyle=pink?'#f4b2c4':'#68a66a';ctx.beginPath();ctx.arc(sx+dx-5,sy+dy-6,r*.65,0,Math.PI*2);ctx.fill()}for(let i=0;i<16;i++){const a=i*2.4;block(sx+Math.sin(a)*25,sy-53+Math.cos(a)*22,3,3,pink?'#ffe0df':'#a5d17a')}}
function mailbox(x,y){const [sx,sy]=iso(x+.5,y+.5);block(sx-2,sy-24,4,25,'#704d37');block(sx-9,sy-31,18,12,'#ab4237');block(sx-7,sy-34,14,5,'#d8674e')}

// Original richly textured isometric ground, generated once for mobile performance
const scenery=document.createElement('canvas');scenery.width=640;scenery.height=448;const sc=scenery.getContext('2d');
function seeded(n){let v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)}
function sceneryDraw(){const old=ctx;ctx=sc;
const sky=sc.createLinearGradient(0,0,0,448);sky.addColorStop(0,'#c2e7d4');sky.addColorStop(.48,'#e7dfad');sky.addColorStop(1,'#759b6d');sc.fillStyle=sky;sc.fillRect(0,0,640,448);
polygon([[0,170],[105,132],[240,185],[345,119],[460,175],[565,120],[640,165],[640,448],[0,448]],'#799b77');
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const road=y===6||y===7,plot=plots.has(x+','+y);diamond(x,y,plot?'#815038':road?((x+y)%2?'#d8b581':'#e6c995'):((x*7+y*11)%5===0?'#79a852':'#8dbb6a'),plot?'#684731':road?'#ad8b60':'#61904e',null,plot?'#65462f':'#578847');const [sx,sy]=iso(x+.5,y+.5);for(let i=0;i<18;i++){const u=seeded(x*711+y*47+i*9),v=seeded(x*37+y*617+i*11);const px=sx+(u-v)*14,py=sy+(u+v-1)*7;block(px,py,1+(i%3===0),1,plot?(i%3?'#9c6641':'#533e2c'):road?(i%2?'#bc9b6b':'#f2d8a6'):(i%3?'#70a257':'#a2c87b'))}}
for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(x===0||x===19||y===0||y===13){if((x+y)%2===0)pine(x,y)}else if((x===4||x===5||x===6)&&y===4)pine(x,y);else if((x===14||x===15)&&y===9)pine(x,y);else if(y===3&&x>=10&&x<=16&&x%2===0)fence(x,y);
for(const [x,y] of [[7,2],[9,3],[12,2],[15,5],[3,9],[12,10],[16,10]])flower(x,y,(x+y)%2);
for(const [x,y] of [[1,5],[5,1],[17,7]])stone(x,y);
for(const [x,y] of [[3,5],[16,5]])barrel(x,y);
gardenTree(6,2,true);gardenTree(16,8,false);building(2,2);mailbox(3,4);
ctx=old}
sceneryDraw();
function draw(t){update(t);ctx.drawImage(scenery,0,0);
for(let y=8;y<=11;y++)for(let x=5;x<=9;x++)plant(x,y,crops[x+','+y]);
for(const [pid,p] of Object.entries(players))if(Number.isFinite(p.x)&&Number.isFinite(p.y))avatar(p,pid,t);
block(8,8,160,26,'#50382c');block(11,11,154,20,'#f0d39c');ctx.fillStyle='#593c2b';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('PS1 FARM v0.7',88,26);
requestAnimationFrame(draw)}
connect();requestAnimationFrame(draw);
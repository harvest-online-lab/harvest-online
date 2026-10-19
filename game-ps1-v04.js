const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),status=document.getElementById('status'),count=document.getElementById('players');
const W=20,H=14,T=32;let id=null,players={},crops={},socket=null,connected=false,selected='plant',self={x:10,y:7,dir:'down'};
const obstacles=new Set(['4,4','5,4','6,4','14,9','15,9','2,2','3,2','2,3','3,3']);const plots=new Set();for(let y=8;y<=11;y++)for(let x=5;x<=9;x++)plots.add(x+','+y);
const keys=new Set();document.querySelectorAll('[data-d]').forEach(b=>{const d=b.dataset.d;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(d)});['pointerup','pointercancel','lostpointercapture'].forEach(k=>b.addEventListener(k,()=>keys.delete(d)))});
const keymap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
window.addEventListener('keydown',e=>{const d=keymap[e.key];if(d){e.preventDefault();keys.add(d)}});window.addEventListener('keyup',e=>{const d=keymap[e.key];if(d)keys.delete(d)});
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.tool;document.querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('active',x===b))}));document.querySelector('[data-tool="plant"]').classList.add('active');
canvas.addEventListener('pointerdown',e=>{if(!connected||!id)return;const r=canvas.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)*canvas.width/r.width/T),y=Math.floor((e.clientY-r.top)*canvas.height/r.height/T);if(!plots.has(x+','+y)){status.textContent='เลือกแปลงดินสีน้ำตาลเพื่อทำฟาร์ม';return}if(Math.abs(x-self.x)+Math.abs(y-self.y)>2){status.textContent='เดินเข้าไปใกล้แปลงก่อน';return}socket.send(JSON.stringify({type:'farm',action:selected,x,y}))});
function connect(){const base=window.WORKER_URL;if(!base||base.includes('REPLACE-ME')){status.textContent='ตั้งค่า WORKER_URL ใน config.js ก่อน';return}socket=new WebSocket(base.replace(/^http/,'ws').replace(/\/$/,'')+'/room/farm1');socket.onopen=()=>{connected=true;status.textContent='ออนไลน์ — ห้อง farm1';socket.send(JSON.stringify({type:'join'}))};socket.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}if(m.type==='welcome'){id=m.id;players=m.players||{};crops=m.crops||{};if(players[id])self={...players[id]}}if(m.type==='state'){players=m.players||{};crops=m.crops||{}}if(m.type==='error')status.textContent=m.message;count.textContent='ผู้เล่นออนไลน์: '+Object.keys(players).length};socket.onclose=()=>{connected=false;id=null;players={};count.textContent='ผู้เล่นออนไลน์: —';status.textContent='หลุดการเชื่อมต่อ กำลังลองใหม่';setTimeout(connect,3000)};socket.onerror=()=>status.textContent='เชื่อมต่อไม่ได้: ตรวจ URL Worker'}
let last=0;function update(t){if(t-last<145)return;last=t;if(!connected||!id)return;let x=self.x,y=self.y,dir=self.dir;if(keys.has('up')){y--;dir='up'}else if(keys.has('down')){y++;dir='down'}else if(keys.has('left')){x--;dir='left'}else if(keys.has('right')){x++;dir='right'};if(x>=0&&x<W&&y>=0&&y<H&&!obstacles.has(x+','+y)&&(x!==self.x||y!==self.y)){self={x,y,dir};socket.send(JSON.stringify({type:'move',x,y,dir}))}}

function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function poly(points,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fill()}
function grain(x,y,seed){let n=(x*31+y*67+seed*17)>>>0;n=(n^(n<<13))>>>0;n=(n^(n>>>17))>>>0;return n%13}
function tree(x,y,seed=0){rect(x+12,y+19,10,13,'#67412e');rect(x+11,y+20,4,9,'#99623c');rect(x+3,y+13,29,12,'#234d39');rect(x+1,y+7,30,13,'#327044');rect(x+6,y+1,23,14,'#3c8950');rect(x+11,y+3,12,5,'#69a95c');rect(x+5,y+10,6,4,'#559c5c');rect(x+23,y+13,5,5,'#25583c');rect(x+9,y+24,15,2,'#385d37')}
function house(x,y){rect(x+2,y+24,68,43,'#785037');rect(x+5,y+23,62,39,'#e6b978');for(let i=0;i<5;i++){rect(x+7+i*12,y+27,1,32,'#d2a66d');rect(x+7+i*12,y+46,11,1,'#e9c98d')}rect(x+27,y+42,18,22,'#72452f');rect(x+31,y+46,9,18,'#99603a');rect(x+11,y+37,13,14,'#f5e5a4');rect(x+13,y+39,9,10,'#7cc2c9');rect(x+48,y+37,13,14,'#f5e5a4');rect(x+50,y+39,9,10,'#7cc2c9');poly([[x-7,y+26],[x+35,y-1],[x+79,y+26]],'#723b32');poly([[x-4,y+23],[x+35,y+1],[x+76,y+23]],'#a7533d');for(let i=0;i<6;i++)rect(x+8+i*10,y+18-Math.floor(i<3?i*5:(5-i)*5),8,2,'#c46b4b');rect(x-5,y+25,81,5,'#643b30');rect(x+1,y+29,72,2,'#c37b50')}
function crop(x,y,c){const px=x*T,py=y*T;rect(px+2,py+3,28,27,'#654632');rect(px+4,py+4,24,22,'#9a6341');rect(px+5,py+6,22,3,'#b17b4e');rect(px+6,py+23,20,2,'#70492f');if(!c)return;if(c.watered){rect(px+5,py+22,21,3,'#578ca3');rect(px+9,py+25,6,2,'#87b7c2')}const level=c.stage||0;rect(px+15,py+15-level*2,3,10+level*2,'#376b37');rect(px+10,py+13-level*2,7,5,'#438747');rect(px+18,py+10-level*2,7,7,'#63aa4f');if(level>=2){rect(px+12,py+15,11,10,level>=3?'#dc7e34':'#82ad4b');rect(px+14,py+16,6,4,level>=3?'#f3ad50':'#a9c76b')}}
function player(p,pid,t){const x=p.x*T,y=p.y*T,own=pid===id,walk=Math.sin(t/120)*2;rect(x+7,y+27,21,4,'#4c6844');rect(x+10,y+22,6,7+Math.max(0,walk),'#453d46');rect(x+19,y+22,6,7+Math.max(0,-walk),'#453d46');rect(x+9,y+14,17,11,own?'#416d9d':'#9d644d');rect(x+10,y+17,15,6,own?'#6389b6':'#bd8463');rect(x+7,y+16,4,8,'#dca77a');rect(x+25,y+16,4,8,'#dca77a');rect(x+11,y+6,14,11,'#e4b38a');rect(x+10,y+4,17,7,own?'#514332':'#684638');rect(x+9,y+3,18,3,own?'#356eac':'#8d5742');rect(x+7,y+8,21,3,own?'#477eb5':'#79503b');if(p.dir!=='up'){rect(x+14,y+12,2,2,'#3c302d');rect(x+22,y+12,2,2,'#3c302d')}ctx.textAlign='center';ctx.font='bold 9px sans-serif';ctx.fillStyle='#3a3027';ctx.fillText(own?'YOU':pid.slice(0,4),x+17,y+2);ctx.fillStyle='#fff4df';ctx.fillText(own?'YOU':pid.slice(0,4),x+16,y+1)}
function draw(t){update(t);
rect(0,0,640,448,'#82b868');
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const px=x*T,py=y*T;rect(px,py,32,32,(x+y)%2?'#85b96b':'#8cbe72');for(let k=0;k<4;k++){const gx=px+grain(x+k,y,2)*2+2,gy=py+grain(y,x+k,3)*2+2;rect(gx%640,gy%448,2,3,k%2?'#7dae65':'#a0c982')}if((x*11+y*7)%9===0){rect(px+15,py+17,3,2,'#e6c77e');rect(px+18,py+17,2,2,'#f4e1a4')}}
for(let x=0;x<W;x++){tree(x*T,-16,x);tree(x*T,13*T-11,x)}for(let y=1;y<13;y++)if(y!==7){tree(0,y*T,y);tree(19*T,y*T,y)}
for(let y=6;y<8;y++)for(let x=1;x<19;x++){const px=x*T,py=y*T;rect(px,py,32,32,(x+y)%2?'#c9b17d':'#d9c18c');rect(px+2,py+4,28,2,'#e3ce9e');rect(px+5,py+24,21,2,'#bca36d');rect(px+grain(x,y,4),py+15,5,2,'#bda472')}

// Warm PS1-era atmospheric details: raised wooden deck, fencing and shadows
rect(28,58,122,100,'#557747');rect(31,61,116,94,'#759454');
for(let k=0;k<8;k++){rect(35+k*14,145,11,4,'#4c7145')}
house(64,64);
for(let k=0;k<8;k++){const fx=268+k*34;rect(fx,65,6,21,'#8d603f');rect(fx+1,66,3,18,'#c3945e');rect(fx,71,33,5,'#b78952');rect(fx,80,33,4,'#a37447')}
rect(375,110,66,28,'#527b4e');rect(380,102,57,23,'#aa7045');rect(385,106,48,12,'#d9a46c');rect(396,95,26,14,'#76462f');rect(399,98,20,10,'#b16e43');
for(let k=0;k<7;k++){rect(385+k*8,120,4,5,'#7d5138')}
for(let k=0;k<6;k++){const xx=340+k*30;rect(xx,378,6,21,'#8e633f');rect(xx+2,379,2,18,'#d4a36b');rect(xx,385,30,4,'#a4774a')}
for(const [x,y] of [[4,4],[5,4],[6,4],[14,9],[15,9]])tree(x*T,y*T);
for(let y=8;y<=11;y++)for(let x=5;x<=9;x++)crop(x,y,crops[x+','+y]);
for(const [pid,p] of Object.entries(players))if(Number.isFinite(p.x)&&Number.isFinite(p.y))player(p,pid,t);

// Always-visible revision label to distinguish deployed assets from cached builds
rect(455,8,177,26,'#513b32');rect(458,10,171,21,'#f3d7a3');
ctx.textAlign='center';ctx.font='bold 13px monospace';ctx.fillStyle='#5b3726';ctx.fillText('PS1 FARM  v0.4',544,25);
requestAnimationFrame(draw)}
connect();requestAnimationFrame(draw);

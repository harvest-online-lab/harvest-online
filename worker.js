const W=20,H=14;
const blocked=new Set(['4,4','5,4','6,4','14,9','15,9','2,2','3,2','2,3','3,3']);
const plots=new Set();for(let y=8;y<=11;y++)for(let x=5;x<=9;x++)plots.add(x+','+y);
export class FarmRoom {
 constructor(ctx,env){this.ctx=ctx;this.env=env;this.players=new Map();this.sockets=new Map();this.crops={};this.ready=this.ctx.blockConcurrencyWhile(async()=>{this.crops=await this.ctx.storage.get('crops')||{}});}
 async fetch(request){
  if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('WebSocket required',{status:426});
  const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();
  const id=crypto.randomUUID().slice(0,8);this.sockets.set(server,id);
  let pos={x:10,y:7,dir:'down'};this.players.set(id,pos);
  server.send(JSON.stringify({type:'welcome',id,players:Object.fromEntries(this.players),crops:this.crops}));this.broadcast();
  server.addEventListener('message',async e=>{try{
   const m=JSON.parse(e.data),old=this.players.get(id);if(!old)return;
   if(m.type==='move'){const {x,y}=m;if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=W||y<0||y>=H||Math.abs(x-old.x)+Math.abs(y-old.y)!==1||blocked.has(x+','+y))return;this.players.set(id,{x,y,dir:['up','down','left','right'].includes(m.dir)?m.dir:old.dir});this.broadcast();return}
   if(m.type==='farm'){const x=m.x,y=m.y;if(!Number.isInteger(x)||!Number.isInteger(y)||!plots.has(x+','+y)||Math.abs(x-old.x)+Math.abs(y-old.y)>2)return;const key=x+','+y,prev=this.crops[key];if(m.action==='plant'&&!prev)this.crops[key]={stage:0,watered:false,plantedAt:Date.now()};else if(m.action==='water'&&prev&&!prev.watered)this.crops[key]={...prev,watered:true,stage:Math.min(3,prev.stage+1)};else if(m.action==='harvest'&&prev&&prev.stage>=3)delete this.crops[key];else return;await this.ctx.storage.put('crops',this.crops);this.broadcast()}
  }catch{}});
  let closed=false;const cleanup=()=>{if(closed)return;closed=true;this.sockets.delete(server);this.players.delete(id);this.broadcast()};server.addEventListener('close',cleanup);server.addEventListener('error',cleanup);
  return new Response(null,{status:101,webSocket:client});
 }
 broadcast(){const data=JSON.stringify({type:'state',players:Object.fromEntries(this.players),crops:this.crops});for(const s of this.sockets.keys())try{s.send(data)}catch{}}
}
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname==='/health')return Response.json({ok:true,version:'TASK-02'});if(!url.pathname.startsWith('/room/'))return new Response('Not found',{status:404});const name=url.pathname.slice(6).slice(0,64);if(!/^[a-zA-Z0-9_-]+$/.test(name))return new Response('Bad room',{status:400});return env.FARM_ROOM.get(env.FARM_ROOM.idFromName(name)).fetch(request)}};

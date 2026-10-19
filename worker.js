export class FarmRoom {
 constructor(ctx,env){this.ctx=ctx;this.env=env;this.players=new Map();this.sockets=new Map();}
 async fetch(request){
  if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('WebSocket required',{status:426});
  const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();
  const id=crypto.randomUUID().slice(0,8);this.sockets.set(server,id);
  const blocked=new Set(['4,4','5,4','6,4','14,9','15,9']);
  let pos={x:10,y:7};this.players.set(id,pos);
  server.send(JSON.stringify({type:'welcome',id,players:Object.fromEntries(this.players)}));this.broadcast();
  server.addEventListener('message',e=>{try{const m=JSON.parse(e.data);if(m.type!=='move')return;const {x,y}=m;const old=this.players.get(id);if(!old||!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=20||y<0||y>=14||Math.abs(x-old.x)+Math.abs(y-old.y)!==1||blocked.has(x+','+y))return;this.players.set(id,{x,y});this.broadcast()}catch{}});
  let closed=false;const cleanup=()=>{if(closed)return;closed=true;this.sockets.delete(server);this.players.delete(id);this.broadcast()};server.addEventListener('close',cleanup);server.addEventListener('error',cleanup);
  return new Response(null,{status:101,webSocket:client});
 }
 broadcast(){const data=JSON.stringify({type:'state',players:Object.fromEntries(this.players)});for(const s of this.sockets.keys())try{s.send(data)}catch{}}
}
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname==='/health')return Response.json({ok:true});if(!url.pathname.startsWith('/room/'))return new Response('Not found',{status:404});const name=url.pathname.slice(6).slice(0,64);if(!/^[a-zA-Z0-9_-]+$/.test(name))return new Response('Bad room',{status:400});return env.FARM_ROOM.get(env.FARM_ROOM.idFromName(name)).fetch(request)}};
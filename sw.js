const CACHE='flan-fact-mobile-layout-oct21';
const ASSETS=['./','./index.html','./styles.css','./ux.css','./ux-model.js','./event-actions.js','./app.js','./backup.js','./manifest.webmanifest','./icons/icon.svg?v=15','./icons/favicon-32.png?v=15','./icons/apple-touch-icon.png?v=15','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('flan-pact-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.includes('/api/'))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));});
const choices=[{action:'done',title:'✓ Выполнено'},{action:'extend',title:'+15 минут'},{action:'missed',title:'✕ Не выполнено'}];
function safeUrl(data){const url=new URL(data.url||'./',self.registration.scope);return url.origin===self.location.origin&&url.href.startsWith(self.registration.scope)?url.href:self.registration.scope;}
function db(){return new Promise((resolve,reject)=>{const request=indexedDB.open('flan-push-actions',1);request.onupgradeneeded=()=>request.result.createObjectStore('pending',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
async function store(mode,fn){const d=await db();try{return await new Promise((resolve,reject)=>{const tx=d.transaction('pending',mode),request=fn(tx.objectStore('pending'));let value;request.onsuccess=()=>value=request.result;tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{d.close();}}
async function broadcast(message){for(const c of await clients.matchAll({type:'window',includeUncontrolled:true}))c.postMessage(message);}
async function openEvent(data){const url=safeUrl(data);for(const w of await clients.matchAll({type:'window',includeUncontrolled:true})){if(w.url.startsWith(self.registration.scope)){w.postMessage({type:'OPEN_EVENT',taskId:data.taskId,planId:data.planId});await w.focus();return;}}await clients.openWindow(url);}
self.addEventListener('push',e=>{let data={title:'Flan Fact',body:'Запланировано событие'};try{data={...data,...e.data.json()};}catch(_){}const max=Number.isFinite(Notification.maxActions)?Notification.maxActions:0;const actions=data.actionToken?choices.slice(0,max):[];e.waitUntil(self.registration.showNotification(data.title,{body:data.body,tag:data.tag,icon:'./icons/icon-192.png',badge:'./icons/favicon-32.png',data:{...data,url:safeUrl(data)},actions}));});
async function execute(item){
 let response;try{const url=new URL(item.data.actionUrl);if(url.origin!==self.location.origin)throw Error('origin');response=await fetch(url.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:item.data.actionToken,action:item.action}),signal:AbortSignal.timeout(12000)});}catch{return false;}
 if(response.status>=500||response.status===429)return false;
 await store('readwrite',s=>s.delete(item.id));
 if(response.ok){for(const n of await self.registration.getNotifications())if(n.data?.taskId===item.data.taskId&&n.data?.planId===item.data.planId)n.close();await broadcast({type:'EVENT_UPDATED',taskId:item.data.taskId,planId:item.data.planId});}
 else {let message='Откройте событие и повторите действие';try{message=(await response.json()).error||message;}catch(_){}await self.registration.showNotification('Действие не применено',{body:message,tag:'error:'+item.id,icon:'./icons/icon-192.png',data:{taskId:item.data.taskId,planId:item.data.planId,url:safeUrl(item.data)}});}
 return true;
}
let flushing=false;
async function flush(){if(flushing)return;flushing=true;try{for(const item of await store('readonly',s=>s.getAll())){if(Date.now()-item.createdAt>86400000){await store('readwrite',s=>s.delete(item.id));await self.registration.showNotification('Действие ожидает подтверждения',{body:'Не удалось связаться с сервером. Откройте событие.',tag:'error:'+item.id,data:item.data});continue;}await execute(item);}}finally{flushing=false;}}
self.addEventListener('notificationclick',e=>{e.notification.close();const data=e.notification.data||{};e.waitUntil((async()=>{if(!choices.some(c=>c.action===e.action)||!data.actionToken){await openEvent(data);return;}
 const item={id:data.notificationId,action:e.action,data,createdAt:Date.now()};
 try{await store('readwrite',s=>s.put(item));if(!await execute(item)){try{await self.registration.sync?.register('flan-event-actions');}catch(_){}await self.registration.showNotification('Ожидает подключения',{body:'Действие сохранено на устройстве. Оно применится после связи с сервером.',tag:'pending:'+item.id,icon:'./icons/icon-192.png',data:{...data,actionToken:null}});}}catch{await openEvent(data);}
})());});
self.addEventListener('sync',e=>{if(e.tag==='flan-event-actions')e.waitUntil(flush());});
self.addEventListener('message',e=>{if(e.data?.type==='RETRY_ACTIONS')e.waitUntil(flush());});

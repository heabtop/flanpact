/* Shared domain operations: browser, push server and future native clients. */
(function(root){
 'use strict';
 const clone=x=>JSON.parse(JSON.stringify(x)),uid=()=>root.crypto.randomUUID();
 const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
 const clock=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
 const shift=(date,n)=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
 const zonedDay=(now,zone)=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));const get=k=>parts.find(p=>p.type===k).value;return `${get('year')}-${get('month')}-${get('day')}`;};
 function instant(date,time,timeZone='UTC'){
  if(time==='24:00'){date=shift(date,1);time='00:00';}
  const target=Date.parse(`${date}T${time}:00Z`);if(!Number.isFinite(target))throw Error('Некорректная дата');
  const format=new Intl.DateTimeFormat('en-CA',{timeZone,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const local=ms=>{const parts=format.formatToParts(new Date(ms)),get=k=>parts.find(p=>p.type===k).value;return Date.parse(`${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}Z`);};
  let at=target;for(let i=0;i<4;i++){const diff=target-local(at);if(!diff)return at;at+=diff;}
  throw Error('Это время отсутствует из-за перевода часов. Выберите другое время.');
 }
 const signature=p=>JSON.stringify([p.id,p.date,p.start,p.end,p.timeZone||'',p.outcome||'',p.actionVersion||0]);
 function repeatDate(date,rule){let d=shift(date,rule==='weekly'?7:1);if(rule==='weekdays')while([0,6].includes(new Date(d+'T12:00:00Z').getUTCDay()))d=shift(d,1);if(rule==='monthly'){const v=new Date(date+'T12:00:00Z'),wanted=v.getUTCDate();v.setUTCDate(1);v.setUTCMonth(v.getUTCMonth()+1);v.setUTCDate(Math.min(wanted,new Date(Date.UTC(v.getUTCFullYear(),v.getUTCMonth()+1,0)).getUTCDate()));d=v.toISOString().slice(0,10);}return d;}
 function repeatTask(state,t,now){
  if(!t.repeatUntil||!t.done||!t.repeat||t.repeat==='none'||t.nextOccurrenceId)return;
  const zone=t.plans[0]?.timeZone||state.settings?.timeZone||'UTC',today=zonedDay(now,zone);
  let date=repeatDate(t.plans[0]?.date||t.plannedDate||today,t.repeat);while(date<today)date=repeatDate(date,t.repeat);
  if(date>t.repeatUntil)return;const existing=state.tasks.find(x=>x.seriesId===(t.seriesId||t.id)&&x.plannedDate===date);if(existing){t.nextOccurrenceId=existing.id;return;}
  const next={...clone(t),id:uid(),status:'pending',done:false,completedAt:null,deletedAt:null,archivedAt:null,sessions:[],history:[],nextOccurrenceId:null,plannedDate:date,dueDate:date,createdAt:new Date(now).toISOString(),seriesId:t.seriesId||t.id};
  next.plans=t.plans.slice(0,1).map(p=>({...p,id:uid(),date,baseline:null,outcome:null,actionVersion:0}));t.seriesId=next.seriesId;t.nextOccurrenceId=next.id;state.tasks.push(next);
 }
 function completeTask(state,t,status='done',now=Date.now()){
  if(['done','missed'].includes(status)&&state.timer?.taskId===t.id)state.timer=null;
  t.status=status;t.done=status==='done';t.completedAt=t.done?new Date(now).toISOString():null;
  for(const p of t.plans){p.outcome=['done','missed'].includes(status)?status:null;p.actionVersion=(p.actionVersion||0)+1;}
  repeatTask(state,t,now);
 }
 function apply(state,command,now=Date.now()){
  const t=state.tasks.find(t=>t.id===command.taskId),p=t?.plans.find(p=>p.id===command.planId),list=state.lists.find(l=>l.id===t?.listId);
  if(!t||!p||t.deletedAt||t.archivedAt||list?.deletedAt||list?.archivedAt)throw Error('Событие недоступно');
  if(command.expected&&signature(p)!==command.expected)throw Error('Событие изменилось. Откройте актуальную карточку.');
  if(!['done','missed','extend'].includes(command.action))throw Error('Неизвестное действие');
  if(p.outcome||t.done||t.status==='missed')throw Error('Событие уже завершено');
  const before=clone(p);
  if(command.action==='extend'){
   const end=minutes(p.end)+15;if(end>1440)throw Error('Продление выходит за границу дня. Измените дату в карточке события.');
   p.baseline||={date:p.date,start:p.start,end:p.end};p.end=clock(end);t.duration=end-minutes(p.start);
  }else{
   p.outcome=command.action;
   t.done=t.plans.every(x=>x.outcome==='done');
   t.status=t.done?'done':t.plans.every(x=>['done','missed'].includes(x.outcome))?(t.plans.every(x=>x.outcome==='missed')?'missed':'partial'):'partial';
   t.completedAt=t.done?new Date(now).toISOString():null;
  }
  p.actionVersion=(p.actionVersion||0)+1;t.updatedAt=new Date(now).toISOString();
  t.history||=[];t.history.push({at:t.updatedAt,action:command.action,source:command.source||'app',before,after:clone(p)});
  repeatTask(state,t,now);return {taskId:t.id,planId:p.id,status:t.status,end:p.end};
 }
 root.FlanEvents={apply,completeTask,signature,instant,zonedDay,repeatDate};
})(globalThis);

/* Flan Fact 0.4: data, migration and reversible operations. */
(() => {
  'use strict';
  const KEY='flan-pact.local.v04', OLD='flan-pact.local.v03';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const uid=()=>crypto.randomUUID();
  const day=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const shift=(date,n)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return day(d);};
  const mins=t=>{const [h,m]=String(t||'00:00').split(':').map(Number);return h*60+m;};
  const clock=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
  const palette=['#005b97','#183146','#326b86','#123f67','#24556a','#00324f'];
  const color=id=>palette[[...id].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,0)%palette.length];
  const base=()=>({version:4,revision:0,updatedAt:'',tasks:[],lists:[{id:uid(),name:'Мои задачи'}],notes:[],folders:[],settings:{startHour:6,endHour:23,defaultDuration:30,calendarMode:'compare',notifications:false,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone},timer:null});
  function migrate(old){
    const s=base();s.legacyOriginal=clone(old);s.lists=old.lists?.length?clone(old.lists):s.lists;s.notes=clone(old.notes||[]);s.folders=clone(old.folders||[]).map(f=>({...f,type:f.type||'note'}));
    for(const t of old.tasks||[]){
      const duration=t.duration||30;
      s.tasks.push({...clone(t),plans:t.dueDate&&t.dueTime?[{id:uid(),date:t.dueDate,start:t.dueTime,end:clock(Math.min(1440,mins(t.dueTime)+duration))}]:[],plannedDate:t.dueDate||'',sessions:[],status:t.done?'done':'pending',color:color(t.id),history:[],origin:'reminder'});
    }
    for(const e of old.events||[]){
      let t=s.tasks.find(t=>t.id===e.taskId && t.title===e.title);
      if(!t){t={id:'event-'+e.id,title:e.title,listId:s.lists[0].id,category:e.category||'work',plans:[],sessions:[],history:[],status:e.status||'pending',color:color(e.id),createdAt:e.date,origin:'calendar',legacyEventId:e.id};s.tasks.push(t);}
      if(!e.unplanned){t.plannedDate=e.date;if(e.start&&e.end)t.plans.push({id:uid(),date:e.date,start:e.start,end:e.end,baseline:e.snapshot?{date:e.date,start:e.snapshot.start,end:e.snapshot.end}:null});}
      if(e.actualStart&&e.actualEnd&&['done','partial'].includes(e.status))t.sessions.push({id:uid(),date:e.date,start:e.actualStart,end:e.actualEnd,source:'legacy',unplanned:!!e.unplanned});
      t.comment=e.reason||'';t.status=e.status||t.status;t.done=t.status==='done';t.legacyEvent=clone(e);
    }
    return s;
  }
  function validate(s){
    s.timer=null; // Manual timers are retired; elapsed time follows calendar plans.
    if(!s||s.version!==4||!Array.isArray(s.tasks)||!Array.isArray(s.lists)||!Array.isArray(s.notes)||!Array.isArray(s.folders))throw Error('Неверный формат резервной копии');
    for(const key of ['tasks','lists','notes','folders']){const ids=new Set();for(const r of s[key]){if(!r||typeof r.id!=='string'||ids.has(r.id))throw Error('Повреждённые или повторяющиеся записи');ids.add(r.id);}}
    const validDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(new Date(d+'T12:00:00').getTime());
    for(const t of s.tasks){if(typeof t.title!=='string'||!Array.isArray(t.plans)||!Array.isArray(t.sessions))throw Error('Повреждённая задача');for(const p of [...t.plans,...t.sessions]){if(!validDate(p.date)||!/^\d{2}:\d{2}$/.test(p.start)||!/^\d{2}:\d{2}$/.test(p.end)||mins(p.start)<0||mins(p.end)>1440||mins(p.start)>=mins(p.end))throw Error('Некорректный интервал времени');}}
    for(const n of s.notes){if(typeof n.body!=='string'||!['note','diary'].includes(n.type))throw Error('Повреждённая запись');}
    s.settings={...base().settings,...s.settings};if(!Number.isInteger(s.settings.startHour)||!Number.isInteger(s.settings.endHour)||s.settings.startHour<0||s.settings.endHour>24||s.settings.startHour>=s.settings.endHour)throw Error('Некорректный диапазон календаря');
    for(const t of s.tasks)for(const p of t.plans)p.timeZone||=s.settings.timeZone;
    return s;
  }
  let state,loadError='';
  try{
    const saved=localStorage.getItem(KEY);
    if(saved)state=validate(JSON.parse(saved));
    else {const old=localStorage.getItem(OLD);state=old?validate(migrate(JSON.parse(old))):base();if(old)localStorage.setItem(OLD+'.before-ux',old);}
  }catch(e){loadError=e.message;state=base();}
  let storedRevision=state.revision||0;
  const undo=[];
  function write(next){
    const existing=localStorage.getItem(KEY);
    if(existing&&(JSON.parse(existing).revision||0)!==storedRevision)throw Error('Данные изменились в другой вкладке. Обновите страницу; несохранённый текст остаётся в форме.');
    next.revision=storedRevision+1;next.updatedAt=new Date().toISOString();
    localStorage.setItem(KEY,JSON.stringify(next));storedRevision=next.revision;state=next;
  }
  function change(label,fn,{history=true,mergeKey=null}={}){
    if(loadError)throw Error('Не удалось прочитать сохранённые данные. Сначала экспортируйте исходные данные или восстановите копию в настройках.');
    const before=clone(state),next=clone(state);fn(next);validate(next);write(next);if(history){if(!mergeKey||undo.at(-1)?.mergeKey!==mergeKey)undo.push({label,state:before,mergeKey});if(undo.length>30)undo.shift();}else{undo.length=0;}return state;
  }
  function undoLast(){const record=undo.at(-1);if(!record)return;write(clone(record.state));undo.pop();return record.label;}
  function restore(data){const next=validate(clone(data.version===3?migrate(data):data));const raw=localStorage.getItem(KEY);if(raw)localStorage.setItem(KEY+'.before-restore',raw);loadError='';const before=clone(state);write(next);undo.push({label:'Восстановление копии',state:before});}
  function bucket(item,s=state){const l=s.lists.find(l=>l.id===item.listId);return item.deletedAt||l?.deletedAt?'trash':item.archivedAt||l?.archivedAt?'archive':'active';}
  function listBucket(l){return l.deletedAt?'trash':l.archivedAt?'archive':'active';}
  // Elapsed time is the union of intervals, separately for each local day.
  function elapsed(intervals){
    const days=new Map();
    for(const p of intervals){const start=mins(p.start),end=mins(p.end);if(!p.date||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)continue;if(!days.has(p.date))days.set(p.date,[]);days.get(p.date).push([start,end]);}
    let total=0;
    for(const ranges of days.values()){ranges.sort((a,b)=>a[0]-b[0]);let start=null,end=null;for(const [a,b] of ranges){if(start===null){start=a;end=b;}else if(a<=end)end=Math.max(end,b);else{total+=end-start;start=a;end=b;}}if(start!==null)total+=end-start;}
    return total;
  }
  function actual(t,date){return elapsed(t.sessions.filter(x=>!date||x.date===date));}
  function schedule(s,t,date,start,end,{planId=null}={}){
    if(!date)throw Error('Выберите дату');
    if(start&&(!end||mins(end)<=mins(start)||mins(end)>1440))throw Error('Окончание должно быть позже начала в пределах суток');
    const old=t.plans.find(p=>p.id===planId)||t.plans[0];
    if(s.timer?.taskId===t.id&&(!old||old.date!==date||old.start!==start||old.end!==end))s.timer=null;
    if(old){t.history||=[];t.history.push({at:new Date().toISOString(),action:'Перепланирование',before:clone(old),after:{date,start,end}});}
    if(!start){t.plans=planId?t.plans.filter(p=>p.id!==planId):[];}
    else {const p={id:old?.id||uid(),date,start,end,timeZone:old?.timeZone||s.settings.timeZone,actionVersion:(old?.actionVersion||0)+1,baseline:old?.baseline||(old?{date:old.date,start:old.start,end:old.end}:null)};if(old)t.plans[t.plans.indexOf(old)]=p;else t.plans.push(p);}
    if(start)t.autoRoll=false;t.plannedDate=date;t.dueDate=date;t.dueTime=start||'';t.duration=start?mins(end)-mins(start):t.duration||30;
  }
  function nextRepeat(date,rule){
    let d=shift(date,1);if(rule==='weekly')d=shift(date,7);if(rule==='weekdays')while([0,6].includes(new Date(d+'T12:00:00').getDay()))d=shift(d,1);
    if(rule==='monthly'){const v=new Date(date+'T12:00:00'),wanted=v.getDate();v.setDate(1);v.setMonth(v.getMonth()+1);const last=new Date(v.getFullYear(),v.getMonth()+1,0).getDate();v.setDate(Math.min(wanted,last));d=day(v);}
    return d;
  }
  function expandRepeats(s,t,until){
    until=t.repeatUntil;const plan=t.plans[0];if(!until||!plan||!t.repeat||t.repeat==='none'||t.deletedAt||t.archivedAt)return;
    t.seriesId ||=t.id;let previous=t,date=plan.date;
    while(true){date=nextRepeat(date,t.repeat);if(date>until)break;
      let next=s.tasks.find(x=>x.seriesId===t.seriesId&&x.plannedDate===date);
      if(!next){next={...clone(t),id:uid(),plannedDate:date,dueDate:date,status:'pending',done:false,completedAt:null,sessions:[],history:[],nextOccurrenceId:null,createdAt:new Date().toISOString()};next.plans=[{...clone(plan),id:uid(),date,baseline:null,outcome:null,actionVersion:0}];s.tasks.push(next);}
      previous.nextOccurrenceId=next.id;previous=next;
    }
    t.repeatThrough=until;
  }
  function complete(s,t,status='done'){return FlanEvents.completeTask(s,t,status);}
  function receive(data){const next=validate(clone(data));next.settings={...next.settings,...state.settings};next.timer=state.timer;write(next);undo.length=0;}

  window.FlanModel={KEY,OLD,get state(){return state;},get loadError(){return loadError;},get canUndo(){return !!undo.length;},get undoLabel(){return undo.at(-1)?.label;},change,undoLast,restore,receive,validate,migrate,clone,uid,day,shift,mins,clock,color,bucket,listBucket,actual,elapsed,schedule,complete,nextRepeat,expandRepeats};
})();

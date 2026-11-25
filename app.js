const V='13.4.0',CDN=`https://www.gstatic.com/firebasejs/${V}/`;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>ymd(new Date());const nowTime=()=>{const d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())};
const MONTHS=['ജനുവരി','ഫെബ്രുവരി','മാർച്ച്','ഏപ്രിൽ','മേയ്','ജൂൺ','ജൂലൈ','ഓഗസ്റ്റ്','സെപ്റ്റംബർ','ഒക്ടോബർ','നവംബർ','ഡിസംബർ'];
const fmtDate=s=>{if(!s)return'';const[y,m,d]=s.split('-');return `${+d} ${MONTHS[+m-1]} ${y}`};
const fmtMonth=s=>{if(!s)return'';const[y,m]=s.split('-');return `${MONTHS[+m-1]} ${y}`};
const WORKS=[['sweep','🧹 തൂത്തുവാരൽ','Sweeping'],['waste','🗑️ മാലിന്യ ശേഖരണം','Waste collection'],['drain','🚰 ഓട വൃത്തിയാക്കൽ','Drain cleaning'],['grass','🌿 പുല്ല് വെട്ടൽ','Grass cutting'],['plastic','♻️ പ്ലാസ്റ്റിക് നീക്കൽ','Plastic removal'],['other','➕ മറ്റുള്ളവ','Other']];
const WMAP=Object.fromEntries(WORKS.map(w=>[w[0],w]));
const RATE={good:['👍 നല്ലത്','Good','r-good',100],ok:['👌 തൃപ്തികരം','Satisfactory','r-ok',70],bad:['⚠️ മെച്ചപ്പെടണം','Needs improvement','r-bad',40]};
const BUILTIN_TYPES=[['main_road','🛣️','മെയിൻ റോഡ്','Main road'],['byroad','🛤️','ഇടറോഡ്','By-road'],['lane','🚶','ഇടവഴി','Lane / footpath'],['busstop','🚏','ബസ് സ്റ്റോപ്പ്','Bus stop'],
  ['office_road','🏢','ഓഫീസുകൾക്ക് മുന്നിലെ റോഡ്','Road in front of offices'],['shop_road','🏪','കടകൾക്ക് മുന്നിലെ റോഡ്','Road in front of shops'],['house_road','🏘️','വീടുകൾക്ക് മുന്നിലെ റോഡ്','Road in front of houses'],
  ['drain','🚰','ഓട','Drain'],['slab','🧱','സ്ലാബ്','Slab'],['mosquito','🦟','കൊതുക് നശീകരണം','Mosquito control'],['leafbin','🍂','കരിയില സംഭരണി','Dry-leaf storage / bin']].map(([id,icon,ml,en])=>({id,icon,ml,en}));
const OTHER_TYPE={id:'other',icon:'📌',ml:'മറ്റുള്ളവ',en:'Other'};
let customTypes=[];
const allTypes=()=>[...BUILTIN_TYPES,...customTypes,OTHER_TYPE];
const typeById=id=>allTypes().find(t=>t.id===id);
function placeTypeOf(x){if(!x)return 'other';if(x.type!==undefined&&x.placeId===undefined)return x.type||'other';const p=places.find(q=>q.id===x.placeId);return x.placeType||p?.type||'other'}
function typeInfo(id,obj){const t=typeById(id)||(obj&&obj.typeLabel?{id,icon:obj.typeIcon||'🏷️',ml:obj.typeLabel,en:''}:OTHER_TYPE);
  const other=obj&&(obj.typeOther||obj.placeTypeOther);return (t.id==='other'&&other)?{...t,ml:'മറ്റുള്ളവ: '+other,en:'Other'}:t}
const typeBadge=(id,obj)=>{const t=typeInfo(id,obj);return `<span class="tbadge">${t.icon} ${esc(t.ml)}${t.en?` <span style="opacity:.75">(${esc(t.en)})</span>`:''}</span>`};
const typeOptions=(first)=>(first?`<option value="">${first}</option>`:'')+allTypes().map(t=>`<option value="${t.id}">${t.icon} ${esc(t.ml)}${t.en?' ('+esc(t.en)+')':''}</option>`).join('');
const ROLES={admin:'👑 അഡ്മിൻ (Admin)',supervisor:'🧑‍💼 സൂപ്പർവൈസർ (Supervisor)',officer:'👮 ഉദ്യോഗസ്ഥൻ (Officer)',worker:'👷 തൊഴിലാളി (Worker)',pending:'⏳ കാത്തിരിക്കുന്നു (Pending)',disabled:'🚫 തടഞ്ഞു (Disabled)'};
function toast(m,ms=2600){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),ms)}
function ask(msg){return new Promise(res=>{$('#mMsg').textContent=msg;$('#modal').classList.add('show');const d=v=>{$('#modal').classList.remove('show');res(v)};$('#mYes').onclick=()=>d(true);$('#mNo').onclick=()=>d(false)})}
const scoreColor=s=>s==null?'#94a3b8':s>=85?'#16a34a':s>=65?'#ca8a04':'#dc2626';
const worksText=(e,en)=>(e.works||[]).map(w=>w==='other'&&e.workOther?e.workOther:(WMAP[w]?(en?WMAP[w][2]:WMAP[w][1]):w)).join(', ');

function show(v){$$('.view').forEach(e=>e.classList.toggle('active',e.id===v));$$('nav.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.v===v));window.scrollTo(0,0);
  if(v==='v-new'&&!editing)setTimeout(()=>{},0);if(v==='v-report'&&!$('#reportOut').innerHTML)makeReport()}
const params=new URLSearchParams(location.search);const EMU=params.has('emulator');
let cfg=window.FIREBASE_CONFIG;if(!cfg&&EMU)cfg={apiKey:'demo-key',authDomain:'demo-cleaning.firebaseapp.com',projectId:'demo-cleaning',storageBucket:'demo-cleaning.appspot.com',appId:'1:1:web:1'};
const OPT=window.APP_OPTIONS||{};
if(!cfg){show('v-setup');throw new Error('not configured')}

const [{initializeApp},A,F,S]=await Promise.all([import(CDN+'firebase-app.js'),import(CDN+'firebase-auth.js'),import(CDN+'firebase-firestore.js'),OPT.storageEnabled?import(CDN+'firebase-storage.js'):Promise.resolve(null)]);
const app=initializeApp(cfg);
const auth=A.getAuth(app);
let db;try{db=F.initializeFirestore(app,{localCache:F.persistentLocalCache({tabManager:F.persistentMultipleTabManager()})})}catch(e){db=F.getFirestore(app)}
const storage=S?S.getStorage(app):null;
if(EMU){A.connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});F.connectFirestoreEmulator(db,'127.0.0.1',8080);if(storage)S.connectStorageEmulator(storage,'127.0.0.1',9199);
  window.__testLogin=(email,name)=>A.signInWithCredential(auth,A.GoogleAuthProvider.credential(JSON.stringify({sub:email.replace(/\W/g,''),email,name,email_verified:true})))}
const {collection,doc,setDoc,getDoc,getDocs,updateDoc,deleteDoc,writeBatch,onSnapshot,query,where,orderBy,limit,serverTimestamp,runTransaction}=F;

/* ---------- state ---------- */
let me=null,meDoc=null,users=[],places=[],entries=[],editing=null,curPhotos=[],gps=null,unsubs=[],entryUnsub=null,detailId=null,detailUnsubs=[],notifs=[],notifReady=false;
const role=()=>meDoc?.role||'none';
const can={staff:()=>['admin','supervisor','officer'].includes(role()),moderate:()=>['admin','officer'].includes(role()),work:()=>['admin','supervisor','worker'].includes(role()),remark:()=>['admin','supervisor','officer'].includes(role()),sup:()=>['admin','supervisor'].includes(role()),admin:()=>role()==='admin'};
function setNet(){$('#net').textContent=navigator.onLine?'● ഓൺലൈൻ':'○ ഓഫ്‌ലൈൻ';$('#net').style.background=navigator.onLine?'rgba(255,255,255,.25)':'#b45309'}
addEventListener('online',setNet);addEventListener('offline',setNet);setNet();

/* ---------- auth ---------- */
$('#loginBtn').onclick=async()=>{const p=new A.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
  try{await A.signInWithPopup(auth,p)}catch(e){if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment'].includes(e.code))return A.signInWithRedirect(auth,p);if(e.code!=='auth/popup-closed-by-user'&&e.code!=='auth/cancelled-popup-request')toast('⚠️ ലോഗിൻ പരാജയപ്പെട്ടു: '+e.code)}};
document.addEventListener('click',async e=>{const a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act==='logout'){if(await ask('ലോഗൗട്ട് ചെയ്യണോ? (Sign out?)')){cleanup();await A.signOut(auth)}}
  if(a.dataset.act==='back')show('v-dash')});
function cleanup(){unsubs.forEach(u=>u());unsubs=[];entryUnsub&&entryUnsub();entryUnsub=null;detailUnsubs.forEach(u=>u());detailUnsubs=[];notifReady=false}
A.onAuthStateChanged(auth,async u=>{cleanup();me=u;meDoc=null;
  if(u&&u.isAnonymous){await A.signOut(auth);return}
  if(!u){$('#who').innerHTML='';$('#tabs').style.display='none';show('v-login');return}
  $('#who').innerHTML=`${u.photoURL?`<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer"> `:''}<div>${esc(u.displayName||u.email)}</div>`;
  show('v-loading');
  try{await ensureUserDoc(u)}catch(e){console.error(e);toast('⚠️ '+e.message)}
  unsubs.push(onSnapshot(doc(db,'users',u.uid),s=>{const prev=role();meDoc=s.data()||null;$('#who div').textContent=(meDoc?.name||u.displayName||'')+' · '+(ROLES[role()]||'').split(' (')[0];
    if(prev!==role())startApp()},e=>console.error(e)))});
async function ensureUserDoc(u){const ref=doc(db,'users',u.uid);const s=await getDoc(ref);if(s.exists())return;
  const base={name:u.displayName||u.email,email:u.email||'',photoURL:u.photoURL||'',phone:'',createdAt:serverTimestamp()};
  const adminRef=doc(db,'meta','admin');const a=await getDoc(adminRef);
  if(!a.exists()){try{const b=writeBatch(db);b.set(adminRef,{uid:u.uid,createdAt:serverTimestamp()});b.set(ref,{...base,role:'admin'});await b.commit();toast('👑 നിങ്ങളാണ് ആദ്യ ഉപയോക്താവ് – അഡ്മിൻ (You are the admin)',4000);return}catch(e){console.warn('admin claim failed',e)}}
  await setDoc(ref,{...base,role:'pending'})}

function startApp(){unsubs.splice(1).forEach(u=>u());entryUnsub&&entryUnsub();entryUnsub=null;
  const r=role();
  if(r==='none'||r==='pending'||r==='disabled'){$('#tabs').style.display='none';$('#pendingMail').textContent=me.email+' · '+(ROLES[r]||'');show('v-pending');return}
  $('#tabs').style.display='flex';$('#tabNew').style.display=can.work()?'flex':'none';
  $('#placesCard').style.display=can.sup()?'block':'none';$('#tabFb').style.display=can.staff()?'flex':'none';$('#qrCard').style.display=can.staff()?'block':'none';$('#usersCard').style.display=can.admin()?'block':'none';
  $('#sName').value=meDoc.name||'';$('#sPhone').value=meDoc.phone||'';$('#meInfo').textContent=`${me.email} · ${ROLES[r]}`;
  $('#phMode').textContent=OPT.storageEnabled?'☁️ ഫോട്ടോകൾ Firebase Storage-ൽ സൂക്ഷിക്കുന്നു (Photos stored in Cloud Storage)':'💾 ഫോട്ടോകൾ ചുരുക്കി (~200KB) ഡാറ്റാബേസിൽ സൂക്ഷിക്കുന്നു (Free-plan mode: compressed photos in Firestore)';
  $('#aboutTxt').innerHTML=`ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം (Bhadram Ee Bhoomi – Daily Cleaning) · പതിപ്പ് (version) team-3 · Firebase: ${esc(cfg.projectId)}${EMU?' (emulator)':''} · Photos: ${OPT.storageEnabled?'Storage':'Firestore (free plan)'}`;
  unsubs.push(onSnapshot(doc(db,'meta','placeTypes'),s=>{customTypes=(s.data()?.types||[]).filter(t=>t&&t.id&&t.ml);renderPlaces();fillFilters();if($('#v-dash').classList.contains('active'))renderDash()},e=>console.error('types',e)));
  unsubs.push(onSnapshot(collection(db,'places'),s=>{places=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.area+a.ward+a.name).localeCompare(b.area+b.ward+b.name));renderPlaces()},e=>console.error(e)));
  unsubs.push(onSnapshot(collection(db,'users'),s=>{users=s.docs.map(d=>({uid:d.id,...d.data()}));renderUsers();fillFilters()},e=>console.error(e)));
  unsubs.push(onSnapshot(query(collection(db,'users',me.uid,'notifications'),orderBy('createdAt','desc'),limit(100)),s=>{
    if(notifReady)s.docChanges().forEach(c=>{if(c.type==='added'&&!c.doc.metadata.hasPendingWrites){const n=c.doc.data();toast('🔔 '+n.text,4500);try{if(Notification.permission==='granted')new Notification('ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം',{body:n.text,icon:'icon-192.png'})}catch(e){}}});
    notifReady=true;notifs=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:'estimate'})}));renderNotifs()},e=>console.error(e)));
  if(!$('#dFrom').value){const d=new Date();$('#dFrom').value=ymd(new Date(d.getFullYear(),d.getMonth(),1));$('#dTo').value=today();$('#rMonth').value=today().slice(0,7)}
  subscribeEntries();resetForm();feedback=[];if(can.staff())subscribeFeedback();
  try{if('Notification'in window&&Notification.permission==='default')setTimeout(()=>Notification.requestPermission().catch(()=>{}),4000)}catch(e){}
  show(can.work()&&!entries.length&&false?'v-new':'v-dash')}

/* ---------- entries (live) ---------- */
function subscribeEntries(){entryUnsub&&entryUnsub();const f=$('#dFrom').value,t=$('#dTo').value;
  entryUnsub=onSnapshot(query(collection(db,'entries'),where('date','>=',f),where('date','<=',t),orderBy('date','desc')),{includeMetadataChanges:true},s=>{
    entries=s.docs.map(d=>({id:d.id,_pending:d.metadata.hasPendingWrites,...d.data({serverTimestamps:'estimate'})}));renderDash();if(detailId&&$('#v-detail').classList.contains('active'))renderDetail()},e=>{console.error(e);toast('⚠️ '+e.code)})}
['#dFrom','#dTo'].forEach(s=>$(s).addEventListener('change',()=>{if($('#dFrom').value&&$('#dTo').value)subscribeEntries()}));
['#dArea','#dWard','#dWorker','#dType','#dSearch'].forEach(s=>$(s).addEventListener('input',()=>{if(s==='#dArea')fillFilters();renderDash()}));
function uniq(a){return [...new Set(a.filter(Boolean))].sort((x,y)=>x.localeCompare(y))}
function fillFilters(){for(const p of ['d','r']){const ar=$(`#${p}Area`),wd=$(`#${p}Ward`),wk=$(`#${p}Worker`);const a=ar.value,w=wd.value,k=wk.value;
  ar.innerHTML='<option value="">എല്ലാ ഏരിയയും (All areas)</option>'+uniq(places.map(x=>x.area).concat(entries.map(e=>e.area))).map(x=>`<option>${esc(x)}</option>`).join('');ar.value=a;
  wd.innerHTML='<option value="">എല്ലാ വാർഡും (All wards)</option>'+uniq(places.filter(x=>!ar.value||x.area===ar.value).map(x=>x.ward).concat(entries.filter(e=>!ar.value||e.area===ar.value).map(e=>e.ward))).map(x=>`<option>${esc(x)}</option>`).join('');wd.value=w;
  wk.innerHTML='<option value="">എല്ലാ തൊഴിലാളികളും (All workers)</option>'+users.filter(u=>['worker','supervisor','admin'].includes(u.role)).map(u=>`<option value="${u.uid}">${esc(u.name)}</option>`).join('');wk.value=k}
  for(const id of ['#dType','#rType']){const s=$(id),v=s.value;s.innerHTML=typeOptions('എല്ലാ തരവും (All types)');s.value=v}
  $('#areaList').innerHTML=uniq(places.map(x=>x.area)).map(x=>`<option value="${esc(x)}">`).join('');$('#wardList').innerHTML=uniq(places.map(x=>x.ward)).map(x=>`<option value="${esc(x)}">`).join('')}
function filtered(p='d'){const ty=$(`#${p}Type`).value,a=$(`#${p}Area`).value,w=$(`#${p}Ward`).value,k=$(`#${p}Worker`).value,q=p==='d'?$('#dSearch').value.trim().toLowerCase():'';
  return entries.filter(e=>(!ty||placeTypeOf(e)===ty)&&(!a||e.area===a)&&(!w||e.ward===w)&&(!k||e.workerUid===k)&&(!q||[e.placeName,e.area,e.ward,e.workerName,e.notes,worksText(e),worksText(e,1),fmtDate(e.date)].join(' ').toLowerCase().includes(q)))}
function stats(list){const scored=list.filter(e=>e.score!=null);const avg=scored.length?Math.round(scored.reduce((s,e)=>s+e.score,0)/scored.length):null;
  const proof=list.length?Math.round(100*list.filter(e=>e.hasBefore&&e.hasAfter).length/list.length):0;
  const waste={};list.forEach(e=>{if(e.waste!=null){const u=e.wasteUnit||'kg';waste[u]=(waste[u]||0)+e.waste}});
  return{avg,proof,scored:scored.length,awaiting:list.filter(e=>!e.remarkCount).length,days:new Set(list.map(e=>e.date)).size,places:new Set(list.map(e=>e.placeId||e.placeName)).size,workers:list.reduce((s,e)=>s+(e.workers||0),0),waste,photos:list.reduce((s,e)=>s+(e.photoCount||0),0)}}
function renderDash(){fillFilters();const list=filtered('d');const st=stats(list);
  const byWard={};list.forEach(e=>{const k=(e.area?e.area+' · ':'')+(e.ward||e.placeName||'-');(byWard[k]=byWard[k]||[]).push(e)});
  $('#dStats').innerHTML=`<div class="row" style="align-items:center"><div class="center" style="flex:0 0 130px"><div class="score" style="color:${scoreColor(st.avg)}">${st.avg??'–'}</div><div class="hint">ശുചിത്വ സ്കോർ<br>(Cleanliness score /100)</div></div>
    <div class="stats" style="flex:1"><div class="stat"><b>${list.length}</b><span>ജോലികൾ (Entries)</span></div><div class="stat"><b>${st.awaiting}</b><span>അഭിപ്രായം ബാക്കി (Awaiting remark)</span></div><div class="stat"><b>${st.proof}%</b><span>ഫോട്ടോ തെളിവ് (Before+after)</span></div><div class="stat"><b>${st.workers}</b><span>തൊഴിൽ (Worker-days)</span></div></div></div>
    ${fbDashHTML()}
    ${typeDashHTML(list)}
    ${Object.keys(byWard).length>1?`<div class="rp-sub" style="margin-top:12px">വാർഡ് തിരിച്ച് (By ward)</div>`+Object.entries(byWard).map(([k,a])=>{const s=stats(a).avg;return `<div class="wardrow"><div>${esc(k)} <span class="en">(${a.length})</span></div><div class="bar"><i style="width:${s??0}%;background:${scoreColor(s)}"></i></div><b style="color:${scoreColor(s)}">${s??'–'}</b></div>`}).join(''):''}`;
  if(!list.length){$('#dList').innerHTML=`<div class="empty"><div class="big">📭</div>ഈ കാലയളവിൽ ജോലികൾ ഇല്ല<br><span class="en">No entries for this period</span></div>`;return}
  let h='',last='';for(const e of list){if(e.date!==last){h+=`<div class="dayhead">📅 ${fmtDate(e.date)}</div>`;last=e.date}const r=RATE[e.lastRating];
    h+=`<div class="card entry" data-id="${e.id}">${e.thumb?`<img class="thumb" src="${e.thumb}" alt="">`:'<div class="thumb">🧹</div>'}<div class="info"><div class="t">📍 ${esc(e.placeName)} <span class="en">${esc(e.time||'')}</span></div><div>${typeBadge(placeTypeOf(e),e)}</div><div class="s">👷 ${esc(e.workerName)} · ${esc(e.ward||'')}</div><div class="s">${esc(worksText(e))}</div><div>${e.photoCount?`<span class="badge">📷 ${e.photoCount}</span>`:''}${r?`<span class="badge ${r[2]}">${r[0]}</span>`:'<span class="badge">💬 അഭിപ്രായം ബാക്കി</span>'}${e.score!=null?`<span class="badge" style="background:${scoreColor(e.score)};color:#fff">${e.score}</span>`:''}${e._pending?'<span class="badge r-ok">⏫ സിങ്ക് ബാക്കി</span>':''}</div></div></div>`}
  $('#dList').innerHTML=h;$$('#dList .entry').forEach(el=>el.onclick=()=>openDetail(el.dataset.id))}

/* ---------- places & users (admin) ---------- */
let editingPlace=null;
function renderPlaces(){const sel=$('#fPlace'),cur=sel.value,ft=$('#fType').value;
  const ftv=$('#fType').value;$('#fType').innerHTML=typeOptions('🔎 എല്ലാ തരവും (All types)');$('#fType').value=ftv;
  const pv=$('#pType').value;$('#pType').innerHTML=typeOptions('-- തരം തിരഞ്ഞെടുക്കുക (Select type) --');$('#pType').value=pv;
  const groups=allTypes().map(t=>({t,ps:places.filter(p=>(p.type||'other')===t.id||(t.id==='other'&&!typeById(p.type||'other')))})).filter(g=>g.ps.length&&(!ft||g.t.id===ft));
  sel.innerHTML='<option value="">-- സ്ഥലം തിരഞ്ഞെടുക്കുക (Select place) --</option>'+groups.map(g=>`<optgroup label="${g.t.icon} ${esc(g.t.ml)}${g.t.en?' ('+esc(g.t.en)+')':''}">${g.ps.map(p=>`<option value="${p.id}">${esc(p.name)}${p.ward?' – '+esc(p.ward):''}${p.area?' ('+esc(p.area)+')':''}${p.typeOther?' · '+esc(p.typeOther):''}</option>`).join('')}</optgroup>`).join('');
  sel.value=cur;if(sel.value!==cur)sel.value='';
  $('#fPlaceHint').textContent=places.length?'':(can.sup()?'⚙️ ക്രമീകരണത്തിൽ സ്ഥലങ്ങൾ ചേർക്കുക (Add places in Settings)':'സൂപ്പർവൈസർ സ്ഥലങ്ങൾ ചേർക്കണം (Supervisor must add places)');
  $('#pList').innerHTML=places.map(p=>`<div class="u" style="display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #eef7f5"><div style="flex:1">📍 <b>${esc(p.name)}</b> <span class="en">${esc(p.ward)} · ${esc(p.area)}</span><br>${typeBadge(p.type||'other',p)}</div><button class="btn sec sm" data-pedit="${p.id}">✏️</button><button class="btn danger sm" data-pid="${p.id}">✕</button></div>`).join('')||'<p class="hint">ഇതുവരെ ഇല്ല (none yet)</p>';
  $('#ctDetails').style.display=can.admin()?'block':'none';
  $('#ctList').innerHTML=customTypes.map(t=>`<span>${t.icon} ${esc(t.ml)} ${t.en?'('+esc(t.en)+')':''}<button data-ctdel="${t.id}" title="remove">✕</button></span>`).join('');
  $$('[data-ctdel]').forEach(b=>b.onclick=async()=>{const t=customTypes.find(x=>x.id===b.dataset.ctdel);if(!await ask(`"${t.ml}" തരം നീക്കണോ? (Remove type?) – ഈ തരത്തിലുള്ള സ്ഥലങ്ങൾ "മറ്റുള്ളവ" ആയി കാണിക്കും.`))return;
    setDoc(doc(db,'meta','placeTypes'),{types:customTypes.filter(x=>x.id!==t.id),updatedBy:me.uid,updatedAt:serverTimestamp()}).catch(e=>toast('⚠️ '+e.code))});
  renderQRList();renderFeedback();
  $$('#pList [data-pedit]').forEach(b=>b.onclick=()=>{const p=places.find(x=>x.id===b.dataset.pedit);editingPlace=p;$('#pArea').value=p.area||'';$('#pWard').value=p.ward||'';$('#pName').value=p.name||'';
    $('#pType').value=typeById(p.type)?p.type:(p.type?'other':'');$('#pTypeOther').value=p.typeOther||'';$('#pTypeOther').style.display=$('#pType').value==='other'?'block':'none';
    $('#pAdd').textContent='💾 മാറ്റം സേവ് (Save place)';$('#pCancel').style.display='flex';$('#pName').scrollIntoView({block:'center'})});
  $$('#pList [data-pid]').forEach(b=>b.onclick=async()=>{const p=places.find(x=>x.id===b.dataset.pid);if(await ask(`"${p.name}" നീക്കണോ? (Remove place?)`))deleteDoc(doc(db,'places',p.id)).catch(e=>toast('⚠️ '+e.code))});fillFilters()}
$('#fType').onchange=renderPlaces;
$('#pType').onchange=()=>{$('#pTypeOther').style.display=$('#pType').value==='other'?'block':'none'};
function resetPlaceForm(){editingPlace=null;$('#pName').value='';$('#pType').value='';$('#pTypeOther').value='';$('#pTypeOther').style.display='none';$('#pAdd').textContent='➕ ചേർക്കുക (Add place)';$('#pCancel').style.display='none'}
$('#pCancel').onclick=resetPlaceForm;
$('#pAdd').onclick=async()=>{const area=$('#pArea').value.trim(),ward=$('#pWard').value.trim(),name=$('#pName').value.trim(),type=$('#pType').value;if(!name)return toast('⚠️ സ്ഥലത്തിൻ്റെ പേര് നൽകുക (Enter place name)');
  if(!type)return toast('⚠️ തരം തിരഞ്ഞെടുക്കുക (Select a type)');const t=typeById(type);
  const data={area,ward,name,type,typeOther:type==='other'?$('#pTypeOther').value.trim().slice(0,60):'',typeLabel:t.ml,typeIcon:t.icon};
  try{if(editingPlace){updateDoc(doc(db,'places',editingPlace.id),{...data,updatedBy:me.uid,updatedAt:serverTimestamp()}).catch(e=>toast('⚠️ '+e.code));toast('✅ മാറ്റം സേവ് ചെയ്തു (Saved)')}
    else{setDoc(doc(collection(db,'places')),{...data,createdBy:me.uid,createdAt:serverTimestamp()}).catch(e=>toast('⚠️ '+e.code));toast('✅ ചേർത്തു (Added)')}resetPlaceForm()}catch(e){toast('⚠️ '+e.message)}};
$('#ctAdd').onclick=()=>{const ml=$('#ctMl').value.trim(),en=$('#ctEn').value.trim(),icon=$('#ctIcon').value.trim()||'🏷️';if(!ml)return toast('⚠️ മലയാളം പേര് നൽകുക');
  const id='c_'+Date.now().toString(36);setDoc(doc(db,'meta','placeTypes'),{types:[...customTypes,{id,icon:icon.slice(0,4),ml:ml.slice(0,40),en:en.slice(0,40)}],updatedBy:me.uid,updatedAt:serverTimestamp()}).then(()=>toast('✅ തരം ചേർത്തു (Type added)')).catch(e=>toast('⚠️ '+e.code));
  $('#ctMl').value='';$('#ctEn').value='';$('#ctIcon').value=''};
function typeDashHTML(list){const m={};list.forEach(e=>{const k=placeTypeOf(e);(m[k]=m[k]||[]).push(e)});const ks=Object.keys(m);if(ks.length<1)return '';
  return `<div class="rp-sub" style="margin-top:12px">🏷️ തരം തിരിച്ച് (By type)</div>`+ks.map(k=>{const t=typeInfo(k),s=stats(m[k]).avg;return `<div class="wardrow"><div>${t.icon} ${esc(t.ml)} <span class="en">(${m[k].length})</span></div><div class="bar"><i style="width:${s??0}%;background:${scoreColor(s)}"></i></div><b style="color:${scoreColor(s)}">${s??'–'}</b></div>`}).join('')}
function typeReportHTML(list,fbList){const m={};const add=k=>m[k]=m[k]||{n:0,places:new Set(),fb:0,fbSum:0,score:[]};
  list.forEach(e=>{const k=placeTypeOf(e);add(k);m[k].n++;m[k].places.add(e.placeId||e.placeName);if(e.score!=null)m[k].score.push(e.score)});
  fbList.forEach(f=>{const k=placeTypeOf(f);add(k);m[k].fb++;m[k].fbSum+=f.rating});
  const ks=allTypes().map(t=>t.id).filter(k=>m[k]).concat(Object.keys(m).filter(k=>!typeById(k)));if(!ks.length)return '';
  return `<div class="rp-sub" style="font-size:15px">🏷️ തരം തിരിച്ചുള്ള സംഗ്രഹം (Summary by type)</div><table class="rp-tbl"><tr><th>തരം (Type)</th><th>ജോലി (Work)</th><th>സ്ഥലങ്ങൾ (Places)</th><th>സ്കോർ (Score)</th><th>നിവാസി ★ (Feedback avg)</th></tr>`+
    ks.map(k=>{const o=m[k],t=typeInfo(k);return `<tr><td>${t.icon} ${esc(t.ml)}${t.en?' ('+esc(t.en)+')':''}</td><td>${o.n}</td><td>${o.places.size}</td><td>${o.score.length?Math.round(o.score.reduce((a,b)=>a+b,0)/o.score.length):'–'}</td><td>${o.fb?(o.fbSum/o.fb).toFixed(1)+' ('+o.fb+')':'–'}</td></tr>`}).join('')+'</table>'}
function renderUsers(){if(!can.admin())return;const order={pending:0,admin:1,supervisor:2,officer:3,worker:4,disabled:5};
  $('#uList').innerHTML=users.slice().sort((a,b)=>(order[a.role]??9)-(order[b.role]??9)||String(a.name).localeCompare(b.name)).map(u=>`<div class="u">${u.photoURL?`<img src="${esc(u.photoURL)}" referrerpolicy="no-referrer" alt="">`:'<div style="font-size:30px">👤</div>'}<div class="nm"><b>${esc(u.name)}</b><br><span class="en">${esc(u.email)}</span></div>
    <select data-uid="${u.uid}" ${u.uid===me.uid?'disabled':''}>${Object.entries(ROLES).map(([k,v])=>`<option value="${k}" ${u.role===k?'selected':''}>${v}</option>`).join('')}</select></div>`).join('');
  $$('#uList select').forEach(s=>s.onchange=async()=>{const u=users.find(x=>x.uid===s.dataset.uid);if(!await ask(`${u.name} → ${ROLES[s.value]}?`)){s.value=u.role;return}
    updateDoc(doc(db,'users',u.uid),{role:s.value,roleBy:me.uid,roleAt:serverTimestamp()}).then(()=>toast('✅ റോൾ മാറ്റി (Role updated)')).catch(e=>{toast('⚠️ '+e.code);s.value=u.role})})}
$('#sSave').onclick=()=>{updateDoc(doc(db,'users',me.uid),{name:$('#sName').value.trim()||me.displayName,phone:$('#sPhone').value.trim()}).catch(e=>toast('⚠️ '+e.code));toast('✅ സേവ് ചെയ്തു (Saved)')};

/* ---------- photos ---------- */
function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('bad image'));i.src=src})}
async function toCanvasBlob(img,max,q){const s=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*s);c.height=Math.round(img.naturalHeight*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);return{c,blob:await new Promise(r=>c.toBlob(r,'image/jpeg',q))}}
async function compressPhoto(file){const url=URL.createObjectURL(file);try{const img=await loadImage(url);
  const full=await toCanvasBlob(img,1280,0.8);let inline=null;
  for(const [m,q] of [[1280,0.7],[1280,0.6],[1024,0.6],[1024,0.5],[800,0.5],[640,0.5]]){const d=(m===1280&&q===0.7?full.c:(await toCanvasBlob(img,m,q)).c).toDataURL('image/jpeg',q);if(d.length<190000){inline=d;break}}
  if(!inline)inline=(await toCanvasBlob(img,480,0.45)).c.toDataURL('image/jpeg',0.45);
  const thumb=(await toCanvasBlob(img,240,0.6)).c.toDataURL('image/jpeg',0.6);
  return{blob:full.blob,inline,thumb}}finally{URL.revokeObjectURL(url)}}
$$('input[type=file][data-kind]').forEach(inp=>inp.onchange=async()=>{const fs=[...inp.files];inp.value='';if(!fs.length)return;toast('⏳ ഫോട്ടോ ചേർക്കുന്നു...');
  for(const f of fs){try{const p=await compressPhoto(f);curPhotos.push({id:doc(collection(db,'x')).id,kind:inp.dataset.kind,isNew:true,ts:Date.now(),...p,src:p.inline})}catch(e){toast('⚠️ ഫോട്ടോ ചേർക്കാനായില്ല')}}
  renderFormPhotos();toast('✅ ഫോട്ടോ ചേർത്തു')});
function renderFormPhotos(){for(const k of ['before','after'])(k==='before'?$('#phBefore'):$('#phAfter')).innerHTML=curPhotos.filter(p=>p.kind===k&&!p.removed).map(p=>`<div class="ph"><img src="${p.src}" alt=""><button type="button" data-id="${p.id}">×</button></div>`).join('');
  $$('#v-new .ph button').forEach(b=>b.onclick=()=>{const p=curPhotos.find(x=>x.id===b.dataset.id);if(p)p.removed=true;renderFormPhotos()})}

/* ---------- form ---------- */
$('#fWork').innerHTML=WORKS.map(w=>`<label class="chip"><input type="checkbox" value="${w[0]}"><span>${w[1]}<br><span class="en">${w[2]}</span></span></label>`).join('');
$('#fWork').addEventListener('change',e=>{e.target.closest('.chip').classList.toggle('on',e.target.checked);if(e.target.value==='other')$('#fWorkOther').style.display=e.target.checked?'block':'none'});
function renderGPS(){$('#gpsTxt').innerHTML=gps?`✅ ${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)} (±${Math.round(gps.acc)} m)`:'';$('#gpsClr').style.display=gps?'block':'none'}
$('#gpsBtn').onclick=()=>{if(!navigator.geolocation)return toast('⚠️ GPS ലഭ്യമല്ല');$('#gpsTxt').textContent='⏳ ലൊക്കേഷൻ എടുക്കുന്നു...';
  navigator.geolocation.getCurrentPosition(p=>{gps={lat:p.coords.latitude,lng:p.coords.longitude,acc:p.coords.accuracy};renderGPS()},e=>{$('#gpsTxt').textContent='⚠️ ലൊക്കേഷൻ കിട്ടിയില്ല ('+e.message+')'},{enableHighAccuracy:true,timeout:20000})};
$('#gpsClr').onclick=()=>{gps=null;renderGPS()};
function resetForm(){editing=null;curPhotos=[];gps=null;$('#fDate').value=today();$('#fTime').value=nowTime();$('#fPlace').value=places.length===1?places[0].id:'';
  $$('#fWork input').forEach(i=>{i.checked=false;i.closest('.chip').classList.remove('on')});$('#fWorkOther').value='';$('#fWorkOther').style.display='none';
  ['#fWorkers','#fWaste','#fNotes'].forEach(s=>$(s).value='');$('#fWasteUnit').selectedIndex=0;renderFormPhotos();renderGPS();
  $('#formTitle').innerHTML='📝 പുതിയ ജോലി <span class="en">(New Work Entry)</span>';$('#cancelEdit').style.display='none'}
$('#cancelEdit').onclick=()=>{resetForm();show('v-dash')};
async function editEntry(e){resetForm();editing=e;$('#fDate').value=e.date;$('#fTime').value=e.time||'';$('#fPlace').value=e.placeId||'';
  $$('#fWork input').forEach(i=>{i.checked=(e.works||[]).includes(i.value);i.closest('.chip').classList.toggle('on',i.checked)});$('#fWorkOther').value=e.workOther||'';$('#fWorkOther').style.display=(e.works||[]).includes('other')?'block':'none';
  $('#fWorkers').value=e.workers??'';$('#fWaste').value=e.waste??'';if(e.wasteUnit)$('#fWasteUnit').value=e.wasteUnit;$('#fNotes').value=e.notes||'';gps=e.gps||null;renderGPS();
  const ps=await getDocs(collection(db,'entries',e.id,'photos'));curPhotos=ps.docs.map(d=>({id:d.id,...d.data(),isNew:false,src:d.data().url||d.data().data}));renderFormPhotos();
  $('#formTitle').innerHTML='✏️ തിരുത്തുന്നു <span class="en">(Editing entry)</span>';$('#cancelEdit').style.display='inline-flex';show('v-new')}
$('#saveBtn').onclick=async()=>{const works=$$('#fWork input:checked').map(i=>i.value);const pl=places.find(p=>p.id===$('#fPlace').value);
  if(!pl)return toast('⚠️ സ്ഥലം തിരഞ്ഞെടുക്കുക (Select a place)');if(!works.length&&!$('#fNotes').value.trim())return toast('⚠️ ചെയ്ത ജോലി തിരഞ്ഞെടുക്കുക (Select work done)');
  const btn=$('#saveBtn');btn.disabled=true;
  try{const ref=editing?doc(db,'entries',editing.id):doc(collection(db,'entries'));const live=curPhotos.filter(p=>!p.removed);
    const useStorage=storage&&navigator.onLine;const newPh=live.filter(p=>p.isNew);
    if(useStorage){toast('⏫ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുന്നു...');for(const p of newPh){try{const sr=S.ref(storage,`photos/${ref.id}/${p.id}.jpg`);await S.uploadBytes(sr,p.blob,{contentType:'image/jpeg'});p.url=await S.getDownloadURL(sr);p.path=sr.fullPath}catch(e){console.warn('storage upload failed, inline fallback',e)}}}
    const thumbP=live.find(p=>p.kind==='after')||live[0];let thumb=editing?.thumb||'';if(thumbP&&thumbP.thumb)thumb=thumbP.thumb;else if(!live.length)thumb='';
    else if(thumbP&&thumbP.id!==editing?.thumbId){try{thumb=(await toCanvasBlob(await loadImage(thumbP.src),240,0.6)).c.toDataURL('image/jpeg',0.6)}catch(e){}}
    const data={date:$('#fDate').value||today(),time:$('#fTime').value,placeId:pl.id,placeName:pl.name,area:pl.area||'',ward:pl.ward||'',placeType:pl.type||'other',placeTypeOther:pl.typeOther||'',works,workOther:$('#fWorkOther').value.trim(),
      workers:$('#fWorkers').value===''?null:+$('#fWorkers').value,waste:$('#fWaste').value===''?null:+$('#fWaste').value,wasteUnit:$('#fWasteUnit').value,notes:$('#fNotes').value.trim(),gps:gps||null,
      photoCount:live.length,hasBefore:live.some(p=>p.kind==='before'),hasAfter:live.some(p=>p.kind==='after'),thumb,thumbId:thumbP?.id||'',updatedAt:serverTimestamp()};
    const b=writeBatch(db);
    if(editing)b.update(ref,data);else b.set(ref,{...data,workerUid:me.uid,workerName:meDoc.name||me.displayName||'',remarkCount:0,score:null,lastRating:'',createdAt:serverTimestamp()});
    for(const p of curPhotos){const pr=doc(db,'entries',ref.id,'photos',p.id);if(p.removed){if(!p.isNew)b.delete(pr)}else if(p.isNew)b.set(pr,{kind:p.kind,ts:p.ts,by:me.uid,...(p.url?{url:p.url,path:p.path}:{data:p.inline})})}
    const commit=b.commit();const wasEdit=!!editing;
    const res=await Promise.race([commit.then(()=>'ok'),new Promise(r=>setTimeout(()=>r('later'),5000))]);
    commit.catch(e=>toast('⚠️ സേവ് പരാജയപ്പെട്ടു: '+e.code,5000));
    toast(res==='ok'?(wasEdit?'✅ മാറ്റങ്ങൾ സേവ് ചെയ്തു (Updated)':'✅ സേവ് ചെയ്തു (Saved)'):'💾 ഫോണിൽ സേവ് ചെയ്തു – നെറ്റ് വന്നാൽ സിങ്ക് ആകും (Saved offline, will sync)',4000);
    resetForm();if(wasEdit)openDetail(ref.id);else show('v-dash')}
  catch(e){console.error(e);toast('⚠️ '+(e.code||e.message))}finally{btn.disabled=false}};

/* ---------- detail ---------- */
let detPhotos=[],detRemarks=[];
function openDetail(id){detailId=id;detailUnsubs.forEach(u=>u());detPhotos=[];detRemarks=[];
  detailUnsubs=[onSnapshot(collection(db,'entries',id,'photos'),s=>{detPhotos=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.ts-b.ts);renderDetail()},e=>console.error(e)),
    onSnapshot(collection(db,'entries',id,'remarks'),s=>{detRemarks=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:'estimate'})})).sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));renderDetail()},e=>console.error(e))];
  getDoc(doc(db,'entries',id)).then(s=>{if(s.exists()&&!entries.find(e=>e.id===id))entries.push({id,...s.data({serverTimestamps:'estimate'})});renderDetail()});
  $('#remarkForm').style.display=can.remark()?'block':'none';resetRemark();show('v-detail');setTimeout(()=>sig.size(),50)}
function entryHTML(e,photos,remarks,withPhotos=true){const rows=[['👷 തൊഴിലാളി (Worker)',e.workerName],['🕐 സമയം (Time)',e.time],['📍 സ്ഥലം (Place)',[e.placeName,e.ward,e.area].filter(Boolean).join(', ')],['🏷️ തരം (Type)',(t=>t.icon+' '+t.ml+(t.en?' ('+t.en+')':''))(typeInfo(placeTypeOf(e),e))],['🧹 ജോലി (Work)',worksText(e)],['👥 തൊഴിലാളികൾ (Workers)',e.workers],['🗑️ മാലിന്യം (Waste)',e.waste!=null?e.waste+' '+(e.wasteUnit||''):''],['📝 കുറിപ്പ് (Notes)',e.notes]].filter(x=>x[1]!==''&&x[1]!=null);
  const gpsRow=e.gps?`<tr><td>🛰️ GPS</td><td><a href="https://maps.google.com/?q=${e.gps.lat},${e.gps.lng}" target="_blank" rel="noopener">${e.gps.lat.toFixed(5)}, ${e.gps.lng.toFixed(5)}</a></td></tr>`:'';
  const grid=k=>{const a=photos.filter(p=>p.kind===k);return a.length?`<div class="rp-sub">${k==='before'?'📷 മുമ്പ് (Before)':'✨ ശേഷം (After)'}</div><div class="rp-ph">${a.map(p=>`<img src="${p.url||p.data}" alt="" loading="lazy">`).join('')}</div>`:''};
  return `<div class="rp-e card"><div class="rp-sub" style="font-size:16px">📅 ${fmtDate(e.date)} · ${esc(e.placeName)} ${e.score!=null?`<span class="badge" style="background:${scoreColor(e.score)};color:#fff">സ്കോർ ${e.score}</span>`:''}</div><table>${rows.map(x=>`<tr><td>${x[0]}</td><td>${esc(x[1])}</td></tr>`).join('')}${gpsRow}</table>
    ${withPhotos?grid('before')+grid('after'):''}${remarks?remarksHTML(remarks):''}</div>`}
function remarksHTML(rs){if(!rs.length)return '';return `<div class="rp-sub">👮 ഉദ്യോഗസ്ഥരുടെ അഭിപ്രായം (Officer remarks)</div>`+rs.map(r=>{const t=RATE[r.rating];return `<div class="remark"><b>${esc(r.officerName)}</b>${r.desig?', '+esc(r.desig):''} ${t?`<span class="badge ${t[2]}">${t[0]} (${t[1]})</span>`:''}<div>${esc(r.text)}</div>${r.signature?`<img src="${r.signature}" alt="signature">`:''}<div class="hint">${r.createdAt?new Date(r.createdAt.seconds*1000).toLocaleString('en-IN'):''}</div></div>`}).join('')}
function renderDetail(){const e=entries.find(x=>x.id===detailId);if(!e){$('#detOut').innerHTML='<div class="empty">⏳</div>';return}
  $('#detOut').innerHTML=entryHTML(e,detPhotos,null);
  $('#detRemarks').innerHTML=`<h2>💬 അഭിപ്രായങ്ങൾ <span class="en">(Remarks – live)</span></h2>`+(detRemarks.length?remarksHTML(detRemarks).replace(/^<div class="rp-sub">.*?<\/div>/,''):'<p class="hint">ഇതുവരെ അഭിപ്രായം ഇല്ല (No remarks yet)</p>');
  const own=e.workerUid===me.uid;$('#detEdit').style.display=(own&&can.work())||can.sup()?'flex':'none';$('#detDel').style.display=(own&&can.work())||can.sup()?'flex':'none'}
$('#detEdit').onclick=()=>{const e=entries.find(x=>x.id===detailId);if(e)editEntry(e)};
$('#detDel').onclick=async()=>{const e=entries.find(x=>x.id===detailId);if(!e)return;if(!await ask(`ഈ എൻട്രി നീക്കം ചെയ്യണോ? (Delete this entry?)\n📍 ${e.placeName} – ${fmtDate(e.date)}`))return;
  try{const b=writeBatch(db);detPhotos.forEach(p=>b.delete(doc(db,'entries',e.id,'photos',p.id)));detRemarks.forEach(r=>b.delete(doc(db,'entries',e.id,'remarks',r.id)));b.delete(doc(db,'entries',e.id));
    if(storage)detPhotos.filter(p=>p.path).forEach(p=>S.deleteObject(S.ref(storage,p.path)).catch(()=>{}));
    b.commit().catch(err=>toast('⚠️ '+err.code));detailUnsubs.forEach(u=>u());detailUnsubs=[];toast('🗑️ നീക്കം ചെയ്തു (Deleted)');show('v-dash')}catch(err){toast('⚠️ '+err.message)}};

/* ---------- signature pad ---------- */
function SigPad(canvas,ph){const ctx=canvas.getContext('2d');let drawing=false,last=null,dirty=false;
  const size=()=>{const r=canvas.getBoundingClientRect();if(!r.width)return;const d=devicePixelRatio||1;const W=Math.round(r.width*d),H=Math.round(r.height*d);if(canvas.width===W&&canvas.height===H)return;canvas.width=W;canvas.height=H;ctx.setTransform(d,0,0,d,0,0);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=2.6;ctx.strokeStyle='#0b2f4a';ctx.fillStyle='#0b2f4a'};
  const pos=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();size();drawing=true;last=pos(e);canvas.setPointerCapture(e.pointerId);ctx.beginPath();ctx.arc(last.x,last.y,1.2,0,7);ctx.fill();dirty=true;ph.style.display='none'});
  canvas.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const p=pos(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p});
  ['pointerup','pointercancel'].forEach(v=>canvas.addEventListener(v,()=>drawing=false));
  return{size,clear(){ctx.clearRect(0,0,canvas.width,canvas.height);dirty=false;ph.style.display='flex'},get dirty(){return dirty},
    data(){const c=document.createElement('canvas');const s=Math.min(1,500/canvas.width);c.width=canvas.width*s;c.height=canvas.height*s;c.getContext('2d').drawImage(canvas,0,0,c.width,c.height);return c.toDataURL('image/png')}}}
const sig=SigPad($('#rmSig'),$('#rmSigPh'));$('#rmSigClr').onclick=()=>sig.clear();addEventListener('resize',()=>{if(!sig.dirty)sig.size()});
$('#rmRating').addEventListener('change',()=>$$('#rmRating label').forEach(l=>l.classList.toggle('on',l.querySelector('input').checked)));
function resetRemark(){$('#rmText').value='';$$('#rmRating input').forEach(i=>i.checked=false);$$('#rmRating label').forEach(l=>l.classList.remove('on'));sig.clear();$('#rmDesig').value=localStorage.getItem('desig')||''}
$('#rmSave').onclick=async()=>{const e=entries.find(x=>x.id===detailId);if(!e)return;const rating=($('#rmRating input:checked')||{}).value;const text=$('#rmText').value.trim();
  if(!rating)return toast('⚠️ വിലയിരുത്തൽ തിരഞ്ഞെടുക്കുക (Choose a rating)');
  const desig=$('#rmDesig').value.trim();localStorage.setItem('desig',desig);
  const all=[...detRemarks.map(r=>r.rating),rating].filter(r=>RATE[r]);const score=Math.round(all.reduce((s,r)=>s+RATE[r][3],0)/all.length);
  const b=writeBatch(db);const rr=doc(collection(db,'entries',e.id,'remarks'));
  b.set(rr,{officerUid:me.uid,officerName:meDoc.name||me.displayName||'',desig,text,rating,signature:sig.dirty?sig.data():null,createdAt:serverTimestamp()});
  b.update(doc(db,'entries',e.id),{remarkCount:(detRemarks.length+1),score,lastRating:rating,lastRemarkAt:serverTimestamp()});
  if(e.workerUid&&e.workerUid!==me.uid)b.set(doc(collection(db,'users',e.workerUid,'notifications')),{fromUid:me.uid,entryId:e.id,read:false,createdAt:serverTimestamp(),
    text:`${meDoc.name||'ഉദ്യോഗസ്ഥൻ'}: ${RATE[rating][0]} – ${e.placeName} (${fmtDate(e.date)})${text?' – "'+text.slice(0,80)+'"':''}`});
  b.commit().catch(err=>toast('⚠️ '+err.code,5000));resetRemark();toast('✅ അഭിപ്രായം ചേർത്തു (Remark added)')};

/* ---------- notifications ---------- */
function renderNotifs(){const un=notifs.filter(n=>!n.read).length;$('#nBadge').textContent=un;$('#nBadge').style.display=un?'block':'none';
  $('#nList').innerHTML=notifs.length?notifs.map(n=>`<div class="card notif ${n.read?'':'unread'}" data-id="${n.id}" data-e="${n.entryId}"><div style="font-size:26px">${n.read?'🔕':'🔔'}</div><div><div>${esc(n.text)}</div><div class="hint">${n.createdAt?new Date(n.createdAt.seconds*1000).toLocaleString('en-IN'):''}</div></div></div>`).join(''):'<div class="empty"><div class="big">🔕</div>അറിയിപ്പുകൾ ഇല്ല (No notifications)</div>';
  $$('#nList .notif').forEach(el=>el.onclick=()=>{updateDoc(doc(db,'users',me.uid,'notifications',el.dataset.id),{read:true}).catch(()=>{});openDetail(el.dataset.e)})}
$('#nAllRead').onclick=()=>{const b=writeBatch(db);notifs.filter(n=>!n.read).forEach(n=>b.update(doc(db,'users',me.uid,'notifications',n.id),{read:true}));b.commit().catch(()=>{})};

/* ---------- monthly report ---------- */
['#rMonth','#rArea','#rWard','#rWorker','#rType','#rPhotos'].forEach(s=>$(s).addEventListener('change',()=>{if(s==='#rArea')fillFilters();makeReport()}));
$('#rMake').onclick=makeReport;
let reportToken=0;
async function makeReport(){const tok=++reportToken;const m=$('#rMonth').value||today().slice(0,7);const [y,mo]=m.split('-').map(Number);const last=ymd(new Date(y,mo,0));
  $('#reportOut').innerHTML='<div class="empty">⏳ തയ്യാറാക്കുന്നു... (Preparing)</div>';
  const s=await getDocs(query(collection(db,'entries'),where('date','>=',m+'-01'),where('date','<=',last),orderBy('date')));if(tok!==reportToken)return;
  const a=$('#rArea').value,w=$('#rWard').value,k=$('#rWorker').value,rty=$('#rType').value;
  const list=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:'estimate'})})).filter(e=>(!rty||placeTypeOf(e)===rty)&&(!a||e.area===a)&&(!w||e.ward===w)&&(!k||e.workerUid===k)).sort((x,z)=>(x.date+(x.time||'')).localeCompare(z.date+(z.time||'')));
  const st=stats(list);const wk=k?users.find(u=>u.uid===k)?.name:'';
  let h=`<div class="rp-h"><div style="font-size:22px;font-weight:800;color:var(--g)">ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം</div><div class="en">Bhadram Ee Bhoomi – Daily Cleaning</div><h2>🧹 മാസ റിപ്പോർട്ട് (Monthly Report) – ${fmtMonth(m)}</h2><div>${[a,w,wk,rty?typeInfo(rty).icon+' '+typeInfo(rty).ml:''].filter(Boolean).map(esc).join(' · ')||'എല്ലാം (All)'}</div></div>`;
  const fbList=can.staff()?await monthFeedback(m,last,a,w,rty):[];if(tok!==reportToken)return;
  if(!list.length){const fb=can.staff()?typeReportHTML([],fbList)+fbReportHTML(fbList):'';$('#reportOut').innerHTML=h+'<div class="empty"><div class="big">📭</div>ജോലി എൻട്രികൾ ഇല്ല (No work entries)</div>'+fb;return}
  h+=`<div class="rp-sum"><b>ആകെ (Summary):</b> ${list.length} ജോലി (entries) · ${st.days} ദിവസം (days) · ${st.places} സ്ഥലം (places) · ${st.workers} തൊഴിൽ (worker-days) · 📷 ${st.photos}${Object.keys(st.waste).length?' · 🗑️ '+Object.entries(st.waste).map(([u,v])=>`${+v.toFixed(2)} ${esc(u)}`).join(', '):''}<br>
    <b>ശുചിത്വ സ്കോർ (Cleanliness score): <span style="color:${scoreColor(st.avg)}">${st.avg??'–'}/100</span></b> · ഫോട്ടോ തെളിവ് (photo proof) ${st.proof}% · അഭിപ്രായം ബാക്കി (awaiting remark) ${st.awaiting}</div>`;
  const byW={};list.forEach(e=>{const key=e.ward||e.placeName;(byW[key]=byW[key]||[]).push(e)});
  h+=`<table class="rp-tbl"><tr><th>വാർഡ് (Ward)</th><th>ജോലി (Entries)</th><th>സ്കോർ (Score)</th></tr>${Object.entries(byW).map(([k2,v])=>`<tr><td>${esc(k2)}</td><td>${v.length}</td><td>${stats(v).avg??'–'}</td></tr>`).join('')}</table>`;
  h+=typeReportHTML(list,fbList);if(can.staff())h+=fbReportHTML(fbList);
  const withPh=$('#rPhotos').checked;
  for(const e of list){const [ps,rs]=await Promise.all([withPh?getDocs(collection(db,'entries',e.id,'photos')):null,getDocs(collection(db,'entries',e.id,'remarks'))]);if(tok!==reportToken)return;
    h+=entryHTML(e,ps?ps.docs.map(d=>d.data()).sort((x,z)=>x.ts-z.ts):[],rs.docs.map(d=>d.data({serverTimestamps:'estimate'})).sort((x,z)=>(x.createdAt?.seconds||0)-(z.createdAt?.seconds||0)),withPh)}
  h+=`<p class="hint center">തയ്യാറാക്കിയത് (Generated): ${new Date().toLocaleString('en-IN')} · ${esc(meDoc?.name||'')} · ഭദ്രം ഈ ഭൂമി (Bhadram Ee Bhoomi)<br>ആപ്പ് ഡെവലപ്പർ: രാഹുൽ കെ.ടി. (Grok സഹായത്തോടെ) · Developed by Rahul K T with Grok</p>`;$('#reportOut').innerHTML=h}
$('#rPrint').onclick=async()=>{if(!$('#reportOut .rp-h'))await makeReport();await Promise.all([...$$('#reportOut img')].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})));print()};

/* ---------- resident feedback ---------- */
let feedback=[],fbUnsub=null;const phoneCache=new Map();
const starsHTML=r=>`<span class="stars">${'★'.repeat(Math.round(r))}<span class="off">${'★'.repeat(5-Math.round(r))}</span></span>`;
function subscribeFeedback(){fbUnsub&&fbUnsub();
  fbUnsub=onSnapshot(query(collection(db,'feedback'),orderBy('createdAt','desc'),limit(500)),s=>{
    feedback=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:'estimate'})}));renderFeedback();if($('#v-dash').classList.contains('active'))renderDash()},e=>console.error('feedback',e));unsubs.push(()=>{fbUnsub&&fbUnsub();fbUnsub=null})}
const fbDate=f=>f.createdAt?new Date(f.createdAt.seconds*1000):null;
function fbAgg(list){const m={};list.forEach(f=>{const k=f.placeId;const o=m[k]=m[k]||{placeId:k,name:f.placeName,ward:f.ward,area:f.area,n:0,sum:0,sug:0};o.n++;o.sum+=f.rating;if(f.suggestion)o.sug++});
  return Object.values(m).map(o=>({...o,avg:o.sum/o.n})).sort((a,b)=>a.avg-b.avg)}
function fbDashHTML(){if(!can.staff())return '';const f=$('#dFrom').value,t=$('#dTo').value,a=$('#dArea').value,w=$('#dWard').value;
  const list=feedback.filter(x=>x.status!=='hidden'&&(!a||x.area===a)&&(!w||x.ward===w)).filter(x=>{const d=fbDate(x);if(!d)return true;const s=ymd(d);return s>=f&&s<=t});
  if(!list.length)return `<div class="rp-sub" style="margin-top:12px">🗣️ നിവാസികളുടെ അഭിപ്രായം (Resident feedback)</div><div class="hint">ഈ കാലയളവിൽ ഇല്ല (none in this period)</div>`;
  const avg=list.reduce((s,x)=>s+x.rating,0)/list.length;
  return `<div class="rp-sub" style="margin-top:12px">🗣️ നിവാസികളുടെ അഭിപ്രായം (Resident feedback): ${starsHTML(avg)} <b>${avg.toFixed(1)}/5</b> <span class="en">(${list.length})</span></div>`+
    fbAgg(list).map(o=>`<div class="wardrow"><div>📍 ${esc(o.name)} <span class="en">(${o.n})</span></div><div class="bar"><i style="width:${o.avg*20}%;background:${scoreColor(o.avg*20)}"></i></div><b style="color:${scoreColor(o.avg*20)}">${o.avg.toFixed(1)}★</b></div>`).join('')}
['#fbPlace','#fbShow'].forEach(s=>$(s).addEventListener('change',renderFeedback));
function renderFeedback(){if(!can.staff())return;const sel=$('#fbPlace'),cur=sel.value;
  sel.innerHTML='<option value="">എല്ലാ സ്ഥലങ്ങളും (All places)</option>'+places.map(p=>`<option value="${p.id}">${esc(p.name)}${p.ward?' – '+esc(p.ward):''}</option>`).join('');sel.value=cur;
  const show=$('#fbShow').value;const list=feedback.filter(f=>(!sel.value||f.placeId===sel.value)&&(show==='all'||(f.status||'visible')===show));
  const vis=feedback.filter(f=>f.status!=='hidden'&&(!sel.value||f.placeId===sel.value));
  $('#fbSum').innerHTML=vis.length?`${starsHTML(vis.reduce((s,f)=>s+f.rating,0)/vis.length)} <b>${(vis.reduce((s,f)=>s+f.rating,0)/vis.length).toFixed(1)}/5</b> · ${vis.length} അഭിപ്രായം (feedback) · 💡 ${vis.filter(f=>f.suggestion).length} നിർദ്ദേശം (suggestions)`:'<span class="hint">ഇതുവരെ അഭിപ്രായം ഇല്ല (No feedback yet)</span>';
  if(!list.length){$('#fbList').innerHTML='<div class="empty"><div class="big">📭</div>ഒന്നുമില്ല (Nothing here)</div>';return}
  $('#fbList').innerHTML=list.map(f=>{const d=fbDate(f);return `<div class="card fbc ${f.status==='hidden'?'hidden':''}" data-id="${f.id}">
    <div class="row" style="align-items:center"><div style="flex:3"><b>📍 ${esc(f.placeName)}</b> <span class="en">${esc(f.ward||'')}</span><br>${typeBadge(placeTypeOf(f),places.find(p=>p.id===f.placeId))}<br>${starsHTML(f.rating)} <b>${f.rating}/5</b></div><div class="hint" style="flex:2;text-align:right">${d?d.toLocaleString('en-IN'):''}</div></div>
    ${f.comment?`<div style="margin-top:6px">💬 <b>അഭിപ്രായം (Comment):</b> ${esc(f.comment)}</div>`:''}
    ${f.suggestion?`<div class="remark" style="border-left-color:#f59e0b;background:#fffbeb">💡 <b>നിർദ്ദേശം (Suggestion):</b> ${esc(f.suggestion)}</div>`:''}
    ${f.photo?`<img class="fbph" src="${f.photo}" alt="" loading="lazy">`:''}
    <div class="hint" style="margin-top:6px">👤 ${esc(f.name||'പേര് നൽകിയിട്ടില്ല (anonymous)')}${f.hasPhone?(can.moderate()?` · 📞 <span class="ph-${f.id}">…</span>`:' · 📞 (ഉദ്യോഗസ്ഥർക്ക് മാത്രം / officers only)'):''}${f.status==='hidden'?' · 🙈 മറച്ചു (hidden)':''}</div>
    ${can.moderate()?`<div style="margin-top:8px"><button class="btn ${f.status==='hidden'?'sec':'danger'} sm" data-fbtoggle="${f.id}">${f.status==='hidden'?'👁️ വീണ്ടും കാണിക്കുക (Unhide)':'🙈 മറയ്ക്കുക – സ്പാം (Hide)'}</button></div>`:''}</div>`}).join('');
  $$('[data-fbtoggle]').forEach(b=>b.onclick=async()=>{const f=feedback.find(x=>x.id===b.dataset.fbtoggle);const to=f.status==='hidden'?'visible':'hidden';
    if(to==='hidden'&&!await ask('ഈ അഭിപ്രായം മറയ്ക്കണോ? (Hide this feedback?)'))return;
    updateDoc(doc(db,'feedback',f.id),{status:to,moderatedBy:me.uid,moderatedAt:serverTimestamp()}).then(()=>toast(to==='hidden'?'🙈 മറച്ചു (Hidden)':'👁️ കാണിക്കുന്നു (Visible)')).catch(e=>toast('⚠️ '+e.code))});
  if(can.moderate())list.filter(f=>f.hasPhone).forEach(async f=>{const set=v=>$$('.ph-'+f.id).forEach(e=>e.innerHTML=v);
    if(!phoneCache.has(f.id))phoneCache.set(f.id,getDoc(doc(db,'feedback',f.id,'private','contact')).then(s=>s.exists()?s.data().phone:'').catch(()=>''));
    const ph=await phoneCache.get(f.id);set(ph?`<a href="tel:${esc(ph)}">${esc(ph)}</a>`:'-')})}
async function monthFeedback(m,last,a,w,ty){const from=new Date(m+'-01T00:00:00'),to=new Date(last+'T23:59:59.999');
  try{const s=await getDocs(query(collection(db,'feedback'),where('createdAt','>=',from),where('createdAt','<=',to),orderBy('createdAt')));return s.docs.map(d=>d.data()).filter(f=>f.status!=='hidden'&&(!a||f.area===a)&&(!w||f.ward===w)&&(!ty||placeTypeOf(f)===ty))}catch(e){console.error(e);return []}}
function fbReportHTML(list){
  const head=`<div class="rp-sub" style="font-size:15px">🗣️ നിവാസികളുടെ അഭിപ്രായം (Resident feedback summary)</div>`;
  if(!list.length)return head+'<p class="hint">ഈ മാസം അഭിപ്രായം ഇല്ല (No resident feedback this month)</p>';
  const avg=list.reduce((s,f)=>s+f.rating,0)/list.length;
  return head+`<table class="rp-tbl"><tr><th>സ്ഥലം (Place)</th><th>അഭിപ്രായം (Feedback)</th><th>ശരാശരി (Avg ★)</th><th>നിർദ്ദേശം (Suggestions)</th></tr>${fbAgg(list).map(o=>`<tr><td>${esc(o.name)}${o.ward?' – '+esc(o.ward):''}</td><td>${o.n}</td><td>${o.avg.toFixed(1)}</td><td>${o.sug}</td></tr>`).join('')}
    <tr><th>ആകെ (Total)</th><th>${list.length}</th><th>${avg.toFixed(1)}</th><th>${list.filter(f=>f.suggestion).length}</th></tr></table>`+
    (list.some(f=>f.suggestion)?`<div class="rp-sub">💡 നിർദ്ദേശങ്ങൾ (Suggestions)</div><ul style="font-size:13px;margin-top:2px">${list.filter(f=>f.suggestion).map(f=>`<li><b>${esc(f.placeName)}</b>: ${esc(f.suggestion)}</li>`).join('')}</ul>`:'')}
/* QR codes */
const fbLink=id=>{const u=new URL('feedback.html',location.href);u.search='';u.hash='';u.searchParams.set('place',id);if(EMU)u.searchParams.set('emulator','1');return u.toString()};
function renderQRList(){if(!can.staff())return;$('#qrList').innerHTML=places.map(p=>`<div class="qrrow"><div class="nm">📍 <b>${esc(p.name)}</b> ${typeBadge(p.type||'other',p)}<br><span class="en">${esc([p.ward,p.area].filter(Boolean).join(' · '))}</span></div><button class="btn sm" data-qr="${p.id}">🔳 QR</button></div>`).join('')||'<p class="hint">ആദ്യം സ്ഥലങ്ങൾ ചേർക്കുക (Add places first)</p>';
  $$('[data-qr]').forEach(b=>b.onclick=()=>openQR(places.find(p=>p.id===b.dataset.qr)))}
let qrPlace=null;
function wrapText(x,t,maxW){const out=[];let line='';for(const w of t.split(' ')){const tt=line?line+' '+w:w;if(x.measureText(tt).width>maxW&&line){out.push(line);line=w}else line=tt}if(line)out.push(line);return out}
function wrapChars(x,t,maxW){const out=[];let line='';for(const ch of t){if(x.measureText(line+ch).width>maxW&&line){out.push(line);line=ch}else line+=ch}if(line)out.push(line);return out}
function drawQR(p){const url=fbLink(p.id);const q=window.qrcode(0,'M');q.addData(url);q.make();const n=q.getModuleCount();
  const W=1240,H=1754,c=$('#qrCanvas');c.width=W;c.height=H;const x=c.getContext('2d');const F='"Noto Sans Malayalam","Noto Sans",sans-serif';
  x.fillStyle='#fff';x.fillRect(0,0,W,H);x.strokeStyle='#0f766e';x.lineWidth=6;x.strokeRect(24,24,W-48,H-48);
  x.fillStyle='#0f766e';x.fillRect(24,24,W-48,190);x.fillStyle='#fff';x.textAlign='center';
  x.font=`700 66px ${F}`;x.fillText('ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം',W/2,128,W-120);x.font=`36px ${F}`;x.fillText('Bhadram Ee Bhoomi – Daily Cleaning · നിവാസികളുടെ അഭിപ്രായം (Resident feedback)',W/2,186,W-120);
  let y=290;x.fillStyle='#134e4a';x.font=`700 64px ${F}`;x.fillText('📍 '+p.name,W/2,y,W-120);y+=56;
  x.font=`38px ${F}`;x.fillStyle='#5b7f7b';const ti=typeInfo(p.type||'other',p);const sub=[ti.icon+' '+ti.ml,p.ward,p.area].filter(Boolean).join(' · ');if(sub){x.fillText(sub,W/2,y,W-120);y+=20}
  y+=50;x.textAlign='left';x.fillStyle='#134e4a';x.font=`32px ${F}`;x.fillText('ഓഫീസ് / സീൽ (Office name / seal):',90,y);x.strokeStyle='#64748b';x.lineWidth=2;x.setLineDash([10,8]);
  x.beginPath();x.moveTo(600,y+6);x.lineTo(W-90,y+6);x.stroke();x.beginPath();x.moveTo(90,y+70);x.lineTo(W-90,y+70);x.stroke();x.setLineDash([]);y+=110;
  const qs=Math.floor(620/(n+8))*(n+8),cell=qs/(n+8),ox=(W-qs)/2;x.fillStyle='#000';
  for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k))x.fillRect(Math.floor(ox+(k+4)*cell),Math.floor(y+(r+4)*cell),Math.ceil(cell),Math.ceil(cell));
  y+=qs+10;x.textAlign='center';x.fillStyle='#0f766e';x.font=`700 44px ${F}`;x.fillText('📱 സ്കാൻ ചെയ്ത് അഭിപ്രായം അറിയിക്കുക',W/2,y,W-120);y+=44;
  x.font=`30px ${F}`;x.fillText('Scan to rate the cleaning & give suggestions',W/2,y,W-120);y+=52;
  x.fillStyle='#134e4a';x.font=`600 28px "Noto Sans Mono","DejaVu Sans Mono",monospace`;x.fillText('വെബ് വിലാസം (Web address) – ഇത് മാത്രം ശരിയായ ലിങ്ക്:',W/2,y);y+=40;
  for(const l of wrapChars(x,url,W-200)){x.fillText(l,W/2,y);y+=38}
  y+=24;const bx=80,bw=W-160;x.font=`600 34px ${F}`;const tl=wrapText(x,'🛡️ '+TRUST_ML,bw-60);x.font=`28px ${F}`;const te=wrapText(x,TRUST_EN,bw-60);
  const bh=30+tl.length*50+te.length*38+20;x.fillStyle='#ecfdf5';x.fillRect(bx,y,bw,bh);x.strokeStyle='#059669';x.lineWidth=3;x.strokeRect(bx,y,bw,bh);
  let ty=y+56;x.fillStyle='#065f46';x.font=`600 34px ${F}`;for(const l of tl){x.fillText(l,W/2,ty);ty+=50}x.font=`28px ${F}`;x.fillStyle='#047857';for(const l of te){x.fillText(l,W/2,ty);ty+=38}
  x.fillStyle='#5b7f7b';x.font=`24px ${F}`;x.fillText('ആപ്പ് ഡെവലപ്പർ: രാഹുൽ കെ.ടി. (Grok സഹായത്തോടെ) · Developed by Rahul K T with Grok',W/2,Math.max(y+bh+50,H-50),W-120);
  return url}
const TRUST_ML='ഇത് ശുചീകരണത്തെക്കുറിച്ചുള്ള അഭിപ്രായ ഫോം മാത്രം. പണമോ OTP-യോ ബാങ്ക് വിവരങ്ങളോ ചോദിക്കില്ല. ലോഗിൻ വേണ്ട. പേരും ഫോണും നിർബന്ധമല്ല.';
const TRUST_EN='Feedback form about cleaning only. It never asks for money, OTP or bank details. No login. Name and phone are optional.';
function openQR(p){qrPlace=p;const url=drawQR(p);$('#qrLink').textContent=url;$('#qrOpen').href=url;$('#qrModal').classList.add('show')}
$('#qrClose').onclick=()=>$('#qrModal').classList.remove('show');
$('#qrDl').onclick=()=>{const a=document.createElement('a');a.href=$('#qrCanvas').toDataURL('image/png');a.download=`bhadram-ee-bhoomi-qr-${(qrPlace.name||'place').replace(/[^\w\u0D00-\u0D7F]+/g,'-')}.png`;document.body.appendChild(a);a.click();a.remove()};
$('#qrCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('#qrLink').textContent);toast('🔗 ലിങ്ക് കോപ്പി ചെയ്തു (Link copied)')}catch(e){toast($('#qrLink').textContent,5000)}};
function printPoster(size){const w=window.open('','_blank');if(!w)return toast('⚠️ Pop-up blocked');
  w.document.write(`<html><head><title>QR poster – ${esc(qrPlace.name)}</title><style>@page{size:${size};margin:6mm}html,body{margin:0;height:100%}body{display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100vh}</style></head><body><img src="${$('#qrCanvas').toDataURL('image/png')}" onload="setTimeout(()=>print(),300)"></body></html>`);w.document.close()}
$('#qrPrint').onclick=()=>printPoster('A4');$('#qrPrintA5').onclick=()=>printPoster('A5');

/* ---------- tabs & SW ---------- */
$$('nav.tabs button').forEach(b=>b.onclick=()=>{if(b.dataset.v==='v-new'&&!editing)resetForm();show(b.dataset.v)});
if('serviceWorker'in navigator&&location.protocol.startsWith('http')&&!EMU)navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__app={get entries(){return entries},get meDoc(){return meDoc},db,F};

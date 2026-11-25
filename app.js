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
const typeBadge=(id,obj)=>{const t=typeInfo(id,obj);return `<span class="tbadge"><i class="te">${t.icon}</i>${esc(t.ml)}${t.en?` <span style="opacity:.75;font-weight:500">(${esc(t.en)})</span>`:''}</span>`};
const ico=(n,c='')=>`<svg class="ic ${c}"><use href="#i-${n}"/></svg>`;
const hic=(n,c='')=>`<span class="hic ${c}">${ico(n)}</span>`;
const MARK_SVG=`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="13.6" r="7" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M4.4 15.3c2.1-.9 4.4-.9 6.6 0s4.5.9 6.6 0" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/><path d="M12.6 11.6C12.7 6.6 15.7 3.4 21.2 3c-.2 5.4-3.4 8.5-8.6 8.6z" fill="#9be8c6"/><path d="M12.8 11.4 17.2 7" stroke="#0b5d4b" stroke-width="1.1" stroke-linecap="round"/></svg>`;
const emptyHTML=(icon,ml,en)=>`<div class="empty"><svg class="art" viewBox="0 0 160 120" aria-hidden="true"><circle cx="80" cy="62" r="50" fill="var(--brand-50)"/><rect x="52" y="34" width="56" height="62" rx="12" fill="var(--surface)" stroke="var(--brand-100)" stroke-width="2"/><g transform="translate(68 53)" fill="none" stroke="var(--brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#i-${icon}" width="24" height="24"/></g><circle cx="126" cy="30" r="5" fill="var(--sun)"/><circle cx="32" cy="90" r="4" fill="var(--teal)" opacity=".55"/><circle cx="118" cy="98" r="3" fill="var(--earth)" opacity=".6"/></svg><b>${ml}</b><span class="en">${en}</span></div>`;
const skelHTML=(n=2)=>Array.from({length:n},()=>`<div class="skc"><div class="sk t"></div><div class="ls"><div class="sk l" style="width:70%"></div><div class="sk l" style="width:45%"></div><div class="sk l" style="width:58%"></div></div></div>`).join('');
const typeOptions=(first)=>(first?`<option value="">${first}</option>`:'')+allTypes().map(t=>`<option value="${t.id}">${t.icon} ${esc(t.ml)}${t.en?' ('+esc(t.en)+')':''}</option>`).join('');
const ROLES={admin:'👑 അഡ്മിൻ (Admin)',supervisor:'🧑‍💼 സൂപ്പർവൈസർ (Supervisor)',officer:'👮 ഉദ്യോഗസ്ഥൻ (Officer)',worker:'👷 തൊഴിലാളി (Worker)',pending:'⏳ കാത്തിരിക്കുന്നു (Pending)',disabled:'🚫 തടഞ്ഞു (Disabled)'};
function toast(m,ms=2600){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),ms)}
function ask(msg){return new Promise(res=>{$('#mMsg').textContent=msg;$('#modal').classList.add('show');const d=v=>{$('#modal').classList.remove('show');res(v)};$('#mYes').onclick=()=>d(true);$('#mNo').onclick=()=>d(false)})}
const scoreColor=s=>s==null?'#94a3b8':s>=85?'#15803d':s>=65?'#b45309':'#b91c1c';
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
function setNet(){$('#net').textContent=navigator.onLine?'ഓൺലൈൻ':'ഓഫ്‌ലൈൻ';$('#net').classList.toggle('off',!navigator.onLine)}
addEventListener('online',setNet);addEventListener('offline',setNet);setNet();

/* ---------- auth ---------- */
$('#loginBtn').onclick=async()=>{const p=new A.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
  try{await A.signInWithPopup(auth,p)}catch(e){if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment'].includes(e.code))return A.signInWithRedirect(auth,p);if(e.code!=='auth/popup-closed-by-user'&&e.code!=='auth/cancelled-popup-request')toast('⚠️ ലോഗിൻ പരാജയപ്പെട്ടു: '+e.code)}};
document.addEventListener('click',async e=>{const a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act==='logout'){if(await ask('ലോഗൗട്ട് ചെയ്യണോ? (Sign out?)')){cleanup();await A.signOut(auth)}}
  if(a.dataset.act==='back')show('v-dash')});
function cleanup(){unsubs.forEach(u=>u());unsubs=[];entryUnsub&&entryUnsub();entryUnsub=null;detailUnsubs.forEach(u=>u());detailUnsubs=[];notifReady=false}
/* ---------- jurisdiction banner (public/banner) ---------- */
let jdText='';
function applyJd(){$('#jdLines').textContent=jdText;$('#jd').classList.toggle('on',!!jdText);if(document.activeElement!==$('#jdText')){$('#jdText').value=jdText;jdCount()}}
const jdLines=()=>jdText?jdText.split('\n').map(s=>s.trim()).filter(Boolean):[];
const jdReportHTML=()=>jdText?`<div class="rp-jd">🏛️ അധികാര പരിധി (ഓഫീസ് / സർക്കിൾ)<b>${esc(jdLines().join('\n'))}</b></div>`:'';
function jdCount(){$('#jdCount').textContent=$('#jdText').value.length+'/300'}
$('#jdText').oninput=jdCount;
onSnapshot(doc(db,'public','banner'),s=>{jdText=((s.exists()&&s.data().text)||'').trim();applyJd()},e=>console.warn('banner',e.code));
$('#jdSave').onclick=async()=>{const t=$('#jdText').value.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,6).join('\n').slice(0,300);
  try{await setDoc(doc(db,'public','banner'),{text:t,updatedAt:serverTimestamp(),by:me.uid});$('#jdText').value=t;jdText=t;applyJd();toast(t?'✅ സേവ് ചെയ്തു (Saved)':'✅ മറച്ചു (Hidden)')}catch(e){console.error(e);toast('⚠️ '+(e.code||e.message))}};
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
  $('#placesCard').style.display=can.sup()?'block':'none';$('#tabFb').style.display=can.staff()?'flex':'none';$('#qrCard').style.display=can.staff()?'block':'none';$('#usersCard').style.display=can.admin()?'block':'none';$('#jdCard').style.display=can.admin()?'block':'none';
  $('#sName').value=meDoc.name||'';$('#sPhone').value=meDoc.phone||'';$('#meInfo').textContent=`${me.email} · ${ROLES[r]}`;
  $('#phMode').textContent=OPT.storageEnabled?'☁️ ഫോട്ടോകൾ Firebase Storage-ൽ സൂക്ഷിക്കുന്നു (Photos stored in Cloud Storage)':'💾 ഫോട്ടോകൾ ചുരുക്കി (~200KB) ഡാറ്റാബേസിൽ സൂക്ഷിക്കുന്നു (Free-plan mode: compressed photos in Firestore)';
  $('#aboutTxt').innerHTML=`ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം (Bhadram Ee Bhoomi – Daily Cleaning) · പതിപ്പ് (version) team-3 · Firebase: ${esc(cfg.projectId)}${EMU?' (emulator)':''} · Photos: ${OPT.storageEnabled?'Storage':'Firestore (free plan)'}`;
  unsubs.push(onSnapshot(doc(db,'meta','placeTypes'),s=>{customTypes=(s.data()?.types||[]).filter(t=>t&&t.id&&t.ml);renderPlaces();fillFilters();if($('#v-dash').classList.contains('active'))renderDash()},e=>console.error('types',e)));
  unsubs.push(onSnapshot(collection(db,'places'),s=>{places=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.area+a.ward+a.name).localeCompare(b.area+b.ward+b.name));renderPlaces()},e=>console.error(e)));
  unsubs.push(onSnapshot(collection(db,'users'),s=>{users=s.docs.map(d=>({uid:d.id,...d.data()}));renderUsers();fillFilters()},e=>console.error(e)));
  unsubs.push(onSnapshot(query(collection(db,'users',me.uid,'notifications'),orderBy('createdAt','desc'),limit(100)),s=>{
    if(notifReady)s.docChanges().forEach(c=>{if(c.type==='added'&&!c.doc.metadata.hasPendingWrites){const n=c.doc.data();toast('🔔 '+n.text,4500);try{if(Notification.permission==='granted')new Notification('ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം',{body:n.text,icon:'icon-192.png'})}catch(e){}}});
    notifReady=true;notifs=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:'estimate'})}));renderNotifs()},e=>console.error(e)));
  if(!$('#dFrom').value){const d=new Date();$('#dFrom').value=ymd(new Date(d.getFullYear(),d.getMonth(),1));$('#dTo').value=today();$('#rMonth').value=today().slice(0,7);$('#rDate').value=today()}
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
  {const s=$('#rPlace'),v=s.value,a=$('#rArea').value,w=$('#rWard').value;s.innerHTML='<option value="">എല്ലാ സ്ഥലവും (All places)</option>'+places.filter(p=>(!a||p.area===a)&&(!w||p.ward===w)).map(p=>`<option value="${p.id}">${esc(p.name)}${p.ward?' – '+esc(p.ward):''}</option>`).join('');s.value=v}
  for(const id of ['#dType','#rType']){const s=$(id),v=s.value;s.innerHTML=typeOptions('എല്ലാ തരവും (All types)');s.value=v}
  $('#areaList').innerHTML=uniq(places.map(x=>x.area)).map(x=>`<option value="${esc(x)}">`).join('');$('#wardList').innerHTML=uniq(places.map(x=>x.ward)).map(x=>`<option value="${esc(x)}">`).join('')}
function filtered(p='d'){const ty=$(`#${p}Type`).value,a=$(`#${p}Area`).value,w=$(`#${p}Ward`).value,k=$(`#${p}Worker`).value,q=p==='d'?$('#dSearch').value.trim().toLowerCase():'';
  return entries.filter(e=>(!ty||placeTypeOf(e)===ty)&&(!a||e.area===a)&&(!w||e.ward===w)&&(!k||e.workerUid===k)&&(!q||[e.placeName,e.area,e.ward,e.workerName,e.notes,worksText(e),worksText(e,1),fmtDate(e.date)].join(' ').toLowerCase().includes(q)))}
function stats(list){const scored=list.filter(e=>e.score!=null);const avg=scored.length?Math.round(scored.reduce((s,e)=>s+e.score,0)/scored.length):null;
  const proof=list.length?Math.round(100*list.filter(e=>e.hasBefore&&e.hasAfter).length/list.length):0;
  const waste={};list.forEach(e=>{if(e.waste!=null){const u=e.wasteUnit||'kg';waste[u]=(waste[u]||0)+e.waste}});
  return{avg,proof,scored:scored.length,awaiting:list.filter(e=>!e.remarkCount).length,days:new Set(list.map(e=>e.date)).size,places:new Set(list.map(e=>e.placeId||e.placeName)).size,workers:list.reduce((s,e)=>s+(e.workers||0),0),waste,photos:list.reduce((s,e)=>s+(e.photoCount||0),0)}}
function ringHTML(v){const r=52,c=2*Math.PI*r,p=v==null?0:Math.max(0,Math.min(1,v/100));return `<div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="11"/>${p>0?`<circle cx="60" cy="60" r="${r}" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-dasharray="${(c*p).toFixed(1)} ${c.toFixed(1)}"/>`:''}</svg><div class="v">${v??'–'}</div></div>`}
function chartHTML(list){const end=new Date(($('#dTo').value||today())+'T12:00:00'),start=$('#dFrom').value;const days=[];for(let i=13;i>=0;i--){const d=new Date(end);d.setDate(d.getDate()-i);const s=ymd(d);if(!start||s>=start)days.push(s)}
  const cnt=Object.fromEntries(days.map(d=>[d,0]));list.forEach(e=>{if(e.date in cnt)cnt[e.date]++});const mx=Math.max(1,...Object.values(cnt));
  return `<div class="bars" role="img" aria-label="entries per day">`+days.map((d,i)=>`<div class="col" title="${fmtDate(d)}: ${cnt[d]}"><b>${cnt[d]||''}</b><i class="${cnt[d]?'':'z'}" style="height:${cnt[d]?Math.max(8,92*cnt[d]/mx):3}%"></i><span>${(days.length-1-i)%2===0?+d.slice(8):''}</span></div>`).join('')+'</div>'}
function renderDash(){fillFilters();const list=filtered('d');const st=stats(list);
  const byWard={};list.forEach(e=>{const k=(e.area?e.area+' · ':'')+(e.ward||e.placeName||'-');(byWard[k]=byWard[k]||[]).push(e)});
  const ward=Object.keys(byWard).length>1?`<div class="rp-sub">${ico('pin','sm')}വാർഡ് തിരിച്ച് <span class="en">(By ward)</span></div>`+Object.entries(byWard).map(([k,a])=>{const s=stats(a).avg;return `<div class="wardrow"><div>${esc(k)} <span class="en">(${a.length})</span></div><div class="bar"><i style="width:${s??0}%;background:${scoreColor(s)}"></i></div><b style="color:${scoreColor(s)}">${s??'–'}</b></div>`}).join(''):'';
  const kpi=(i,c,v,ml,en)=>`<div class="kpi"><div class="k">${hic(i,c)}<span>${ml}<br><span class="en">${en}</span></span></div><b>${v}</b></div>`;
  $('#dStats').innerHTML=`<div class="kpis"><div class="scorecard">${ringHTML(st.avg)}<div class="lbl">ശുചിത്വ സ്കോർ<br><span class="en">Cleanliness score / 100</span></div></div>
    <div class="kgrid">${kpi('check2','','<span>'+list.length+'</span>','ജോലികൾ','Entries')}${kpi('badge','earth',st.awaiting,'അഭിപ്രായം ബാക്കി','Awaiting remark')}${kpi('camera','info',st.proof+'%','ഫോട്ടോ തെളിവ്','Before + after')}${kpi('users','warn',st.workers,'തൊഴിൽ','Worker-days')}</div></div>
    <div class="card"><div class="secttl">${hic('chart')}പ്രവർത്തനം <span class="en">(Activity – last 14 days)</span></div>${chartHTML(list)}</div>
    <div class="card dash-more">${fbDashHTML()}${typeDashHTML(list)}${ward}</div>`;
  if(!$('#dStats .dash-more').textContent.trim())$('#dStats .dash-more').remove();
  if(!list.length){$('#dList').innerHTML=emptyHTML('inbox','ഈ കാലയളവിൽ ജോലികൾ ഇല്ല','No entries for this period');return}
  let h='',last='';for(const e of list){if(e.date!==last){h+=`<div class="dayhead">${ico('cal','sm')} ${fmtDate(e.date)}</div>`;last=e.date}const r=RATE[e.lastRating];
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
  $('#pList').innerHTML=places.map(p=>`<div class="u" style="display:flex;gap:8px;align-items:center;padding:10px 0"><div style="flex:1;min-width:0"><b>${esc(p.name)}</b> <span class="en">${esc(p.ward)} · ${esc(p.area)}</span><br>${typeBadge(p.type||'other',p)}</div><button class="btn sec sm iconbtn" data-pedit="${p.id}" aria-label="edit">${ico('edit')}</button><button class="btn danger sm iconbtn" data-pid="${p.id}" aria-label="delete">${ico('trash')}</button></div>`).join('')||'<p class="hint">ഇതുവരെ ഇല്ല (none yet)</p>';
  $('#ctDetails').style.display=can.admin()?'block':'none';
  $('#ctList').innerHTML=customTypes.map(t=>`<span>${t.icon} ${esc(t.ml)} ${t.en?'('+esc(t.en)+')':''}<button data-ctdel="${t.id}" title="remove">✕</button></span>`).join('');
  $$('[data-ctdel]').forEach(b=>b.onclick=async()=>{const t=customTypes.find(x=>x.id===b.dataset.ctdel);if(!await ask(`"${t.ml}" തരം നീക്കണോ? (Remove type?) – ഈ തരത്തിലുള്ള സ്ഥലങ്ങൾ "മറ്റുള്ളവ" ആയി കാണിക്കും.`))return;
    setDoc(doc(db,'meta','placeTypes'),{types:customTypes.filter(x=>x.id!==t.id),updatedBy:me.uid,updatedAt:serverTimestamp()}).catch(e=>toast('⚠️ '+e.code))});
  renderQRList();renderFeedback();
  $$('#pList [data-pedit]').forEach(b=>b.onclick=()=>{const p=places.find(x=>x.id===b.dataset.pedit);editingPlace=p;$('#pArea').value=p.area||'';$('#pWard').value=p.ward||'';$('#pName').value=p.name||'';
    $('#pType').value=typeById(p.type)?p.type:(p.type?'other':'');$('#pTypeOther').value=p.typeOther||'';$('#pTypeOther').style.display=$('#pType').value==='other'?'block':'none';
    $('#pAdd').innerHTML=ico('save')+'മാറ്റം സേവ് <span class="en">(Save place)</span>';$('#pCancel').style.display='flex';$('#pName').scrollIntoView({block:'center'})});
  $$('#pList [data-pid]').forEach(b=>b.onclick=async()=>{const p=places.find(x=>x.id===b.dataset.pid);if(await ask(`"${p.name}" നീക്കണോ? (Remove place?)`))deleteDoc(doc(db,'places',p.id)).catch(e=>toast('⚠️ '+e.code))});fillFilters()}
$('#fType').onchange=renderPlaces;
$('#pType').onchange=()=>{$('#pTypeOther').style.display=$('#pType').value==='other'?'block':'none'};
function resetPlaceForm(){editingPlace=null;$('#pName').value='';$('#pType').value='';$('#pTypeOther').value='';$('#pTypeOther').style.display='none';$('#pAdd').innerHTML=ico('plus')+'ചേർക്കുക <span class="en">(Add place)</span>';$('#pCancel').style.display='none'}
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
  return `<div class="rp-sub">${ico('tag','sm')}തരം തിരിച്ച് <span class="en">(By type)</span></div>`+ks.map(k=>{const t=typeInfo(k),s=stats(m[k]).avg;return `<div class="wardrow"><div>${t.icon} ${esc(t.ml)} <span class="en">(${m[k].length})</span></div><div class="bar"><i style="width:${s??0}%;background:${scoreColor(s)}"></i></div><b style="color:${scoreColor(s)}">${s??'–'}</b></div>`}).join('')}
function typeReportHTML(list,fbList){const m={};const add=k=>m[k]=m[k]||{n:0,places:new Set(),fb:0,fbSum:0,score:[]};
  list.forEach(e=>{const k=placeTypeOf(e);add(k);m[k].n++;m[k].places.add(e.placeId||e.placeName);if(e.score!=null)m[k].score.push(e.score)});
  fbList.forEach(f=>{const k=placeTypeOf(f);add(k);m[k].fb++;m[k].fbSum+=f.rating});
  const ks=allTypes().map(t=>t.id).filter(k=>m[k]).concat(Object.keys(m).filter(k=>!typeById(k)));if(!ks.length)return '';
  return `<div class="rp-sub" style="font-size:15px">🏷️ തരം തിരിച്ചുള്ള സംഗ്രഹം (Summary by type)</div><table class="rp-tbl"><tr><th>തരം (Type)</th><th>ജോലി (Work)</th><th>സ്ഥലങ്ങൾ (Places)</th><th>സ്കോർ (Score)</th><th>നിവാസി ★ (Feedback avg)</th></tr>`+
    ks.map(k=>{const o=m[k],t=typeInfo(k);return `<tr><td>${t.icon} ${esc(t.ml)}${t.en?' ('+esc(t.en)+')':''}</td><td>${o.n}</td><td>${o.places.size}</td><td>${o.score.length?Math.round(o.score.reduce((a,b)=>a+b,0)/o.score.length):'–'}</td><td>${o.fb?(o.fbSum/o.fb).toFixed(1)+' ('+o.fb+')':'–'}</td></tr>`}).join('')+'</table>'}
function renderUsers(){if(!can.admin())return;const order={pending:0,admin:1,supervisor:2,officer:3,worker:4,disabled:5};
  $('#uList').innerHTML=users.slice().sort((a,b)=>(order[a.role]??9)-(order[b.role]??9)||String(a.name).localeCompare(b.name)).map(u=>`<div class="u">${u.photoURL?`<img src="${esc(u.photoURL)}" referrerpolicy="no-referrer" alt="">`:hic('user')}<div class="nm"><b>${esc(u.name)}</b><br><span class="en">${esc(u.email)}</span></div>
    <select data-uid="${u.uid}" ${u.uid===me.uid?'disabled':''}>${Object.entries(ROLES).map(([k,v])=>`<option value="${k}" ${u.role===k?'selected':''}>${v}</option>`).join('')}</select></div>`).join('');
  $$('#uList select').forEach(s=>s.onchange=async()=>{const u=users.find(x=>x.uid===s.dataset.uid);if(!await ask(`${u.name} → ${ROLES[s.value]}?`)){s.value=u.role;return}
    updateDoc(doc(db,'users',u.uid),{role:s.value,roleBy:me.uid,roleAt:serverTimestamp()}).then(()=>toast('✅ റോൾ മാറ്റി (Role updated)')).catch(e=>{toast('⚠️ '+e.code);s.value=u.role})})}
$('#sSave').onclick=()=>{updateDoc(doc(db,'users',me.uid),{name:$('#sName').value.trim()||me.displayName,phone:$('#sPhone').value.trim()}).catch(e=>toast('⚠️ '+e.code));toast('✅ സേവ് ചെയ്തു (Saved)')};

/* ---------- photos ---------- */
function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('bad image'));i.src=src})}
// Decode honoring EXIF orientation; always scale proportionally (never crop).
async function decodeImage(file){if(window.createImageBitmap){try{return await createImageBitmap(file,{imageOrientation:'from-image'})}catch(e){}}
  const url=URL.createObjectURL(file);try{return await loadImage(url)}finally{setTimeout(()=>URL.revokeObjectURL(url),5000)}}
const dims=img=>[img.naturalWidth||img.width,img.naturalHeight||img.height];
function scaleCanvas(img,max){const [w,h]=dims(img);const s=Math.min(1,max/Math.max(w,h));const c=document.createElement('canvas');c.width=Math.round(w*s);c.height=Math.round(h*s);
  const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(img,0,0,c.width,c.height);return c}
async function toCanvasBlob(img,max,q){const c=scaleCanvas(img,max);return{c,blob:await new Promise(r=>c.toBlob(r,'image/jpeg',q))}}
const INLINE_LIMIT=190000; // dataURL chars (~140 KB JPEG)
const STEPS=[[1600,0.78],[1600,0.68],[1440,0.68],[1280,0.72],[1280,0.62],[1280,0.52],[1024,0.6],[1024,0.5],[900,0.5],[800,0.5],[640,0.45],[480,0.45]];
async function compressPhoto(file){const img=await decodeImage(file);
  const full=await toCanvasBlob(img,1600,0.82);let inline=null,cache={};
  for(const [m,q] of STEPS){const c=cache[m]||(cache[m]=scaleCanvas(img,m));const d=c.toDataURL('image/jpeg',q);if(d.length<INLINE_LIMIT){inline=d;break}}
  const thumb=scaleCanvas(img,240).toDataURL('image/jpeg',0.65);if(img.close)img.close();
  return{blob:full.blob,inline,thumb}}
window.__compressPhoto=compressPhoto;
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
  const grid=k=>{const a=photos.filter(p=>p.kind===k);return a.length?`<div class="rp-sub">${k==='before'?'📷 മുമ്പ് (Before)':'✨ ശേഷം (After)'}</div><div class="rp-ph">${a.map(p=>`<img src="${p.url||p.data}" alt="" loading="lazy" data-cap="${k==='before'?'📷 മുമ്പ് (Before)':'✨ ശേഷം (After)'}">`).join('')}</div>`:''};
  return `<div class="rp-e card"><div class="rp-sub" style="font-size:16px">📅 ${fmtDate(e.date)} · ${esc(e.placeName)} ${e.score!=null?`<span class="badge" style="background:${scoreColor(e.score)};color:#fff">സ്കോർ ${e.score}</span>`:''}</div><table>${rows.map(x=>`<tr><td>${x[0]}</td><td>${esc(x[1])}</td></tr>`).join('')}${gpsRow}</table>
    ${withPhotos?grid('before')+grid('after'):''}${remarks?remarksHTML(remarks):''}</div>`}
function remarksHTML(rs){if(!rs.length)return '';return `<div class="rp-sub">👮 ഉദ്യോഗസ്ഥരുടെ അഭിപ്രായം (Officer remarks)</div>`+rs.map(r=>{const t=RATE[r.rating];return `<div class="remark"><b>${esc(r.officerName)}</b>${r.desig?', '+esc(r.desig):''} ${t?`<span class="badge ${t[2]}">${t[0]} (${t[1]})</span>`:''}<div>${esc(r.text)}</div>${r.signature?`<img src="${r.signature}" alt="signature">`:''}<div class="hint">${r.createdAt?new Date(r.createdAt.seconds*1000).toLocaleString('en-IN'):''}</div></div>`}).join('')}
function renderDetail(){const e=entries.find(x=>x.id===detailId);if(!e){$('#detOut').innerHTML=skelHTML(1);return}
  $('#detOut').innerHTML=entryHTML(e,detPhotos,null);
  $('#detRemarks').innerHTML=`<h2>${hic('badge','earth')}അഭിപ്രായങ്ങൾ <span class="en">(Remarks – live)</span></h2>`+(detRemarks.length?remarksHTML(detRemarks).replace(/^<div class="rp-sub">.*?<\/div>/,''):'<p class="hint">ഇതുവരെ അഭിപ്രായം ഇല്ല (No remarks yet)</p>');
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
  $('#nList').innerHTML=notifs.length?notifs.map(n=>`<div class="card notif ${n.read?'':'unread'}" data-id="${n.id}" data-e="${n.entryId}"><div class="nic">${ico('bell')}</div><div><div>${esc(n.text)}</div><div class="hint">${n.createdAt?new Date(n.createdAt.seconds*1000).toLocaleString('en-IN'):''}</div></div></div>`).join(''):emptyHTML('bell','അറിയിപ്പുകൾ ഇല്ല','No notifications yet');
  $$('#nList .notif').forEach(el=>el.onclick=()=>{updateDoc(doc(db,'users',me.uid,'notifications',el.dataset.id),{read:true}).catch(()=>{});openDetail(el.dataset.e)})}
$('#nAllRead').onclick=()=>{const b=writeBatch(db);notifs.filter(n=>!n.read).forEach(n=>b.update(doc(db,'users',me.uid,'notifications',n.id),{read:true}));b.commit().catch(()=>{})};

/* ---------- monthly report ---------- */
['#rMonth','#rDate','#rArea','#rWard','#rPlace','#rWorker','#rType','#rPhotos'].forEach(s=>$(s).addEventListener('change',()=>{if(s==='#rArea'||s==='#rWard')fillFilters();makeReport()}));
$('#rMake').onclick=()=>makeReport();
let reportToken=0,rMode='day',shareText='';
$$('#rMode button').forEach(b=>b.onclick=()=>{rMode=b.dataset.m;$$('#rMode button').forEach(x=>x.classList.toggle('on',x===b));$('#rDayRow').style.display=rMode==='day'?'flex':'none';$('#rMonth').style.display=rMode==='month'?'':'none';makeReport()});
const shiftDay=n=>{const d=new Date(($('#rDate').value||today())+'T12:00:00');d.setDate(d.getDate()+n);$('#rDate').value=ymd(d);makeReport()};
$('#rPrev').onclick=()=>shiftDay(-1);$('#rNext').onclick=()=>shiftDay(1);$('#rToday').onclick=()=>{$('#rDate').value=today();makeReport()};
function makeReport(){return rMode==='day'?makeDaily():makeMonthly()}
const placeKey=e=>e.placeId||e.placeName;
async function rangeFeedback(from,to,a,w,ty,pl){try{const s=await getDocs(query(collection(db,'feedback'),where('createdAt','>=',from),where('createdAt','<=',to),orderBy('createdAt')));
  return s.docs.map(d=>({id:d.id,...d.data()})).filter(f=>f.status!=='hidden'&&(!a||f.area===a)&&(!w||f.ward===w)&&(!ty||placeTypeOf(f)===ty)&&(!pl||f.placeId===pl))}catch(e){console.error(e);return []}}
const REPORT_HEAD=t=>`<div class="rp-h"><div class="rp-brand"><span class="mark">${MARK_SVG}</span><b>ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം</b></div><div class="en">Bhadram Ee Bhoomi – Daily Cleaning</div><h2>${t}</h2>${jdReportHTML()}`;
const CREDIT=()=>`<p class="hint center">തയ്യാറാക്കിയത് (Generated): ${new Date().toLocaleString('en-IN')} · ${esc(meDoc?.name||'')} · ഭദ്രം ഈ ഭൂമി (Bhadram Ee Bhoomi)<br>ആപ്പ് ഡെവലപ്പർ: രാഹുൽ കെ.ടി. (Grok സഹായത്തോടെ) · Developed by Rahul K T with Grok</p>`;
function dailyEntryHTML(e,photos,rs,withPh){const sc=e.score!=null?`<span class="badge" style="background:${scoreColor(e.score)};color:#fff">സ്കോർ ${e.score}</span>`:`<span class="badge pend">⏳ അഭിപ്രായം ബാക്കി (Awaiting remark)</span>`;
  const proof=e.hasBefore&&e.hasAfter?'✅ മുമ്പും ശേഷവും ഫോട്ടോ (Before+after)':e.hasBefore||e.hasAfter?'⚠️ ഭാഗിക ഫോട്ടോ (Partial photos)':'❌ ഫോട്ടോ ഇല്ല (No photos)';
  const ph=photos.slice().sort((x,z)=>(x.kind===z.kind?0:x.kind==='before'?-1:1)||x.ts-z.ts);
  return `<div class="dr-e"><div class="hd"><span>📍 ${esc(e.placeName)}${e.ward?' · '+esc(e.ward):''}</span><span>🕐 ${esc(e.time||'')}</span></div>
  <div>${typeBadge(placeTypeOf(e),e)} ${sc}</div>
  <table class="rp-tbl" style="margin:6px 0"><tr><td style="width:34%">👷 തൊഴിലാളി (Worker)</td><td>${esc(e.workerName||'')}${e.workers?` · 👥 ${e.workers}`:''}</td></tr>
  <tr><td>🧹 ജോലി (Work done)</td><td>${esc(worksText(e))}${e.waste!=null?` · 🗑️ ${e.waste} ${esc(e.wasteUnit||'')}`:''}</td></tr>
  <tr><td>📋 നില (Status)</td><td>${proof}${e.remarkCount?` · 💬 ${e.remarkCount}`:''}</td></tr>${e.notes?`<tr><td>📝 കുറിപ്പ് (Notes)</td><td>${esc(e.notes)}</td></tr>`:''}</table>
  ${withPh&&ph.length?`<div class="dr-ph">${ph.map(p=>{const c=p.kind==='before'?'📷 മുമ്പ് (Before)':'✨ ശേഷം (After)';return `<figure><img src="${p.url||p.data}" alt="" data-cap="${c}"><figcaption>${c}</figcaption></figure>`}).join('')}</div>`:''}
  ${remarksHTML(rs)}</div>`}
function dayFbHTML(list){if(!list.length)return '<p class="hint">ഈ ദിവസം നിവാസികളുടെ അഭിപ്രായം ഇല്ല (No resident feedback this day)</p>';
  return list.map(f=>`<div class="dr-fb">${starsHTML(f.rating)} <b>${f.rating}/5</b> · <b>${esc(f.placeName||'')}</b>${f.ward?' · '+esc(f.ward):''} <span class="hint">${fbDate(f)?fbDate(f).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):''}${f.name?' · '+esc(f.name):''}</span>
    ${f.comment?`<div>💬 ${esc(f.comment)}</div>`:''}${f.suggestion?`<div>💡 <b>നിർദ്ദേശം (Suggestion):</b> ${esc(f.suggestion)}</div>`:''}${f.photo?`<img class="fbph" src="${f.photo}" alt="">`:''}</div>`).join('')}
async function makeDaily(){const tok=++reportToken;const d=$('#rDate').value||($('#rDate').value=today());
  $('#reportOut').innerHTML=skelHTML(3);
  const a=$('#rArea').value,w=$('#rWard').value,k=$('#rWorker').value,rty=$('#rType').value,pl=$('#rPlace').value;
  const s=await getDocs(query(collection(db,'entries'),where('date','==',d)));if(tok!==reportToken)return;
  const list=s.docs.map(x=>({id:x.id,...x.data({serverTimestamps:'estimate'})})).filter(e=>(!rty||placeTypeOf(e)===rty)&&(!a||e.area===a)&&(!w||e.ward===w)&&(!k||e.workerUid===k)&&(!pl||e.placeId===pl)).sort((x,z)=>(x.time||'').localeCompare(z.time||''));
  const fbList=can.staff()?await rangeFeedback(new Date(d+'T00:00:00'),new Date(d+'T23:59:59.999'),a,w,rty,pl):[];if(tok!==reportToken)return;
  const pls=places.filter(p=>(!rty||placeTypeOf(p)===rty)&&(!a||p.area===a)&&(!w||p.ward===w)&&(!pl||p.id===pl));
  const done=new Set(list.map(placeKey));const pending=k?[]:pls.filter(p=>!done.has(p.id));const doneN=k?done.size:pls.filter(p=>done.has(p.id)).length;
  const st=stats(list);const rcount=list.reduce((n,e)=>n+(e.remarkCount||0),0);const fbAvg=fbList.length?fbList.reduce((n,f)=>n+f.rating,0)/fbList.length:null;
  const wk=k?users.find(u=>u.uid===k)?.name:'',pn=pl?places.find(p=>p.id===pl)?.name:'';
  const filt=[a,w,pn,wk,rty?typeInfo(rty).icon+' '+typeInfo(rty).ml:''].filter(Boolean).map(esc).join(' · ')||'എല്ലാം (All)';
  let h=REPORT_HEAD(`📅 ദിവസ റിപ്പോർട്ട് (Daily Report) – ${fmtDate(d)}`)+`<div>${filt}</div></div>`;
  h+=`<div class="rp-sum"><div class="dr-kpi"><div><b>${list.length}</b>ജോലി<br>(Entries)</div><div><b>${k?doneN:doneN+'/'+pls.length}</b>സ്ഥലം പൂർത്തി<br>(Places done)</div><div><b style="color:${scoreColor(st.avg)}">${st.avg??'–'}</b>സ്കോർ<br>(Avg score)</div>
    <div><b>${rcount}</b>അഭിപ്രായം<br>(Remarks)</div><div><b>${st.awaiting}</b>അഭിപ്രായം ബാക്കി<br>(Awaiting)</div><div><b>${can.staff()?fbList.length+(fbAvg!=null?' · '+fbAvg.toFixed(1)+'★':''):'–'}</b>നിവാസി അഭിപ്രായം<br>(Resident fb)</div></div>
    👥 ${st.workers} തൊഴിൽ (worker-days) · 📷 ${st.photos} · ഫോട്ടോ തെളിവ് (photo proof) ${st.proof}%${Object.keys(st.waste).length?' · 🗑️ '+Object.entries(st.waste).map(([u,v])=>`${+v.toFixed(2)} ${esc(u)}`).join(', '):''}</div>`;
  if(!k)h+=`<div class="rp-sub" style="font-size:15px">⏳ ബാക്കി സ്ഥലങ്ങൾ (Not done today): ${pending.length}</div>`+(pending.length?`<ul style="font-size:13px;margin:2px 0 10px;columns:2">${pending.map(p=>`<li class="pend">${typeInfo(placeTypeOf(p),p).icon} ${esc(p.name)}${p.ward?' – '+esc(p.ward):''}</li>`).join('')}</ul>`:'<p class="hint">✅ എല്ലാ സ്ഥലവും പൂർത്തിയായി (All places done)</p>');
  h+=typeReportHTML(list,fbList);
  if(list.length){h+=`<div class="rp-sub" style="font-size:15px">🧹 ജോലി വിവരങ്ങൾ (Work entries)</div>`;const withPh=$('#rPhotos').checked;
    const parts=await Promise.all(list.map(async e=>{const [ps,rs]=await Promise.all([withPh?getDocs(collection(db,'entries',e.id,'photos')):null,getDocs(collection(db,'entries',e.id,'remarks'))]);
      return dailyEntryHTML(e,ps?ps.docs.map(x=>x.data()):[],rs.docs.map(x=>x.data({serverTimestamps:'estimate'})).sort((x,z)=>(x.createdAt?.seconds||0)-(z.createdAt?.seconds||0)),withPh)}));if(tok!==reportToken)return;h+=parts.join('')}
  else h+=emptyHTML('inbox','ഈ ദിവസം ജോലി എൻട്രികൾ ഇല്ല','No work entries this day');
  if(can.staff())h+=`<div class="rp-sub" style="font-size:15px">🗣️ നിവാസികളുടെ അഭിപ്രായം / നിർദ്ദേശങ്ങൾ (Resident feedback & suggestions)</div>`+dayFbHTML(fbList);
  h+=CREDIT();$('#reportOut').innerHTML=h;
  const L=[`🧹 ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം`,...(jdText?[`🏛️ ${jdLines().join(' · ')}`]:[]),`📅 ദിവസ റിപ്പോർട്ട് (Daily report): ${fmtDate(d)}`,filt.replace(/<[^>]+>/g,'')==='എല്ലാം (All)'?'':`🔎 ${[a,w,pn,wk,rty?typeInfo(rty).ml:''].filter(Boolean).join(' · ')}`,
    `✅ സ്ഥലം പൂർത്തി (Places done): ${k?doneN:doneN+'/'+pls.length}`,`🧹 ജോലി (Entries): ${list.length}`,`⭐ സ്കോർ (Avg score): ${st.avg??'–'}`,`💬 അഭിപ്രായം (Remarks): ${rcount} · ബാക്കി (awaiting) ${st.awaiting}`,
    can.staff()?`🗣️ നിവാസി അഭിപ്രായം (Resident feedback): ${fbList.length}${fbAvg!=null?' · ശരാശരി '+fbAvg.toFixed(1)+'★':''}`:'',
    !k&&pending.length?`⏳ ബാക്കി (Not done): ${pending.map(p=>p.name).join(', ')}`:''].filter(Boolean);
  const E=list.map(e=>`• ${e.time||''} ${e.placeName} – ${e.workerName||''} – ${worksText(e)}${e.score!=null?' – സ്കോർ '+e.score:''}`);
  shareText=L.join('\n')+(E.length?'\n\n'+E.join('\n'):'')+'\n\n— ഭദ്രം ഈ ഭൂമി app'}
async function makeMonthly(){const tok=++reportToken;const m=$('#rMonth').value||today().slice(0,7);const [y,mo]=m.split('-').map(Number);const last=ymd(new Date(y,mo,0));
  $('#reportOut').innerHTML=skelHTML(3);shareText='';
  const pl=$('#rPlace').value;
  const s=await getDocs(query(collection(db,'entries'),where('date','>=',m+'-01'),where('date','<=',last),orderBy('date')));if(tok!==reportToken)return;
  const a=$('#rArea').value,w=$('#rWard').value,k=$('#rWorker').value,rty=$('#rType').value;
  const list=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:'estimate'})})).filter(e=>(!rty||placeTypeOf(e)===rty)&&(!a||e.area===a)&&(!w||e.ward===w)&&(!k||e.workerUid===k)&&(!pl||e.placeId===pl)).sort((x,z)=>(x.date+(x.time||'')).localeCompare(z.date+(z.time||'')));
  const st=stats(list);const wk=k?users.find(u=>u.uid===k)?.name:'';
  let h=`<div class="rp-h"><div class="rp-brand"><span class="mark">${MARK_SVG}</span><b>ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം</b></div><div class="en">Bhadram Ee Bhoomi – Daily Cleaning</div><h2>🧹 മാസ റിപ്പോർട്ട് (Monthly Report) – ${fmtMonth(m)}</h2>${jdReportHTML()}<div>${[a,w,wk,rty?typeInfo(rty).icon+' '+typeInfo(rty).ml:''].filter(Boolean).map(esc).join(' · ')||'എല്ലാം (All)'}</div></div>`;
  const fbList=can.staff()?(await monthFeedback(m,last,a,w,rty)).filter(f=>!pl||f.placeId===pl):[];if(tok!==reportToken)return;
  if(!list.length){const fb=can.staff()?typeReportHTML([],fbList)+fbReportHTML(fbList):'';$('#reportOut').innerHTML=h+emptyHTML('inbox','ജോലി എൻട്രികൾ ഇല്ല','No work entries')+fb;return}
  h+=`<div class="rp-sum"><b>ആകെ (Summary):</b> ${list.length} ജോലി (entries) · ${st.days} ദിവസം (days) · ${st.places} സ്ഥലം (places) · ${st.workers} തൊഴിൽ (worker-days) · 📷 ${st.photos}${Object.keys(st.waste).length?' · 🗑️ '+Object.entries(st.waste).map(([u,v])=>`${+v.toFixed(2)} ${esc(u)}`).join(', '):''}<br>
    <b>ശുചിത്വ സ്കോർ (Cleanliness score): <span style="color:${scoreColor(st.avg)}">${st.avg??'–'}/100</span></b> · ഫോട്ടോ തെളിവ് (photo proof) ${st.proof}% · അഭിപ്രായം ബാക്കി (awaiting remark) ${st.awaiting}</div>`;
  const byW={};list.forEach(e=>{const key=e.ward||e.placeName;(byW[key]=byW[key]||[]).push(e)});
  h+=`<table class="rp-tbl"><tr><th>വാർഡ് (Ward)</th><th>ജോലി (Entries)</th><th>സ്കോർ (Score)</th></tr>${Object.entries(byW).map(([k2,v])=>`<tr><td>${esc(k2)}</td><td>${v.length}</td><td>${stats(v).avg??'–'}</td></tr>`).join('')}</table>`;
  h+=typeReportHTML(list,fbList);if(can.staff())h+=fbReportHTML(fbList);
  const withPh=$('#rPhotos').checked;
  for(const e of list){const [ps,rs]=await Promise.all([withPh?getDocs(collection(db,'entries',e.id,'photos')):null,getDocs(collection(db,'entries',e.id,'remarks'))]);if(tok!==reportToken)return;
    h+=entryHTML(e,ps?ps.docs.map(d=>d.data()).sort((x,z)=>x.ts-z.ts):[],rs.docs.map(d=>d.data({serverTimestamps:'estimate'})).sort((x,z)=>(x.createdAt?.seconds||0)-(z.createdAt?.seconds||0)),withPh)}
  h+=`<p class="hint center">തയ്യാറാക്കിയത് (Generated): ${new Date().toLocaleString('en-IN')} · ${esc(meDoc?.name||'')} · ഭദ്രം ഈ ഭൂമി (Bhadram Ee Bhoomi)<br>ആപ്പ് ഡെവലപ്പർ: രാഹുൽ കെ.ടി. (Grok സഹായത്തോടെ) · Developed by Rahul K T with Grok</p>`;$('#reportOut').innerHTML=h;
  shareText=[`🧹 ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം`,jdText?`🏛️ ${jdLines().join(' · ')}`:'',`🗓️ മാസ റിപ്പോർട്ട് (Monthly report): ${fmtMonth(m)}`,`🧹 ജോലി (Entries): ${list.length} · ${st.days} ദിവസം · ${st.places} സ്ഥലം`,`⭐ സ്കോർ (Score): ${st.avg??'–'}/100 · ഫോട്ടോ തെളിവ് ${st.proof}%`,`💬 അഭിപ്രായം ബാക്കി (Awaiting): ${st.awaiting}`,can.staff()&&fbList.length?`🗣️ നിവാസി അഭിപ്രായം: ${fbList.length} · ശരാശരി ${(fbList.reduce((n,f)=>n+f.rating,0)/fbList.length).toFixed(1)}★`:'','— ഭദ്രം ഈ ഭൂമി app'].filter(Boolean).join('\n')}
async function ensureShare(){if(!shareText||!$('#reportOut .rp-h'))await makeReport();return shareText||$('#reportOut').innerText.slice(0,1500)}
async function copyText(t){try{await navigator.clipboard.writeText(t);toast('📋 കോപ്പി ചെയ്തു (Copied)')}catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('📋 കോപ്പി ചെയ്തു (Copied)')}catch(_){toast('⚠️ copy failed')}ta.remove()}}
$('#rShare').onclick=async()=>{const t=await ensureShare();if(navigator.share){try{await navigator.share({title:'ഭദ്രം ഈ ഭൂമി – റിപ്പോർട്ട്',text:t});return}catch(e){if(e.name==='AbortError')return}}copyText(t)};
$('#rWa').onclick=async()=>{const t=await ensureShare();window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank','noopener')};
$('#rCopy').onclick=async()=>copyText(await ensureShare());
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
  if(!list.length)return `<div class="rp-sub" style="margin-top:0">${ico('msg','sm')}നിവാസികളുടെ അഭിപ്രായം <span class="en">(Resident feedback)</span></div><div class="hint">ഈ കാലയളവിൽ ഇല്ല (none in this period)</div>`;
  const avg=list.reduce((s,x)=>s+x.rating,0)/list.length;
  return `<div class="rp-sub" style="margin-top:0">${ico('msg','sm')}നിവാസികളുടെ അഭിപ്രായം <span class="en">(Resident feedback)</span> ${starsHTML(avg)} <b>${avg.toFixed(1)}/5</b> <span class="en">(${list.length})</span></div>`+
    fbAgg(list).map(o=>`<div class="wardrow"><div>${esc(o.name)} <span class="en">(${o.n})</span></div><div class="bar"><i style="width:${o.avg*20}%;background:${scoreColor(o.avg*20)}"></i></div><b style="color:${scoreColor(o.avg*20)}">${o.avg.toFixed(1)}★</b></div>`).join('')}
['#fbPlace','#fbShow'].forEach(s=>$(s).addEventListener('change',renderFeedback));
function renderFeedback(){if(!can.staff())return;const sel=$('#fbPlace'),cur=sel.value;
  sel.innerHTML='<option value="">എല്ലാ സ്ഥലങ്ങളും (All places)</option>'+places.map(p=>`<option value="${p.id}">${esc(p.name)}${p.ward?' – '+esc(p.ward):''}</option>`).join('');sel.value=cur;
  const show=$('#fbShow').value;const list=feedback.filter(f=>(!sel.value||f.placeId===sel.value)&&(show==='all'||(f.status||'visible')===show));
  const vis=feedback.filter(f=>f.status!=='hidden'&&(!sel.value||f.placeId===sel.value));
  $('#fbSum').innerHTML=vis.length?`${starsHTML(vis.reduce((s,f)=>s+f.rating,0)/vis.length)} <b>${(vis.reduce((s,f)=>s+f.rating,0)/vis.length).toFixed(1)}/5</b> · ${vis.length} അഭിപ്രായം (feedback) · 💡 ${vis.filter(f=>f.suggestion).length} നിർദ്ദേശം (suggestions)`:'<span class="hint">ഇതുവരെ അഭിപ്രായം ഇല്ല (No feedback yet)</span>';
  if(!list.length){$('#fbList').innerHTML=emptyHTML('msg','ഒന്നുമില്ല','Nothing here yet');return}
  $('#fbList').innerHTML=list.map(f=>{const d=fbDate(f);return `<div class="card fbc ${f.status==='hidden'?'hidden':''}" data-id="${f.id}">
    <div class="row" style="align-items:center"><div style="flex:3"><b>📍 ${esc(f.placeName)}</b> <span class="en">${esc(f.ward||'')}</span><br>${typeBadge(placeTypeOf(f),places.find(p=>p.id===f.placeId))}<br>${starsHTML(f.rating)} <b>${f.rating}/5</b></div><div class="hint" style="flex:2;text-align:right">${d?d.toLocaleString('en-IN'):''}</div></div>
    ${f.comment?`<div style="margin-top:6px">💬 <b>അഭിപ്രായം (Comment):</b> ${esc(f.comment)}</div>`:''}
    ${f.suggestion?`<div class="remark sug">💡 <b>നിർദ്ദേശം (Suggestion):</b> ${esc(f.suggestion)}</div>`:''}
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
function renderQRList(){if(!can.staff())return;$('#qrList').innerHTML=places.map(p=>`<div class="qrrow"><div class="nm"><b>${esc(p.name)}</b> ${typeBadge(p.type||'other',p)}<br><span class="en">${esc([p.ward,p.area].filter(Boolean).join(' · '))}</span></div><button class="btn sm" data-qr="${p.id}">${ico('qr','sm')} QR</button></div>`).join('')||'<p class="hint">ആദ്യം സ്ഥലങ്ങൾ ചേർക്കുക (Add places first)</p>';
  $$('[data-qr]').forEach(b=>b.onclick=()=>openQR(places.find(p=>p.id===b.dataset.qr)))}
let qrPlace=null;
function wrapText(x,t,maxW){const out=[];let line='';for(const w of t.split(' ')){const tt=line?line+' '+w:w;if(x.measureText(tt).width>maxW&&line){out.push(line);line=w}else line=tt}if(line)out.push(line);return out}
function wrapChars(x,t,maxW){const out=[];let line='';for(const ch of t){if(x.measureText(line+ch).width>maxW&&line){out.push(line);line=ch}else line+=ch}if(line)out.push(line);return out}
function rr(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function drawMark(x,cx,cy,s){const g=x.createLinearGradient(cx-s/2,cy-s/2,cx+s/2,cy+s/2);g.addColorStop(0,'#12917a');g.addColorStop(.55,'#0b5d4b');g.addColorStop(1,'#073f33');x.fillStyle=g;rr(x,cx-s/2,cy-s/2,s,s,s*.28);x.fill();
  x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=Math.max(2,s/60);rr(x,cx-s/2,cy-s/2,s,s,s*.28);x.stroke();
  const k=s/24*0.68;x.save();x.translate(cx-12*k,cy-12*k);x.scale(k,k);x.lineCap='round';
  x.strokeStyle='#fff';x.lineWidth=1.8;x.beginPath();x.arc(11,13.6,7,0,Math.PI*2);x.stroke();
  x.lineWidth=1.6;x.beginPath();x.moveTo(4.4,15.3);x.bezierCurveTo(6.5,14.4,8.8,14.4,11,15.3);x.bezierCurveTo(13.2,16.2,15.5,16.2,17.6,15.3);x.stroke();
  x.fillStyle='#9be8c6';x.fill(new Path2D('M12.6 11.6C12.7 6.6 15.7 3.4 21.2 3c-.2 5.4-3.4 8.5-8.6 8.6z'));
  x.strokeStyle='#0b5d4b';x.lineWidth=1.1;x.beginPath();x.moveTo(12.8,11.4);x.lineTo(17.2,7);x.stroke();x.restore()}
function drawQR(p){const url=fbLink(p.id);const q=window.qrcode(0,'M');q.addData(url);q.make();const n=q.getModuleCount();
  const W=1240,H=1754,c=$('#qrCanvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const F='"Inter","Noto Sans Malayalam","Noto Sans",sans-serif',MONO='"DejaVu Sans Mono","Noto Sans Mono",monospace';
  const C={brand:'#0b5d4b',brand2:'#0e7a62',teal:'#14a39a',ink:'#0f1f1a',ink2:'#3f524b',mut:'#5d6e67',line:'#e1e7e2',bg:'#f5f6f2',b50:'#e7f4ef',b100:'#cfe9df',earth:'#a8642b'};
  x.fillStyle=C.bg;x.fillRect(0,0,W,H);
  // header band
  const hg=x.createLinearGradient(0,0,W,340);hg.addColorStop(0,'#07372d');hg.addColorStop(.6,C.brand);hg.addColorStop(1,C.teal);x.fillStyle=hg;rr(x,0,-40,W,380,56);x.fill();
  x.fillStyle='rgba(255,255,255,.06)';x.beginPath();x.arc(W-120,40,190,0,Math.PI*2);x.fill();x.beginPath();x.arc(W-40,260,110,0,Math.PI*2);x.fill();
  x.fillStyle='#ffd27a';x.globalAlpha=.9;x.beginPath();x.arc(W-170,92,34,0,Math.PI*2);x.fill();x.globalAlpha=1;
  drawMark(x,150,158,150);
  x.textAlign='left';x.fillStyle='#fff';x.font=`800 70px ${F}`;x.fillText('ഭദ്രം ഈ ഭൂമി',258,140,W-420);
  x.font=`600 42px ${F}`;x.fillStyle='rgba(255,255,255,.95)';x.fillText('– ദൈനംദിന ശുചീകരണം',258,198,W-420);
  x.font=`500 28px ${F}`;x.fillStyle='rgba(255,255,255,.8)';x.fillText('Bhadram Ee Bhoomi – Daily Cleaning',258,244,W-420);
  // pill
  x.font=`700 26px ${F}`;const pill='നിവാസികളുടെ അഭിപ്രായം · Resident feedback';const pw=x.measureText(pill).width+56;x.fillStyle='rgba(255,255,255,.16)';rr(x,72,282,pw,52,26);x.fill();x.fillStyle='#fff';x.fillText(pill,100,317);
  // place card
  let y=372;const cx0=60,cw=W-120;
  const jl=jdLines();x.font=`700 34px ${F}`;const wl=jl.flatMap(l=>wrapText(x,l,cw-140));
  const ti=typeInfo(p.type||'other',p);const sub=[ti.icon+' '+ti.ml,p.ward,p.area].filter(Boolean).join('  ·  ');
  x.font=`800 60px ${F}`;const nameL=wrapText(x,'📍 '+p.name,cw-80).slice(0,2);
  const jdH=wl.length?(70+wl.length*46+10):0;const cardH=60+nameL.length*72+50+(jdH?jdH+24:0)+120;
  x.fillStyle='#fff';x.shadowColor='rgba(16,32,26,.10)';x.shadowBlur=30;x.shadowOffsetY=10;rr(x,cx0,y,cw,cardH,36);x.fill();x.shadowColor='transparent';x.strokeStyle=C.line;x.lineWidth=2;rr(x,cx0,y,cw,cardH,36);x.stroke();
  let ty=y+82;x.textAlign='center';x.fillStyle=C.ink;x.font=`800 60px ${F}`;for(const l of nameL){x.fillText(l,W/2,ty,cw-60);ty+=72}
  x.font=`500 34px ${F}`;x.fillStyle=C.mut;x.fillText(sub,W/2,ty-10,cw-60);ty+=30;
  if(jdH){const bx=cx0+40,bw=cw-80;x.fillStyle=C.b50;rr(x,bx,ty,bw,jdH,24);x.fill();x.strokeStyle=C.b100;x.lineWidth=2;rr(x,bx,ty,bw,jdH,24);x.stroke();
    x.fillStyle=C.brand2;x.font=`700 26px ${F}`;x.fillText('🏛️  അധികാര പരിധി (ഓഫീസ് / സർക്കിൾ)',W/2,ty+44);x.fillStyle=C.ink;x.font=`700 34px ${F}`;let jy=ty+92;for(const l of wl){x.fillText(l,W/2,jy,bw-40);jy+=46}ty+=jdH+24}
  // seal line
  x.textAlign='left';x.fillStyle=C.ink2;x.font=`600 28px ${F}`;x.fillText('ഓഫീസ് / സീൽ (Office name / seal):',cx0+44,ty+46);x.strokeStyle='#9fb1aa';x.lineWidth=2;x.setLineDash([10,9]);
  x.beginPath();x.moveTo(cx0+560,ty+52);x.lineTo(cx0+cw-44,ty+52);x.stroke();x.beginPath();x.moveTo(cx0+44,ty+100);x.lineTo(cx0+cw-44,ty+100);x.stroke();x.setLineDash([]);
  y+=cardH+34;
  // trust box measure
  const bx=60,bw=W-120;x.font=`700 31px ${F}`;const tl=wrapText(x,TRUST_ML,bw-170);x.font=`500 25px ${F}`;const te=wrapText(x,TRUST_EN,bw-170);const trustH=48+tl.length*44+te.length*34+24;
  x.font=`600 24px ${MONO}`;const ul=wrapChars(x,url,W-240);
  const below=60+44+34+32+ul.length*34+30+trustH+80;
  const qs0=Math.max(380,Math.min(600,H-y-below-80));const qs=Math.floor(qs0/(n+8))*(n+8),cell=qs/(n+8);
  // QR card
  const qx=(W-qs)/2;x.fillStyle='#fff';x.shadowColor='rgba(16,32,26,.12)';x.shadowBlur=34;x.shadowOffsetY=10;rr(x,qx-24,y,qs+48,qs+48,40);x.fill();x.shadowColor='transparent';
  x.strokeStyle=C.brand;x.lineWidth=6;const k=58,X0=qx-24,Y0=y,S=qs+48;x.lineCap='round';
  for(const [ax,ay,dx,dy] of [[X0,Y0,1,1],[X0+S,Y0,-1,1],[X0,Y0+S,1,-1],[X0+S,Y0+S,-1,-1]]){const px=ax+dx*14,py=ay+dy*14;x.beginPath();x.moveTo(px,py+dy*k);x.lineTo(px,py);x.lineTo(px+dx*k,py);x.stroke()}
  x.fillStyle='#000';const qy=y+24;
  for(let r=0;r<n;r++)for(let kk=0;kk<n;kk++)if(q.isDark(r,kk))x.fillRect(Math.floor(qx+(kk+4)*cell),Math.floor(qy+(r+4)*cell),Math.ceil(cell),Math.ceil(cell));
  y+=qs+48+60;x.textAlign='center';x.fillStyle=C.brand;x.font=`800 44px ${F}`;x.fillText('സ്കാൻ ചെയ്ത് അഭിപ്രായം അറിയിക്കുക',W/2,y,W-120);y+=42;
  x.fillStyle=C.mut;x.font=`500 28px ${F}`;x.fillText('Scan to rate the cleaning & give suggestions',W/2,y,W-120);y+=46;
  x.fillStyle=C.ink2;x.font=`600 22px ${F}`;x.fillText('വെബ് വിലാസം (Web address) – ഇത് മാത്രം ശരിയായ ലിങ്ക്:',W/2,y);y+=36;
  x.fillStyle=C.ink;x.font=`600 24px ${MONO}`;for(const l of ul){x.fillText(l,W/2,y);y+=34}
  y+=22;x.fillStyle='#ecf8f1';rr(x,bx,y,bw,trustH,28);x.fill();x.strokeStyle='#9fdcb9';x.lineWidth=2;rr(x,bx,y,bw,trustH,28);x.stroke();
  x.fillStyle='#15803d';x.beginPath();x.arc(bx+66,y+trustH/2,34,0,Math.PI*2);x.fill();x.fillStyle='#fff';x.font=`800 34px ${F}`;x.fillText('✓',bx+66,y+trustH/2+12);
  x.textAlign='left';let yy=y+54;x.fillStyle='#14532d';x.font=`700 31px ${F}`;for(const l of tl){x.fillText(l,bx+126,yy);yy+=44}x.fillStyle='#2f6b45';x.font=`500 25px ${F}`;for(const l of te){x.fillText(l,bx+126,yy);yy+=34}
  x.textAlign='center';x.fillStyle=C.mut;x.font=`500 22px ${F}`;x.fillText('ആപ്പ് ഡെവലപ്പർ: രാഹുൽ കെ.ടി. (Grok സഹായത്തോടെ) · Developed by Rahul K T with Grok',W/2,Math.max(y+trustH+50,H-44),W-120);
  return url}
const TRUST_ML='ഇത് ശുചീകരണത്തെക്കുറിച്ചുള്ള അഭിപ്രായ ഫോം മാത്രം. പണമോ OTP-യോ ബാങ്ക് വിവരങ്ങളോ ചോദിക്കില്ല. ലോഗിൻ വേണ്ട. പേരും ഫോണും നിർബന്ധമല്ല.';
const TRUST_EN='Feedback form about cleaning only. It never asks for money, OTP or bank details. No login. Name and phone are optional.';
function openQR(p){qrPlace=p;const url=drawQR(p);Promise.all(['800 60px "Noto Sans Malayalam"','600 30px Inter','800 40px Inter']. map(f=>document.fonts.load(f,'ഭദ്രം A'))).then(()=>{if(qrPlace===p)drawQR(p)}).catch(()=>{});$('#qrLink').textContent=url;$('#qrOpen').href=url;$('#qrModal').classList.add('show')}
$('#qrClose').onclick=()=>$('#qrModal').classList.remove('show');
$('#qrDl').onclick=()=>{const a=document.createElement('a');a.href=$('#qrCanvas').toDataURL('image/png');a.download=`bhadram-ee-bhoomi-qr-${(qrPlace.name||'place').replace(/[^\w\u0D00-\u0D7F]+/g,'-')}.png`;document.body.appendChild(a);a.click();a.remove()};
$('#qrCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('#qrLink').textContent);toast('🔗 ലിങ്ക് കോപ്പി ചെയ്തു (Link copied)')}catch(e){toast($('#qrLink').textContent,5000)}};
function printPoster(size){const w=window.open('','_blank');if(!w)return toast('⚠️ Pop-up blocked');
  w.document.write(`<html><head><title>QR poster – ${esc(qrPlace.name)}</title><style>@page{size:${size};margin:6mm}html,body{margin:0;height:100%}body{display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100vh}</style></head><body><img src="${$('#qrCanvas').toDataURL('image/png')}" onload="setTimeout(()=>print(),300)"></body></html>`);w.document.close()}
$('#qrPrint').onclick=()=>printPoster('A4');$('#qrPrintA5').onclick=()=>printPoster('A5');

/* ---------- stepper highlight ---------- */
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const n=+e.target.dataset.step;$$('.stepper li').forEach((li,i)=>{li.classList.toggle('on',i+1===n);li.classList.toggle('done',i+1<n)})}})},{rootMargin:'-45% 0px -50% 0px'});$$('.step-card').forEach(c=>io.observe(c))}
/* ---------- full-screen photo viewer (zoom to read GPS stamps) ---------- */
let vw={list:[],i:0,z:1};
function openViewer(list,i=0){vw={list,i,z:1};$('#viewer').classList.add('show');showVw()}
function showVw(){const it=vw.list[vw.i];if(!it)return;vw.z=1;const im=$('#vwImg');im.src=it.src;applyZoom();$('#vwCap').textContent=(it.cap||'')+(vw.list.length>1?`  ${vw.i+1}/${vw.list.length}`:'');
  $('#vwPrev').style.visibility=$('#vwNext').style.visibility=vw.list.length>1?'visible':'hidden'}
function applyZoom(cx,cy){const sc=$('#vwScroll'),im=$('#vwImg');const box=sc.getBoundingClientRect();
  if(vw.z<=1.01){vw.z=1;sc.classList.remove('zoomed');im.style.width='';im.style.height='';return}
  const [nw,nh]=[im.naturalWidth||1,im.naturalHeight||1];const fit=Math.min(box.width/nw,box.height/nh);
  const fx=cx==null?0.5:(sc.scrollLeft+cx)/Math.max(sc.scrollWidth,1),fy=cy==null?0.5:(sc.scrollTop+cy)/Math.max(sc.scrollHeight,1);
  sc.classList.add('zoomed');im.style.width=Math.round(nw*fit*vw.z)+'px';im.style.height=Math.round(nh*fit*vw.z)+'px';
  sc.scrollLeft=fx*sc.scrollWidth-(cx??box.width/2);sc.scrollTop=fy*sc.scrollHeight-(cy??box.height/2)}
const zoomBy=(f,cx,cy)=>{vw.z=Math.max(1,Math.min(8,vw.z*f));applyZoom(cx,cy)};
$('#vwIn').onclick=()=>zoomBy(1.6);$('#vwOut').onclick=()=>zoomBy(1/1.6);
$('#vwClose').onclick=()=>{$('#viewer').classList.remove('show');$('#vwImg').src=''};
$('#vwPrev').onclick=()=>{vw.i=(vw.i-1+vw.list.length)%vw.list.length;showVw()};$('#vwNext').onclick=()=>{vw.i=(vw.i+1)%vw.list.length;showVw()};
addEventListener('keydown',e=>{if(!$('#viewer').classList.contains('show'))return;if(e.key==='Escape')$('#vwClose').click();if(e.key==='ArrowLeft')$('#vwPrev').click();if(e.key==='ArrowRight')$('#vwNext').click();if(e.key==='+')zoomBy(1.6);if(e.key==='-')zoomBy(1/1.6)});
(()=>{const sc=$('#vwScroll');const pts=new Map();let startD=0,startZ=1,lastTap=0;
  sc.addEventListener('pointerdown',e=>{pts.set(e.pointerId,e);if(pts.size===2){const [a,b]=[...pts.values()];startD=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);startZ=vw.z}
    if(e.pointerType!=='mouse'&&pts.size===1){const t=Date.now();if(t-lastTap<300){const r=sc.getBoundingClientRect();vw.z=vw.z>1?1:3;applyZoom(e.clientX-r.left,e.clientY-r.top)}lastTap=t}});
  sc.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,e);if(pts.size===2&&startD){e.preventDefault();const [a,b]=[...pts.values()];const d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);const r=sc.getBoundingClientRect();
    vw.z=Math.max(1,Math.min(8,startZ*d/startD));applyZoom((a.clientX+b.clientX)/2-r.left,(a.clientY+b.clientY)/2-r.top)}});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>sc.addEventListener(t,e=>{pts.delete(e.pointerId);if(pts.size<2)startD=0}));
  sc.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
  sc.addEventListener('dblclick',e=>{const r=sc.getBoundingClientRect();vw.z=vw.z>1?1:3;applyZoom(e.clientX-r.left,e.clientY-r.top)});
  sc.addEventListener('wheel',e=>{if(!e.ctrlKey&&vw.z===1&&Math.abs(e.deltaY)<1)return;e.preventDefault();const r=sc.getBoundingClientRect();zoomBy(e.deltaY<0?1.25:0.8,e.clientX-r.left,e.clientY-r.top)},{passive:false})})();
// open viewer from any photo
document.addEventListener('click',async e=>{const im=e.target.closest('img');if(!im||im.id==='vwImg')return;
  const grid=im.closest('.rp-ph,.photos,.dr-ph');
  if(grid){e.preventDefault();e.stopPropagation();const imgs=[...grid.closest('.dr-e,.rp-e,.card,#v-new')?.querySelectorAll('.rp-ph img,.photos img,.dr-ph img')||grid.querySelectorAll('img')];
    const list=imgs.map(x=>({src:x.src,cap:x.closest('.photos')?.id==='phBefore'?'📷 മുമ്പ് (Before)':x.closest('.photos')?.id==='phAfter'?'✨ ശേഷം (After)':(x.dataset.cap||'')}));openViewer(list,imgs.indexOf(im));return}
  if(im.classList.contains('fbph')){e.stopPropagation();openViewer([{src:im.src,cap:'🗣️ നിവാസിയുടെ ഫോട്ടോ (Resident photo)'}]);return}
  if(im.classList.contains('thumb')){const card=im.closest('.entry');if(!card)return;e.stopPropagation();toast('⏳');
    try{const s=await getDocs(collection(db,'entries',card.dataset.id,'photos'));const ps=s.docs.map(d=>d.data()).sort((a,b)=>(a.kind===b.kind?0:a.kind==='before'?-1:1)||a.ts-b.ts);
      if(ps.length)openViewer(ps.map(p=>({src:p.url||p.data,cap:p.kind==='before'?'📷 മുമ്പ് (Before)':'✨ ശേഷം (After)'})),0);else openDetail(card.dataset.id)}catch(err){openDetail(card.dataset.id)}}},true);

/* ---------- tabs & SW ---------- */
$$('nav.tabs button').forEach(b=>b.onclick=()=>{if(b.dataset.v==='v-new'&&!editing)resetForm();show(b.dataset.v)});
if('serviceWorker'in navigator&&location.protocol.startsWith('http')&&!EMU)navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__app={get entries(){return entries},get meDoc(){return meDoc},get me(){return me},db,F};

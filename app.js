const APP_VER='v30';const V='13.4.0',CDN=`https://www.gstatic.com/firebasejs/${V}/`;
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
/* mass cleaning work ("മാസ് വർക്ക്") types – defaults; admin/supervisor can edit the list (meta/massWorks) */
const MASS_DEFAULT=[['m_sweep','🧹','തൂത്തുവാരൽ','Sweeping'],['m_grass','🌿','പുല്ല് / കാട് വെട്ടൽ','Grass / bush cutting'],['m_drain','🚰','ഓട വൃത്തിയാക്കൽ','Drain cleaning'],['m_plastic','♻️','പ്ലാസ്റ്റിക് തരംതിരിക്കൽ','Plastic segregation'],['m_glass','🍾','പൊട്ടുന്ന കുപ്പികൾ തരംതിരിക്കൽ','Glass / breakable bottle segregation'],['m_organic','🍂','അഴുകുന്ന മാലിന്യങ്ങൾ തരംതിരിക്കൽ','Biodegradable waste segregation'],['m_soil','🪨','റോഡിലെ മണ്ണ് നീക്കം ചെയ്യൽ','Removing soil from road'],['m_food','🍲','ഫുഡ് വേസ്റ്റ് നീക്കം ചെയ്യൽ','Food waste removal'],['m_busstand','🚌','ബസ് സ്റ്റാൻഡും പരിസരവും ശുചീകരണം','Bus stand & surroundings'],['m_railway','🚉','റെയിൽവേ സ്റ്റേഷനും പരിസരവും ശുചീകരണം','Railway station & surroundings'],['m_school','🏫','സ്കൂളുകളും പരിസരവും ശുചീകരണം','Schools & surroundings'],['m_stadium','🏟️','സ്റ്റേഡിയവും പരിസരവും ശുചീകരണം','Stadium & surroundings'],['m_grill','🌧️','മഴവെള്ളം താഴാനുള്ള റോഡ് ഗ്രില്ലുകളുടെ ശുചീകരണം','Road storm-water grills'],['m_divider','🛣️','റോഡ് ഡിവൈഡറുകളുടെ ശുചീകരണം','Road dividers'],['m_park','🌳','പാർക്കുകളും പരിസരവും ശുചീകരണം','Parks & surroundings'],['m_toilet','🚻','പബ്ലിക് ടോയ്‌ലറ്റുകളുടെ ശുചീകരണം','Public toilets'],['m_river','🏞️','പുഴകൾ, തോടുകൾ ശുചീകരണം','Rivers & streams']].map(([id,icon,ml,en])=>({id,icon,ml,en,active:true}));
let massTypes=MASS_DEFAULT.slice();
const massById=id=>massTypes.find(t=>t.id===id);
const activeMass=()=>massTypes.filter(t=>t.active!==false);
function massLabels(e,en,icons=true){const snap=e.massLabels||[];const L=(e.massWorks||[]).map((id,i)=>{const t=massById(id);return t?((icons&&t.icon?t.icon+' ':'')+(en&&t.en?t.en:t.ml)):(snap[i]||id)});if(e.massOther)L.push(e.massOther);return L}
/* workers' names ("തൊഴിലാളികളുടെ പേരുകൾ") – managed list in meta/crew; entries keep a snapshot */
let crewNames=[];
const crewById=id=>crewNames.find(c=>c.id===id);
const activeCrew=()=>crewNames.filter(c=>c.active!==false);
const splitNames=t=>String(t||'').split(/[,،\n;]+/).map(x=>x.trim()).filter(Boolean);
function crewOf(e){const snap=e.crewNames||[];const L=(e.crew||[]).map((id,i)=>crewById(id)?.name||snap[i]||id);return L.concat(splitNames(e.crewOther))}
/* kind of work for mass-mode entries: മാസ് വർക്ക് and/or സ്പെഷ്യൽ വർക്ക് (old mass entries = മാസ് വർക്ക്) */
const KIND={daily:['🧹','ദൈനംദിന ശുചീകരണം','Daily cleaning'],mass:['💪','മാസ് വർക്ക്','Mass work'],special:['⭐','സ്പെഷ്യൽ വർക്ക്','Special work']};
/* work categories (any combination): old entries = ദൈനംദിന unless flagged mass; old mass entries = മാസ് (+ ദൈനംദിന if they also had daily works) */
const kindsOf=e=>{if(!e)return [];if(Array.isArray(e.cats)&&e.cats.length)return Object.keys(KIND).filter(k=>e.cats.includes(k));
  if(!e.mass)return ['daily'];const mk=Array.isArray(e.massKind)&&e.massKind.length?e.massKind.filter(k=>KIND[k]&&k!=='daily'):['mass'];return ((e.works||[]).length?['daily']:[]).concat(mk)};
const catMarks=(e,en)=>{const ks=kindsOf(e);return Object.entries(KIND).map(([k,v])=>`${ks.includes(k)?'☑':'☐'} ${en?v[2]:v[1]}`).join('  ')};
const regWorksText=(e,en)=>(e.works||[]).map(w=>w==='other'&&e.workOther?e.workOther:(WMAP[w]?(en?WMAP[w][2]:WMAP[w][1]):w)).join(', ');
const kindText=(e,en,icons=true)=>kindsOf(e).map(k=>(icons?KIND[k][0]+' ':'')+(en?KIND[k][2]:KIND[k][1])).join(' + ');
const kindBadge=e=>e.mass?kindsOf(e).map(k=>`<span class="badge mwb${k==='special'?' spb':k==='daily'?' dlb':''}">${KIND[k][0]} ${KIND[k][1]}</span>`).join(' ')+' ':'';
const massPlaceOf=e=>e.mass?(e.massPlace||(!e.placeId?e.placeName:'')||''):'';
const massWardOf=e=>e.mass?(e.massWard||(!e.placeId?e.ward:'')||''):'';
const massAreaOf=e=>e.mass?(e.massArea||(!e.placeId?e.area:'')||''):'';
const massLocText=(e,sep=' · ')=>[massPlaceOf(e),massWardOf(e)?'വാർഡ് (Ward): '+massWardOf(e):'',massAreaOf(e)?'ഏരിയ (Area): '+massAreaOf(e):''].filter(Boolean).join(sep);
/* every active common work type (+ removed/unknown ones used by this entry) with done state */
function massItems(e){const mw=e.massWorks||[];const known=new Set(massTypes.map(t=>t.id));
  const L=massTypes.filter(t=>t.active!==false||mw.includes(t.id)).map(t=>({on:mw.includes(t.id),label:(t.icon?t.icon+' ':'')+t.ml,removed:t.active===false}));
  mw.filter(id=>!known.has(id)).forEach(id=>L.push({on:true,label:(e.massLabels||[])[mw.indexOf(id)]||id,removed:true}));return L}
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
function ask(msg,o={}){return new Promise(res=>{$('#mMsg').textContent=msg;const y=$('#mYes');y.textContent=o.yes||'ശരി';y.classList.toggle('delred',!!o.danger);$('#modal').classList.add('show');const d=v=>{$('#modal').classList.remove('show');y.textContent='ശരി';y.classList.remove('delred');res(v)};y.onclick=()=>d(true);$('#mNo').onclick=()=>d(false)})}
const scoreColor=s=>s==null?'#94a3b8':s>=85?'#15803d':s>=65?'#b45309':'#b91c1c';
const worksText=(e,en)=>{const r=(e.works||[]).map(w=>w==='other'&&e.workOther?e.workOther:(WMAP[w]?(en?WMAP[w][2]:WMAP[w][1]):w));return e.mass?`${kindText(e,en)}: `+massLabels(e,en,false).concat(r).join(', '):r.join(', ')};

function show(v){if(v==='v-set')setTimeout(renderVer,0);$$('.view').forEach(e=>e.classList.toggle('active',e.id===v));$$('nav.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.v===v));window.scrollTo(0,0);
  if(v==='v-new'&&!editing)setTimeout(()=>{},0);if(v==='v-report'&&!$('#reportOut').innerHTML)makeReport();if(v==='v-dash'&&meDoc)renderDash()}
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
/* photo kinds: before, after, and present status (ഇപ്പോഴത്തെ അവസ്ഥ). Old entries have only before/after. */
const PH_KIND={before:['📷','മുമ്പ്','Before'],after:['✨','ശേഷം','After'],present:['📍','ഇപ്പോഴത്തെ അവസ്ഥ','Present Status']};
const PH_ORDER=['before','after','present'];
const phCap=k=>{const t=PH_KIND[k]||['','',k];return `${t[0]} ${t[1]} (${t[2]})`};
const PH_NOTE_MAX=200;
const phNoteOf=p=>String(p&&p.note||'').replace(/\s+/g,' ').trim().slice(0,PH_NOTE_MAX);
const phNoteHTML=p=>{const n=phNoteOf(p);return n?`<div class="phn">${esc(n)}</div>`:''};
const phRank=k=>{const i=PH_ORDER.indexOf(k);return i<0?99:i};
const phSort=(x,z)=>phRank(x.kind)-phRank(z.kind)||(x.ts||0)-(z.ts||0);
const hasPres=e=>!!(e&&e.hasPresent);
const PH_PRIOR_ML='മുമ്പ് കാണപ്പെട്ടിരുന്ന അവസ്ഥ',PH_PRIOR_EN='Previously observed condition';
function photoStatus(e){const b=!!e.hasBefore,a=!!e.hasAfter,p=hasPres(e);
  if(b&&a)return '✅ മുമ്പും ശേഷവും ഫോട്ടോ (Before+after)'+(p?' · 📍 ഇപ്പോഴത്തെ അവസ്ഥ (Present status)':'');
  if(p&&!b&&!a)return '✅ ഇപ്പോഴത്തെ അവസ്ഥ ഫോട്ടോ (Present status)';
  if(p||b||a)return '⚠️ '+PH_PRIOR_ML+(p?' + ഇപ്പോഴത്തെ അവസ്ഥ ('+PH_PRIOR_EN+' + Present status)':' ('+PH_PRIOR_EN+')');
  return '❌ ഫോട്ടോ ഇല്ല (No photos)'}
const photoProof=e=>!!((e.hasBefore&&e.hasAfter)||e.hasPresent);
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
  $('#placesCard').style.display=can.sup()?'block':'none';$('#mwCard').style.display=can.sup()?'block':'none';$('#crCard').style.display=can.sup()?'block':'none';$('#ofCard').style.display=can.sup()?'block':'none';$('#tabFb').style.display=can.staff()?'flex':'none';$('#qrCard').style.display=can.staff()?'block':'none';$('#usersCard').style.display=can.admin()?'block':'none';$('#jdCard').style.display=can.admin()?'block':'none';
  $('#sName').value=meDoc.name||'';$('#sPhone').value=meDoc.phone||'';if(document.activeElement!==$('#sDesig'))$('#sDesig').value=meDoc.desig||'';$('#meInfo').textContent=`${me.email} · ${ROLES[r]}`;
  $('#phMode').textContent=OPT.storageEnabled?'☁️ ഫോട്ടോകൾ Firebase Storage-ൽ സൂക്ഷിക്കുന്നു (Photos stored in Cloud Storage)':'💾 ഫോട്ടോകൾ ചുരുക്കി (~200KB) ഡാറ്റാബേസിൽ സൂക്ഷിക്കുന്നു (Free-plan mode: compressed photos in Firestore)';
  $('#aboutTxt').innerHTML=`ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം (Bhadram Ee Bhoomi – Daily Cleaning) · പതിപ്പ് (version) team-3 · Firebase: ${esc(cfg.projectId)}${EMU?' (emulator)':''} · Photos: ${OPT.storageEnabled?'Storage':'Firestore (free plan)'}`;
  unsubs.push(onSnapshot(doc(db,'meta','officers'),s=>{const n=s.data()?.list;offNames=Array.isArray(n)?n.filter(x=>x&&x.id&&x.name):[];renderOffManager()},e=>console.warn('officers',e.code)));
  unsubs.push(onSnapshot(doc(db,'meta','crew'),s=>{const n=s.data()?.names;crewNames=Array.isArray(n)?n.filter(x=>x&&x.id&&x.name):[];renderCrewChips();renderCrewManager()},e=>console.warn('crew',e.code)));
  unsubs.push(onSnapshot(doc(db,'meta','massWorks'),s=>{const t=s.data()?.types;massTypes=Array.isArray(t)&&t.length?t.filter(x=>x&&x.id&&x.ml):MASS_DEFAULT.slice();renderMassChips();renderMassManager()},e=>console.warn('massWorks',e.code)));
  unsubs.push(onSnapshot(doc(db,'meta','placeTypes'),s=>{customTypes=(s.data()?.types||[]).filter(t=>t&&t.id&&t.ml);renderPlaces();fillFilters();if($('#v-dash').classList.contains('active'))renderDash()},e=>console.error('types',e)));
  unsubs.push(onSnapshot(collection(db,'places'),s=>{places=s.docs.map(d=>({id:d.id,...d.data()})).sort(placeSort);renderPlaces();if(can.staff())fillSquadPlaces()},e=>console.error(e)));
  unsubs.push(onSnapshot(collection(db,'users'),s=>{users=s.docs.map(d=>({uid:d.id,...d.data()}));renderUsers();fillFilters()},e=>console.error(e)));
  unsubs.push(onSnapshot(query(collection(db,'users',me.uid,'notifications'),orderBy('createdAt','desc'),limit(100)),s=>{
    if(notifReady)s.docChanges().forEach(c=>{if(c.type==='added'&&!c.doc.metadata.hasPendingWrites){const n=c.doc.data();toast('🔔 '+n.text,4500);try{if(Notification.permission==='granted')new Notification('ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം',{body:n.text,icon:'icon-192.png'})}catch(e){}}});
    notifReady=true;notifs=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:'estimate'})}));renderNotifs()},e=>console.error(e)));
  if(!$('#dFrom').value){const d=new Date();$('#dFrom').value=ymd(new Date(d.getFullYear(),d.getMonth(),1));$('#dTo').value=today();$('#rMonth').value=today().slice(0,7);$('#rDate').value=today()}
  subscribeEntries();resetForm();feedback=[];squadFb=[];squadLinks=[];if(can.staff()){subscribeFeedback();subscribeSquad()}
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
  {const s=$('#rPlace'),v=s.value,a=$('#rArea').value,w=$('#rWard').value;s.innerHTML='<option value="">എല്ലാ സ്ഥലവും (All places)</option>'+places.filter(p=>(!a||p.area===a)&&(!w||p.ward===w)).map(p=>`<option value="${p.id}">${esc(p.name)}${p.ward?' – '+esc(p.ward):''}${placeOffTag(p)}</option>`).join('');s.value=v}
  for(const id of ['#dType','#rType']){const s=$(id),v=s.value;s.innerHTML=typeOptions('എല്ലാ തരവും (All types)');s.value=v}
  $('#areaList').innerHTML=uniq(places.map(x=>x.area)).map(x=>`<option value="${esc(x)}">`).join('');$('#wardList').innerHTML=uniq(places.map(x=>x.ward)).map(x=>`<option value="${esc(x)}">`).join('')}
function filtered(p='d'){const ty=$(`#${p}Type`).value,a=$(`#${p}Area`).value,w=$(`#${p}Ward`).value,k=$(`#${p}Worker`).value,q=p==='d'?$('#dSearch').value.trim().toLowerCase():'';
  return entries.filter(e=>(!ty||placeTypeOf(e)===ty)&&(!a||e.area===a)&&(!w||e.ward===w)&&(!k||e.workerUid===k)&&(!q||[e.placeName,e.area,e.ward,e.workerName,e.notes,worksText(e),worksText(e,1),fmtDate(e.date)].join(' ').toLowerCase().includes(q)))}
function stats(list){const scored=list.filter(e=>e.score!=null);const avg=scored.length?Math.round(scored.reduce((s,e)=>s+e.score,0)/scored.length):null;
  const proof=list.length?Math.round(100*list.filter(e=>photoProof(e)).length/list.length):0;
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
    <div class="card dash-more">${fbDashHTML()}${sqDashHTML()}${typeDashHTML(list)}${ward}</div>`;
  if(!$('#dStats .dash-more').textContent.trim())$('#dStats .dash-more').remove();
  if(!list.length){$('#dList').innerHTML=emptyHTML('inbox','ഈ കാലയളവിൽ ജോലികൾ ഇല്ല','No entries for this period');return}
  let h='',last='';for(const e of list){if(e.date!==last){h+=`<div class="dayhead">${ico('cal','sm')} ${fmtDate(e.date)}</div>`;last=e.date}const r=RATE[e.lastRating];
    h+=`<div class="card entry" data-id="${e.id}">${e.thumb?`<img class="thumb" src="${e.thumb}" alt="">`:'<div class="thumb">🧹</div>'}<div class="info"><div class="t">📍 ${esc(e.placeName)} <span class="en">${esc(e.time||'')}</span></div><div>${kindBadge(e)}${typeBadge(placeTypeOf(e),e)}</div><div class="s">👷 ${esc(e.workerName)} · ${esc(e.ward||'')}</div>${crewOf(e).length?`<div class="s crs">👥 ${esc(crewOf(e).join(', '))}</div>`:''}<div class="s">${esc(worksText(e))}</div><div>${e.photoCount?`<span class="badge">📷 ${e.photoCount}</span>`:''}${r?`<span class="badge ${r[2]}">${r[0]}</span>`:'<span class="badge">💬 അഭിപ്രായം ബാക്കി</span>'}${e.score!=null?`<span class="badge" style="background:${scoreColor(e.score)};color:#fff">${e.score}</span>`:''}${e._pending?'<span class="badge r-ok">⏫ സിങ്ക് ബാക്കി</span>':''}</div></div><button class="epdf" data-epdf="${e.id}" aria-label="PDF – അയയ്ക്കുക / സേവ് / പ്രിൻ്റ് (Share / Save / Print)" aria-haspopup="menu" title="PDF – അയയ്ക്കുക / സേവ് / പ്രിൻ്റ്">${ico('share')}<span>PDF</span></button></div>`}
  $('#dList').innerHTML=h;$$('#dList .entry').forEach(el=>el.onclick=()=>openDetail(el.dataset.id));$$('#dList [data-epdf]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();entryPdfMenu(b.dataset.epdf,b)})}

/* ---------- places & users (admin) ---------- */
let editingPlace=null;
function placeSort(a,b){const oa=typeof a.order==='number'?a.order:1e9,ob=typeof b.order==='number'?b.order:1e9;return oa-ob||((a.area||'')+(a.ward||'')+(a.name||'')).localeCompare((b.area||'')+(b.ward||'')+(b.name||''))}
const isActivePlace=p=>p&&p.active!==false;
const activePlaces=()=>places.filter(isActivePlace);
const placeOffTag=p=>isActivePlace(p)?'':' (ഒഴിവാക്കി · removed)';
function placeRowHTML(p,i,n,on){const sub=[p.ward,p.area].filter(Boolean).map(esc).join(' · ');
  return `<div class="plrow${on?'':' off'}" data-row="${p.id}">${on?`<span class="plno">${i+1}</span>`:''}<div class="plnm"><b>${esc(p.name)}</b>${sub?` <span class="en">${sub}</span>`:''}<br>${typeBadge(p.type||'other',p)}</div>
  <div class="plbtns">${on?`<button class="btn out sm iconbtn" data-pup="${p.id}" aria-label="move up" ${i===0?'disabled':''}>${ico('up')}</button><button class="btn out sm iconbtn" data-pdn="${p.id}" aria-label="move down" ${i===n-1?'disabled':''}>${ico('down')}</button><button class="btn sec sm iconbtn" data-pedit="${p.id}" aria-label="rename / edit">${ico('edit')}</button><button class="btn out sm iconbtn warnb" data-poff="${p.id}" aria-label="remove (deactivate)">${ico('pause')}</button>`
    :`<button class="btn sec sm" data-pon="${p.id}">${ico('undo','sm')}തിരികെ <span class="en">(Restore)</span></button>${can.admin()?`<button class="btn danger sm iconbtn" data-pdel="${p.id}" aria-label="delete permanently">${ico('trash')}</button>`:''}`}</div></div>`}
function orderFix(b,act){act.forEach((p,k)=>{if(p.order!==k)b.update(doc(db,'places',p.id),{order:k,updatedBy:me.uid,updatedAt:serverTimestamp()})})}
async function movePlace(id,dir){const act=activePlaces();const i=act.findIndex(p=>p.id===id),j=i+dir;if(i<0||j<0||j>=act.length)return;
  [act[i],act[j]]=[act[j],act[i]];const b=writeBatch(db);let n=0;act.forEach((p,k)=>{if(p.order!==k){b.update(doc(db,'places',p.id),{order:k,updatedBy:me.uid,updatedAt:serverTimestamp()});n++}});
  try{await b.commit()}catch(e){toast('⚠️ '+(e.code||e.message))}}
function renderPlaces(){const sel=$('#fPlace'),cur=sel.value,ft=$('#fType').value;
  const ftv=$('#fType').value;$('#fType').innerHTML=typeOptions('🔎 എല്ലാ തരവും (All types)');$('#fType').value=ftv;
  const pv=$('#pType').value;$('#pType').innerHTML=typeOptions('-- തരം തിരഞ്ഞെടുക്കുക (Select type) --');$('#pType').value=pv;
  const selPl=places.filter(p=>isActivePlace(p)||(editing&&editing.placeId===p.id));
  const groups=allTypes().map(t=>({t,ps:selPl.filter(p=>(p.type||'other')===t.id||(t.id==='other'&&!typeById(p.type||'other')))})).filter(g=>g.ps.length&&(!ft||g.t.id===ft));
  sel.innerHTML='<option value="">-- സ്ഥലം തിരഞ്ഞെടുക്കുക (Select place) --</option>'+groups.map(g=>`<optgroup label="${g.t.icon} ${esc(g.t.ml)}${g.t.en?' ('+esc(g.t.en)+')':''}">${g.ps.map(p=>`<option value="${p.id}">${esc(p.name)}${p.ward?' – '+esc(p.ward):''}${p.area?' ('+esc(p.area)+')':''}${p.typeOther?' · '+esc(p.typeOther):''}${placeOffTag(p)}</option>`).join('')}</optgroup>`).join('');
  sel.value=cur;if(sel.value!==cur)sel.value='';syncMassForm();if(cur==='__oneoff'){sel.value=cur;syncMassForm()}
  $('#fPlaceHint').textContent=activePlaces().length?'':(can.sup()?'⚙️ ക്രമീകരണത്തിൽ സ്ഥലങ്ങൾ ചേർക്കുക (Add places in Settings)':'സൂപ്പർവൈസർ സ്ഥലങ്ങൾ ചേർക്കണം (Supervisor must add places)');
  {const act=activePlaces(),off=places.filter(p=>!isActivePlace(p));
  $('#pList').innerHTML=act.map((p,k)=>placeRowHTML(p,k,act.length,true)).join('')||'<p class="hint">ഇതുവരെ ഇല്ല – മുകളിൽ ചേർക്കുക (none yet – add above)</p>';
  $('#pCount').textContent=act.length;$('#pOffCount').textContent=off.length;$('#pOffWrap').style.display=off.length?'block':'none';
  $('#pOffList').innerHTML=off.map(p=>placeRowHTML(p,0,0,false)).join('')}
  $('#ctDetails').style.display=can.admin()?'block':'none';
  $('#ctList').innerHTML=customTypes.map(t=>`<span>${t.icon} ${esc(t.ml)} ${t.en?'('+esc(t.en)+')':''}<button data-ctdel="${t.id}" title="remove">✕</button></span>`).join('');
  $$('[data-ctdel]').forEach(b=>b.onclick=async()=>{const t=customTypes.find(x=>x.id===b.dataset.ctdel);if(!await ask(`"${t.ml}" തരം നീക്കണോ? (Remove type?) – ഈ തരത്തിലുള്ള സ്ഥലങ്ങൾ "മറ്റുള്ളവ" ആയി കാണിക്കും.`))return;
    setDoc(doc(db,'meta','placeTypes'),{types:customTypes.filter(x=>x.id!==t.id),updatedBy:me.uid,updatedAt:serverTimestamp()}).catch(e=>toast('⚠️ '+e.code))});
  renderQRList();renderFeedback();
  $$('#pList [data-pedit]').forEach(b=>b.onclick=()=>{const p=places.find(x=>x.id===b.dataset.pedit);editingPlace=p;$('#pArea').value=p.area||'';$('#pWard').value=p.ward||'';$('#pName').value=p.name||'';
    $('#pType').value=typeById(p.type)?p.type:(p.type?'other':'');$('#pTypeOther').value=p.typeOther||'';$('#pTypeOther').style.display=$('#pType').value==='other'?'block':'none';
    $('#pAdd').innerHTML=ico('save')+'മാറ്റം സേവ് <span class="en">(Save place)</span>';$('#pCancel').style.display='flex';$('#pEditName').textContent=p.name||'';$('#pEditHint').style.display='block';$('#pName').scrollIntoView({block:'center'})});
  $$('#pList [data-pup]').forEach(b=>b.onclick=()=>movePlace(b.dataset.pup,-1));$$('#pList [data-pdn]').forEach(b=>b.onclick=()=>movePlace(b.dataset.pdn,1));
  $$('#pList [data-poff]').forEach(b=>b.onclick=async()=>{const p=places.find(x=>x.id===b.dataset.poff);
    if(!await ask(`"${p.name}" ലിസ്റ്റിൽ നിന്ന് ഒഴിവാക്കണോ? (Remove from list?)\nപുതിയ എൻട്രികൾക്ക് കാണിക്കില്ല. പഴയ എൻട്രികളും റിപ്പോർട്ടുകളും അതേപടി നിലനിൽക്കും; പിന്നീട് തിരികെ ചേർക്കാം. (Hidden for new entries; old entries & reports stay; can be restored.)`))return;
    if(editingPlace?.id===p.id)resetPlaceForm();
    updateDoc(doc(db,'places',p.id),{active:false,removedAt:serverTimestamp(),updatedBy:me.uid,updatedAt:serverTimestamp()}).then(()=>toast('⏸ ഒഴിവാക്കി (Removed) – '+p.name)).catch(e=>toast('⚠️ '+e.code))});
  $$('#pOffList [data-pon]').forEach(b=>b.onclick=()=>{const p=places.find(x=>x.id===b.dataset.pon);
    const act=activePlaces(),bt=writeBatch(db);orderFix(bt,act);bt.update(doc(db,'places',p.id),{active:true,order:act.length,updatedBy:me.uid,updatedAt:serverTimestamp()});bt.commit().then(()=>toast('✅ തിരികെ ചേർത്തു (Restored) – '+p.name)).catch(e=>toast('⚠️ '+e.code))});
  $$('#pOffList [data-pdel]').forEach(b=>b.onclick=async()=>{const p=places.find(x=>x.id===b.dataset.pdel);
    if(!await ask(`"${p.name}" സ്ഥിരമായി ഡിലീറ്റ് ചെയ്യണോ? (Delete permanently?)\nപഴയ എൻട്രികൾ ഡിലീറ്റ് ആകില്ല, പക്ഷേ ഈ സ്ഥലം വീണ്ടും തിരികെ ചേർക്കാൻ കഴിയില്ല. (Old entries are kept, but this cannot be undone.)`))return;
    deleteDoc(doc(db,'places',p.id)).then(()=>toast('🗑️ ഡിലീറ്റ് ചെയ്തു (Deleted)')).catch(e=>toast('⚠️ '+e.code))});
  fillFilters()}
$('#fType').onchange=renderPlaces;
$('#pType').onchange=()=>{$('#pTypeOther').style.display=$('#pType').value==='other'?'block':'none'};
function resetPlaceForm(){editingPlace=null;$('#pName').value='';$('#pType').value='';$('#pTypeOther').value='';$('#pTypeOther').style.display='none';$('#pAdd').innerHTML=ico('plus')+'ചേർക്കുക <span class="en">(Add place)</span>';$('#pCancel').style.display='none';$('#pEditHint').style.display='none'}
$('#pCancel').onclick=resetPlaceForm;
$('#pAdd').onclick=async()=>{const area=$('#pArea').value.trim(),ward=$('#pWard').value.trim(),name=$('#pName').value.trim(),type=$('#pType').value;if(!name)return toast('⚠️ സ്ഥലത്തിൻ്റെ പേര് നൽകുക (Enter place name)');
  if(!type)return toast('⚠️ തരം തിരഞ്ഞെടുക്കുക (Select a type)');const t=typeById(type);
  const data={area,ward,name,type,typeOther:type==='other'?$('#pTypeOther').value.trim().slice(0,60):'',typeLabel:t.ml,typeIcon:t.icon};
  try{if(editingPlace){updateDoc(doc(db,'places',editingPlace.id),{...data,updatedBy:me.uid,updatedAt:serverTimestamp()}).catch(e=>toast('⚠️ '+e.code));toast('✅ മാറ്റം സേവ് ചെയ്തു (Saved)')}
    else{const act=activePlaces(),b=writeBatch(db);orderFix(b,act);b.set(doc(collection(db,'places')),{...data,active:true,order:act.length,createdBy:me.uid,createdAt:serverTimestamp()});b.commit().catch(e=>toast('⚠️ '+e.code));toast('✅ ചേർത്തു (Added)')}resetPlaceForm()}catch(e){toast('⚠️ '+e.message)}};
$('#ctAdd').onclick=()=>{const ml=$('#ctMl').value.trim(),en=$('#ctEn').value.trim(),icon=$('#ctIcon').value.trim()||'🏷️';if(!ml)return toast('⚠️ മലയാളം പേര് നൽകുക');
  const id='c_'+Date.now().toString(36);setDoc(doc(db,'meta','placeTypes'),{types:[...customTypes,{id,icon:icon.slice(0,4),ml:ml.slice(0,40),en:en.slice(0,40)}],updatedBy:me.uid,updatedAt:serverTimestamp()}).then(()=>toast('✅ തരം ചേർത്തു (Type added)')).catch(e=>toast('⚠️ '+e.code));
  $('#ctMl').value='';$('#ctEn').value='';$('#ctIcon').value=''};
/* mass work types manager (Settings) */
let editingMass=null;
function saveMass(next,msg){setDoc(doc(db,'meta','massWorks'),{types:next.map(t=>({id:t.id,icon:t.icon||'',ml:t.ml,en:t.en||'',active:t.active!==false})),updatedBy:me.uid,updatedAt:serverTimestamp()}).catch(e=>toast('⚠️ '+(e.code||e.message)));if(msg)toast(msg)}
function resetMassForm(){editingMass=null;['#mwIcon','#mwMl','#mwEn'].forEach(s=>$(s).value='');$('#mwAdd').innerHTML=ico('plus')+'ജോലി ചേർക്കുക <span class="en">(Add work type)</span>';$('#mwCancel').style.display='none';$('#mwEditHint').style.display='none'}
function renderMassManager(){if(!$('#mwList')||!can.sup())return;const act=activeMass(),off=massTypes.filter(t=>t.active===false);
  const row=(t,i,n,on)=>`<div class="plrow${on?'':' off'}" data-mrow="${esc(t.id)}">${on?`<span class="plno">${i+1}</span>`:''}<div class="plnm"><b>${t.icon?esc(t.icon)+' ':''}${esc(t.ml)}</b>${t.en?` <span class="en">${esc(t.en)}</span>`:''}</div><div class="plbtns">${on?`<button class="btn out sm iconbtn" data-mup="${esc(t.id)}" aria-label="move up"${i===0?' disabled':''}>${ico('up')}</button><button class="btn out sm iconbtn" data-mdn="${esc(t.id)}" aria-label="move down"${i===n-1?' disabled':''}>${ico('down')}</button><button class="btn sec sm iconbtn" data-medit="${esc(t.id)}" aria-label="rename">${ico('edit')}</button><button class="btn out sm iconbtn warnb" data-moff="${esc(t.id)}" aria-label="remove">${ico('pause')}</button>`:`<button class="btn sec sm" data-mon="${esc(t.id)}">${ico('undo','sm')}തിരികെ <span class="en">(Restore)</span></button>`}</div></div>`;
  $('#mwList').innerHTML=act.map((t,i)=>row(t,i,act.length,true)).join('')||'<p class="hint">ഇല്ല – മുകളിൽ ചേർക്കുക (none – add above)</p>';$('#mwOffList').innerHTML=off.map(t=>row(t,0,0,false)).join('');
  $('#mwCount').textContent=act.length;$('#mwOffCount').textContent=off.length;$('#mwOffWrap').style.display=off.length?'block':'none';
  const mv=(id,d)=>{const a=activeMass(),i=a.findIndex(t=>t.id===id),j=i+d;if(i<0||j<0||j>=a.length)return;const next=massTypes.slice(),x=next.indexOf(a[i]),y=next.indexOf(a[j]);[next[x],next[y]]=[next[y],next[x]];saveMass(next)};
  $$('#mwList [data-mup]').forEach(b=>b.onclick=()=>mv(b.dataset.mup,-1));$$('#mwList [data-mdn]').forEach(b=>b.onclick=()=>mv(b.dataset.mdn,1));
  $$('#mwList [data-medit]').forEach(b=>b.onclick=()=>{const t=massById(b.dataset.medit);editingMass=t;$('#mwIcon').value=t.icon||'';$('#mwMl').value=t.ml;$('#mwEn').value=t.en||'';
    $('#mwAdd').innerHTML=ico('save')+'മാറ്റം സേവ് <span class="en">(Save)</span>';$('#mwCancel').style.display='flex';$('#mwEditName').textContent=t.ml;$('#mwEditHint').style.display='block';$('#mwMl').scrollIntoView({block:'center'})});
  $$('#mwList [data-moff]').forEach(b=>b.onclick=async()=>{const t=massById(b.dataset.moff);if(!await ask(`"${t.ml}" ലിസ്റ്റിൽ നിന്ന് ഒഴിവാക്കണോ? (Remove from list?)\nപുതിയ എൻട്രികൾക്ക് കാണിക്കില്ല. പഴയ എൻട്രികളും റിപ്പോർട്ടുകളും അതേപടി നിലനിൽക്കും; പിന്നീട് തിരികെ ചേർക്കാം. (Hidden for new entries; old entries keep it; can be restored.)`))return;
    if(editingMass?.id===t.id)resetMassForm();saveMass(massTypes.map(x=>x.id===t.id?{...x,active:false}:x),'⏸ ഒഴിവാക്കി (Removed) – '+t.ml)});
  $$('#mwOffList [data-mon]').forEach(b=>b.onclick=()=>{const t=massById(b.dataset.mon);saveMass(massTypes.map(x=>x.id===t.id?{...x,active:true}:x),'✅ തിരികെ ചേർത്തു (Restored) – '+t.ml)})}
$('#mwCancel').onclick=resetMassForm;
$('#mwAdd').onclick=()=>{const ml=$('#mwMl').value.trim(),en=$('#mwEn').value.trim(),icon=$('#mwIcon').value.trim();if(!ml)return toast('⚠️ ജോലിയുടെ പേര് (മലയാളം) നൽകുക');
  if(massTypes.some(t=>t.ml===ml&&t.id!==editingMass?.id))return toast('⚠️ ഈ ജോലി ലിസ്റ്റിൽ ഉണ്ട് (Already in the list)');
  if(editingMass){const id=editingMass.id;saveMass(massTypes.map(x=>x.id===id?{...x,ml,en,icon}:x),'✅ മാറ്റം സേവ് ചെയ്തു (Saved)')}
  else saveMass([...massTypes,{id:'mw_'+Date.now().toString(36),icon:icon||'🧹',ml,en,active:true}],'✅ ചേർത്തു (Added)');resetMassForm()};
/* workers' names manager (Settings) – admin/supervisor */
let editingCrew=null;
function saveCrew(next,msg){setDoc(doc(db,'meta','crew'),{names:next.map(c=>({id:c.id,name:c.name,active:c.active!==false})),updatedBy:me.uid,updatedAt:serverTimestamp()}).catch(e=>toast('⚠️ '+(e.code||e.message)));if(msg)toast(msg)}
function resetCrewForm(){editingCrew=null;$('#crName').value='';$('#crAdd').innerHTML=ico('plus')+'പേര് ചേർക്കുക <span class="en">(Add name)</span>';$('#crCancel').style.display='none';$('#crEditHint').style.display='none'}
function renderCrewManager(){if(!$('#crList')||!can.sup())return;const act=activeCrew(),off=crewNames.filter(c=>c.active===false);
  const row=(c,i,n,on)=>`<div class="plrow${on?'':' off'}">${on?`<span class="plno">${i+1}</span>`:''}<div class="plnm"><b>${esc(c.name)}</b></div><div class="plbtns">${on?`<button class="btn out sm iconbtn" data-cup="${esc(c.id)}" aria-label="move up"${i===0?' disabled':''}>${ico('up')}</button><button class="btn out sm iconbtn" data-cdn="${esc(c.id)}" aria-label="move down"${i===n-1?' disabled':''}>${ico('down')}</button><button class="btn sec sm iconbtn" data-cedit="${esc(c.id)}" aria-label="rename">${ico('edit')}</button><button class="btn out sm iconbtn warnb" data-coff="${esc(c.id)}" aria-label="remove">${ico('pause')}</button>`:`<button class="btn sec sm" data-con="${esc(c.id)}">${ico('undo','sm')}തിരികെ <span class="en">(Restore)</span></button>`}</div></div>`;
  $('#crList').innerHTML=act.map((c,i)=>row(c,i,act.length,true)).join('')||'<p class="hint">ഇല്ല – മുകളിൽ ചേർക്കുക (none – add above)</p>';$('#crOffList').innerHTML=off.map(c=>row(c,0,0,false)).join('');
  $('#crCount').textContent=act.length;$('#crOffCount').textContent=off.length;$('#crOffWrap').style.display=off.length?'block':'none';
  const mv=(id,d)=>{const a=activeCrew(),i=a.findIndex(c=>c.id===id),j=i+d;if(i<0||j<0||j>=a.length)return;const next=crewNames.slice(),x=next.indexOf(a[i]),y=next.indexOf(a[j]);[next[x],next[y]]=[next[y],next[x]];saveCrew(next)};
  $$('#crList [data-cup]').forEach(b=>b.onclick=()=>mv(b.dataset.cup,-1));$$('#crList [data-cdn]').forEach(b=>b.onclick=()=>mv(b.dataset.cdn,1));
  $$('#crList [data-cedit]').forEach(b=>b.onclick=()=>{const c=crewById(b.dataset.cedit);editingCrew=c;$('#crName').value=c.name;
    $('#crAdd').innerHTML=ico('save')+'മാറ്റം സേവ് <span class="en">(Save)</span>';$('#crCancel').style.display='flex';$('#crEditName').textContent=c.name;$('#crEditHint').style.display='block';$('#crName').scrollIntoView({block:'center'})});
  $$('#crList [data-coff]').forEach(b=>b.onclick=async()=>{const c=crewById(b.dataset.coff);if(!await ask(`"${c.name}" ലിസ്റ്റിൽ നിന്ന് ഒഴിവാക്കണോ? (Remove from list?)\nപുതിയ എൻട്രികൾക്ക് കാണിക്കില്ല. പഴയ എൻട്രികളിലും റിപ്പോർട്ടുകളിലും പേര് നിലനിൽക്കും; പിന്നീട് തിരികെ ചേർക്കാം. (Hidden for new entries; old entries keep the name; can be restored.)`))return;
    if(editingCrew?.id===c.id)resetCrewForm();saveCrew(crewNames.map(x=>x.id===c.id?{...x,active:false}:x),'⏸ ഒഴിവാക്കി (Removed) – '+c.name)});
  $$('#crOffList [data-con]').forEach(b=>b.onclick=()=>{const c=crewById(b.dataset.con);saveCrew(crewNames.map(x=>x.id===c.id?{...x,active:true}:x),'✅ തിരികെ ചേർത്തു (Restored) – '+c.name)})}
$('#crCancel').onclick=resetCrewForm;
$('#crAdd').onclick=()=>{const name=$('#crName').value.trim().replace(/\s+/g,' ').slice(0,80);if(!name)return toast('⚠️ തൊഴിലാളിയുടെ പേര് നൽകുക (Type a name)');
  if(crewNames.some(c=>c.name.toLowerCase()===name.toLowerCase()&&c.id!==editingCrew?.id))return toast('⚠️ ഈ പേര് ലിസ്റ്റിൽ ഉണ്ട് (Already in the list)');
  if(crewNames.length>=300&&!editingCrew)return toast('⚠️ പരമാവധി 300 പേര് (Max 300 names)');
  if(editingCrew){const id=editingCrew.id;saveCrew(crewNames.map(x=>x.id===id?{...x,name}:x),'✅ മാറ്റം സേവ് ചെയ്തു (Saved)')}
  else saveCrew([...crewNames,{id:'w_'+Date.now().toString(36),name,active:true}],'✅ ചേർത്തു (Added) – '+name);resetCrewForm()};
$('#crName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#crAdd').click()}});
/* ---------- officers' evaluation ("ഓഫീസർമാരുടെ പ്രവർത്തനങ്ങളുടെ വിലയിരുത്തൽ") – one review per date (reviews/{YYYY-MM-DD}); officer list in meta/officers ---------- */
const RV_H1='തിരുവനന്തപുരം നഗരസഭ, പബ്ലിക് ഹെൽത്ത് ഇൻസ്പെക്ടർ ഓഫീസ്, സെക്രട്ടേറിയറ്റ് സർക്കിൾ';
const RV_H2='പൊതുജനങ്ങൾക്ക് വേണ്ടി, ഇന്ന് നടത്തിയ ശുചീകരണ പ്രവർത്തന സേവനങ്ങളിൽ, മേൽനോട്ടം വഹിച്ച ഈ സർക്കിളിലെ ഓഫീസർമാരുടെ പ്രവർത്തനങ്ങളുടെ വിലയിരുത്തൽ';
const RV_C=['ശുചീകരണ പ്രവർത്തനങ്ങളുടെ പ്രാധാന്യം (priority) അനുസരിച്ച് ആദ്യം ചെയ്ത് തീർക്കേണ്ട ജോലികളുടെ ആസൂത്രണം',
  'ചെയ്യാൻ പോകുന്ന ശുചീകരണ പ്രവർത്തനങ്ങളുടെ പ്രാധാന്യം, ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ തുടങ്ങിയ കാര്യങ്ങളെക്കുറിച്ച് സാനിട്ടേഷൻ വർക്കർമാരോട് പറഞ്ഞു മനസ്സിലാക്കി കൊടുക്കൽ',
  'ബന്ധപ്പെട്ട സ്ഥലത്ത് ശുചീകരണം നടത്താൻ ആവശ്യമായ സാനിട്ടേഷൻ വർക്കർമാരുടെ എണ്ണത്തിൽ ഉള്ള ക്രമീകരണം',
  'ശുചീകരണം നടത്തേണ്ട സ്ഥലങ്ങളിലെ സാനിട്ടേഷൻ വർക്കർമാർക്ക് ശുചീകരണ പ്രവർത്തനങ്ങൾ നടത്തുവാൻ ആവശ്യമായ ടൂൾസ്, ചാക്കുകൾ, ഗ്ലൗസ്, മാസ്ക് തുടങ്ങിയവ ഉറപ്പാക്കൽ',
  'ശുചീകരണ പ്രവർത്തനങ്ങളുടെ മേൽനോട്ടം, ഏകോപനം, തുല്യ നീതി'];
const RV_G='വളരെ മികച്ചത്',RV_P='നിലവാരമില്ലാത്തത്',RV_MIN=5;
let offNames=[];const offById=id=>offNames.find(o=>o.id===id);const activeOff=()=>offNames.filter(o=>o.active!==false);
const dmy=d=>(d||'').split('-').reverse().join('/');
async function getReview(d){if(!d)return null;try{const s=await getDoc(doc(db,'reviews',d));return s.exists()?s.data({serverTimestamps:'estimate'}):null}catch(e){console.warn('review',e.code);return null}}
async function getMonthReviews(m){try{const s=await getDocs(query(collection(db,'reviews'),where('date','>=',m+'-01'),where('date','<=',m+'-31')));return s.docs.map(d=>d.data({serverTimestamps:'estimate'})).sort((a,b)=>a.date.localeCompare(b.date))}catch(e){console.warn('reviews',e.code);return []}}
const rvOfficers=r=>(r?.officers||[]).filter(o=>o&&(o.name||'').trim());
const rvCrit=r=>RV_C.map((_,i)=>{const c=(r?.crit||[])[i]||{};return {v:c.v==='good'||c.v==='poor'?c.v:'',why:String(c.why||'')}});
const rvBox=on=>`<span class="rv-bx${on?' on':''}">${on?'✓':''}</span>`;
const rvHead=(sub)=>`<div class="rv-h"><b>${RV_H1}</b><div class="rv-h2">${RV_H2}</div><div class="rv-dt">${sub}</div></div>`;
/* PDF / print block for one day (blank boxes + lines when not filled, for pen filling) */
function reviewPdfHTML(r,d){const of=rvOfficers(r);const n=Math.max(RV_MIN,of.length);const cr=rvCrit(r);
  const orows=Array.from({length:n},(_,i)=>{const o=of[i];return `<tr><td class="rvn">${i+1}</td><td>${o?esc(o.name):''}</td><td>${o?esc(o.desig||''):''}</td></tr>`}).join('');
  const crows=cr.map((c,i)=>`<tr><td class="rvn">${i+1}</td><td class="rvq">${RV_C[i]}</td><td class="rvx">${rvBox(c.v==='good')}</td><td class="rvx">${rvBox(c.v==='poor')}</td><td class="rvw">${esc(c.why)}</td></tr>`).join('');
  return `${rvHead(`തീയതി <i>Date</i>: <b>${d?dmy(d):'____ / ____ / ________'}</b>`)}
  <div class="rp-sub rv-sub">മേൽനോട്ടം വഹിച്ച ഓഫീസർമാർ <span class="en">(Supervising officers)</span></div>
  <table class="rp-tbl rv-of"><tr><th class="rvn">ക്രമ നം.</th><th>പേര് <i>Name</i></th><th>തസ്തിക <i>Designation</i></th></tr>${orows}</table>
  <div class="rp-sub rv-sub">വിലയിരുത്തൽ <span class="en">(Evaluation – tick one per item)</span></div>
  <table class="rp-tbl rv-ct"><tr><th class="rvn">നം.</th><th>വിഷയം <i>Item</i></th><th class="rvx">${RV_G}</th><th class="rvx">${RV_P}</th><th class="rvw">കാരണം <i>Reason</i></th></tr>${crows}</table>
  <div class="rv-by">${r&&r.byName?`വിലയിരുത്തിയത് <i>Evaluated by</i>: <b>${esc(r.byName)}</b>${r.updatedAt?.toDate?' · '+fmtGen(r.updatedAt.toDate()):''}`:'വിലയിരുത്തിയത് <i>Evaluated by</i>: <span class="sg-line"></span>'}</div>`}
/* monthly: the month's daily reviews summarised; blank form when none */
function reviewMonthHTML(list,m){if(!list.length)return reviewPdfHTML(null,'').replace('തീയതി <i>Date</i>: <b>____ / ____ / ________</b>',`മാസം <i>Month</i>: <b>${esc(fmtMonth(m))}</b> · തീയതി <i>Date</i>: ____ / ____ / ________`);
  const om=new Map();list.forEach(r=>rvOfficers(r).forEach(o=>{const k=o.name.trim().toLowerCase();const x=om.get(k)||{name:o.name.trim(),desig:o.desig||'',days:0};x.days++;if(!x.desig&&o.desig)x.desig=o.desig;om.set(k,x)}));
  const ofs=[...om.values()];const n=Math.max(RV_MIN,ofs.length);
  const orows=Array.from({length:n},(_,i)=>{const o=ofs[i];return `<tr><td class="rvn">${i+1}</td><td>${o?esc(o.name):''}</td><td>${o?esc(o.desig):''}</td><td class="rvx">${o?o.days:''}</td></tr>`}).join('');
  const crows=RV_C.map((q,i)=>{let g=0,p=0;const why=[];list.forEach(r=>{const c=rvCrit(r)[i];if(c.v==='good')g++;if(c.v==='poor')p++;if(c.why.trim())why.push(`${dmy(r.date).slice(0,5)}: ${esc(c.why.trim())}`)});
    return `<tr><td class="rvn">${i+1}</td><td class="rvq">${q}</td><td class="rvx"><b>${g}</b></td><td class="rvx"><b>${p}</b></td><td class="rvw">${why.join('<br>')}</td></tr>`}).join('');
  return `${rvHead(`മാസം <i>Month</i>: <b>${esc(fmtMonth(m))}</b> · വിലയിരുത്തിയ ദിവസങ്ങൾ <i>Days evaluated</i>: <b>${list.length}</b>`)}
  <div class="rp-sub rv-sub">മേൽനോട്ടം വഹിച്ച ഓഫീസർമാർ <span class="en">(Supervising officers)</span></div>
  <table class="rp-tbl rv-of"><tr><th class="rvn">ക്രമ നം.</th><th>പേര് <i>Name</i></th><th>തസ്തിക <i>Designation</i></th><th class="rvx">ദിവസങ്ങൾ <i>Days</i></th></tr>${orows}</table>
  <div class="rp-sub rv-sub">വിലയിരുത്തൽ – ദിവസങ്ങളുടെ എണ്ണം <span class="en">(Evaluation – number of days)</span></div>
  <table class="rp-tbl rv-ct"><tr><th class="rvn">നം.</th><th>വിഷയം <i>Item</i></th><th class="rvx">${RV_G}</th><th class="rvx">${RV_P}</th><th class="rvw">കാരണം <i>Reason</i></th></tr>${crows}</table>
  <div class="rv-by">ദിവസങ്ങൾ <i>Dates</i>: ${list.map(r=>dmy(r.date).slice(0,5)).join(', ')}</div>`}
/* Reports tab card: read view for everyone, editor for admin/supervisor */
let rvCur=null,rvEditing=false,rvTok=0;
async function renderReviewCard(){const box=$('#rvBody');if(!box)return;const tok=++rvTok;
  if(rMode!=='day'){const m=$('#rMonth').value||today().slice(0,7);$('#rvTitleSub').textContent=fmtMonth(m);box.innerHTML='<p class="hint">…</p>';const L=await getMonthReviews(m);if(tok!==rvTok)return;
    box.innerHTML=`<p class="hint" style="margin-top:0">📄 മാസ PDF-ൽ ഈ മാസത്തെ വിലയിരുത്തലുകളുടെ സംഗ്രഹം ഉണ്ടാകും <span class="en">(The monthly PDF includes a summary of this month's evaluations)</span></p>`+(L.length?`<div class="rv-sum">${RV_C.map((q,i)=>{let g=0,p=0;L.forEach(r=>{const c=rvCrit(r)[i];if(c.v==='good')g++;if(c.v==='poor')p++});return `<div class="rv-sr"><span class="rvq"><b>${i+1}.</b> ${q}</span><span class="rv-cnt"><span class="g">✓ ${RV_G}: ${g}</span><span class="p">✗ ${RV_P}: ${p}</span></span></div>`}).join('')}</div><p class="hint">🗓️ ${L.length} ദിവസം <span class="en">(days)</span>: ${L.map(r=>dmy(r.date).slice(0,5)).join(', ')}</p>`:'<p class="hint">ഈ മാസം വിലയിരുത്തൽ ഇല്ല – PDF-ൽ ശൂന്യ ഫോം (blank form for pen filling)</p>');$('#rvEdit').style.display='none';return}
  const d=$('#rDate').value||today();$('#rvTitleSub').textContent=fmtDate(d);if(rvEditing)return;box.innerHTML='<p class="hint">…</p>';
  const r=await getReview(d);if(tok!==rvTok)return;rvCur={d,r};
  $('#rvEdit').style.display=can.sup()?'flex':'none';$('#rvEdit').innerHTML=ico('edit')+(r?'മാറ്റം വരുത്തുക <span class="en">(Edit)</span>':'പൂരിപ്പിക്കുക <span class="en">(Fill in)</span>');
  if(!r){box.innerHTML=`<p class="hint" style="margin:0">⏳ ഈ ദിവസം വിലയിരുത്തൽ പൂരിപ്പിച്ചിട്ടില്ല. <span class="en">(Not filled for this day – PDFs show a blank form for pen filling.)</span></p>`;return}
  box.innerHTML=rvReadHTML(r)}
function rvRowHTML(o,i){return `<div class="rvo"><span class="no">${i+1}</span><div class="rvo-f"><input type="text" class="rvn" maxlength="80" list="offDl" placeholder="പേര് (Name)" value="${esc(o?.name||'')}"><input type="text" class="rvd" maxlength="80" list="offDesDl" placeholder="തസ്തിക (Designation)" value="${esc(o?.desig||'')}"></div></div>`}
/* shared review editor pieces (Reports card + entry form) */
function rvReadHTML(r){const of=rvOfficers(r),cr=rvCrit(r);
  return `<div class="rv-ofl">${of.map((o,i)=>`<div class="rv-or"><span class="no">${i+1}</span><span><b>${esc(o.name)}</b>${o.desig?` <span class="en">· ${esc(o.desig)}</span>`:''}</span></div>`).join('')||'<p class="hint">ഓഫീസർമാരുടെ പേര് ഇല്ല (no officers)</p>'}</div>
    ${cr.map((c,i)=>`<div class="rv-sr"><span class="rvq"><b>${i+1}.</b> ${RV_C[i]}</span><span class="rv-cnt">${c.v==='good'?`<span class="g">✓ ${RV_G}</span>`:c.v==='poor'?`<span class="p">✗ ${RV_P}</span>`:'<span class="n">— ടിക്ക് ഇല്ല (not ticked)</span>'}</span>${c.why?`<span class="rv-why">കാരണം <span class="en">(Reason)</span>: ${esc(c.why)}</span>`:''}</div>`).join('')}
    <p class="hint" style="margin:8px 0 0">✍️ ${esc(r.byName||'')}${r.updatedAt?.toDate?' · '+fmtGen(r.updatedAt.toDate()):''}</p>`}
function rvEditorHTML(d,r,pfx){const base=r?rvOfficers(r):activeOff().map(o=>({id:o.id,name:o.name,desig:o.desig||''}));const rows=base.concat(Array(Math.max(0,RV_MIN-base.length)).fill(null));const cr=rvCrit(r);
  $('#offDl').innerHTML=activeOff().map(o=>`<option value="${esc(o.name)}">`).join('');fillDesDl();
  return `<p class="hint" style="margin-top:0">🗓️ <b>${fmtDate(d)}</b> – ഓഫീസർമാരുടെ പേരും തസ്തികയും <span class="en">(officers' names & designations)</span></p>
    <div id="${pfx}Rows" class="rvRows">${rows.map(rvRowHTML).join('')}</div>
    <button class="btn out sm rvAddRow" id="${pfx}AddRow" type="button">${ico('plus','sm')}വരി ചേർക്കുക <span class="en">(Add row)</span></button>
    <div class="rv-crit">${cr.map((c,i)=>`<div class="rvc" data-i="${i}"><div class="rvq"><b>${i+1}.</b> ${RV_C[i]}</div><div class="rvt"><label class="mwc rvg${c.v==='good'?' on':''}"><input type="checkbox" data-v="good"${c.v==='good'?' checked':''}><span class="mwbx"></span><span>${RV_G}</span></label><label class="mwc rvp${c.v==='poor'?' on':''}"><input type="checkbox" data-v="poor"${c.v==='poor'?' checked':''}><span class="mwbx"></span><span>${RV_P}</span></label></div><textarea class="rvw" rows="2" maxlength="300" placeholder="കാരണം (Reason)">${esc(c.why)}</textarea></div>`).join('')}</div>`}
function bindRvEditor(root){const rowsEl=root.querySelector('.rvRows');
  root.querySelector('.rvAddRow').onclick=()=>{const n=rowsEl.querySelectorAll('.rvo').length;if(n>=40)return toast('⚠️ പരമാവധി 40 (Max 40)');rowsEl.insertAdjacentHTML('beforeend',rvRowHTML(null,n));[...rowsEl.querySelectorAll('.rvn')].at(-1).focus();root.dispatchEvent(new Event('input',{bubbles:true}))};
  rowsEl.addEventListener('change',e=>{if(!e.target.classList.contains('rvn'))return;const o=activeOff().find(x=>x.name.toLowerCase()===e.target.value.trim().toLowerCase());const dz=e.target.closest('.rvo').querySelector('.rvd');if(o&&o.desig&&!dz.value.trim())dz.value=o.desig});
  root.querySelectorAll('.rvc').forEach(c=>c.addEventListener('change',e=>{const t=e.target;if(t.type!=='checkbox')return;if(t.checked)c.querySelectorAll('input[type=checkbox]').forEach(x=>{if(x!==t)x.checked=false});c.querySelectorAll('.mwc').forEach(l=>l.classList.toggle('on',l.querySelector('input').checked))}))}
function collectRv(root){const officers=[...root.querySelectorAll('.rvRows .rvo')].map(x=>({name:x.querySelector('.rvn').value.trim().replace(/\s+/g,' ').slice(0,80),desig:x.querySelector('.rvd').value.trim().replace(/\s+/g,' ').slice(0,80)})).filter(o=>o.name).map(o=>{const m=offNames.find(x=>x.name.toLowerCase()===o.name.toLowerCase());return m?{id:m.id,...o}:o});
  const crit=[...root.querySelectorAll('.rvc')].map(c=>({v:c.querySelector('input[data-v=good]').checked?'good':c.querySelector('input[data-v=poor]').checked?'poor':'',why:c.querySelector('.rvw').value.trim().slice(0,300)}));
  return {officers,crit,empty:!officers.length&&!crit.some(c=>c.v||c.why)}}
const saveRv=(d,v)=>setDoc(doc(db,'reviews',d),{date:d,officers:v.officers,crit:v.crit,by:me.uid,byName:meDoc.name||me.email||'',updatedAt:serverTimestamp()});
function openReviewEditor(){if(!can.sup()||!rvCur)return;rvEditing=true;const {d,r}=rvCur;
  $('#rvEdit').style.display='none';
  $('#rvBody').innerHTML=rvEditorHTML(d,r,'rv')+`<div class="row" style="margin-top:12px"><button class="btn out" id="rvCancel" type="button">${ico('x')}റദ്ദാക്കുക</button><button class="btn block" id="rvSave" type="button">${ico('save')}സേവ് ചെയ്യുക <span class="en">(Save)</span></button></div>
    ${r?`<button class="btn out sm" id="rvClear" type="button" style="margin-top:10px">${ico('trash','sm')}ഈ ദിവസത്തെ വിലയിരുത്തൽ മായ്ക്കുക <span class="en">(Clear)</span></button>`:''}`;
  bindRvEditor($('#rvBody'));
  $('#rvCancel').onclick=()=>{rvEditing=false;renderReviewCard()};
  $('#rvSave').onclick=async()=>{const v=collectRv($('#rvBody'));if(v.empty)return toast('⚠️ ഒന്നും പൂരിപ്പിച്ചിട്ടില്ല (Nothing filled)');
    const b=$('#rvSave');b.disabled=true;try{await saveRv(d,v);toast('✅ വിലയിരുത്തൽ സേവ് ചെയ്തു (Evaluation saved)');rvEditing=false;resetPdfBtn();renderReviewCard()}catch(e){toast('⚠️ '+(e.code||e.message))}finally{b.disabled=false}};
  if($('#rvClear'))$('#rvClear').onclick=async()=>{if(!await ask(`${fmtDate(d)} – വിലയിരുത്തൽ മായ്ക്കണോ? (Clear this day's evaluation?)`,{danger:true,yes:'മായ്ക്കുക (Clear)'}))return;try{await deleteDoc(doc(db,'reviews',d));toast('🗑️ മായ്ച്ചു (Cleared)');rvEditing=false;resetPdfBtn();renderReviewCard()}catch(e){toast('⚠️ '+(e.code||e.message))}};
  $('#rvCard').scrollIntoView({block:'start'})}
/* entry form section: same reviews/{entry date} record; loaded when opened / date changes; saved with the entry only if touched */
let fRv={d:null,r:null,touched:false,tok:0,loaded:false};
async function loadFormReview(){const box=$('#fRvBody');if(!box)return;const d=$('#fDate').value||today();const tok=++fRv.tok;fRv={...fRv,d,touched:false,loaded:false};
  $('#fRvDate').textContent=fmtDate(d);if(!$('#fRvWrap').open){$('#fRvState').textContent='';box.innerHTML='';return}
  box.innerHTML='<p class="hint">…</p>';const r=await getReview(d);if(tok!==fRv.tok)return;fRv.r=r;fRv.loaded=true;
  $('#fRvState').textContent=r?'✓ പൂരിപ്പിച്ചു (filled)':'';
  if(can.sup()){box.innerHTML=rvEditorHTML(d,r,'fRv')+`<p class="hint" style="margin:10px 0 0">💾 ജോലി സേവ് ചെയ്യുമ്പോൾ ഈ വിലയിരുത്തലും സേവ് ആകും (${fmtDate(d)} – റിപ്പോർട്ടിലെ അതേ വിലയിരുത്തൽ). <span class="en">(Saved together with the entry; same record as the Reports card.)</span></p>`;bindRvEditor(box)}
  else box.innerHTML=r?rvReadHTML(r):`<p class="hint" style="margin:0">⏳ ഈ ദിവസം വിലയിരുത്തൽ പൂരിപ്പിച്ചിട്ടില്ല. അഡ്മിൻ / സൂപ്പർവൈസർ പൂരിപ്പിക്കും. <span class="en">(Not filled yet – admin / supervisor fills it.)</span></p>`}
$('#fRvWrap').addEventListener('toggle',()=>{if($('#fRvWrap').open&&(!fRv.loaded||fRv.d!==($('#fDate').value||today())))loadFormReview()});
$('#fRvBody').addEventListener('input',()=>{if(fRv.loaded)fRv.touched=true});$('#fRvBody').addEventListener('change',()=>{if(fRv.loaded)fRv.touched=true});
$('#fDate').addEventListener('change',async()=>{const nd=$('#fDate').value||today();if(nd===fRv.d)return;
  if(fRv.touched&&can.sup()&&!await ask(`വിലയിരുത്തലിലെ മാറ്റങ്ങൾ സേവ് ചെയ്തിട്ടില്ല. ${fmtDate(nd)} ലെ വിലയിരുത്തൽ തുറക്കണോ? (Unsaved evaluation changes will be dropped – load ${dmy(nd)}?)`)){$('#fDate').value=fRv.d;return}
  loadFormReview()});
function resetFormReview(){fRv={d:null,r:null,touched:false,tok:fRv.tok+1,loaded:false};const w=$('#fRvWrap');if(w){w.open=false;$('#fRvBody').innerHTML='';$('#fRvState').textContent='';$('#fRvDate').textContent=fmtDate($('#fDate').value||today())}}
$('#rvEdit').onclick=openReviewEditor;
$('#rvJump').onclick=()=>$('#rvCard').scrollIntoView({block:'start',behavior:'smooth'});
/* officers' names manager (Settings) – admin/supervisor; soft remove keeps old reviews (they store a snapshot) */
let editingOff=null;
function fillDesDl(){const dl=$('#offDesDl');if(dl)dl.innerHTML=[...new Set(offNames.map(o=>o.desig).filter(Boolean).concat(['ഹെൽത്ത് സൂപ്പർവൈസർ','പബ്ലിക് ഹെൽത്ത് ഇൻസ്പെക്ടർ','ഹെൽത്ത് ഇൻസ്പെക്ടർ','ജൂനിയർ പബ്ലിക് ഹെൽത്ത് ഇൻസ്പെക്ടർ']))].map(x=>`<option value="${esc(x)}">`).join('')}
function saveOff(next,msg){setDoc(doc(db,'meta','officers'),{list:next.map(o=>({id:o.id,name:o.name,desig:o.desig||'',active:o.active!==false})),updatedBy:me.uid,updatedAt:serverTimestamp()}).catch(e=>toast('⚠️ '+(e.code||e.message)));if(msg)toast(msg)}
function resetOffForm(){editingOff=null;$('#ofName').value='';$('#ofDesig').value='';$('#ofAdd').innerHTML=ico('plus')+'ചേർക്കുക <span class="en">(Add)</span>';$('#ofCancel').style.display='none';$('#ofEditHint').style.display='none'}
function renderOffManager(){fillDesDl();if(!$('#ofList')||!can.sup())return;const act=activeOff(),off=offNames.filter(o=>o.active===false);
  const row=(c,i,n,on)=>`<div class="plrow${on?'':' off'}">${on?`<span class="plno">${i+1}</span>`:''}<div class="plnm"><b>${esc(c.name)}</b>${c.desig?`<small>${esc(c.desig)}</small>`:''}</div><div class="plbtns">${on?`<button class="btn out sm iconbtn" data-oup="${esc(c.id)}" aria-label="move up"${i===0?' disabled':''}>${ico('up')}</button><button class="btn out sm iconbtn" data-odn="${esc(c.id)}" aria-label="move down"${i===n-1?' disabled':''}>${ico('down')}</button><button class="btn sec sm iconbtn" data-oedit="${esc(c.id)}" aria-label="edit">${ico('edit')}</button><button class="btn out sm iconbtn warnb" data-ooff="${esc(c.id)}" aria-label="remove">${ico('pause')}</button>`:`<button class="btn sec sm" data-oon="${esc(c.id)}">${ico('undo','sm')}തിരികെ <span class="en">(Restore)</span></button>`}</div></div>`;
  $('#ofList').innerHTML=act.map((c,i)=>row(c,i,act.length,true)).join('')||'<p class="hint">ഇല്ല – മുകളിൽ ചേർക്കുക (none – add above)</p>';$('#ofOffList').innerHTML=off.map(c=>row(c,0,0,false)).join('');
  $('#ofCount').textContent=act.length;$('#ofOffCount').textContent=off.length;$('#ofOffWrap').style.display=off.length?'block':'none';
  const mv=(id,d)=>{const a=activeOff(),i=a.findIndex(c=>c.id===id),j=i+d;if(i<0||j<0||j>=a.length)return;const next=offNames.slice(),x=next.indexOf(a[i]),y=next.indexOf(a[j]);[next[x],next[y]]=[next[y],next[x]];saveOff(next)};
  $$('#ofList [data-oup]').forEach(b=>b.onclick=()=>mv(b.dataset.oup,-1));$$('#ofList [data-odn]').forEach(b=>b.onclick=()=>mv(b.dataset.odn,1));
  $$('#ofList [data-oedit]').forEach(b=>b.onclick=()=>{const c=offById(b.dataset.oedit);editingOff=c;$('#ofName').value=c.name;$('#ofDesig').value=c.desig||'';
    $('#ofAdd').innerHTML=ico('save')+'മാറ്റം സേവ് <span class="en">(Save)</span>';$('#ofCancel').style.display='flex';$('#ofEditName').textContent=c.name;$('#ofEditHint').style.display='block';$('#ofName').scrollIntoView({block:'center'})});
  $$('#ofList [data-ooff]').forEach(b=>b.onclick=async()=>{const c=offById(b.dataset.ooff);if(!await ask(`"${c.name}" ലിസ്റ്റിൽ നിന്ന് ഒഴിവാക്കണോ? (Remove from list?)\nപഴയ വിലയിരുത്തലുകളിൽ പേര് നിലനിൽക്കും; പിന്നീട് തിരികെ ചേർക്കാം. (Old evaluations keep the name; can be restored.)`))return;
    if(editingOff?.id===c.id)resetOffForm();saveOff(offNames.map(x=>x.id===c.id?{...x,active:false}:x),'⏸ ഒഴിവാക്കി (Removed) – '+c.name)});
  $$('#ofOffList [data-oon]').forEach(b=>b.onclick=()=>{const c=offById(b.dataset.oon);saveOff(offNames.map(x=>x.id===c.id?{...x,active:true}:x),'✅ തിരികെ ചേർത്തു (Restored) – '+c.name)})}
$('#ofCancel').onclick=resetOffForm;
$('#ofAdd').onclick=()=>{const name=$('#ofName').value.trim().replace(/\s+/g,' ').slice(0,80),desig=$('#ofDesig').value.trim().replace(/\s+/g,' ').slice(0,80);if(!name)return toast('⚠️ ഓഫീസറുടെ പേര് നൽകുക (Type a name)');
  if(offNames.some(c=>c.name.toLowerCase()===name.toLowerCase()&&c.id!==editingOff?.id))return toast('⚠️ ഈ പേര് ലിസ്റ്റിൽ ഉണ്ട് (Already in the list)');
  if(offNames.length>=100&&!editingOff)return toast('⚠️ പരമാവധി 100 (Max 100)');
  if(editingOff){const id=editingOff.id;saveOff(offNames.map(x=>x.id===id?{...x,name,desig}:x),'✅ മാറ്റം സേവ് ചെയ്തു (Saved)')}
  else saveOff([...offNames,{id:'o_'+Date.now().toString(36),name,desig,active:true}],'✅ ചേർത്തു (Added) – '+name);resetOffForm()};
$('#ofName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#ofDesig').focus()}});
/* entry form: tick boxes of names + others; count auto-fills from the names (stays editable) */
function crewCount(){return $$('#fCrew input:checked').length+splitNames($('#fCrewOther').value).length}
function syncCrewCount(){const n=crewCount(),w=$('#fWorkers');if(w.dataset.manual!=='1')w.value=n?n:'';$('#fCrewN').textContent=n?`✓ ${n} പേര് (names)`:''}
function renderCrewChips(){const box=$('#fCrew');if(!box)return;const cur=new Set($$('#fCrew input:checked').map(i=>i.value));const keep=new Set(editing?.crew||[]);
  const list=crewNames.filter(c=>c.active!==false||keep.has(c.id)||cur.has(c.id));
  box.innerHTML=list.map(c=>`<label class="mwc crc${cur.has(c.id)?' on':''}"><input type="checkbox" value="${esc(c.id)}"${cur.has(c.id)?' checked':''}><span class="mwbx"></span><span class="mwt">${esc(c.name)}${c.active===false?' <span class="en">(ഒഴിവാക്കി · removed)</span>':''}</span></label>`).join('');
  // names removed from the list entirely but on the entry being edited
  if(editing)(editing.crew||[]).forEach((id,i)=>{if(!crewById(id)){box.insertAdjacentHTML('beforeend',`<label class="mwc crc${cur.has(id)?' on':''}"><input type="checkbox" value="${esc(id)}"${cur.has(id)?' checked':''}><span class="mwbx"></span><span class="mwt">${esc((editing.crewNames||[])[i]||id)}</span></label>`)}});
  $('#fCrewEmpty').style.display=list.length?'none':'block';syncCrewCount()}
$('#fCrew').addEventListener('change',e=>{const l=e.target.closest('.mwc');if(l)l.classList.toggle('on',e.target.checked);syncCrewCount()});
$('#fCrewOther').addEventListener('input',syncCrewCount);
$('#fWorkers').addEventListener('input',()=>{$('#fWorkers').dataset.manual=$('#fWorkers').value===''?'':'1'});
function crewReportHTML(list,monthly){const m=new Map();list.forEach(e=>crewOf(e).forEach(n=>{const k=n.toLowerCase();const o=m.get(k)||{n,days:new Set(),es:0,pl:new Set()};o.days.add(e.date);o.es++;o.pl.add(e.placeName);m.set(k,o)}));
  if(!m.size)return '';const order=new Map(crewNames.map((c,i)=>[c.name.toLowerCase(),i]));
  const rows=[...m.entries()].sort((a,b)=>(order.get(a[0])??1e9)-(order.get(b[0])??1e9)||a[1].n.localeCompare(b[1].n)).map(x=>x[1]);
  return `<div class="rp-sub" style="font-size:15px">👥 തൊഴിലാളികളുടെ പേരുകൾ <span class="en">(Workers' names)</span>: ${rows.length}</div><table class="rp-tbl crtbl"><tr><th>#</th><th>പേര് (Name)</th>${monthly?'<th>ദിവസം (Days)</th>':''}<th>ജോലി (Entries)</th><th>സ്ഥലം (Places)</th></tr>${rows.map((o,i)=>`<tr><td>${i+1}</td><td>${esc(o.n)}</td>${monthly?`<td><b>${o.days.size}</b></td>`:''}<td>${o.es}</td><td>${esc([...o.pl].join(', '))}</td></tr>`).join('')}</table>`}
function crewShare(list,monthly){const m=new Map();list.forEach(e=>crewOf(e).forEach(n=>{const k=n.toLowerCase();const o=m.get(k)||{n,days:new Set()};o.days.add(e.date);m.set(k,o)}));
  return m.size?`👥 തൊഴിലാളികൾ (Workers): ${m.size}\n`+[...m.values()].map(o=>`   • ${o.n}${monthly?` – ${o.days.size} ദിവസം`:''}`).join('\n'):''}
function typeDashHTML(list){const m={};list.forEach(e=>{const k=placeTypeOf(e);(m[k]=m[k]||[]).push(e)});const ks=Object.keys(m);if(ks.length<1)return '';
  return `<div class="rp-sub">${ico('tag','sm')}തരം തിരിച്ച് <span class="en">(By type)</span></div>`+ks.map(k=>{const t=typeInfo(k),s=stats(m[k]).avg;return `<div class="wardrow"><div>${t.icon} ${esc(t.ml)} <span class="en">(${m[k].length})</span></div><div class="bar"><i style="width:${s??0}%;background:${scoreColor(s)}"></i></div><b style="color:${scoreColor(s)}">${s??'–'}</b></div>`}).join('')}
function typeReportHTML(list,fbList){const m={};const add=k=>m[k]=m[k]||{n:0,places:new Set(),fb:0,fbSum:0,score:[]};
  list.forEach(e=>{const k=placeTypeOf(e);add(k);m[k].n++;m[k].places.add(e.placeId||e.placeName);if(e.score!=null)m[k].score.push(e.score)});
  fbList.forEach(f=>{const k=placeTypeOf(f);add(k);m[k].fb++;m[k].fbSum+=f.rating});
  const ks=allTypes().map(t=>t.id).filter(k=>m[k]).concat(Object.keys(m).filter(k=>!typeById(k)));if(!ks.length)return '';
  return `<div class="rp-sub" style="font-size:15px">🏷️ തരം തിരിച്ചുള്ള സംഗ്രഹം (Summary by type)</div><table class="rp-tbl"><tr><th>തരം (Type)</th><th>ജോലി (Work)</th><th>സ്ഥലങ്ങൾ (Places)</th><th>സ്കോർ (Score)</th><th>സ്ഥലവാസി ★ (Feedback avg)</th></tr>`+
    ks.map(k=>{const o=m[k],t=typeInfo(k);return `<tr><td>${t.icon} ${esc(t.ml)}${t.en?' ('+esc(t.en)+')':''}</td><td>${o.n}</td><td>${o.places.size}</td><td>${o.score.length?Math.round(o.score.reduce((a,b)=>a+b,0)/o.score.length):'–'}</td><td>${o.fb?(o.fbSum/o.fb).toFixed(1)+' ('+o.fb+')':'–'}</td></tr>`}).join('')+'</table>'}
function renderUsers(){if(!can.admin())return;const order={pending:0,admin:1,supervisor:2,officer:3,worker:4,disabled:5};
  $('#uList').innerHTML=users.slice().sort((a,b)=>(order[a.role]??9)-(order[b.role]??9)||String(a.name).localeCompare(b.name)).map(u=>`<div class="u">${u.photoURL?`<img src="${esc(u.photoURL)}" referrerpolicy="no-referrer" alt="">`:hic('user')}<div class="nm"><b>${esc(u.name)}</b><br><span class="en">${esc(u.email)}</span><input type="text" class="udesig" data-uid="${u.uid}" maxlength="80" list="desigList2" value="${esc(u.desig||'')}" placeholder="പദവി (Designation)" aria-label="പദവി (Designation)"></div>
    <select data-uid="${u.uid}" ${u.uid===me.uid?'disabled':''}>${Object.entries(ROLES).map(([k,v])=>`<option value="${k}" ${u.role===k?'selected':''}>${v}</option>`).join('')}</select></div>`).join('');
  $$('#uList .udesig').forEach(i=>i.onchange=()=>{const v=i.value.trim().slice(0,80);updateDoc(doc(db,'users',i.dataset.uid),{desig:v}).then(()=>toast('✅ പദവി സേവ് ചെയ്തു (Designation saved)')).catch(e=>toast('⚠️ '+e.code))});$$('#uList select').forEach(s=>s.onchange=async()=>{const u=users.find(x=>x.uid===s.dataset.uid);if(!await ask(`${u.name} → ${ROLES[s.value]}?`)){s.value=u.role;return}
    updateDoc(doc(db,'users',u.uid),{role:s.value,roleBy:me.uid,roleAt:serverTimestamp()}).then(()=>toast('✅ റോൾ മാറ്റി (Role updated)')).catch(e=>{toast('⚠️ '+e.code);s.value=u.role})})}
$('#sSave').onclick=()=>{updateDoc(doc(db,'users',me.uid),{name:$('#sName').value.trim()||me.displayName,phone:$('#sPhone').value.trim(),desig:$('#sDesig').value.trim().slice(0,80)}).catch(e=>toast('⚠️ '+e.code));toast('✅ സേവ് ചെയ്തു (Saved)')};

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
function renderFormPhotos(){for(const k of PH_ORDER){const box=$(k==='before'?'#phBefore':k==='after'?'#phAfter':'#phPresent');if(!box)continue;
    box.innerHTML=curPhotos.filter(p=>p.kind===k&&!p.removed).map(p=>`<div class="phitem"><div class="ph"><img src="${p.src}" alt=""><button type="button" data-id="${p.id}" aria-label="remove">×</button></div><textarea class="phnote" lang="ml" rows="2" maxlength="${PH_NOTE_MAX}" placeholder="ഫോട്ടോയെക്കുറിച്ച് എഴുതുക (വേണമെങ്കിൽ)" data-id="${p.id}">${esc(p.note||'')}</textarea></div>`).join('')}
  $$('#v-new .ph button').forEach(b=>b.onclick=()=>{const p=curPhotos.find(x=>x.id===b.dataset.id);if(p)p.removed=true;renderFormPhotos()});
  $$('#v-new textarea.phnote').forEach(t=>t.addEventListener('input',()=>{const p=curPhotos.find(x=>x.id===t.dataset.id);if(p)p.note=t.value.slice(0,PH_NOTE_MAX)}))}

/* ---------- form ---------- */
$('#fWork').innerHTML=WORKS.map(w=>`<label class="chip"><input type="checkbox" value="${w[0]}"><span>${w[1]}<br><span class="en">${w[2]}</span></span></label>`).join('');
$('#fWork').addEventListener('change',e=>{e.target.closest('.chip').classList.toggle('on',e.target.checked);if(e.target.value==='other')$('#fWorkOther').style.display=e.target.checked?'block':'none'});
function renderGPS(){$('#gpsTxt').innerHTML=gps?`✅ ${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)} (±${Math.round(gps.acc)} m)`:'';$('#gpsClr').style.display=gps?'block':'none'}
$('#gpsBtn').onclick=()=>{if(!navigator.geolocation)return toast('⚠️ GPS ലഭ്യമല്ല');$('#gpsTxt').textContent='⏳ ലൊക്കേഷൻ എടുക്കുന്നു...';
  navigator.geolocation.getCurrentPosition(p=>{gps={lat:p.coords.latitude,lng:p.coords.longitude,acc:p.coords.accuracy};renderGPS()},e=>{$('#gpsTxt').textContent='⚠️ ലൊക്കേഷൻ കിട്ടിയില്ല ('+e.message+')'},{enableHighAccuracy:true,timeout:20000})};
$('#gpsClr').onclick=()=>{gps=null;renderGPS()};
const massOn=()=>$('#fMass').checked||$('#fSpecial').checked;const dailyOn=()=>$('#fDaily').checked;
function syncMassForm(){const m=$('#fMass');if(!m)return;const on=massOn();$$('#fKind .mwc').forEach(l=>l.classList.toggle('on',l.querySelector('input').checked));const sel=$('#fPlace');let o=sel.querySelector('option[value="__oneoff"]');
  if(on&&!o)sel.insertAdjacentHTML('beforeend','<option value="__oneoff">✍️ പട്ടികയിൽ ഇല്ലാത്ത സ്ഥലം എഴുതുക (Type a one-off place)</option>');
  if(!on&&o){if(sel.value==='__oneoff')sel.value='';o.remove()}
  $('#fMassWrap').style.display=on?'block':'none';$('#fRegWrap').style.display=dailyOn()?'block':'none';$('#fCatHint').style.display=on||dailyOn()?'none':'block';$('#fOneOffWrap').style.display=on&&sel.value==='__oneoff'?'flex':'none';
  m.closest('.card').classList.toggle('massmode',on)}
function renderMassChips(){const box=$('#fMassWork');if(!box)return;const cur=new Set($$('#fMassWork input:checked').map(i=>i.value));const keep=new Set(editing?.massWorks||[]);
  const list=massTypes.filter(t=>t.active!==false||keep.has(t.id)||cur.has(t.id));
  box.innerHTML=list.map(t=>`<label class="mwc${cur.has(t.id)?' on':''}"><input type="checkbox" value="${esc(t.id)}"${cur.has(t.id)?' checked':''}><span class="mwbx"></span><span class="mwt">${t.icon?esc(t.icon)+' ':''}${esc(t.ml)}${t.en?`<span class="en">${esc(t.en)}</span>`:''}</span></label>`).join('')}
$('#fMassWork').addEventListener('change',e=>{const l=e.target.closest('.mwc');if(l)l.classList.toggle('on',e.target.checked)});
['#fDaily','#fMass','#fSpecial'].forEach(s=>$(s).addEventListener('change',()=>{syncMassForm();renderMassChips()}));
$('#fPlace').addEventListener('change',syncMassForm);
function resetForm(){editing=null;curPhotos=[];gps=null;$('#fDate').value=today();$('#fTime').value=nowTime();{const ap=activePlaces();$('#fPlace').value=ap.length===1?ap[0].id:''}
  $$('#fWork input').forEach(i=>{i.checked=false;i.closest('.chip').classList.remove('on')});$('#fWorkOther').value='';$('#fWorkOther').style.display='none';
  ['#fWorkers','#fWaste','#fNotes','#fMassOther','#fMassPlace','#fMassWard','#fMassArea','#fCrewOther'].forEach(s=>$(s).value='');$('#fWorkers').dataset.manual='';$$('#fCrew input').forEach(i=>i.checked=false);renderCrewChips();$('#fDaily').checked=true;$('#fMass').checked=false;$('#fSpecial').checked=false;$$('#fMassWork input').forEach(i=>i.checked=false);renderMassChips();syncMassForm();$('#fWasteUnit').selectedIndex=0;renderFormPhotos();renderGPS();
  $('#formTitle').innerHTML='📝 പുതിയ ജോലി <span class="en">(New Work Entry)</span>';$('#cancelEdit').style.display='none';resetFormReview()}
$('#cancelEdit').onclick=()=>{resetForm();show('v-dash')};
async function editEntry(e){resetForm();editing=e;if(e.placeId&&!isActivePlace(places.find(p=>p.id===e.placeId)))renderPlaces();$('#fDate').value=e.date;resetFormReview();$('#fTime').value=e.time||'';$('#fPlace').value=e.placeId||'';
  $$('#fWork input').forEach(i=>{i.checked=(e.works||[]).includes(i.value);i.closest('.chip').classList.toggle('on',i.checked)});$('#fWorkOther').value=e.workOther||'';$('#fWorkOther').style.display=(e.works||[]).includes('other')?'block':'none';
  $('#fWorkers').value=e.workers??'';$('#fWaste').value=e.waste??'';if(e.wasteUnit)$('#fWasteUnit').value=e.wasteUnit;$('#fNotes').value=e.notes||'';gps=e.gps||null;renderGPS();
  const ps=await getDocs(collection(db,'entries',e.id,'photos'));curPhotos=ps.docs.map(d=>{const x=d.data();return {id:d.id,...x,isNew:false,src:x.url||x.data,note:x.note||'',note0:phNoteOf(x)}});renderFormPhotos();
  renderCrewChips();$$('#fCrew input').forEach(i=>{i.checked=(e.crew||[]).includes(i.value);i.closest('.mwc').classList.toggle('on',i.checked)});$('#fCrewOther').value=e.crewOther||'';{const n=crewCount();$('#fWorkers').dataset.manual=(e.workers??null)!==(n||null)&&e.workers!=null?'1':'';$('#fWorkers').value=e.workers??'';$('#fCrewN').textContent=n?`✓ ${n} പേര് (names)`:''}
  {const ks=kindsOf(e);$('#fDaily').checked=ks.includes('daily');$('#fMass').checked=ks.includes('mass');$('#fSpecial').checked=ks.includes('special')}$('#fMassPlace').value=massPlaceOf(e);$('#fMassWard').value=massWardOf(e);$('#fMassArea').value=massAreaOf(e);renderMassChips();$$('#fMassWork input').forEach(i=>{i.checked=(e.massWorks||[]).includes(i.value);i.closest('.mwc').classList.toggle('on',i.checked)});$('#fMassOther').value=e.massOther||'';syncMassForm();
  if(e.mass&&!e.placeId){$('#fPlace').value='__oneoff';syncMassForm()}
  $('#formTitle').innerHTML='✏️ തിരുത്തുന്നു <span class="en">(Editing entry)</span>';$('#cancelEdit').style.display='inline-flex';show('v-new')}
$('#saveBtn').onclick=async()=>{const mass=massOn(),mKind=mass?['mass','special'].filter(k=>$(k==='mass'?'#fMass':'#fSpecial').checked):[],mPlace=mass?$('#fMassPlace').value.trim().slice(0,160):'',mWard=mass?$('#fMassWard').value.trim().slice(0,80):'',mArea=mass?$('#fMassArea').value.trim().slice(0,80):'',oneOff=mass&&$('#fPlace').value==='__oneoff',daily=dailyOn();const works=daily?$$('#fWork input:checked').map(i=>i.value):[];
  if(!daily&&!mass)return toast('⚠️ ജോലി വിഭാഗം ടിക്ക് ചെയ്യുക (Tick a work category)');
  const pl=oneOff?{id:'',name:mPlace,area:mArea,ward:mWard,type:'other',typeOther:''}:places.find(p=>p.id===$('#fPlace').value);
  if(oneOff&&!pl.name){$('#fMassPlace').focus();return toast('⚠️ ചെയ്ത സ്ഥലം എഴുതുക (Type the place where the work was done)')}
  if(!pl)return toast('⚠️ സ്ഥലം തിരഞ്ഞെടുക്കുക (Select a place)');
  const cIds=$$('#fCrew input:checked').map(i=>i.value);const mIds=mass?$$('#fMassWork input:checked').map(i=>i.value):[],mOther=mass?$('#fMassOther').value.trim():'';
  if(mass&&!mIds.length&&!mOther)return toast('⚠️ മാസ് / സ്പെഷ്യൽ വർക്കിൽ ചെയ്ത ജോലികൾ ടിക്ക് ചെയ്യുക (Tick the mass / special works done)');
  if(daily&&!mass&&!works.length&&!$('#fNotes').value.trim())return toast('⚠️ ചെയ്ത ജോലി തിരഞ്ഞെടുക്കുക (Select work done)');
  const btn=$('#saveBtn');btn.disabled=true;
  try{const ref=editing?doc(db,'entries',editing.id):doc(collection(db,'entries'));const live=curPhotos.filter(p=>!p.removed);
    const useStorage=storage&&navigator.onLine;const newPh=live.filter(p=>p.isNew);
    if(useStorage){toast('⏫ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുന്നു...');for(const p of newPh){try{const sr=S.ref(storage,`photos/${ref.id}/${p.id}.jpg`);await S.uploadBytes(sr,p.blob,{contentType:'image/jpeg'});p.url=await S.getDownloadURL(sr);p.path=sr.fullPath}catch(e){console.warn('storage upload failed, inline fallback',e)}}}
    const thumbP=live.find(p=>p.kind==='after')||live.find(p=>p.kind==='present')||live[0];let thumb=editing?.thumb||'';if(thumbP&&thumbP.thumb)thumb=thumbP.thumb;else if(!live.length)thumb='';
    else if(thumbP&&thumbP.id!==editing?.thumbId){try{thumb=(await toCanvasBlob(await loadImage(thumbP.src),240,0.6)).c.toDataURL('image/jpeg',0.6)}catch(e){}}
    const data={date:$('#fDate').value||today(),time:$('#fTime').value,placeId:pl.id,placeName:pl.name,area:pl.area||'',ward:pl.ward||'',placeType:pl.type||'other',placeTypeOther:pl.typeOther||'',works,workOther:daily?$('#fWorkOther').value.trim():'',cats:[...(daily?['daily']:[]),...mKind],mass,massWorks:mIds,massLabels:mIds.map(id=>massById(id)?.ml||id),massOther:mOther,oneOff,massKind:mKind,massPlace:mPlace,massWard:mWard,massArea:mArea,crew:cIds,crewNames:cIds.map((id,i)=>crewById(id)?.name||(editing?.crewNames||[])[(editing?.crew||[]).indexOf(id)]||id),crewOther:$('#fCrewOther').value.trim().slice(0,500),
      workers:$('#fWorkers').value===''?null:+$('#fWorkers').value,waste:$('#fWaste').value===''?null:+$('#fWaste').value,wasteUnit:$('#fWasteUnit').value,notes:$('#fNotes').value.trim(),gps:gps||null,
      photoCount:live.length,hasBefore:live.some(p=>p.kind==='before'),hasAfter:live.some(p=>p.kind==='after'),hasPresent:live.some(p=>p.kind==='present'),thumb,thumbId:thumbP?.id||'',updatedAt:serverTimestamp()};
    const b=writeBatch(db);
    if(editing)b.update(ref,data);else b.set(ref,{...data,workerUid:me.uid,workerName:meDoc.name||me.displayName||'',remarkCount:0,score:null,lastRating:'',createdAt:serverTimestamp()});
    for(const p of curPhotos){const pr=doc(db,'entries',ref.id,'photos',p.id);if(p.removed){if(!p.isNew)b.delete(pr)}else if(p.isNew){const n=phNoteOf(p);b.set(pr,{kind:p.kind,ts:p.ts,by:me.uid,...(p.url?{url:p.url,path:p.path}:{data:p.inline}),...(n?{note:n}:{})})}else{const n=phNoteOf(p),was=p.note0||'';if(n!==was)b.update(pr,{note:n})}}
    const rvV=(fRv.touched&&fRv.loaded&&can.sup()&&$('#fRvBody .rvRows'))?collectRv($('#fRvBody')):null,rvD=data.date;
    const commit=b.commit();const wasEdit=!!editing;
    if(rvV&&!rvV.empty){if(rvD!==fRv.d)toast('⚠️ തീയതി മാറി – വിലയിരുത്തൽ സേവ് ചെയ്തില്ല (date changed – evaluation not saved)');else saveRv(rvD,rvV).then(()=>{toast('✅ വിലയിരുത്തലും സേവ് ചെയ്തു (Evaluation saved too)');resetPdfBtn()}).catch(e=>toast('⚠️ വിലയിരുത്തൽ: '+(e.code||e.message),5000))}
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
function entryHTML(e,photos,remarks,withPhotos=true){const rows=[['👷 തൊഴിലാളി (Worker)',e.workerName],['🕐 സമയം (Time)',e.time],['📍 സ്ഥലം (Place)',[e.placeName,e.ward,e.area].filter(Boolean).join(', ')],['🏷️ തരം (Type)',(t=>t.icon+' '+t.ml+(t.en?' ('+t.en+')':''))(typeInfo(placeTypeOf(e),e))],['🗂️ വിഭാഗം (Category)',catMarks(e)],['🧹 ദൈനംദിന ജോലി (Daily work)',regWorksText(e)],['👥 തൊഴിലാളികൾ (Workers)',e.workers],['📝 തൊഴിലാളികളുടെ പേരുകൾ (Names)',crewOf(e).join(', ')],['🗑️ മാലിന്യം (Waste)',e.waste!=null?e.waste+' '+(e.wasteUnit||''):''],['📋 നില (Status)',photoStatus(e)],['📝 കുറിപ്പ് (Notes)',e.notes]].filter(x=>x[1]!==''&&x[1]!=null);
  const gpsRow=e.gps?`<tr><td>🛰️ GPS</td><td><a href="https://maps.google.com/?q=${e.gps.lat},${e.gps.lng}" target="_blank" rel="noopener">${e.gps.lat.toFixed(5)}, ${e.gps.lng.toFixed(5)}</a></td></tr>`:'';
  const grid=k=>{const a=photos.filter(p=>p.kind===k);return a.length?`<div class="rp-sub">${phCap(k)}</div><div class="rp-ph">${a.map(p=>`<figure><img src="${p.url||p.data}" alt="" loading="lazy" data-cap="${phCap(k)}">${phNoteHTML(p)}</figure>`).join('')}</div>`:''};
  return `<div class="rp-e card"><div class="rp-sub" style="font-size:16px">📅 ${fmtDate(e.date)} · ${esc(e.placeName)} ${kindBadge(e)} ${e.score!=null?`<span class="badge" style="background:${scoreColor(e.score)};color:#fff">സ്കോർ ${e.score}</span>`:''}</div><table>${rows.map(x=>`<tr><td>${x[0]}</td><td>${esc(x[1])}</td></tr>`).join('')}${gpsRow}</table>${e.mass?massBlockHTML(e):''}
    ${withPhotos?PH_ORDER.map(grid).join(''):''}${remarks?remarksHTML(remarks):''}</div>`}
function remarksHTML(rs){if(!rs.length)return '';return `<div class="rp-sub">👮 ഉദ്യോഗസ്ഥരുടെ അഭിപ്രായം (Officer remarks)</div>`+rs.map(r=>{const t=RATE[r.rating];return `<div class="remark"><b>${esc(r.officerName)}</b>${r.desig?', '+esc(r.desig):''} ${t?`<span class="badge ${t[2]}">${t[0]} (${t[1]})</span>`:''}<div>${esc(r.text)}</div>${r.signature?`<img src="${r.signature}" alt="signature">`:''}<div class="hint">${r.createdAt?new Date(r.createdAt.seconds*1000).toLocaleString('en-IN'):''}</div></div>`}).join('')}
function renderDetail(){const e=entries.find(x=>x.id===detailId);if(!e){$('#detOut').innerHTML=skelHTML(1);return}
  $('#detOut').innerHTML=entryHTML(e,detPhotos,null);{const b=$('#detPdf');if(!b.classList.contains('ready')||b.dataset.id!==e.id){b.classList.remove('ready');b.dataset.id=e.id;b.innerHTML=EPDF_LABEL;b.onclick=()=>entryPdfAction(e.id,'share',b)}$('#detSave').onclick=()=>entryPdfAction(e.id,'save',$('#detSave'));$('#detPrint').onclick=()=>entryPdfAction(e.id,'print',$('#detPrint'))}
  $('#detRemarks').innerHTML=`<h2>${hic('badge','earth')}അഭിപ്രായങ്ങൾ <span class="en">(Remarks – live)</span></h2>`+(detRemarks.length?remarksHTML(detRemarks).replace(/^<div class="rp-sub">.*?<\/div>/,''):'<p class="hint">ഇതുവരെ അഭിപ്രായം ഇല്ല (No remarks yet)</p>');
  const own=e.workerUid===me.uid;$('#detEdit').style.display=(own&&can.work())||can.sup()?'flex':'none';$('#detDelWrap').style.display=canDelEntry(e)?'block':'none'}
$('#detEdit').onclick=()=>{const e=entries.find(x=>x.id===detailId);if(e)editEntry(e)};
const canDelEntry=e=>!!e&&((e.workerUid===me.uid&&can.work())||can.sup());
/* permanent delete of one entry with its photos and remarks (confirmation first) */
async function deleteEntry(id){const e=entries.find(x=>x.id===id);if(!e||!canDelEntry(e))return false;
  let ps,rs;try{[ps,rs]=await Promise.all([getDocs(collection(db,'entries',id,'photos')),getDocs(collection(db,'entries',id,'remarks'))])}catch(err){toast('⚠️ '+(err.code||err.message));return false}
  if(!await ask(`🗑️ ഈ ജോലി സ്ഥിരമായി നീക്കം ചെയ്യണോ? (Permanently delete this entry?)\n📍 ${e.placeName||''} – ${fmtDate(e.date)}${e.time?' · '+e.time:''}\n👷 ${e.workerName||''}\n📷 ഫോട്ടോ (Photos): ${ps.size} · 👮 അഭിപ്രായം (Remarks): ${rs.size}\nഇത് തിരിച്ചെടുക്കാൻ കഴിയില്ല. (This cannot be undone.)`,{danger:true,yes:'നീക്കുക (Delete)'}))return false;
  try{const b=writeBatch(db);ps.docs.forEach(d=>b.delete(d.ref));rs.docs.forEach(d=>b.delete(d.ref));b.delete(doc(db,'entries',id));
    if(storage)ps.docs.map(d=>d.data()).filter(p=>p.path).forEach(p=>S.deleteObject(S.ref(storage,p.path)).catch(()=>{}));
    b.commit().catch(err=>toast('⚠️ '+err.code,5000));if(detailId===id){detailUnsubs.forEach(u=>u());detailUnsubs=[]}toast('🗑️ നീക്കം ചെയ്തു (Deleted)');return true}catch(err){toast('⚠️ '+err.message);return false}}
$('#detDel').onclick=async()=>{const b=$('#detDel');b.disabled=true;try{if(await deleteEntry(detailId))show('v-dash')}finally{b.disabled=false}};

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
function resetRemark(){$('#rmText').value='';$$('#rmRating input').forEach(i=>i.checked=false);$$('#rmRating label').forEach(l=>l.classList.remove('on'));sig.clear();$('#rmDesig').value=localStorage.getItem('desig')||meDoc?.desig||''}
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
let lastReportKey='';
function makeReport(){lastReportKey=reportKey();resetPdfBtn();renderReviewCard();return rMode==='day'?makeDaily():makeMonthly()}
const placeKey=e=>e.placeId||e.placeName;
async function rangeFeedback(from,to,a,w,ty,pl){try{const s=await getDocs(query(collection(db,'feedback'),where('createdAt','>=',from),where('createdAt','<=',to),orderBy('createdAt')));
  return s.docs.map(d=>({id:d.id,...d.data()})).filter(f=>f.status!=='hidden'&&(!a||f.area===a)&&(!w||f.ward===w)&&(!ty||placeTypeOf(f)===ty)&&(!pl||f.placeId===pl))}catch(e){console.error(e);return []}}
const REPORT_HEAD=t=>`<div class="rp-h"><div class="rp-brand"><span class="mark">${MARK_SVG}</span><b>ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം</b></div><div class="en">Bhadram Ee Bhoomi – Daily Cleaning</div><h2>${t}</h2>${jdReportHTML()}`;
const CREDIT=()=>`<p class="hint center">തയ്യാറാക്കിയത് (Generated): ${new Date().toLocaleString('en-IN')} · ${esc(meDoc?.name||'')} · ഭദ്രം ഈ ഭൂമി (Bhadram Ee Bhoomi)<br>ആപ്പ് ഡെവലപ്പർ: രാഹുൽ കെ.ടി. (Grok സഹായത്തോടെ) · Developed by Rahul K T with Grok</p>`;
function dailyEntryHTML(e,photos,rs,withPh){const sc=e.score!=null?`<span class="badge" style="background:${scoreColor(e.score)};color:#fff">സ്കോർ ${e.score}</span>`:`<span class="badge pend">⏳ അഭിപ്രായം ബാക്കി (Awaiting remark)</span>`;
  const proof=photoStatus(e);
  const ph=photos.slice().sort(phSort);
  return `<div class="dr-e"><div class="hd"><span>📍 ${esc(e.placeName)}${e.ward?' · '+esc(e.ward):''}</span><span>🕐 ${esc(e.time||'')}</span></div>
  <div>${kindBadge(e)}${typeBadge(placeTypeOf(e),e)} ${sc}</div>
  <table class="rp-tbl" style="margin:6px 0"><tr><td style="width:34%">👷 തൊഴിലാളി (Worker)</td><td>${esc(e.workerName||'')}${e.workers?` · 👥 ${e.workers}`:''}</td></tr>${crewOf(e).length?`<tr><td>👥 തൊഴിലാളികളുടെ പേരുകൾ (Names)</td><td>${esc(crewOf(e).join(', '))}</td></tr>`:''}
  <tr><td>🗂️ വിഭാഗം (Category)</td><td class="catm">${esc(catMarks(e))}</td></tr>
  <tr><td>🧹 ജോലി (Work done)</td><td>${(e.works||[]).length?esc(regWorksText(e)):''}${e.mass?massBlockHTML(e,true):''}${e.waste!=null?` · 🗑️ ${e.waste} ${esc(e.wasteUnit||'')}`:''}</td></tr>
  <tr><td>📋 നില (Status)</td><td>${proof}${e.remarkCount?` · 💬 ${e.remarkCount}`:''}</td></tr>${e.notes?`<tr><td>📝 കുറിപ്പ് (Notes)</td><td>${esc(e.notes)}</td></tr>`:''}</table>
  ${withPh&&ph.length?`<div class="dr-ph">${ph.map(p=>{const c=phCap(p.kind);return `<figure><img src="${p.url||p.data}" alt="" data-cap="${c}"><figcaption>${c} · ${esc(e.placeName)}${e.time?' · '+esc(e.time):''}</figcaption>${phNoteHTML(p)}</figure>`}).join('')}</div>`:''}
  ${remarksHTML(rs)}</div>`}
function dayFbHTML(list){if(!list.length)return '<p class="hint">ഈ ദിവസം സ്ഥലവാസികളുടെ അഭിപ്രായം ഇല്ല (No resident feedback this day)</p>';
  return list.map(f=>`<div class="dr-fb">${starsHTML(f.rating)} <b>${f.rating}/5</b> · <b>${esc(f.placeName||'')}</b>${f.ward?' · '+esc(f.ward):''} <span class="hint">${fbDate(f)?fbDate(f).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):''}${f.name?' · '+esc(f.name):''}</span>
    ${f.comment?`<div>💬 ${esc(f.comment)}</div>`:''}${f.suggestion?`<div>💡 <b>നിർദ്ദേശം (Suggestion):</b> ${esc(f.suggestion)}</div>`:''}${f.photo?`<img class="fbph" src="${f.photo}" alt="">`:''}</div>`).join('')}
function massBlockHTML(e,compact){const ks=kindsOf(e),pl=massPlaceOf(e),it=massItems(e);const bx=on=>`<span class="pcb${on?' on':''}">${on?'✓':''}</span>`;
  return `<div class="mwbox${compact?' c':''}"><div class="mwk">${Object.entries(KIND).map(([k,v])=>`<span class="mwki${ks.includes(k)?' on':''}">${bx(ks.includes(k))}${v[0]} <b>${v[1]}</b> <span class="en">(${v[2]})</span></span>`).join('')}</div>
  ${pl||massWardOf(e)||massAreaOf(e)?`<div class="mwp">📍 ചെയ്ത സ്ഥലം <span class="en">(Place where done)</span>: <b>${esc(pl||'–')}</b>${massWardOf(e)?` · വാർഡ് <span class="en">(Ward)</span>: <b>${esc(massWardOf(e))}</b>`:''}${massAreaOf(e)?` · ഏരിയ <span class="en">(Area)</span>: <b>${esc(massAreaOf(e))}</b>`:''}</div>`:''}
  <div class="mwh2">ചെയ്ത ജോലികൾ <span class="en">(Works – ✓ done: ${it.filter(x=>x.on).length+(e.massOther?1:0)})</span></div>
  <div class="mwl">${it.map(x=>`<div class="mwi${x.on?' on':''}">${bx(x.on)}<span>${esc(x.label)}${x.removed?' <span class="en">(ഒഴിവാക്കി · removed)</span>':''}</span></div>`).join('')}<div class="mwi${e.massOther?' on':''}">${bx(!!e.massOther)}<span>➕ മറ്റുള്ളവ <span class="en">(Other)</span>${e.massOther?': <b>'+esc(e.massOther)+'</b>':''}</span></div></div></div>`}
function massReportHTML(list,monthly){const m=list.filter(e=>e.mass);if(!m.length)return '';
  const nk=k=>m.filter(e=>kindsOf(e).includes(k)).length;return `<div class="rp-sub" style="font-size:15px">💪 മാസ് / ⭐ സ്പെഷ്യൽ വർക്ക് <span class="en">(Mass / special work)</span>: ${m.length} <span class="en">(മാസ് ${nk('mass')} · സ്പെഷ്യൽ ${nk('special')})</span></div>`+m.map(e=>`<div class="mwrep"><div class="mwrh"><b>📍 ${esc(e.placeName)}</b>${e.ward?` <span class="en">– ${esc(e.ward)}</span>`:''}${e.placeId?'':' <span class="badge">✍️ പ്രത്യേക സ്ഥലം (one-off)</span>'} ${kindBadge(e)}<div class="en">${monthly?'📅 '+fmtDate(e.date)+' · ':''}🕐 ${esc(e.time||'')} · 👷 ${esc(e.workerName||'')}${e.workers?' · 👥 '+e.workers:''}${crewOf(e).length?' · '+esc(crewOf(e).join(', ')):''}</div></div>${massBlockHTML(e,true)}</div>`).join('')}
const catCount=(list,k)=>list.filter(e=>kindsOf(e).includes(k)).length;
const catSumHTML=list=>`<div class="catsum">🗂️ വിഭാഗം <span class="en">(Category)</span>: ${Object.entries(KIND).map(([k,v])=>`${v[0]} ${v[1]} <b>${catCount(list,k)}</b>`).join(' · ')}</div>`;
const catSumText=list=>'🗂️ '+Object.entries(KIND).map(([k,v])=>`${v[1]}: ${catCount(list,k)}`).join(' · ');
const massShare=(list,monthly)=>{const m=list.filter(e=>e.mass);return m.length?`💪 മാസ് / ⭐ സ്പെഷ്യൽ വർക്ക് (Mass / special work): ${m.length}\n`+m.map(e=>{const ks=kindsOf(e),pl=massPlaceOf(e);return `📍 ${monthly?fmtDate(e.date)+' · ':''}${e.placeName}${e.ward?' – '+e.ward:''}\n   ${catMarks(e)}${massLocText(e)?`\n   📍 ചെയ്ത സ്ഥലം: ${massLocText(e)}`:''}\n${massLabels(e,false,false).map(x=>'   ✓ '+x).join('\n')}`}).join('\n'):''};
/* places/roads checklist for reports: every place in scope with a ✓ box when it had work in the period */
function reportPlaces(list,{a,w,rty,pl}){const keys=new Set(list.map(placeKey));
  return places.filter(p=>(!rty||placeTypeOf(p)===rty)&&(!a||p.area===a)&&(!w||p.ward===w)&&(!pl||p.id===pl)&&(isActivePlace(p)||keys.has(p.id)))}
function placeDone(p,list){return list.filter(e=>e.placeId?e.placeId===p.id:e.placeName===p.name)}
function placeChecklistHTML(pls,list,monthly,wk){if(!pls.length)return '';
  const rows=pls.map(p=>{const es=placeDone(p,list),on=es.length>0,n=monthly?new Set(es.map(e=>e.date)).size:es.length;
    return {p,on,n}});const dn=rows.filter(r=>r.on).length;
  return `<div class="rp-sub" style="font-size:15px">📍 സ്ഥലങ്ങൾ / റോഡുകൾ <span class="en">(Places / roads)</span> – ✓ ${dn}/${rows.length}${rows.length-dn?` · ബാക്കി <span class="en">(not done)</span> ${rows.length-dn}`:''}</div>
  <div class="pcl-legend">${wk?`👤 ${esc(wk)} · `:''}<span class="pcb on">✓</span> ജോലി ചെയ്തു <span class="en">(work done${monthly?', days':''})</span> &nbsp; <span class="pcb"></span> ${monthly?'ഈ മാസം ജോലി ഇല്ല':'ബാക്കി'} <span class="en">(${monthly?'no work this month':'not done'})</span></div>
  <div class="pcl">${rows.map(({p,on,n})=>`<div class="pci${on?' on':' pend'}"><span class="pcb${on?' on':''}">${on?'✓':''}</span><span class="pcn">${typeInfo(placeTypeOf(p),p).icon} <b>${esc(p.name)}</b>${p.ward?` <span class="en">– ${esc(p.ward)}</span>`:''}${isActivePlace(p)?'':' <span class="en">(ഒഴിവാക്കി · removed)</span>'}</span>${on?`<span class="pcc">${n}${monthly?' ദിവസം':''}</span>`:''}</div>`).join('')}</div>`}
async function makeDaily(){const tok=++reportToken;const d=$('#rDate').value||($('#rDate').value=today());
  $('#reportOut').innerHTML=skelHTML(3);
  const a=$('#rArea').value,w=$('#rWard').value,k=$('#rWorker').value,rty=$('#rType').value,pl=$('#rPlace').value;
  const s=await getDocs(query(collection(db,'entries'),where('date','==',d)));if(tok!==reportToken)return;
  const list=s.docs.map(x=>({id:x.id,...x.data({serverTimestamps:'estimate'})})).filter(e=>(!rty||placeTypeOf(e)===rty)&&(!a||e.area===a)&&(!w||e.ward===w)&&(!k||e.workerUid===k)&&(!pl||e.placeId===pl)).sort((x,z)=>(x.time||'').localeCompare(z.time||''));
  const [fbList,sqList]=can.staff()?await Promise.all([rangeFeedback(new Date(d+'T00:00:00'),new Date(d+'T23:59:59.999'),a,w,rty,pl),rangeSquad(new Date(d+'T00:00:00'),new Date(d+'T23:59:59.999'),a,w,rty,pl)]):[[],[]];if(tok!==reportToken)return;
  const pls=reportPlaces(list,{a,w,rty,pl});
  const pending=k?[]:pls.filter(p=>isActivePlace(p)&&!placeDone(p,list).length);const doneN=k?new Set(list.map(placeKey)).size:pls.filter(p=>placeDone(p,list).length).length;
  const st=stats(list);const rcount=list.reduce((n,e)=>n+(e.remarkCount||0),0);const fbAvg=fbList.length?fbList.reduce((n,f)=>n+f.rating,0)/fbList.length:null;
  const wk=k?users.find(u=>u.uid===k)?.name:'',pn=pl?places.find(p=>p.id===pl)?.name:'';
  const filt=[a,w,pn,wk,rty?typeInfo(rty).icon+' '+typeInfo(rty).ml:''].filter(Boolean).map(esc).join(' · ');
  let h=REPORT_HEAD(`📅 ദിവസ റിപ്പോർട്ട് (Daily Report) – ${fmtDate(d)}`)+(filt?`<div class="rp-filt">🔎 ${filt}</div>`:'')+`</div>`;
  h+=`<div class="rp-sum"><div class="dr-kpi"><div><b>${list.length}</b>ജോലി<br>(Entries)</div><div><b>${k?doneN:doneN+'/'+pls.length}</b>സ്ഥലം പൂർത്തി<br>(Places done)</div><div><b style="color:${scoreColor(st.avg)}">${st.avg??'–'}</b>സ്കോർ<br>(Avg score)</div>
    <div><b>${rcount}</b>അഭിപ്രായം<br>(Remarks)</div><div><b>${st.awaiting}</b>അഭിപ്രായം ബാക്കി<br>(Awaiting)</div><div><b>${can.staff()?fbList.length+(fbAvg!=null?' · '+fbAvg.toFixed(1)+'★':''):'–'}</b>സ്ഥലവാസി അഭിപ്രായം<br>(Resident fb)</div></div>${can.staff()?`<div class="sq-line">🏛️ SPHI, PHI, മറ്റ് ഉദ്യോഗസ്ഥർ &amp; സ്ക്വാഡ് എന്നിവരുടെ പരിശോധന <span class="en">(Inspections)</span>: <b>${sqList.length}</b>${sqList.length?` · ✅ ${sqList.filter(f=>f.overall==='good').length} · ⚠️ ${sqList.filter(f=>f.overall==='partial').length} · ❌ ${sqList.filter(f=>f.overall==='poor').length} · ${(sqList.reduce((n,f)=>n+f.rating,0)/sqList.length).toFixed(1)}★`:''}</div>`:''}
    👥 ${st.workers} തൊഴിൽ (worker-days) · 📷 ${st.photos} · ഫോട്ടോ തെളിവ് (photo proof) ${st.proof}%${Object.keys(st.waste).length?' · 🗑️ '+Object.entries(st.waste).map(([u,v])=>`${+v.toFixed(2)} ${esc(u)}`).join(', '):''}</div>`;
  h+=catSumHTML(list)+placeChecklistHTML(pls,list,false,wk);
  h+=crewReportHTML(list,false);
  h+=massReportHTML(list,false);
  h+=typeReportHTML(list,fbList);
  if(list.length){h+=`<div class="rp-sub" style="font-size:15px">🧹 ജോലി വിവരങ്ങൾ (Work entries)</div>`;const withPh=$('#rPhotos').checked;
    const parts=await Promise.all(list.map(async e=>{const [ps,rs]=await Promise.all([withPh?getDocs(collection(db,'entries',e.id,'photos')):null,getDocs(collection(db,'entries',e.id,'remarks'))]);
      return dailyEntryHTML(e,ps?ps.docs.map(x=>x.data()):[],rs.docs.map(x=>x.data({serverTimestamps:'estimate'})).sort((x,z)=>(x.createdAt?.seconds||0)-(z.createdAt?.seconds||0)),withPh)}));if(tok!==reportToken)return;h+=parts.join('')}
  else h+=emptyHTML('inbox','ഈ ദിവസം ജോലി എൻട്രികൾ ഇല്ല','No work entries this day');
  if(can.staff())h+=`<div class="rp-sub" style="font-size:15px">🗣️ സ്ഥലവാസികളുടെ അഭിപ്രായം / നിർദ്ദേശങ്ങൾ (Resident feedback & suggestions)</div>`+dayFbHTML(fbList)+sqDayHTML(sqList);
  h+=CREDIT();$('#reportOut').innerHTML=h;
  const L=[`🧹 ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം`,...(jdText?[`🏛️ ${jdLines().join(' · ')}`]:[]),`📅 ദിവസ റിപ്പോർട്ട് (Daily report): ${fmtDate(d)}`,filt?`🔎 ${[a,w,pn,wk,rty?typeInfo(rty).ml:''].filter(Boolean).join(' · ')}`:'',
    `✅ സ്ഥലം പൂർത്തി (Places done): ${k?doneN:doneN+'/'+pls.length}`,`🧹 ജോലി (Entries): ${list.length}`,catSumText(list),`⭐ സ്കോർ (Avg score): ${st.avg??'–'}`,`💬 അഭിപ്രായം (Remarks): ${rcount} · ബാക്കി (awaiting) ${st.awaiting}`,
    can.staff()?`🗣️ സ്ഥലവാസി അഭിപ്രായം (Resident feedback): ${fbList.length}${fbAvg!=null?' · ശരാശരി '+fbAvg.toFixed(1)+'★':''}`:'',
    can.staff()&&sqList.length?`🏛️ SPHI, PHI, മറ്റ് ഉദ്യോഗസ്ഥർ & സ്ക്വാഡ് എന്നിവരുടെ പരിശോധന (Inspections): ${sqList.length} · ${sqList.map(f=>`${f.officialName} (${f.designation}) – ${(SQ_OVR[f.overall]||[''])[0]} ${f.rating}★`).join('; ')}`:'',
    pls.length?`📍 സ്ഥലങ്ങൾ / റോഡുകൾ (Places):\n${pls.map(p=>`${placeDone(p,list).length?'✅':'⬜'} ${p.name}${p.ward?' – '+p.ward:''}`).join('\n')}`:'',crewShare(list,false),massShare(list,false)].filter(Boolean);
  const E=list.map(e=>`• ${e.time||''} ${e.placeName} – ${e.workerName||''}${crewOf(e).length?' (👥 '+crewOf(e).join(', ')+')':''} – ${worksText(e)}\n   ${catMarks(e)}${e.score!=null?' – സ്കോർ '+e.score:''}`);
  shareText=L.join('\n')+(E.length?'\n\n'+E.join('\n'):'')+'\n\n— ഭദ്രം ഈ ഭൂമി app'}
async function makeMonthly(){const tok=++reportToken;const m=$('#rMonth').value||today().slice(0,7);const [y,mo]=m.split('-').map(Number);const last=ymd(new Date(y,mo,0));
  $('#reportOut').innerHTML=skelHTML(3);shareText='';
  const pl=$('#rPlace').value;
  const s=await getDocs(query(collection(db,'entries'),where('date','>=',m+'-01'),where('date','<=',last),orderBy('date')));if(tok!==reportToken)return;
  const a=$('#rArea').value,w=$('#rWard').value,k=$('#rWorker').value,rty=$('#rType').value;
  const list=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:'estimate'})})).filter(e=>(!rty||placeTypeOf(e)===rty)&&(!a||e.area===a)&&(!w||e.ward===w)&&(!k||e.workerUid===k)&&(!pl||e.placeId===pl)).sort((x,z)=>(x.date+(x.time||'')).localeCompare(z.date+(z.time||'')));
  const st=stats(list);const wk=k?users.find(u=>u.uid===k)?.name:'',pn=pl?places.find(p=>p.id===pl)?.name:'';const pls=reportPlaces(list,{a,w,rty,pl});
  const mfilt=[a,w,pn,wk,rty?typeInfo(rty).icon+' '+typeInfo(rty).ml:''].filter(Boolean).map(esc).join(' · ');
  let h=`<div class="rp-h"><div class="rp-brand"><span class="mark">${MARK_SVG}</span><b>ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം</b></div><div class="en">Bhadram Ee Bhoomi – Daily Cleaning</div><h2>🧹 മാസ റിപ്പോർട്ട് (Monthly Report) – ${fmtMonth(m)}</h2>${jdReportHTML()}${mfilt?`<div class="rp-filt">🔎 ${mfilt}</div>`:''}</div>`;
  const fbList=can.staff()?(await monthFeedback(m,last,a,w,rty)).filter(f=>!pl||f.placeId===pl):[];const sqList=can.staff()?await rangeSquad(new Date(m+'-01T00:00:00'),new Date(last+'T23:59:59.999'),a,w,rty,pl):[];if(tok!==reportToken)return;
  if(!list.length){const fb=can.staff()?typeReportHTML([],fbList)+fbReportHTML(fbList)+sqMonthHTML(sqList):'';$('#reportOut').innerHTML=h+placeChecklistHTML(pls,list,true,wk)+emptyHTML('inbox','ജോലി എൻട്രികൾ ഇല്ല','No work entries')+fb+CREDIT();return}
  h+=`<div class="rp-sum"><b>ആകെ (Summary):</b> ${list.length} ജോലി (entries) · ${st.days} ദിവസം (days) · ${st.places} സ്ഥലം (places) · ${st.workers} തൊഴിൽ (worker-days) · 📷 ${st.photos}${Object.keys(st.waste).length?' · 🗑️ '+Object.entries(st.waste).map(([u,v])=>`${+v.toFixed(2)} ${esc(u)}`).join(', '):''}<br>
    <b>ശുചിത്വ സ്കോർ (Cleanliness score): <span style="color:${scoreColor(st.avg)}">${st.avg??'–'}/100</span></b> · ഫോട്ടോ തെളിവ് (photo proof) ${st.proof}% · അഭിപ്രായം ബാക്കി (awaiting remark) ${st.awaiting}</div>`;
  h+=catSumHTML(list)+placeChecklistHTML(pls,list,true,wk)+crewReportHTML(list,true)+massReportHTML(list,true);
  const byW={};list.forEach(e=>{const key=e.ward||e.placeName;(byW[key]=byW[key]||[]).push(e)});
  h+=`<table class="rp-tbl"><tr><th>വാർഡ് (Ward)</th><th>ജോലി (Entries)</th><th>സ്കോർ (Score)</th></tr>${Object.entries(byW).map(([k2,v])=>`<tr><td>${esc(k2)}</td><td>${v.length}</td><td>${stats(v).avg??'–'}</td></tr>`).join('')}</table>`;
  h+=typeReportHTML(list,fbList);if(can.staff())h+=fbReportHTML(fbList)+sqMonthHTML(sqList);
  const withPh=$('#rPhotos').checked;
  for(const e of list){const [ps,rs]=await Promise.all([withPh?getDocs(collection(db,'entries',e.id,'photos')):null,getDocs(collection(db,'entries',e.id,'remarks'))]);if(tok!==reportToken)return;
    h+=entryHTML(e,ps?ps.docs.map(d=>d.data()).sort((x,z)=>x.ts-z.ts):[],rs.docs.map(d=>d.data({serverTimestamps:'estimate'})).sort((x,z)=>(x.createdAt?.seconds||0)-(z.createdAt?.seconds||0)),withPh)}
  h+=`<p class="hint center">തയ്യാറാക്കിയത് (Generated): ${new Date().toLocaleString('en-IN')} · ${esc(meDoc?.name||'')} · ഭദ്രം ഈ ഭൂമി (Bhadram Ee Bhoomi)<br>ആപ്പ് ഡെവലപ്പർ: രാഹുൽ കെ.ടി. (Grok സഹായത്തോടെ) · Developed by Rahul K T with Grok</p>`;$('#reportOut').innerHTML=h;
  shareText=[`🧹 ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം`,jdText?`🏛️ ${jdLines().join(' · ')}`:'',`🗓️ മാസ റിപ്പോർട്ട് (Monthly report): ${fmtMonth(m)}`,`🧹 ജോലി (Entries): ${list.length} · ${st.days} ദിവസം · ${st.places} സ്ഥലം`,catSumText(list),`⭐ സ്കോർ (Score): ${st.avg??'–'}/100 · ഫോട്ടോ തെളിവ് ${st.proof}%`,`💬 അഭിപ്രായം ബാക്കി (Awaiting): ${st.awaiting}`,can.staff()&&fbList.length?`🗣️ സ്ഥലവാസി അഭിപ്രായം: ${fbList.length} · ശരാശരി ${(fbList.reduce((n,f)=>n+f.rating,0)/fbList.length).toFixed(1)}★`:'',pls.length?`📍 സ്ഥലങ്ങൾ / റോഡുകൾ (Places):\n${pls.map(p=>{const n=new Set(placeDone(p,list).map(e=>e.date)).size;return `${n?'✅':'⬜'} ${p.name}${p.ward?' – '+p.ward:''}${n?` (${n} ദിവസം)`:''}`}).join('\n')}`:'',crewShare(list,true),massShare(list,true),'— ഭദ്രം ഈ ഭൂമി app'].filter(Boolean).join('\n')}
async function ensureShare(){if(!shareText||!$('#reportOut .rp-h'))await makeReport();return shareText||$('#reportOut').innerText.slice(0,1500)}
async function copyText(t){try{await navigator.clipboard.writeText(t);toast('📋 കോപ്പി ചെയ്തു (Copied)')}catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('📋 കോപ്പി ചെയ്തു (Copied)')}catch(_){toast('⚠️ copy failed')}ta.remove()}}
$('#rShare').onclick=async()=>{const t=await ensureShare();if(navigator.share){try{await navigator.share({title:'ഭദ്രം ഈ ഭൂമി – റിപ്പോർട്ട്',text:t});return}catch(e){if(e.name==='AbortError')return}}copyText(t)};
$('#rWa').onclick=async()=>{const t=await ensureShare();window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank','noopener')};
$('#rCopy').onclick=async()=>copyText(await ensureShare());
$('#rPrint').onclick=async()=>{if(!$('#reportOut .rp-h')||reportKey()!==lastReportKey)await makeReport();await printFormal($('#reportOut').innerHTML,{...reportMeta(),review:await reportReviewHTML()})};
/* ---------- on-device PDF (html2canvas + jsPDF, vendored for offline) ---------- */
let pdfReady=null,pdfBusy=false;
const loadScript=src=>new Promise((res,rej)=>{if(document.querySelector(`script[data-src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.dataset.src=src;s.onload=res;s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s)});
const reportKey=()=>[rMode,rMode==='day'?$('#rDate').value:$('#rMonth').value,$('#rArea').value,$('#rWard').value,$('#rPlace').value,$('#rWorker').value,$('#rType').value,$('#rPhotos').checked].join('|');
const PDF_LABEL='<svg class="ic"><use href="#i-share"/></svg><span>PDF ഷെയർ / WhatsApp <small class="en">(Share PDF)</small></span>';
function resetPdfBtn(){pdfReady=null;const b=$('#rPdf');if(b&&!pdfBusy){b.classList.remove('ready');b.innerHTML=PDF_LABEL}}
function pdfProg(on,msg,frac){$('#rPdfProg').hidden=!on;if(msg!=null)$('#rPdfMsg').textContent=msg;if(frac!=null)$('#rPdfProg .bar i').style.width=Math.round(frac*100)+'%'}
const CSS_COLOR_PROPS=['color','background-color','background-image','border-top-color','border-right-color','border-bottom-color','border-left-color','outline-color','text-decoration-color','box-shadow','fill','stroke','caret-color','column-rule-color'];
const toRGBA=v=>v.replace(/color\(srgb\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)(?:\s*\/\s*([\d.e+-]+))?\)/g,(m,r,g,b,a)=>`rgba(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)},${a==null?1:+a})`).replace(/(?:oklab|oklch|lab|lch|color)\([^()]*\)/g,'rgba(0,0,0,0)');
function fixCloneColors(doc){const win=doc.defaultView;for(const el of doc.querySelectorAll('.pdfpage, .pdfpage *')){const cs=win.getComputedStyle(el);
  for(const pr of CSS_COLOR_PROPS){const v=cs.getPropertyValue(pr);if(v&&/(color|oklab|oklch|lab|lch)\(/.test(v))el.style.setProperty(pr,toRGBA(v),'important')}}}
async function reportReviewHTML(){if(rMode==='day'){const d=$('#rDate').value||today();return reviewPdfHTML(await getReview(d),d)}const m=$('#rMonth').value||today().slice(0,7);return reviewMonthHTML(await getMonthReviews(m),m)}
async function buildReportPdf(){
  await Promise.all([loadScript('vendor/html2canvas.min.js'),loadScript('vendor/jspdf.umd.min.js')]);
  if(!$('#reportOut .rp-h')||reportKey()!==lastReportKey)await makeReport();
  const title=rMode==='day'?`Daily report ${($('#rDate').value||'').split('-').reverse().join('/')}`:`Monthly report ${$('#rMonth').value}`;
  const pdf=await htmlToPdf($('#reportOut').innerHTML,title,pdfProg,{...reportMeta(),review:await reportReviewHTML()});
  pdfProg(true,'✅ PDF തയ്യാർ (Ready)',1);
  const name=`Bhadram-Ee-Bhoomi-${rMode==='day'?'Daily-Report-'+$('#rDate').value:'Monthly-Report-'+$('#rMonth').value}.pdf`;
  const blob=pdf.output('blob');return {file:new File([blob],name,{type:'application/pdf'}),blob,name,title,key:reportKey(),pages:pdf.getNumberOfPages()}}
/* ---------- single work-entry PDF ---------- */
const boxItem=(on,label,extra)=>`<div class="pci${on?' on':''}"><span class="pcb${on?' on':''}">${on?'✓':''}</span><span class="pcn">${label}</span>${extra||''}</div>`;
function entryWorkTypesHTML(e){const works=e.works||[],mw=e.massWorks||[];
  const reg=WORKS.filter(w=>w[0]!=='other').map(w=>boxItem(works.includes(w[0]),`${esc(w[1])} <span class="en">(${esc(w[2])})</span>`)).join('');
  const regOther=boxItem(works.includes('other')||!!e.workOther,`➕ മറ്റുള്ളവ <span class="en">(Other)</span>${e.workOther?`: <b>${esc(e.workOther)}</b>`:''}`);
  const ks=kindsOf(e),pl=massPlaceOf(e);
  const mass=massItems(e).map(t=>boxItem(t.on,`${esc(t.label)}${t.removed?' <span class="en">(ഒഴിവാക്കി · removed)</span>':''}`)).join('');
  const massOther=boxItem(!!(e.mass&&e.massOther),`➕ മറ്റുള്ളവ <span class="en">(Other)</span>${e.mass&&e.massOther?`: <b>${esc(e.massOther)}</b>`:''}`);
  return `<div class="rp-sub" style="font-size:16px">🧹 തൊഴിൽ തരം <span class="en">(Type of work)</span></div>
  <div class="ewt-h">ജോലി വിഭാഗം <span class="en">(Work category)</span></div><div class="pcl ewt cat3">${Object.entries(KIND).map(([k,v])=>boxItem(ks.includes(k),`${v[0]} <b>${v[1]}</b> <span class="en">(${v[2]})</span>`)).join('')}</div>
  <div class="ewt-h">ദൈനംദിന ശുചീകരണ ജോലികൾ <span class="en">(Daily cleaning works)</span></div><div class="pcl ewt">${reg}${regOther}</div>
  <div class="pcl ewt one">${boxItem(!!pl,`📍 ചെയ്ത സ്ഥലം <span class="en">(Place where done)</span>: ${pl?`<b>${esc(pl)}</b>${e.mass&&!e.placeId?' <span class="en">(one-off)</span>':''}`:'<span class="sg-line"></span>'}`)}</div>
  <div class="pcl ewt">${boxItem(!!massWardOf(e),`വാർഡ് <span class="en">(Ward)</span>: ${massWardOf(e)?`<b>${esc(massWardOf(e))}</b>`:'<span class="sg-line"></span>'}`)}${boxItem(!!massAreaOf(e),`ഏരിയ <span class="en">(Area)</span>: ${massAreaOf(e)?`<b>${esc(massAreaOf(e))}</b>`:'<span class="sg-line"></span>'}`)}</div>
  <div class="ewt-h">💪 മാസ് / സ്പെഷ്യൽ വർക്ക് ജോലികൾ <span class="en">(Mass / special work types)</span></div><div class="pcl ewt">${mass}${massOther}</div>`}
function entryPdfHTML(e,photos,remarks){
  const proof=photoStatus(e);
  const t=typeInfo(placeTypeOf(e),e);
  const rows=[['📅 തീയതി (Date)',esc(fmtDate(e.date))],['🕐 സമയം (Time)',esc(e.time||'')],['📍 സ്ഥലം / വാർഡ് (Place / ward)',esc([e.placeName,e.ward,e.area].filter(Boolean).join(', '))+(e.mass&&!e.placeId?' <span class="en">(one-off)</span>':'')],
    ['🏷️ സ്ഥല തരം (Place type)',esc(t.icon+' '+t.ml+(t.en?' ('+t.en+')':''))],['👷 തൊഴിലാളി (Worker)',esc(e.workerName||'')],['👥 തൊഴിലാളികളുടെ എണ്ണം (Workers)',e.workers!=null?esc(e.workers):''],['📝 തൊഴിലാളികളുടെ പേരുകൾ (Workers\' names)',crewOf(e).length?crewOf(e).map((n,i)=>`${i+1}. ${esc(n)}`).join('<br>'):''],
    ['🗑️ മാലിന്യം (Waste)',e.waste!=null?esc(e.waste+' '+(e.wasteUnit||'')):''],['📋 നില (Status)',proof+(e.score!=null?` · സ്കോർ (Score) <b>${e.score}</b>`:'')],
    ['🛰️ ലൊക്കേഷൻ (Location)',e.gps?`${e.gps.lat.toFixed(5)}, ${e.gps.lng.toFixed(5)}${e.gps.acc?` (±${Math.round(e.gps.acc)} m)`:''}<br><span class="en">maps.google.com/?q=${e.gps.lat.toFixed(5)},${e.gps.lng.toFixed(5)}</span>`:'<span class="en">– (GPS ഇല്ല / not recorded)</span>'],
    ['📝 കുറിപ്പ് (Remarks / notes)',esc(e.notes||'')]].filter(x=>x[1]!=='');
  const ph=photos.slice().sort(phSort);
  return REPORT_HEAD(`🧾 ജോലി റിപ്പോർട്ട് (Work entry) – ${fmtDate(e.date)}${e.time?' · '+esc(e.time):''}`)+`</div>
  ${e.mass?`<div style="margin:6px 0">${kindBadge(e)}</div>`:''}
  <table class="rp-tbl" style="margin:8px 0"><tbody>${rows.map(r=>`<tr><td style="width:36%">${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table>
  ${entryWorkTypesHTML(e)}
  ${ph.length?`<div class="rp-sub" style="font-size:15px">📷 ഫോട്ടോകൾ (Photos): ${ph.length}</div><div class="dr-ph">${ph.map(p=>{const c=phCap(p.kind);return `<figure><img src="${p.url||p.data}" alt=""><figcaption>${c} · ${esc(e.placeName)}${e.time?' · '+esc(e.time):''}</figcaption>${phNoteHTML(p)}</figure>`}).join('')}</div>`:''}
  ${remarks&&remarks.length?remarksHTML(remarks):'<div class="rp-sub">👮 ഉദ്യോഗസ്ഥരുടെ അഭിപ്രായം (Officer remarks)</div><p class="hint">ഇതുവരെ ഇല്ല (None yet)</p>'}`+CREDIT()}
let entryPdfBusy=false;const EPDF_LABEL='<svg class="ic"><use href="#i-share"/></svg><span>PDF അയയ്ക്കുക / WhatsApp <small class="en">(Share)</small></span>';
function detProg(on,msg,frac){const w=$('#detPdfProg');if(!w)return;w.hidden=!on;if(msg!=null)$('#detPdfMsg').textContent=msg;if(frac!=null)w.querySelector('.bar i').style.width=Math.round(frac*100)+'%'}
async function entryData(id){let e=entries.find(x=>x.id===id);if(!e){const d=await getDoc(doc(db,'entries',id));if(!d.exists())throw new Error('entry not found');e={id,...d.data({serverTimestamps:'estimate'})}}
  const [ps,rs]=await Promise.all([getDocs(collection(db,'entries',id,'photos')),getDocs(collection(db,'entries',id,'remarks'))]);
  const photos=ps.docs.map(d=>d.data()),remarks=rs.docs.map(d=>d.data({serverTimestamps:'estimate'})).sort((x,z)=>(x.createdAt?.seconds||0)-(z.createdAt?.seconds||0));
  const dd=(e.date||'').split('-').reverse().join('/');const rv=await getReview(e.date);
  const meta={review:reviewPdfHTML(rv,e.date),titleMl:`ജോലി റിപ്പോർട്ട് – ${fmtDate(e.date)}${e.time?' · '+e.time:''}${e.mass?' ('+kindText(e,false,false)+')':''}`,titleEn:`Work Entry Report – ${dd}${e.time?' '+e.time:''}${e.mass?' ('+kindText(e,true,false)+')':''}`,id:`WE-${(e.date||'').replace(/-/g,'')}-${(e.time||'').replace(':','')}-${id.slice(0,6).toUpperCase()}`};
  return {e,html:entryPdfHTML(e,photos,remarks),meta,title:`Work entry ${dd} ${e.time||''}`,sig:JSON.stringify([e.updatedAt||e.createdAt||null,photos.length,remarks.length,remarks.map(r=>r.text||'').join('|').length,rv?JSON.stringify(rv):''])}}
let entryPdfCache=null;
async function buildEntryPdf(id){await Promise.all([loadScript('vendor/html2canvas.min.js'),loadScript('vendor/jspdf.umd.min.js')]);
  const d=await entryData(id);if(entryPdfCache&&entryPdfCache.id===id&&entryPdfCache.sig===d.sig){detProg(true,'✅ PDF തയ്യാർ (Ready)',1);return entryPdfCache.r}
  const pdf=await htmlToPdf(d.html,d.title,detProg,d.meta);detProg(true,'✅ PDF തയ്യാർ (Ready)',1);
  const name=`Bhadram-Ee-Bhoomi-Entry-${d.meta.id}.pdf`;const blob=pdf.output('blob');
  const r={file:new File([blob],name,{type:'application/pdf'}),blob,name,title:d.title,id:d.meta.id,pages:pdf.getNumberOfPages()};window.__lastEntryPdf=r;entryPdfCache={id,sig:d.sig,r};return r}
/* action: 'share' | 'save' | 'print' */
async function entryPdfAction(id,act,btn){if(entryPdfBusy)return;entryPdfBusy=true;const b=btn||null;if(b)b.disabled=true;
  detProg(true,act==='print'?'പ്രിൻ്റ് തയ്യാറാക്കുന്നു… (Preparing print)':'PDF തയ്യാറാക്കുന്നു… (Creating PDF)',0.05);if(b&&!b.closest('.detpdf'))toast(act==='print'?'🖨️ പ്രിൻ്റ് തയ്യാറാക്കുന്നു… (Preparing print)':'📄 PDF തയ്യാറാക്കുന്നു… (Creating PDF)',3500);
  try{if(act==='print'){const d=await entryData(id);entryPdfBusy=false;if(b)b.disabled=false;detProg(false);await printFormal(d.html,d.meta);return}
    const r=await buildEntryPdf(id);if(b)b.disabled=false;entryPdfBusy=false;
    if(act==='save'){downloadPdf(r);return}
    const sb=b&&b.id==='detPdf'?b:null;const res=await sharePdf(r,sb?'#detPdf':'#__none','ജോലി റിപ്പോർട്ട്');
    if(res==='needtap'&&sb){sb.onclick=async()=>{await sharePdf(r,'#detPdf','ജോലി റിപ്പോർട്ട്');sb.classList.remove('ready');sb.innerHTML=EPDF_LABEL;sb.onclick=()=>entryPdfAction(id,'share',sb)}}}
  catch(err){console.error(err);$$('.pdfpage').forEach(x=>x.remove());toast('⚠️ PDF ഉണ്ടാക്കാനായില്ല (PDF failed): '+(err.message||err),5000);detProg(false)}
  finally{entryPdfBusy=false;if(b)b.disabled=false;setTimeout(()=>{if(!entryPdfBusy)detProg(false)},4000)}}
const shareEntryPdf=(id,btn)=>entryPdfAction(id,'share',btn);
/* small menu on list cards: Share / Save / Print */
function entryPdfMenu(id,btn){let m=$('#epMenu');if(m){const same=m.dataset.id===id;m.remove();if(same)return}
  m=document.createElement('div');m.id='epMenu';m.className='epmenu noprint';m.dataset.id=id;m.setAttribute('role','menu');
  m.innerHTML=`<button data-a="share" role="menuitem">${ico('share','sm')}<span>PDF അയയ്ക്കുക / WhatsApp <small class="en">(Share)</small></span></button><button data-a="save" role="menuitem">${ico('download','sm')}<span>PDF സേവ് <small class="en">(Save)</small></span></button><button data-a="print" role="menuitem">${ico('print','sm')}<span>പ്രിൻ്റ് <small class="en">(Print)</small></span></button>${canDelEntry(entries.find(x=>x.id===id))?`<hr><button data-a="delete" role="menuitem" class="mdel">${ico('trash','sm')}<span>നീക്കുക <small class="en">(Delete)</small></span></button>`:''}`;
  document.body.appendChild(m);const rc=btn.getBoundingClientRect(),mw=m.offsetWidth,mh=m.offsetHeight;
  let top=rc.bottom+6;if(top+mh>innerHeight-8)top=Math.max(8,rc.top-mh-6);m.style.top=(top+scrollY)+'px';m.style.left=Math.max(8,Math.min(innerWidth-mw-8,rc.right-mw))+'px';
  m.querySelectorAll('button').forEach(x=>x.onclick=ev=>{ev.stopPropagation();m.remove();if(x.dataset.a==='delete')deleteEntry(id);else entryPdfAction(id,x.dataset.a,btn)});
  setTimeout(()=>{const close=ev=>{if(!m.contains(ev.target)){m.remove();document.removeEventListener('click',close,true)}};document.addEventListener('click',close,true)},0)}
/* formal print view (reports and single entries) */
async function printFormal(html,meta){let ps=$('#printSheet');if(!ps){ps=document.createElement('div');ps.id='printSheet';document.body.appendChild(ps)}
  ps.className='fsheet';ps.innerHTML=formalHTML(html,meta);{const rv=ps.querySelector(':scope>.rvwrap'),sg=ps.querySelector(':scope>.sigblk');if(rv&&sg)sg.before(rv)}
  await Promise.all([...ps.querySelectorAll('img')].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})));
  document.body.classList.add('pf');const done=()=>{document.body.classList.remove('pf');window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);print()}
/* ---------- formal (letterhead) layout shared by all PDFs and the print view ---------- */
const EMOJI_RE=/(?![\u2610\u2611\u2612])(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?|[\u{1F3FB}-\u{1F3FF}])*\uFE0F?[ \u00A0]?/gu;
const noEmoji=t=>String(t||'').replace(/[\u00A9\u00AE\u2122]/g,m=>m).replace(EMOJI_RE,'').replace(/\uFE0F/g,'').replace(/\s{2,}/g,' ').trim();
function stripEmojiDom(root){const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const L=[];let n;while((n=tw.nextNode()))L.push(n);
  for(const t of L){if(t.parentElement?.closest('.pcb'))continue;const v=t.nodeValue.replace(EMOJI_RE,'').replace(/\uFE0F/g,'');if(v!==t.nodeValue)t.nodeValue=v}}
const fmtGen=d=>`${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
function formalHTML(html,meta){const d=document.createElement('div');d.innerHTML=html;
  const h=d.querySelector('.rp-h');const filt=h?.querySelector('.rp-filt')?.textContent||'';if(h)h.remove();
  d.querySelectorAll('svg.ic,.mark,.hic').forEach(x=>x.remove());
  d.querySelectorAll('.pcb').forEach(b=>{b.textContent=b.classList.contains('on')?'✓':''});
  stripEmojiDom(d);const gen=meta.gen||new Date();const jd=jdLines();const role=noEmoji((meDoc?.desig||'').trim()||ROLES[meDoc?.role]||'');
  const head=`<div class="lh"><div class="lh-top"><div class="lh-mark">${MARK_SVG}</div><div class="lh-name"><b>ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം</b><span>Bhadram Ee Bhoomi – Daily Cleaning</span></div>${jd.length?`<div class="lh-office">${jd.map(esc).join('<br>')}</div>`:''}</div>
    <div class="lh-title"><b>${esc(meta.titleMl)}</b><span>${esc(meta.titleEn)}</span></div>
    <table class="lh-meta"><tr><td>റിപ്പോർട്ട് നമ്പർ <i>Report No.</i></td><td><b>${esc(meta.id)}</b></td><td>തയ്യാറാക്കിയ സമയം <i>Generated</i></td><td>${fmtGen(gen)}</td></tr>${filt?`<tr><td>ഫിൽറ്റർ <i>Filter</i></td><td colspan="3">${esc(noEmoji(filt))}</td></tr>`:''}</table></div>`;
  const line='<span class="sg-line"></span>';
  const sign=`<div class="sigblk"><table><tr><th>തയ്യാറാക്കിയത് <i>Prepared by</i></th><th>പരിശോധിച്ചത് <i>Verified by</i></th></tr>
    <tr><td>പേര് <i>Name</i>: <b>${esc(meDoc?.name||'')}</b></td><td>പേര് <i>Name</i>: ${line}</td></tr>
    <tr><td>പദവി <i>Designation</i>: ${esc(role)}</td><td>പദവി <i>Designation</i>: ${line}</td></tr>
    <tr><td>തീയതി <i>Date</i>: ${fmtGen(gen).slice(0,10)}</td><td>തീയതി <i>Date</i>: ${line}</td></tr>
    <tr class="sg"><td>ഒപ്പ് <i>Signature</i>: ${line}</td><td>ഒപ്പ് <i>Signature</i>: ${line}</td></tr></table></div>`;
  return head+d.innerHTML+sign+(meta.review?`<div class="rvwrap">${meta.review}</div>`:'')}
function reportMeta(){const fk=[$('#rArea').value,$('#rWard').value,$('#rPlace').value,$('#rWorker').value,$('#rType').value].join('|');let hsh=0;for(const c of fk)hsh=(hsh*31+c.charCodeAt(0))>>>0;const sfx=fk.replace(/\|/g,'')?'-F'+hsh.toString(36).slice(0,4).toUpperCase():'';
  if(rMode==='day'){const d=$('#rDate').value||today();return {titleMl:`ദിവസ റിപ്പോർട്ട് – ${fmtDate(d)}`,titleEn:`Daily Cleaning Report – ${d.split('-').reverse().join('/')}`,id:`DR-${d.replace(/-/g,'')}${sfx}`}}
  const m=$('#rMonth').value||today().slice(0,7);const [y,mo]=m.split('-');return {titleMl:`മാസ റിപ്പോർട്ട് – ${fmtMonth(m)}`,titleEn:`Monthly Cleaning Report – ${new Date(+y,+mo-1,1).toLocaleString('en-GB',{month:'long'})} ${y}`,id:`MR-${y}${mo}${sfx}`}}
function textCanvas(parts,w,h){const S=3;const c=document.createElement('canvas');c.width=w*S;c.height=h*S;const x=c.getContext('2d');x.scale(S,S);x.fillStyle='#fff';x.fillRect(0,0,w,h);
  x.strokeStyle='#111';x.lineWidth=.8;x.beginPath();x.moveTo(0,parts.top?h-1:1);x.lineTo(w,parts.top?h-1:1);x.stroke();
  x.fillStyle='#111';x.font=`11px "Noto Sans Malayalam","Inter",sans-serif`;x.textBaseline='middle';
  if(parts.l){x.textAlign='left';x.fillText(parts.l,2,h/2+1)}if(parts.c){x.textAlign='center';x.fillText(parts.c,w/2,h/2+1)}if(parts.r){x.textAlign='right';x.fillText(parts.r,w-2,h/2+1)}return c.toDataURL('image/png')}
/* pick the smaller of JPEG and PNG for a text-only page so files stay reasonable at 3x */
function pageImg(cv,hasPh,Q){const jpg=cv.toDataURL('image/jpeg',Q);if(hasPh)return {data:jpg,fmt:'JPEG'};
  const png=cv.toDataURL('image/png');return png.length<jpg.length?{data:png,fmt:'PNG'}:{data:jpg,fmt:'JPEG'}}
/* render report-style HTML into an A4 PDF (rasterised so Malayalam always renders) */
async function htmlToPdf(html,title,prog,meta){if(meta)html=formalHTML(html,meta);
  await Promise.all([loadScript('vendor/html2canvas.min.js'),loadScript('vendor/jspdf.umd.min.js')]);
  try{await document.fonts.ready}catch(e){}
  const W=794,PAGE_H=Math.floor(277*W/190),MM=190/W;
  const sheet=document.createElement('div');sheet.className='pdfpage'+(meta?' fsheet':'');sheet.innerHTML=html;document.body.appendChild(sheet);
  await Promise.all([...sheet.querySelectorAll('img')].map(i=>i.decode?i.decode().catch(()=>{}):0));
  // split blocks taller than a page: group their children into page-sized chunks, each wrapped in a shallow copy of the parent
  const LIM=PAGE_H*0.92, FIT=0.85;
  const hd=c=>c.classList.contains('rp-sub')||c.classList.contains('ewt-h')||c.classList.contains('rv-h')||c.classList.contains('rv-sub')||/^H[1-4]$/.test(c.tagName);const isHead=el=>hd(el)||(el.children.length>0&&el.children.length<=2&&[...el.children].every(hd));
  const outerH=el=>{const cs=getComputedStyle(el);return el.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0)};
  const spanH=(a,b)=>!a||!b?0:(b.offsetTop+b.offsetHeight)-a.offsetTop;
  const splitTable=table=>{if(table.offsetHeight<=LIM||!table.rows||table.rows.length<3)return [table];
    const rows=[...table.rows];const headRows=[],bodyRows=[];
    rows.forEach((r,i)=>{if(r.parentElement&&r.parentElement.tagName==='THEAD'||i===0&&[...r.cells].every(c=>c.tagName==='TH'))headRows.push(r);else bodyRows.push(r)});
    if(!bodyRows.length)return [table];
    const headH=headRows.reduce((n,r)=>n+outerH(r),0),shell=Math.max(0,table.offsetHeight-rows.reduce((n,r)=>n+outerH(r),0));
    const chunks=[];let cur=[],acc=shell+headH;
    for(const r of bodyRows){const h=outerH(r);if(cur.length&&acc+h>LIM){chunks.push(cur);cur=[r];acc=shell+headH+h}else{cur.push(r);acc+=h}}
    if(cur.length)chunks.push(cur);if(chunks.length<=1)return [table];
    return chunks.map(ch=>{const w=table.cloneNode(false);
      if(headRows.length){const hdEl=document.createElement('thead');headRows.forEach(r=>hdEl.appendChild(r.cloneNode(true)));w.appendChild(hdEl)}
      const tb=document.createElement('tbody');ch.forEach(r=>tb.appendChild(r));w.appendChild(tb);return w})};
  const split=el=>{if(el.tagName==='TABLE')return splitTable(el);
    if(el.offsetHeight<=LIM||!el.children.length||/^(IMG|FIGURE|UL)$/.test(el.tagName))return [el];
    const kids=[...el.children].map(k=>({k,h:outerH(k)}));if(getComputedStyle(el).display==='grid'){const gap=parseFloat(getComputedStyle(el).rowGap)||0;let row=null;for(const x of kids){if(row&&Math.abs(x.k.offsetTop-row.k.offsetTop)<2){row.h=Math.max(row.h,x.h+gap);x.h=0}else{x.h+=gap;row=x}}}const shellPad=el.offsetHeight-kids.reduce((n,x)=>n+x.h,0);
    const chunks=[];let cur=[],acc=Math.max(0,shellPad);
    for(const x of kids){if(x.h>LIM){if(cur.length){chunks.push(cur);cur=[];acc=Math.max(0,shellPad)}split(x.k).forEach(piece=>chunks.push([piece]));continue}
      if(acc+x.h>LIM&&cur.length){const carry=[];while(cur.length&&isHead(cur[cur.length-1]))carry.unshift(cur.pop());if(cur.length)chunks.push(cur);cur=carry;acc=Math.max(0,shellPad)+carry.reduce((n,c)=>n+outerH(c),0)}cur.push(x.k);acc+=x.h}
    if(cur.length)chunks.push(cur);
    return chunks.map(ch=>{const w=el.cloneNode(false);ch.forEach(n=>w.appendChild(n));return w})};
  const paginate=sh=>{for(const el of [...sh.children]){const parts=split(el);if(parts.length>1||parts[0]!==el){const f=document.createDocumentFragment();parts.forEach(x=>f.appendChild(x));el.replaceWith(f)}}
    const items=[...sh.children];const pages=[];let cur=[],start=0;
    for(const it of items){const top=it.offsetTop,bot=top+it.offsetHeight;if(!cur.length){cur=[it];start=top;continue}
      const h=bot-start;
      if(h>PAGE_H){const ratio=h/PAGE_H;
        /* keep a slightly-over block on this page (we'll scale the raster) rather than leave a near-empty next page */
        if(ratio<=1/FIT){cur.push(it);continue}
        const carry=[];while(cur.length>1&&isHead(cur[cur.length-1]))carry.unshift(cur.pop());pages.push(cur);cur=[...carry,it];start=(carry[0]||it).offsetTop}else cur.push(it)}
    if(cur.length)pages.push(cur);return pages};
  /* officers' evaluation: one page when possible, placed immediately before the last (signature) page */
  const rvEl=sheet.querySelector(':scope>.rvwrap');let rvSheet=null;
  if(rvEl){rvSheet=document.createElement('div');rvSheet.className=sheet.className;while(rvEl.firstChild)rvSheet.appendChild(rvEl.firstChild);rvEl.remove();document.body.appendChild(rvSheet)}
  const pages=paginate(sheet);
  if(rvSheet){const kids=[...rvSheet.children];const h=spanH(kids[0],kids[kids.length-1]);
    let rp;if(!kids.length)rp=[];else if(h<=PAGE_H||(h/PAGE_H)<=1/FIT)rp=[kids];else rp=paginate(rvSheet);
    /* keep signature as the last page; leftover photos/remarks stay on the preceding content page */
    const last=pages[pages.length-1]||[];
    const sg=last.find(n=>n.classList&&n.classList.contains('sigblk'));
    if(sg&&last.length>1){last.splice(last.indexOf(sg),1);pages.push(...rp,[sg])}
    else if(pages.length>=2)pages.splice(pages.length-1,0,...rp);
    else pages.unshift(...rp)}
  const {jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'mm',format:'a4',compress:true});
  for(let i=0;i<pages.length;i++){prog(true,`PDF തയ്യാറാക്കുന്നു… ${i+1}/${pages.length} പേജ് (Creating PDF)`,(i+.3)/pages.length);
    const pg=document.createElement('div');pg.className='pdfpage'+(meta?' fsheet':'');pages[i].forEach(n=>pg.appendChild(n));document.body.appendChild(pg);
    if(pg.firstElementChild){const firstM=parseFloat(getComputedStyle(pg.firstElementChild).marginTop)||0;pg.firstElementChild.style.marginTop='0'}
    // every page is rendered at 3x so Malayalam stays sharp; photos use a slightly higher JPEG quality
    const hasPh=!!pg.querySelector('.dr-ph img,.rp-ph img,.dr-fb img,img.fbph'),S=3,Q=hasPh?0.92:0.88;
    const cv=await window.html2canvas(pg,{scale:S,backgroundColor:'#ffffff',useCORS:true,logging:false,windowWidth:1024,onclone:fixCloneColors});
    pg.remove();
    let hmm=cv.height/S*MM;
    const add=(im,wmm,hmm2)=>{pdf.addImage(im.data,im.fmt,10+(190-wmm)/2,10,wmm,hmm2,undefined,'FAST')};
    if(hmm<=0.8){/* skip nearly empty raster leftover */}
    else if(hmm<=277.5){if(i)pdf.addPage();const im=pageImg(cv,hasPh,Q);add(im,190,hmm)}
    else if(277.5/hmm>=FIT){if(i)pdf.addPage();const sc=277.5/hmm,im=pageImg(cv,hasPh,Q);add(im,190*sc,277.5)}
    else{const sliceH=Math.floor(277/MM*S);let y=0,first=true;
      while(y<cv.height){const h=Math.min(sliceH,cv.height-y);if(h<8)break;const c=document.createElement('canvas');c.width=cv.width;c.height=h;c.getContext('2d').drawImage(cv,0,y,cv.width,h,0,0,cv.width,h);
        if(!first||i)pdf.addPage();const im=pageImg(c,hasPh,Q);pdf.addImage(im.data,im.fmt,10,10,190,h/S*MM,undefined,'FAST');y+=h;first=false}}
    await new Promise(r=>setTimeout(r,0))}

  sheet.remove();rvSheet?.remove();
  const n=pdf.getNumberOfPages();
  for(let i=1;i<=n;i++){pdf.setPage(i);
    if(meta){pdf.addImage(textCanvas({l:'Generated by ഭദ്രം ഈ ഭൂമി (Bhadram Ee Bhoomi)',c:meta.id,r:`Page ${i} of ${n}`},718,22),'PNG',10,287.5,190,190*22/718,undefined,'FAST');
      if(i>1)pdf.addImage(textCanvas({l:'ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം',r:noEmoji(meta.titleMl),top:true},718,22),'PNG',10,2.2,190,190*22/718,undefined,'FAST')}
    else{pdf.setFontSize(10);pdf.setTextColor(17);pdf.text(`Bhadram Ee Bhoomi - Daily Cleaning  |  ${title}  |  ${i}/${n}`,105,292,{align:'center'})}}
  return pdf}
function downloadPdf(r){const u=URL.createObjectURL(r.blob);const a=document.createElement('a');a.href=u;a.download=r.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);toast('⬇️ PDF ഡൗൺലോഡ് ചെയ്തു (Downloaded) – '+r.name,4000)}
async function sharePdf(r,btnSel='#rPdf',kind){
  if(navigator.canShare&&navigator.share&&navigator.canShare({files:[r.file]})){
    try{await navigator.share({files:[r.file],title:'ഭദ്രം ഈ ഭൂമി – '+(kind||(rMode==='day'?'ദിവസ റിപ്പോർട്ട്':'മാസ റിപ്പോർട്ട്')),text:'ഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം: '+r.title});return 'shared'}
    catch(e){if(e.name==='AbortError')return 'aborted';if(e.name==='NotAllowedError'){const b=$(btnSel);if(b){b.classList.add('ready');b.innerHTML='<svg class="ic"><use href="#i-share"/></svg><span>PDF തയ്യാർ – ഷെയർ ചെയ്യാൻ തൊടുക <small class="en">(Ready – tap to share)</small></span>'}toast('📄 PDF തയ്യാർ – വീണ്ടും തൊടുക (Tap again to share)',3500);return 'needtap'}console.error(e)}}
  downloadPdf(r);return 'downloaded'}
$('#rPdf').onclick=async()=>{if(pdfBusy)return;
  if(pdfReady&&pdfReady.key===reportKey()){await sharePdf(pdfReady);return}
  pdfBusy=true;const b=$('#rPdf');b.disabled=true;pdfProg(true,'PDF തയ്യാറാക്കുന്നു… (Creating PDF)',0.05);
  try{pdfReady=await buildReportPdf();window.__lastPdf=pdfReady;b.disabled=false;pdfBusy=false;await sharePdf(pdfReady)}
  catch(e){console.error(e);$$('.pdfpage').forEach(x=>x.remove());toast('⚠️ PDF ഉണ്ടാക്കാനായില്ല (PDF failed): '+(e.message||e),5000);pdfProg(false)}
  finally{pdfBusy=false;b.disabled=false;setTimeout(()=>{if(!pdfBusy)pdfProg(false)},4000)}};

$('#rSave').onclick=async()=>{if(pdfBusy)return;
  if(pdfReady&&pdfReady.key===reportKey()){downloadPdf(pdfReady);return}
  pdfBusy=true;const b=$('#rSave');b.disabled=true;pdfProg(true,'PDF തയ്യാറാക്കുന്നു… (Creating PDF)',0.05);
  try{pdfReady=await buildReportPdf();window.__lastPdf=pdfReady;downloadPdf(pdfReady)}
  catch(e){console.error(e);$$('.pdfpage').forEach(x=>x.remove());toast('⚠️ PDF ഉണ്ടാക്കാനായില്ല (PDF failed): '+(e.message||e),5000);pdfProg(false)}
  finally{pdfBusy=false;b.disabled=false;setTimeout(()=>{if(!pdfBusy)pdfProg(false)},4000)}};

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
  if(!list.length)return `<div class="rp-sub" style="margin-top:0">${ico('msg','sm')}സ്ഥലവാസികളുടെ അഭിപ്രായം <span class="en">(Resident feedback)</span></div><div class="hint">ഈ കാലയളവിൽ ഇല്ല (none in this period)</div>`;
  const avg=list.reduce((s,x)=>s+x.rating,0)/list.length;
  return `<div class="rp-sub" style="margin-top:0">${ico('msg','sm')}സ്ഥലവാസികളുടെ അഭിപ്രായം <span class="en">(Resident feedback)</span> ${starsHTML(avg)} <b>${avg.toFixed(1)}/5</b> <span class="en">(${list.length})</span></div>`+
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
/* ---------- squad inspection feedback (one-time personal links) ---------- */
let squadFb=[],squadLinks=[],sqLinkFilter='open',fbMode='res';const sqPhoneCache=new Map();
const SQ_OVR={good:['✅','തൃപ്തികരം','Satisfactory'],partial:['⚠️','ഭാഗികമായി തൃപ്തികരം','Partly satisfactory'],poor:['❌','തൃപ്തികരമല്ല','Not satisfactory']};
const sqOvrBadge=o=>{const v=SQ_OVR[o];if(!v)return '';const ml=o==='partial'?PH_PRIOR_ML:v[1],en=o==='partial'?PH_PRIOR_EN:v[2];return `<span class="ovb ${o}">${v[0]} ${ml} <span class="en">(${en})</span></span>`};
const sqToken=()=>{const b=crypto.getRandomValues(new Uint8Array(24));return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const sqUrl=t=>{const u=new URL('squad.html',location.href);u.search='';u.hash='';u.searchParams.set('t',t);if(EMU)u.searchParams.set('emulator','1');return u.toString()};
const sqWhere=l=>esc(l.placeName||l.route||'')+(l.placeName&&l.route?` <span class="en">· ${esc(l.route)}</span>`:'');
const sqState=l=>l.status==='used'?'used':l.status==='revoked'?'revoked':(l.expiresAt&&l.expiresAt.seconds*1000<Date.now())?'expired':'open';
const SQ_ST={open:['pend','⏳ ബാക്കി (Pending)'],used:['ok','✅ ലഭിച്ചു (Received)'],expired:['','⌛ കാലഹരണം (Expired)'],revoked:['','🚫 റദ്ദാക്കി (Revoked)']};
function sqMsg(l){const nm=l.officialName?` ${l.officialName}`:'';const where=l.placeName||l.route||'';
  return `🏛️ SPHI, PHI, മറ്റ് ഉദ്യോഗസ്ഥർ & സ്ക്വാഡ് എന്നിവരുടെ പരിശോധന\n\nനമസ്കാരം${nm},\nഭദ്രം ഈ ഭൂമി – ദൈനംദിന ശുചീകരണം: ${where}${l.inspDate?' ('+fmtDate(l.inspDate)+')':''} ശുചീകരണ പരിശോധനയ്ക്ക് നന്ദി. നിങ്ങളുടെ പരിശോധനാ ഫീഡ്‌ബാക്ക് താഴെ ലിങ്കിൽ അറിയിക്കാമോ? (ലോഗിൻ വേണ്ട, ഒരു തവണ മാത്രം)\nThank you for the inspection. Please share your feedback (no login, one-time link):\n${sqUrl(l.id)}\n— ${meDoc?.name||''}`}
async function sqShare(l){const t=sqMsg(l);if(navigator.share){try{await navigator.share({title:'SPHI, PHI, മറ്റ് ഉദ്യോഗസ്ഥർ & സ്ക്വാഡ് എന്നിവരുടെ പരിശോധന – ഭദ്രം ഈ ഭൂമി',text:t});return}catch(e){if(e.name==='AbortError')return}}copyText(t)}
const sqWa=l=>window.open('https://wa.me/?text='+encodeURIComponent(sqMsg(l)),'_blank','noopener');
function sqQR(url){try{const q=qrcode(0,'M');q.addData(url);q.make();return q.createSvgTag({cellSize:5,margin:2,scalable:true})}catch(e){return ''}}
function subscribeSquad(){
  unsubs.push(onSnapshot(query(collection(db,'squadFeedback'),orderBy('createdAt','desc'),limit(500)),s=>{squadFb=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:'estimate'})}));renderSquad();if($('#v-dash').classList.contains('active'))renderDash()},e=>console.error('squadFb',e)));
  const q=can.admin()?query(collection(db,'squadLinks'),orderBy('createdAt','desc'),limit(500)):query(collection(db,'squadLinks'),where('createdBy','==',me.uid));
  unsubs.push(onSnapshot(q,s=>{squadLinks=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:'estimate'})})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));renderSquadLinks()},e=>console.error('squadLinks',e)))}
function setFbMode(m){fbMode=m;$$('#fbMode button').forEach(x=>x.classList.toggle('on',x.dataset.m===m));$('#fbRes').style.display=m==='res'?'':'none';$('#fbSquad').style.display=m==='squad'?'':'none';
  $('#fbEyebrow').textContent=m==='res'?'സ്ഥലവാസികൾ · Residents':'SPHI / PHI / സ്ക്വാഡ് പരിശോധന · Inspections';
  $('#fbTitle').innerHTML=m==='res'?'സ്ഥലവാസികളുടെ അഭിപ്രായം <span class="en">(Resident feedback)</span>':'SPHI, PHI, മറ്റ് ഉദ്യോഗസ്ഥർ &amp; സ്ക്വാഡ് എന്നിവരുടെ പരിശോധന <span class="en">(SPHI, PHI, Other Officials &amp; Squad inspection feedback)</span>';if(m==='squad'){renderSquad();renderSquadLinks()}}
$$('#fbMode button').forEach(b=>b.onclick=()=>setFbMode(b.dataset.m));
$$('#sqLinkF button').forEach(b=>b.onclick=()=>{sqLinkFilter=b.dataset.f;$$('#sqLinkF button').forEach(x=>x.classList.toggle('on',x===b));renderSquadLinks()});
['#sqfPlace','#sqfShow'].forEach(s=>$(s).addEventListener('change',renderSquad));
function fillSquadPlaces(){const opt=p=>`<option value="${p.id}">${esc(p.name)}${p.ward?' – '+esc(p.ward):''}${placeOffTag(p)}</option>`,o=activePlaces().map(opt).join(''),oAll=places.map(opt).join('');
  const s1=$('#sqPlace'),c1=s1.value;s1.innerHTML='<option value="">— സ്ഥലം തിരഞ്ഞെടുക്കുക (Place) —</option>'+o;s1.value=c1;
  const s2=$('#sqfPlace'),c2=s2.value;s2.innerHTML='<option value="">എല്ലാ സ്ഥലങ്ങളും (All places)</option>'+oAll;s2.value=c2;$('#sqExpWrap').style.display=can.admin()?'':'none'}
function sqOutHTML(l){const url=sqUrl(l.id);return `<div class="sq-ok">${ico('check','sm')} ലിങ്ക് തയ്യാർ <span class="en">(Link ready)</span> – ${sqWhere(l)}</div>
  <div class="sq-url"><input type="text" readonly value="${esc(url)}" aria-label="link"></div>
  <div class="row actions3"><button class="btn sm" data-sqa="share" data-id="${l.id}">${ico('share','sm')}പങ്കിടുക <span class="en">(Share)</span></button><button class="btn sm wa" data-sqa="wa" data-id="${l.id}">${ico('chat','sm')}WhatsApp</button><button class="btn out sm" data-sqa="copy" data-id="${l.id}">${ico('copy','sm')}കോപ്പി <span class="en">(Copy)</span></button></div>
  <details class="sq-qr"><summary>${ico('qr','sm')} QR കോഡ് കാണിക്കുക <span class="en">(Show QR)</span></summary><div class="qrbox">${sqQR(url)}</div></details>
  <p class="hint" style="margin:8px 0 0">${l.expiresAt?'⌛ സാധുത (Valid till) '+new Date(l.expiresAt.seconds*1000).toLocaleDateString('en-IN'):'♾️ കാലാവധി ഇല്ല (No expiry)'} · ഒരു തവണ മാത്രം (Single use) · അയച്ച ശേഷം ഇതേ ലിങ്കിൽ ഫീഡ്‌ബാക്ക് വായിക്കാൻ മാത്രം കാണാം (After submission the link shows the feedback read-only)</p>`}
function bindSqActions(root){root.querySelectorAll('[data-sqa]').forEach(b=>b.onclick=async()=>{const l=squadLinks.find(x=>x.id===b.dataset.id)||lastLink;if(!l)return;const a=b.dataset.sqa;
  if(a==='share')sqShare(l);else if(a==='wa')sqWa(l);else if(a==='copy')copyText(sqUrl(l.id));else if(a==='open')window.open(sqUrl(l.id),'_blank','noopener');
  else if(a==='qr'){const box=b.closest('.sql').querySelector('.qrbox');box.innerHTML=box.innerHTML?'':sqQR(sqUrl(l.id))}
  else if(a==='revoke'){if(!await ask('ഈ ലിങ്ക് റദ്ദാക്കണോ? ഇനി ഇത് ഉപയോഗിക്കാനാവില്ല. (Revoke this link?)'))return;
    updateDoc(doc(db,'squadLinks',l.id),{status:'revoked',revokedAt:serverTimestamp(),revokedBy:me.uid}).then(()=>toast('🚫 റദ്ദാക്കി (Revoked)')).catch(e=>toast('⚠️ '+e.code))}
  else if(a==='view'){setFbMode('squad');const el=$(`#sqList [data-id="${l.id}"]`);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600)}}})}
let lastLink=null;
$('#sqCreate').onclick=async()=>{const pid=$('#sqPlace').value,route=$('#sqRoute').value.trim().slice(0,150);
  if(!pid&&!route){toast('📍 സ്ഥലം അല്ലെങ്കിൽ റൂട്ട് നൽകുക (Pick a place or enter a route)');return}
  const p=places.find(x=>x.id===pid);const id=sqToken();
  const d={placeId:pid||'',placeName:p?p.name:'',createdBy:me.uid,createdByName:(meDoc?.name||'').slice(0,80),createdAt:serverTimestamp(),status:'open'};
  if(p?.area)d.area=p.area;if(p?.ward)d.ward=p.ward;if(route)d.route=route;const dt=$('#sqDate').value;if(dt)d.inspDate=dt;const nm=$('#sqName').value.trim().slice(0,80);if(nm)d.officialName=nm;
  const ex=can.admin()?+$('#sqExp').value:0;if(ex)d.expiresAt=F.Timestamp.fromMillis(Date.now()+ex*864e5);
  const btn=$('#sqCreate');btn.disabled=true;
  try{await setDoc(doc(db,'squadLinks',id),d);lastLink={id,...d,createdAt:{seconds:Date.now()/1000},expiresAt:d.expiresAt?{seconds:d.expiresAt.seconds}:null};
    $('#sqOut').innerHTML=sqOutHTML(lastLink);$('#sqOut').style.display='block';bindSqActions($('#sqOut'));toast('🔗 ലിങ്ക് തയ്യാർ (Link created)');
    $('#sqRoute').value='';$('#sqName').value='';$('#sqOut').scrollIntoView({behavior:'smooth',block:'nearest'})}
  catch(e){console.error(e);toast('⚠️ '+(e.code||e.message))}finally{btn.disabled=false}};
function renderSquadLinks(){if(!can.staff())return;const now=Date.now();
  const L=squadLinks.filter(l=>{const st=sqState(l);return sqLinkFilter==='all'||(sqLinkFilter==='closed'?(st==='expired'||st==='revoked'):st===sqLinkFilter)});
  const cnt=k=>squadLinks.filter(l=>k==='closed'?['expired','revoked'].includes(sqState(l)):k==='all'||sqState(l)===k).length;
  $$('#sqLinkF button').forEach(b=>{const n=cnt(b.dataset.f);let c=b.querySelector('.cnt');if(!c){c=document.createElement('b');c.className='cnt';b.appendChild(c)}c.textContent=n});
  if(!L.length){$('#sqLinks').innerHTML=emptyHTML('link','ലിങ്കുകൾ ഇല്ല','No links here');return}
  $('#sqLinks').innerHTML=L.map(l=>{const st=sqState(l),[cls,lab]=SQ_ST[st];const d=l.createdAt?new Date(l.createdAt.seconds*1000):null;const mine=l.createdBy===me.uid;
    return `<div class="sql" data-id="${l.id}"><div class="sql-h"><div><b>📍 ${sqWhere(l)}</b><div class="hint">${l.officialName?'👤 '+esc(l.officialName)+' · ':''}${l.inspDate?'📅 '+fmtDate(l.inspDate)+' · ':''}${d?'🔗 '+d.toLocaleDateString('en-IN'):''}${!mine&&l.createdByName?' · '+esc(l.createdByName):''}${l.expiresAt&&st==='open'?' · ⌛ '+new Date(l.expiresAt.seconds*1000).toLocaleDateString('en-IN'):''}</div></div><span class="badge ${cls}">${lab}</span></div>
    <div class="sql-a">${st==='open'?`<button class="btn sm" data-sqa="share" data-id="${l.id}">${ico('share','sm')}<span>പങ്കിടുക</span></button><button class="btn sm wa" data-sqa="wa" data-id="${l.id}">${ico('chat','sm')}<span>WhatsApp</span></button><button class="btn out sm iconbtn" data-sqa="copy" data-id="${l.id}" aria-label="copy link">${ico('copy','sm')}</button><button class="btn out sm iconbtn" data-sqa="qr" data-id="${l.id}" aria-label="QR">${ico('qr','sm')}</button>${mine||can.admin()?`<button class="btn danger sm iconbtn" data-sqa="revoke" data-id="${l.id}" aria-label="revoke">${ico('x','sm')}</button>`:''}`
      :st==='used'?`<button class="btn sec sm" data-sqa="view" data-id="${l.id}">${ico('eye','sm')}<span>ഫീഡ്‌ബാക്ക് കാണുക (View)</span></button><button class="btn out sm" data-sqa="open" data-id="${l.id}">${ico('ext','sm')}<span>ലിങ്ക് (Link view)</span></button>`:''}</div><div class="qrbox"></div></div>`}).join('');
  bindSqActions($('#sqLinks'))}
function renderSquad(){if(!can.staff())return;fillSquadPlaces();const pl=$('#sqfPlace').value,show=$('#sqfShow').value;
  const list=squadFb.filter(f=>(!pl||f.placeId===pl)&&(show==='all'||(f.status||'visible')===show));
  const vis=squadFb.filter(f=>f.status!=='hidden'&&(!pl||f.placeId===pl));const c=k=>vis.filter(f=>f.overall===k).length;
  $('#sqSum').innerHTML=vis.length?`${starsHTML(vis.reduce((s,f)=>s+f.rating,0)/vis.length)} <b>${(vis.reduce((s,f)=>s+f.rating,0)/vis.length).toFixed(1)}/5</b> · ${vis.length} പരിശോധന (inspections)<div class="sq-dist"><span class="ovb good">✅ ${c('good')}</span><span class="ovb partial">⚠️ ${c('partial')}</span><span class="ovb poor">❌ ${c('poor')}</span></div>`:'<span class="hint">ഇതുവരെ ഫീഡ്‌ബാക്ക് ഇല്ല (No squad feedback yet)</span>';
  if(!list.length){$('#sqList').innerHTML=emptyHTML('landmark','ഒന്നുമില്ല','No inspection feedback yet');return}
  $('#sqList').innerHTML=list.map(f=>{const d=fbDate(f);return `<div class="card fbc sqc ${f.status==='hidden'?'hidden':''}" data-id="${f.id}">
    <div class="sqc-h"><div><b>📍 ${sqWhere(f)}</b> <span class="en">${esc(f.ward||'')}</span></div><div class="hint">${d?d.toLocaleString('en-IN'):''}</div></div>
    <div class="sqc-o"><span class="sqav">${esc((f.officialName||'?').trim().charAt(0))}</span><div><b>${esc(f.officialName)}</b><div class="hint">${esc(f.designation)} · ${esc(f.institution)}</div></div></div>
    <div class="sqc-r">${sqOvrBadge(f.overall)} ${starsHTML(f.rating)} <b>${f.rating}/5</b> <span class="hint">📅 ${fmtDate(f.inspDate)}</span></div>
    ${f.concerns?`<div class="remark"><b>🔎 കൂടുതൽ ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ (Needs attention):</b> ${esc(f.concerns)}</div>`:''}
    ${f.suggestions?`<div class="remark sug">💡 <b>നിർദ്ദേശങ്ങൾ (Suggestions):</b> ${esc(f.suggestions)}</div>`:''}
    ${f.photo?`<img class="fbph" src="${f.photo}" alt="" loading="lazy">`:''}
    <div class="hint" style="margin-top:6px">🔗 ${esc(f.linkByName||'')}${f.hasPhone?(can.moderate()?` · 📞 <span class="sph-${f.id}">…</span>`:' · 📞 (ഉദ്യോഗസ്ഥർക്ക് മാത്രം / officers only)'):''}${f.status==='hidden'?' · 🙈 മറച്ചു (hidden)':''}</div>
    ${can.moderate()?`<div style="margin-top:8px"><button class="btn ${f.status==='hidden'?'sec':'danger'} sm" data-sqtoggle="${f.id}">${f.status==='hidden'?'👁️ വീണ്ടും കാണിക്കുക (Unhide)':'🙈 മറയ്ക്കുക (Hide)'}</button></div>`:''}</div>`}).join('');
  $$('#sqList .fbph').forEach(im=>im.onclick=()=>openViewer([{src:im.src,cap:'🏛️ SPHI / PHI / സ്ക്വാഡ് പരിശോധന – ഫോട്ടോ (Inspection photo)'}],0));
  $$('[data-sqtoggle]').forEach(b=>b.onclick=async()=>{const f=squadFb.find(x=>x.id===b.dataset.sqtoggle);const to=f.status==='hidden'?'visible':'hidden';
    if(to==='hidden'&&!await ask('ഈ ഫീഡ്‌ബാക്ക് മറയ്ക്കണോ? (Hide this feedback?)'))return;
    updateDoc(doc(db,'squadFeedback',f.id),{status:to,moderatedBy:me.uid,moderatedAt:serverTimestamp()}).then(()=>toast(to==='hidden'?'🙈 മറച്ചു (Hidden)':'👁️ കാണിക്കുന്നു (Visible)')).catch(e=>toast('⚠️ '+e.code))});
  if(can.moderate())list.filter(f=>f.hasPhone).forEach(async f=>{const set=v=>$$('.sph-'+f.id).forEach(e=>e.innerHTML=v);
    if(!sqPhoneCache.has(f.id))sqPhoneCache.set(f.id,getDoc(doc(db,'squadFeedback',f.id,'private','contact')).then(s=>s.exists()?s.data().phone:'').catch(()=>''));
    const ph=await sqPhoneCache.get(f.id);set(ph?`<a href="tel:${esc(ph)}">${esc(ph)}</a>`:'-')})}
function sqDashHTML(){if(!can.staff())return '';const f=$('#dFrom').value,t=$('#dTo').value,a=$('#dArea').value,w=$('#dWard').value;
  const list=squadFb.filter(x=>x.status!=='hidden'&&(!a||x.area===a)&&(!w||x.ward===w)).filter(x=>{const s=x.inspDate||(fbDate(x)?ymd(fbDate(x)):'');return !s||(s>=f&&s<=t)});
  const pend=squadLinks.filter(l=>sqState(l)==='open').length;
  const head=`<div class="rp-sub">${ico('landmark','sm')}SPHI, PHI, മറ്റ് ഉദ്യോഗസ്ഥർ &amp; സ്ക്വാഡ് എന്നിവരുടെ പരിശോധന <span class="en">(SPHI, PHI, Other Officials &amp; Squad inspection)</span>`;
  if(!list.length)return head+`</div><div class="hint">ഈ കാലയളവിൽ ഇല്ല (none in this period)${pend?` · ⏳ ${pend} ലിങ്ക് ബാക്കി (links pending)`:''}</div>`;
  const avg=list.reduce((s,x)=>s+x.rating,0)/list.length;const c=k=>list.filter(x=>x.overall===k).length;
  return head+` ${starsHTML(avg)} <b>${avg.toFixed(1)}/5</b> <span class="en">(${list.length})</span></div><div class="sq-dist"><span class="ovb good">✅ ${c('good')}</span><span class="ovb partial">⚠️ ${c('partial')}</span><span class="ovb poor">❌ ${c('poor')}</span>${pend?`<span class="hint">⏳ ${pend} ലിങ്ക് ബാക്കി (pending)</span>`:''}</div>`}
async function rangeSquad(from,to,a,w,ty,pl){try{const s=await getDocs(query(collection(db,'squadFeedback'),where('createdAt','>=',from),where('createdAt','<=',to),orderBy('createdAt')));
  return s.docs.map(d=>({id:d.id,...d.data()})).filter(f=>f.status!=='hidden'&&(!a||f.area===a)&&(!w||f.ward===w)&&(!ty||(f.placeId&&placeTypeOf(f)===ty))&&(!pl||f.placeId===pl))}catch(e){console.error(e);return []}}
const sqHead=`<div class="rp-sub" style="font-size:15px">🏛️ SPHI, PHI, മറ്റ് ഉദ്യോഗസ്ഥർ &amp; സ്ക്വാഡ് എന്നിവരുടെ പരിശോധന – ഫീഡ്‌ബാക്ക് <span class="en">(SPHI, PHI, Other Officials &amp; Squad inspection feedback)</span></div>`;
function sqDayHTML(list){if(!list.length)return sqHead+'<p class="hint">ഈ ദിവസം SPHI / PHI / സ്ക്വാഡ് പരിശോധന ഫീഡ്‌ബാക്ക് ഇല്ല (No inspection feedback this day)</p>';
  return sqHead+list.map(f=>`<div class="dr-fb dr-sq"><div><b>📍 ${sqWhere(f)}</b>${f.ward?' · '+esc(f.ward):''} · ${sqOvrBadge(f.overall)} ${starsHTML(f.rating)} <b>${f.rating}/5</b></div>
    <div>👤 <b>${esc(f.officialName)}</b>, ${esc(f.designation)} – ${esc(f.institution)} <span class="hint">· 📅 പരിശോധന (Inspected) ${fmtDate(f.inspDate)}</span></div>
    ${f.concerns?`<div>🔎 <b>ശ്രദ്ധിക്കേണ്ടവ (Needs attention):</b> ${esc(f.concerns)}</div>`:''}${f.suggestions?`<div>💡 <b>നിർദ്ദേശങ്ങൾ (Suggestions):</b> ${esc(f.suggestions)}</div>`:''}${f.photo?`<img class="fbph" src="${f.photo}" alt="">`:''}</div>`).join('')}
function sqMonthHTML(list){if(!list.length)return sqHead+'<p class="hint">ഈ മാസം SPHI / PHI / സ്ക്വാഡ് പരിശോധന ഫീഡ്‌ബാക്ക് ഇല്ല (No inspection feedback this month)</p>';
  const avg=list.reduce((s,f)=>s+f.rating,0)/list.length;const c=k=>list.filter(f=>f.overall===k).length;
  return sqHead+`<div class="sq-dist sq-sumrow"><span class="ovb tot">ആകെ (Total) ${list.length}</span><span class="ovb good">✅ തൃപ്തികരം ${c('good')}</span><span class="ovb partial">⚠️ ${PH_PRIOR_ML} ${c('partial')}</span><span class="ovb poor">❌ തൃപ്തികരമല്ല ${c('poor')}</span><span class="ovb tot">★ ${avg.toFixed(1)}/5</span></div>
  <table class="rp-tbl sq-tbl"><tr><th style="width:30%">തീയതി · സ്ഥലം <span class="en">(Date · Place)</span></th><th style="width:36%">പേര് / പദവി <span class="en">(Official)</span></th><th style="width:34%">നില <span class="en">(Status)</span></th></tr>${list.map(f=>`<tr><td><b>${f.inspDate?fmtDate(f.inspDate):''}</b><br>${sqWhere(f)}</td><td>${esc(f.officialName)}<br><span class="en">${esc(f.designation)} – ${esc(f.institution)}</span></td><td>${SQ_OVR[f.overall]?SQ_OVR[f.overall][0]+' '+(f.overall==='partial'?PH_PRIOR_ML:SQ_OVR[f.overall][1]):''}<br>★ ${f.rating}/5</td></tr>`).join('')}</table>`+
  (list.some(f=>f.concerns||f.suggestions)?`<div class="rp-sub">🔎 ശ്രദ്ധിക്കേണ്ടവ / 💡 നിർദ്ദേശങ്ങൾ (Attention points / suggestions)</div><ul style="font-size:13px;margin-top:2px">${list.filter(f=>f.concerns||f.suggestions).map(f=>`<li><b>${sqWhere(f)}</b> (${esc(f.officialName)}, ${fmtDate(f.inspDate)}): ${f.concerns?'🔎 '+esc(f.concerns):''}${f.concerns&&f.suggestions?' · ':''}${f.suggestions?'💡 '+esc(f.suggestions):''}</li>`).join('')}</ul>`:'')}
async function monthFeedback(m,last,a,w,ty){const from=new Date(m+'-01T00:00:00'),to=new Date(last+'T23:59:59.999');
  try{const s=await getDocs(query(collection(db,'feedback'),where('createdAt','>=',from),where('createdAt','<=',to),orderBy('createdAt')));return s.docs.map(d=>d.data()).filter(f=>f.status!=='hidden'&&(!a||f.area===a)&&(!w||f.ward===w)&&(!ty||placeTypeOf(f)===ty))}catch(e){console.error(e);return []}}
function fbReportHTML(list){
  const head=`<div class="rp-sub" style="font-size:15px">🗣️ സ്ഥലവാസികളുടെ അഭിപ്രായം (Resident feedback summary)</div>`;
  if(!list.length)return head+'<p class="hint">ഈ മാസം അഭിപ്രായം ഇല്ല (No resident feedback this month)</p>';
  const avg=list.reduce((s,f)=>s+f.rating,0)/list.length;
  return head+`<table class="rp-tbl"><tr><th>സ്ഥലം (Place)</th><th>അഭിപ്രായം (Feedback)</th><th>ശരാശരി (Avg ★)</th><th>നിർദ്ദേശം (Suggestions)</th></tr>${fbAgg(list).map(o=>`<tr><td>${esc(o.name)}${o.ward?' – '+esc(o.ward):''}</td><td>${o.n}</td><td>${o.avg.toFixed(1)}</td><td>${o.sug}</td></tr>`).join('')}
    <tr><th>ആകെ (Total)</th><th>${list.length}</th><th>${avg.toFixed(1)}</th><th>${list.filter(f=>f.suggestion).length}</th></tr></table>`+
    (list.some(f=>f.suggestion)?`<div class="rp-sub">💡 നിർദ്ദേശങ്ങൾ (Suggestions)</div><ul style="font-size:13px;margin-top:2px">${list.filter(f=>f.suggestion).map(f=>`<li><b>${esc(f.placeName)}</b>: ${esc(f.suggestion)}</li>`).join('')}</ul>`:'')}
/* QR codes */
const fbLink=id=>{const u=new URL('feedback.html',location.href);u.search='';u.hash='';u.searchParams.set('place',id);if(EMU)u.searchParams.set('emulator','1');return u.toString()};
function renderQRList(){if(!can.staff())return;$('#qrList').innerHTML=activePlaces().map(p=>`<div class="qrrow"><div class="nm"><b>${esc(p.name)}</b> ${typeBadge(p.type||'other',p)}<br><span class="en">${esc([p.ward,p.area].filter(Boolean).join(' · '))}</span></div><button class="btn sm" data-qr="${p.id}">${ico('qr','sm')} QR</button></div>`).join('')||'<p class="hint">ആദ്യം സ്ഥലങ്ങൾ ചേർക്കുക (Add places first)</p>';
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
  x.font=`700 26px ${F}`;const pill='സ്ഥലവാസികളുടെ അഭിപ്രായം · Resident feedback';const pw=x.measureText(pill).width+56;x.fillStyle='rgba(255,255,255,.16)';rr(x,72,282,pw,52,26);x.fill();x.fillStyle='#fff';x.fillText(pill,100,317);
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
    const list=imgs.map(x=>{const n=x.closest('figure')?.querySelector('.phn')?.textContent||'';const cap=x.closest('.photos')?.id==='phBefore'?phCap('before'):x.closest('.photos')?.id==='phAfter'?phCap('after'):x.closest('.photos')?.id==='phPresent'?phCap('present'):(x.dataset.cap||'');return {src:x.src,cap:cap+(n?' – '+n.trim():'')}});openViewer(list,imgs.indexOf(im));return}
  if(im.classList.contains('fbph')){e.stopPropagation();openViewer([{src:im.src,cap:'🗣️ സ്ഥലവാസിയുടെ ഫോട്ടോ (Resident photo)'}]);return}
  if(im.classList.contains('thumb')){const card=im.closest('.entry');if(!card)return;e.stopPropagation();toast('⏳');
    try{const s=await getDocs(collection(db,'entries',card.dataset.id,'photos'));const ps=s.docs.map(d=>d.data()).sort(phSort);
      if(ps.length)openViewer(ps.map(p=>({src:p.url||p.data,cap:phCap(p.kind)+(phNoteOf(p)?' – '+phNoteOf(p):'')})),0);else openDetail(card.dataset.id)}catch(err){openDetail(card.dataset.id)}}},true);

/* ---------- tabs & SW ---------- */
$$('nav.tabs button').forEach(b=>b.onclick=()=>{if(b.dataset.v==='v-new'&&!editing)resetForm();show(b.dataset.v)});
/* ---------- app updates: new versions apply on the next open (or via ക്രമീകരണം → പുതുക്കുക) ---------- */
const formBusy=()=>$('#v-new').classList.contains('active')&&(!!editing||curPhotos.length>0||!!$('#fNotes').value.trim()||$$('#fWork input:checked,#fMassWork input:checked').length>0||!!$('#fMassOther').value.trim());
function showUpdateBar(){if($('#updBar'))return;const d=document.createElement('div');d.id='updBar';d.className='updbar';d.innerHTML=`<span>🔄 പുതിയ പതിപ്പ് തയ്യാർ <span class="en">(New version ready)</span></span><button class="btn sm" id="updNow">പുതുക്കുക</button>`;document.body.appendChild(d);d.querySelector('#updNow').onclick=()=>location.reload()}
async function latestVer(){try{const t=await (await fetch('sw.js?v='+Date.now(),{cache:'no-store'})).text();return (t.match(/cleaning-team-(v\d+)/)||[])[1]||''}catch(e){return ''}}
async function renderVer(){const el=$('#verInfo');if(!el)return;el.innerHTML=`📱 ആപ്പ് പതിപ്പ് <span class="en">(App version)</span>: <b>${APP_VER}</b>`;const L=await latestVer();
  if(L&&L!==APP_VER){el.innerHTML+=` · <span class="pend">പുതിയത് ലഭ്യം (new: ${esc(L)})</span>`;$('#updBtn').classList.add('big')}else if(L)el.innerHTML+=` · <span style="color:var(--good)">✓ ഏറ്റവും പുതിയത് (up to date)</span>`}
async function forceUpdate(){const b=$('#updBtn');b.disabled=true;b.innerHTML=ico('refresh')+'പുതുക്കുന്നു… <span class="en">(Updating)</span>';
  try{const r=await navigator.serviceWorker?.getRegistration();if(r){await r.update().catch(()=>{});r.waiting?.postMessage('skipWaiting')}}catch(e){}
  try{for(const k of await caches.keys())if(k.startsWith('cleaning-team'))await caches.delete(k)}catch(e){}
  location.reload()}
$('#updBtn').onclick=forceUpdate;
if('serviceWorker'in navigator&&location.protocol.startsWith('http')&&!EMU){
  const hadCtl=!!navigator.serviceWorker.controller;let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadCtl||reloading)return;if(formBusy())return showUpdateBar();reloading=true;location.reload()});
  navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>{
    const check=()=>reg.update().catch(()=>{});setInterval(check,30*60*1000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
    // safety net: if the server already has a newer version than this page, reload once (or offer the button while a form is open)
    latestVer().then(L=>{if(L&&L!==APP_VER){check();if(formBusy())showUpdateBar();else if(sessionStorage.getItem('updTried')!==L){sessionStorage.setItem('updTried',L);setTimeout(()=>forceUpdate(),1500)}}})
  }).catch(()=>{})}
window.__app={reviewPdfHTML,htmlToPdf,reviewMonthHTML,phCap,phNoteOf,photoStatus,photoProof,get entries(){return entries},get meDoc(){return meDoc},get me(){return me},db,F,entryPdfHTML,formalHTML,fs:{getDocs,getDoc,collection,doc,updateDoc}};

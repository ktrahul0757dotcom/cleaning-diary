const V='13.4.0',CDN=`https://www.gstatic.com/firebasejs/${V}/`;
const $=s=>document.querySelector(s);
const show=v=>document.querySelectorAll('.view').forEach(e=>e.classList.toggle('active',e.id===v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LABELS=['','😞 വളരെ മോശം (Very poor)','🙁 മോശം (Poor)','😐 ശരാശരി (Average)','🙂 നല്ലത് (Good)','😄 വളരെ നല്ലത് (Excellent)'];
const OVR={good:'✅ തൃപ്തികരം (Satisfactory)',partial:'⚠️ ഭാഗികമായി തൃപ്തികരം (Partly satisfactory)',poor:'❌ തൃപ്തികരമല്ല (Not satisfactory)'};
const pad=n=>String(n).padStart(2,'0'),ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fmtD=s=>{if(!s)return '';const [y,m,d]=s.split('-');return `${d}/${m}/${y}`};
const params=new URLSearchParams(location.search);const EMU=params.has('emulator');
const token=(params.get('t')||'').trim();
let cfg=window.FIREBASE_CONFIG;if(!cfg&&EMU)cfg={apiKey:'demo-key',authDomain:'demo-cleaning.firebaseapp.com',projectId:'demo-cleaning',appId:'1:1:web:1'};
const bad=msg=>{if(msg)$('#badMsg').innerHTML=msg;show('v-bad')};
if(!cfg||!/^[A-Za-z0-9_-]{24,64}$/.test(token)){bad();throw new Error('bad link')}

const [{initializeApp},A,F]=await Promise.all([import(CDN+'firebase-app.js'),import(CDN+'firebase-auth.js'),import(CDN+'firebase-firestore.js')]);
const app=initializeApp(cfg,'squad'); // separate app name: never mixes with staff login
const auth=A.getAuth(app);const db=F.getFirestore(app);
if(EMU){A.connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});F.connectFirestoreEmulator(db,'127.0.0.1',8080)}

function roHTML(f){const d=f.createdAt?.toDate?f.createdAt.toDate():null;
  const row=(k,v)=>v?`<div class="rrow"><span>${k}</span><b>${v}</b></div>`:'';
  return `<div class="eyebrow">പരിശോധിച്ച സ്ഥലം · Inspected place</div><div class="place" style="font-size:19px">📍 ${esc(f.placeName||f.route||'')}</div><div class="hint">${esc([f.placeName&&f.route?f.route:'',f.ward,f.area].filter(Boolean).join(' · '))}</div>
  <div style="margin-top:10px">`+
  row('പേര് (Name)',esc(f.officialName))+row('പദവി (Designation)',esc(f.designation))+row('സ്ഥാപനം (Institution)',esc(f.institution))+
  row('പരിശോധന തീയതി (Inspection date)',esc(fmtD(f.inspDate)))+
  row('ശുചീകരണ നില (Overall status)',`<span class="ovb ${esc(f.overall)}">${OVR[f.overall]||''}</span>`)+
  row('റേറ്റിംഗ് (Rating)',`<span class="st">${'★'.repeat(f.rating)}<i>${'★'.repeat(5-f.rating)}</i></span> ${f.rating}/5`)+
  row('അയച്ചത് (Submitted)',d?esc(d.toLocaleString('en-IN')):'')+`</div>`+
  (f.concerns?`<label class="f">കൂടുതൽ ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ <span class="en">(Points needing attention)</span></label><div class="txt">${esc(f.concerns)}</div>`:'')+
  (f.suggestions?`<label class="f">നിർദ്ദേശങ്ങൾ <span class="en">(Suggestions)</span></label><div class="txt">${esc(f.suggestions)}</div>`:'')+
  (f.photo?`<label class="f">ഫോട്ടോ <span class="en">(Photo)</span></label><img src="${f.photo}" alt="">`:'')}
async function showSubmitted(fresh){const s=await F.getDoc(F.doc(db,'squadFeedback',token));if(!s.exists())return false;
  $('#roOut').innerHTML=roHTML(s.data());
  if(fresh){$('#roTitle').textContent='നന്ദി! പരിശോധനാ ഫീഡ്‌ബാക്ക് ലഭിച്ചു.';$('#roSub').innerHTML='Thank you! Your inspection feedback has been received.<br>ഈ ലിങ്ക് തുറന്നാൽ എപ്പോഴും ഇത് കാണാം. <span class="en">(Open this link any time to view it.)</span>'}
  else{$('#roTitle').textContent='ഈ ലിങ്കിൽ ഫീഡ്‌ബാക്ക് ഇതിനകം അയച്ചിട്ടുണ്ട്';$('#roSub').innerHTML='Feedback was already submitted with this link.<br><span class="en">Shown below, read-only.</span>'}
  show('v-view');window.scrollTo(0,0);return true}

(async()=>{
let link=null,rating=0,photo=null;
F.getDoc(F.doc(db,'public','banner')).then(s=>{const t=(s.exists()&&s.data().text||'').trim();if(t){$('#jdLines').textContent=t;$('#jd').classList.add('on')}}).catch(e=>console.warn('banner',e.code));
try{if(!auth.currentUser)await A.signInAnonymously(auth);
  const s=await F.getDoc(F.doc(db,'squadLinks',token));if(!s.exists())return bad();link=s.data();
  if(link.status==='used'){if(!await showSubmitted(false))bad();return}
  if(link.status==='revoked')return bad('🚫 ഈ ലിങ്ക് റദ്ദാക്കിയിരിക്കുന്നു. അയച്ച ആളോട് പുതിയ ലിങ്ക് ആവശ്യപ്പെടുക.<br><span class="en">This link has been cancelled. Please ask the sender for a new link.</span>');
  if(link.expiresAt&&link.expiresAt.toMillis()<Date.now())return bad('⌛ ഈ ലിങ്കിൻ്റെ കാലാവധി കഴിഞ്ഞു. അയച്ച ആളോട് പുതിയ ലിങ്ക് ആവശ്യപ്പെടുക.<br><span class="en">This link has expired. Please ask the sender for a new link.</span>')}
catch(e){console.error(e);return bad(`⚠️ കണക്ഷൻ പ്രശ്നം. ഇൻ്റർനെറ്റ് പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.<br><span class="en">Connection problem (${e.code||e.message}). Check internet and try again.</span>`)}
$('#plName').textContent='📍 '+(link.placeName||link.route);
$('#plSub').textContent=[link.placeName&&link.route?'🛣️ '+link.route:'',link.ward,link.area].filter(Boolean).join(' · ');
$('#mBy').innerHTML=link.createdByName?`<svg class="ic sm"><use href="#i-user"/></svg>അയച്ചത് (Sent by): ${esc(link.createdByName)}`:'';
$('#mExp').innerHTML=`<svg class="ic sm"><use href="#i-clock"/></svg>`+(link.expiresAt?`സാധുത (Valid till): ${link.expiresAt.toDate().toLocaleDateString('en-IN')}`:'ഒരു തവണ മാത്രം (Single use)');
if(link.officialName)$('#oName').value=link.officialName;
$('#oDate').value=link.inspDate||ymd(new Date());$('#oDate').max=ymd(new Date());
$('#stars').innerHTML=[1,2,3,4,5].map(i=>`<button type="button" data-r="${i}" aria-label="${i} star">★</button>`).join('');
$('#stars').onclick=e=>{const b=e.target.closest('button');if(!b)return;rating=+b.dataset.r;document.querySelectorAll('#stars button').forEach(x=>x.classList.toggle('on',+x.dataset.r<=rating));$('#slabel').textContent=LABELS[rating];$('#err').textContent=''};
$('#concerns').oninput=()=>$('#cc').textContent=$('#concerns').value.length;
$('#suggestions').oninput=()=>$('#sc').textContent=$('#suggestions').value.length;
show('v-form');

function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('bad image'));i.src=src})}
async function decodeImage(file){if(window.createImageBitmap){try{return await createImageBitmap(file,{imageOrientation:'from-image'})}catch(e){}}const url=URL.createObjectURL(file);try{return await loadImage(url)}finally{setTimeout(()=>URL.revokeObjectURL(url),5000)}}
async function compress(file){const img=await decodeImage(file);const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;const cache={};
  for(const [m,q] of [[1600,0.78],[1600,0.68],[1440,0.68],[1280,0.72],[1280,0.62],[1280,0.52],[1024,0.6],[1024,0.5],[900,0.5],[800,0.5],[640,0.45],[480,0.45]]){
    let c=cache[m];if(!c){const s=Math.min(1,m/Math.max(w,h));c=cache[m]=document.createElement('canvas');c.width=Math.round(w*s);c.height=Math.round(h*s);const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(img,0,0,c.width,c.height)}
    const d=c.toDataURL('image/jpeg',q);if(d.length<190000)return d}
  throw new Error('too big')}
document.querySelectorAll('.phin').forEach(inp=>inp.onchange=async()=>{const f=inp.files[0];inp.value='';if(!f)return;try{photo=await compress(f);$('#phImg').src=photo;$('#ph').style.display='block'}catch(e){$('#err').textContent='⚠️ ഫോട്ടോ ചേർക്കാനായില്ല (Could not add photo)'}});
$('#phDel').onclick=()=>{photo=null;$('#ph').style.display='none'};

$('#send').onclick=async()=>{$('#err').textContent='';
  const name=$('#oName').value.trim().slice(0,80),desig=$('#oDesig').value.trim().slice(0,80),inst=$('#oInst').value.trim().slice(0,120),date=$('#oDate').value;
  const overall=(document.querySelector('input[name=ovr]:checked')||{}).value;
  const miss=[!name&&'പേര് (Name)',!desig&&'പദവി (Designation)',!inst&&'സ്ഥാപനം (Institution)',!/^\d{4}-\d{2}-\d{2}$/.test(date)&&'തീയതി (Date)',!overall&&'ശുചീകരണ നില (Overall status)',!rating&&'റേറ്റിംഗ് (Rating)'].filter(Boolean);
  if(miss.length){$('#err').innerHTML='⚠️ ദയവായി പൂരിപ്പിക്കുക (Please fill): '+miss.join(', ');return}
  const phone=$('#phone').value.replace(/[^\d+]/g,'').slice(0,15);
  if(phone&&phone.replace(/\D/g,'').length<10){$('#err').textContent='📞 ഫോൺ നമ്പർ ശരിയല്ല (Phone number looks wrong)';return}
  const btn=$('#send');btn.disabled=true;btn.textContent='⏳ അയക്കുന്നു... (Sending)';
  try{const uid=auth.currentUser.uid;const b=F.writeBatch(db);
    const data={placeId:link.placeId||'',placeName:link.placeName||'',linkBy:link.createdBy,officialName:name,designation:desig,institution:inst,inspDate:date,overall,rating,hasPhone:!!phone,status:'visible',uid,createdAt:F.serverTimestamp()};
    if(link.route)data.route=link.route;if(link.area)data.area=link.area;if(link.ward)data.ward=link.ward;if(link.createdByName)data.linkByName=link.createdByName;
    const c=$('#concerns').value.trim().slice(0,1500),sg=$('#suggestions').value.trim().slice(0,1500);if(c)data.concerns=c;if(sg)data.suggestions=sg;if(photo)data.photo=photo;
    b.set(F.doc(db,'squadFeedback',token),data);
    b.update(F.doc(db,'squadLinks',token),{status:'used',usedAt:F.serverTimestamp(),usedBy:uid});
    if(phone)b.set(F.doc(db,'squadFeedback',token,'private','contact'),{phone});
    await b.commit();await showSubmitted(true)}
  catch(e){console.error(e);
    let msg=`⚠️ അയക്കാനായില്ല (${e.code||e.message}). ഇൻ്റർനെറ്റ് പരിശോധിക്കുക.`;
    if(e.code==='permission-denied'){try{const s=await F.getDoc(F.doc(db,'squadLinks',token));const st=s.exists()?s.data().status:'';
      if(st==='used'){await showSubmitted(false);return}
      msg=st==='revoked'?'🚫 ഈ ലിങ്ക് റദ്ദാക്കിയിരിക്കുന്നു (This link was cancelled)':'⚠️ ലിങ്ക് സാധുവല്ല അല്ലെങ്കിൽ വിവരങ്ങൾ ശരിയല്ല (Link no longer valid or data invalid)'}catch(_){}}
    $('#err').innerHTML=msg}
  finally{btn.disabled=false;btn.innerHTML='<svg class="ic"><use href="#i-send"/></svg>അയക്കുക <span class="en">(Submit)</span>'}};
})();

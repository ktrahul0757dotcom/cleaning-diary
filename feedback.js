const V='13.4.0',CDN=`https://www.gstatic.com/firebasejs/${V}/`;
const $=s=>document.querySelector(s);
const show=v=>document.querySelectorAll('.view').forEach(e=>e.classList.toggle('active',e.id===v));
const LABELS=['','😞 വളരെ മോശം (Very poor)','🙁 മോശം (Poor)','😐 ശരാശരി (Average)','🙂 നല്ലത് (Good)','😄 വളരെ നല്ലത് (Excellent)'];
const WAIT_MIN=10;
const params=new URLSearchParams(location.search);const EMU=params.has('emulator');
const placeId=(params.get('place')||'').trim();
let cfg=window.FIREBASE_CONFIG;if(!cfg&&EMU)cfg={apiKey:'demo-key',authDomain:'demo-cleaning.firebaseapp.com',projectId:'demo-cleaning',appId:'1:1:web:1'};
const bad=msg=>{if(msg)$('#badMsg').innerHTML=msg;show('v-bad')};
if(!cfg||!/^[A-Za-z0-9_-]{5,40}$/.test(placeId)){bad();throw new Error('bad link')}

const [{initializeApp},A,F]=await Promise.all([import(CDN+'firebase-app.js'),import(CDN+'firebase-auth.js'),import(CDN+'firebase-firestore.js')]);
const app=initializeApp(cfg,'feedback'); // separate app name: never mixes with staff login
const auth=A.getAuth(app);const db=F.getFirestore(app);
if(EMU){A.connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});F.connectFirestoreEmulator(db,'127.0.0.1',8080)}

(async()=>{
let place=null,rating=0,photo=null;
F.getDoc(F.doc(db,'public','banner')).then(s=>{const t=(s.exists()&&s.data().text||'').trim();if(t){$('#jdLines').textContent=t;$('#jd').classList.add('on')}}).catch(e=>console.warn('banner',e.code));
try{if(!auth.currentUser)await A.signInAnonymously(auth);
  const s=await F.getDoc(F.doc(db,'places',placeId));if(!s.exists())return bad();place={id:s.id,...s.data()}}
catch(e){console.error(e);return bad(`⚠️ കണക്ഷൻ പ്രശ്നം. ഇൻ്റർനെറ്റ് പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.<br><span class="en">Connection problem (${e.code||e.message}). Check internet and try again.</span>`)}
$('#plName').textContent=place.name;$('#plSub').textContent=[place.typeLabel?((place.typeIcon||'')+' '+place.typeLabel+(place.typeOther?': '+place.typeOther:'')):'',place.ward,place.area].filter(Boolean).join(' · ');
$('#stars').innerHTML=[1,2,3,4,5].map(i=>`<button type="button" data-r="${i}" aria-label="${i} star">★</button>`).join('');
$('#stars').onclick=e=>{const b=e.target.closest('button');if(!b)return;rating=+b.dataset.r;document.querySelectorAll('#stars button').forEach(x=>x.classList.toggle('on',+x.dataset.r<=rating));$('#slabel').textContent=LABELS[rating];$('#err').textContent=''};
$('#comment').oninput=()=>$('#cc').textContent=$('#comment').value.length;
$('#suggestion').oninput=()=>$('#sc').textContent=$('#suggestion').value.length;
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

const key='niravu_fb_'+placeId;
$('#send').onclick=async()=>{$('#err').textContent='';
  if(!rating){$('#err').textContent='⭐ റേറ്റിംഗ് തിരഞ്ഞെടുക്കുക (Please choose a star rating)';return}
  const last=+localStorage.getItem(key)||0,left=Math.ceil((last+WAIT_MIN*60000-Date.now())/60000);
  if(left>0){$('#err').innerHTML=`⏳ ഈ സ്ഥലത്തിന് അഭിപ്രായം അയച്ചിട്ടുണ്ട്. ${left} മിനിറ്റ് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.<br><span class="en">You already sent feedback for this place. Try again in ${left} min.</span>`;return}
  const phone=$('#phone').value.replace(/[^\d+]/g,'').slice(0,15);const name=$('#name').value.trim().slice(0,60);
  if(phone&&phone.replace(/\D/g,'').length<10){$('#err').textContent='📞 ഫോൺ നമ്പർ ശരിയല്ല (Phone number looks wrong)';return}
  const btn=$('#send');btn.disabled=true;btn.textContent='⏳ അയക്കുന്നു... (Sending)';
  try{const uid=auth.currentUser.uid;const b=F.writeBatch(db);const fref=F.doc(F.collection(db,'feedback'));
    b.set(F.doc(db,'feedbackRate',uid+'_'+placeId),{placeId,last:F.serverTimestamp()});
    const data={placeId,placeName:place.name||'',area:place.area||'',ward:place.ward||'',rating,comment:$('#comment').value.trim().slice(0,1000),hasPhone:!!phone,status:'visible',uid,createdAt:F.serverTimestamp()};
    const sug=$('#suggestion').value.trim().slice(0,1000);if(sug)data.suggestion=sug;if(photo)data.photo=photo;if(name)data.name=name;
    b.set(fref,data);if(phone)b.set(F.doc(db,'feedback',fref.id,'private','contact'),{phone});
    await b.commit();localStorage.setItem(key,Date.now());
    $('#donePlace').textContent='📍 '+place.name;$('#doneStars').textContent='★'.repeat(rating)+'☆'.repeat(5-rating);show('v-done');window.scrollTo(0,0)}
  catch(e){console.error(e);$('#err').innerHTML=e.code==='permission-denied'?`⏳ അൽപ്പ സമയം മുമ്പ് ഈ സ്ഥലത്തിന് അഭിപ്രായം അയച്ചിട്ടുണ്ട്, അല്ലെങ്കിൽ വിവരങ്ങൾ ശരിയല്ല. ${WAIT_MIN} മിനിറ്റ് കഴിഞ്ഞ് ശ്രമിക്കുക.<br><span class="en">Feedback was sent recently or the data is invalid. Please try again in ${WAIT_MIN} min.</span>`:`⚠️ അയക്കാനായില്ല (${e.code||e.message}). ഇൻ്റർനെറ്റ് പരിശോധിക്കുക.`}
  finally{btn.disabled=false;btn.innerHTML='<svg class="ic"><use href="#i-send"/></svg>അയക്കുക <span class="en">(Submit)</span>'}};

})();

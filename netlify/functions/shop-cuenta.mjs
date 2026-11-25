import {getStore} from '@netlify/blobs';
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const clean=(v,n=160)=>String(v??'').trim().slice(0,n);
const hex=b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
const hash=async s=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
async function passHash(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:150000,hash:'SHA-256'},key,256));}
const safe=u=>({name:u.name,email:u.email,phone:u.phone||'',created:u.created,purchases:u.purchases||0,favorites:u.favorites||[],coupons:u.coupons||[],messages:u.messages||[]});
export default async req=>{
 const st=getStore('tecnoespacios-shop');let b;try{b=await req.json()}catch{return J({e:'Solicitud inválida'},400)}
 const index=await st.get('users-index',{type:'json'})||[];
 const userKey=async email=>'user-'+await hash(email.toLowerCase());
 const getUser=async email=>st.get(await userKey(email),{type:'json'});
 const save=async u=>{await st.setJSON(await userKey(u.email),u);if(!index.includes(u.email.toLowerCase())){index.push(u.email.toLowerCase());await st.setJSON('users-index',index)}};
 const credStore=getStore('tecnoespacios');const adminHash=(await credStore.get('cred'))||'102eadf5a95f7d262edefb1f2888cb8ded09635c5d71fa6c21d2def3902c299e';
 if(b.action==='register'){
  const name=clean(b.name,100),email=clean(b.email,160).toLowerCase(),phone=clean(b.phone,40),password=String(b.password||'');
  if(name.length<2||!/^\S+@\S+\.\S+$/.test(email)||password.length<8)return J({e:'Completa nombre, correo válido y contraseña de mínimo 8 caracteres.'},400);
  if(await getUser(email))return J({e:'Ya existe una cuenta con ese correo. Inicia sesión.'},409);
  const salt=hex(crypto.getRandomValues(new Uint8Array(16))),u={name,email,phone,salt,passwordHash:await passHash(password,salt),created:new Date().toISOString(),purchases:0,favorites:[],coupons:[],messages:[]};await save(u);
  const token=crypto.randomUUID()+crypto.randomUUID();await st.setJSON('session-'+await hash(token),{email,expires:Date.now()+30*24*60*60*1000});return J({ok:true,token,user:safe(u)});
 }
 if(b.action==='login'){
  const email=clean(b.email,160).toLowerCase(),u=await getUser(email);if(!u||await passHash(String(b.password||''),u.salt)!==u.passwordHash)return J({e:'Correo o contraseña incorrectos.'},401);
  const token=crypto.randomUUID()+crypto.randomUUID();await st.setJSON('session-'+await hash(token),{email,expires:Date.now()+30*24*60*60*1000});return J({ok:true,token,user:safe(u)});
 }
 if(b.action==='admin-list'||b.action==='admin-update'){
  if(b.auth!==adminHash)return J({e:'No autorizado'},401);
  if(b.action==='admin-list'){const users=[];for(const email of index){const u=await getUser(email);if(u)users.push(safe(u))}return J({ok:true,users})}
  const email=clean(b.email,160).toLowerCase(),u=await getUser(email);if(!u)return J({e:'Cliente no encontrado'},404);
  if(b.purchase===true)u.purchases=(u.purchases||0)+1;
  if(b.coupon){const code=clean(b.coupon.code,40).toUpperCase(),description=clean(b.coupon.description,180);if(!code)return J({e:'Escribe un código de cupón.'},400);u.coupons=u.coupons||[];u.coupons.push({code,description,created:new Date().toISOString(),used:false})}
  if(b.message){u.messages=u.messages||[];u.messages.push({id:crypto.randomUUID(),text:clean(b.message,700),created:new Date().toISOString(),read:false})}
  await save(u);return J({ok:true,user:safe(u)});
 }
 const token=clean(b.token,100),session=token?await st.get('session-'+await hash(token),{type:'json'}):null,email=session?.email;if(!email||session.expires<Date.now())return J({e:'Tu sesión venció. Inicia sesión nuevamente.'},401);
 const u=await getUser(email);if(!u)return J({e:'Cuenta no encontrada.'},404);
 if(b.action==='me')return J({ok:true,user:safe(u)});
 if(b.action==='favorite'){const id=String(b.productId||'').slice(0,80);u.favorites=u.favorites||[];u.favorites=u.favorites.includes(id)?u.favorites.filter(x=>x!==id):[...u.favorites,id];await save(u);return J({ok:true,user:safe(u)})}
 if(b.action==='logout'){await st.delete('session-'+await hash(token));return J({ok:true})}
 return J({e:'Acción desconocida'},400);
};

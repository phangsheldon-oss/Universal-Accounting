// Offline licence verification foundation. No private signing key belongs in the app.
(function(root){
'use strict';
const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
async function verifyLicence(token,publicKey,installationId,platform){
 if(typeof token!=='string'||token.length>16384||!installationId||!platform)return false;
 try{
 const parts=token.trim().split('.');if(parts.length!==2)return false;
 const bytes=decode(parts[0]),signature=decode(parts[1]);
 const key=await crypto.subtle.importKey('jwk',publicKey,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
 if(!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,signature,bytes))return false;
 const p=JSON.parse(new TextDecoder().decode(bytes));
 return p.product==='Universal Accounting'&&p.version===1&&typeof p.licenceId==='string'&&p.licenceId.length>0&&p.installationId===installationId&&p.platform===platform&&p.entitlement==='perpetual';
 }catch{return false}
}
root.UALicensing={verifyLicence};
})(globalThis);

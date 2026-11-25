// Commercial activation gate. Installation ID is local, not hardware-backed.
async function UAActivate(publicKey,platform){
 const idKey='ua_licence_installation_v1',tokenKey='ua_licence_token_v1';
 const locked=document.getElementById('ua-locked-app');
 const cover=document.createElement('div');
 cover.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#17324d;color:white;padding:24px;overflow:auto';
 document.body.appendChild(cover);
 function start(){const script=document.createElement('script');script.textContent=locked.textContent;locked.remove();document.body.appendChild(script);cover.remove()}
 try{
 let id=localStorage.getItem(idKey);
 if(!id){id=Array.from(crypto.getRandomValues(new Uint8Array(24)),x=>x.toString(16).padStart(2,'0')).join('');localStorage.setItem(idKey,id)}
 if(await UALicensing.verifyLicence(localStorage.getItem(tokenKey),publicKey,id,platform)){start();return}
 cover.innerHTML='<h1>Activate Universal Accounting</h1><p>Send this installation ID to your software provider. Activation works offline using a signed licence.</p><input id="ua-id" readonly style="width:100%"><p>Paste your licence below.</p><textarea id="ua-token" rows="6" style="width:100%"></textarea><p><button id="ua-activate">Activate</button></p><p id="ua-status" role="status"></p>';
 cover.querySelector('#ua-id').value=id;
 cover.querySelector('#ua-activate').onclick=async()=>{const token=cover.querySelector('#ua-token').value.trim();if(await UALicensing.verifyLicence(token,publicKey,id,platform)){localStorage.setItem(tokenKey,token);start()}else cover.querySelector('#ua-status').textContent='Invalid licence for this installation.'};
 }catch{cover.textContent='Activation unavailable. Contact your software provider. Your accounting records have not been changed.'}
}

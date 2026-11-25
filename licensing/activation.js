// Commercial activation uses an identifier supplied by the platform wrapper.
async function UAActivate(publicKey,platform){
 const tokenKey='ua_licence_token_v1';
 const locked=document.getElementById('ua-locked-app');
 const cover=document.createElement('div');
 cover.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#17324d;color:white;padding:24px;overflow:auto';
 document.body.appendChild(cover);
 function start(){const script=document.createElement('script');script.textContent=locked.textContent;locked.remove();document.body.appendChild(script);cover.remove()}
 try{
 const id=platform==='android'
  ? window.AndroidLicence.getDeviceId()
  : await window.UALicenceDevice.getDeviceId();
 if(!/^[a-f0-9]{64}$/.test(id))throw Error('Device identity unavailable');
 if(await UALicensing.verifyLicence(localStorage.getItem(tokenKey),publicKey,id,platform)){start();return}
 cover.innerHTML='<h1>Activate Universal Accounting</h1><p>Send this device ID to your software provider. Activation works offline using a signed licence.</p><input id="ua-id" readonly style="width:100%"><p>Paste your licence below.</p><textarea id="ua-token" rows="6" style="width:100%"></textarea><p><button id="ua-activate">Activate</button></p><p id="ua-status" role="status"></p>';
 cover.querySelector('#ua-id').value=id;
 cover.querySelector('#ua-activate').onclick=async()=>{const token=cover.querySelector('#ua-token').value.trim();if(await UALicensing.verifyLicence(token,publicKey,id,platform)){localStorage.setItem(tokenKey,token);start()}else cover.querySelector('#ua-status').textContent='Invalid licence for this device.'};
 }catch{cover.textContent='Activation unavailable. Contact your software provider. Your accounting records have not been changed.'}
}

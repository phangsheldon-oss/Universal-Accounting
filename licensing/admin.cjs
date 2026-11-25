// Run on the owner's private computer, never bundle with customer installers.
const fs=require('node:fs'),crypto=require('node:crypto');
const [cmd,...args]=process.argv.slice(2);
if(cmd==='init'){
 const {privateKey,publicKey}=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'});
 fs.writeFileSync('ua-private.pem',privateKey.export({type:'pkcs8',format:'pem'}),{flag:'wx',mode:0o600});
 fs.writeFileSync('ua-public.json',JSON.stringify(publicKey.export({format:'jwk'})),{flag:'wx'});
 console.log('Keys generated. Keep ua-private.pem private.');
}else if(cmd==='issue'){
 const [installationId,platform,customer]=args;
 if(!/^[a-zA-Z0-9-]{16,128}$/.test(installationId||'')||!['android','windows'].includes(platform)||!customer)throw Error('Usage: issue INSTALLATION_ID android|windows CUSTOMER_REFERENCE');
 const payload={product:'Universal Accounting',version:1,licenceId:crypto.randomUUID(),installationId,platform,entitlement:'perpetual'};
 const bytes=Buffer.from(JSON.stringify(payload));
 const signature=crypto.sign('sha256',bytes,{key:fs.readFileSync('ua-private.pem'),dsaEncoding:'ieee-p1363'});
 const token=bytes.toString('base64url')+'.'+signature.toString('base64url');
 fs.appendFileSync('ua-licence-registry.jsonl',JSON.stringify({...payload,customer,issuedAt:new Date().toISOString()})+'\n',{mode:0o600});
 console.log(token);
}else throw Error('Use init or issue');

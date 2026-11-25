// Prepare a separate commercial HTML asset. Never include private keys.
const fs=require('node:fs'),path=require('node:path');
const [platform,keyPath,output]=process.argv.slice(2);
if(!['android','windows'].includes(platform)||!keyPath||!output)throw Error('Usage: prepare-commercial android|windows PUBLIC_JWK OUTPUT_HTML');
const key=JSON.parse(fs.readFileSync(keyPath,'utf8'));
if(key.kty!=='EC'||key.crv!=='P-256'||!key.x||!key.y||key.d)throw Error('Expected public P-256 JWK only');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'Android/app/src/main/assets/index.html'),'utf8');
const verify=fs.readFileSync(path.join(__dirname,'verify-licence.js'),'utf8');
const gate=fs.readFileSync(path.join(__dirname,'activation.js'),'utf8');
const marker='<script>';
if(!source.includes(marker))throw Error('Application script marker missing');
const result=source.replace(marker,'<script type="text/plain" id="ua-locked-app">').replace('</script></body></html>','</script><script>'+verify+'\n'+gate+'\nUAActivate('+JSON.stringify(key)+','+JSON.stringify(platform)+');</script></body></html>');
if(!result.includes('id="ua-locked-app"')||!result.includes('UAActivate('))throw Error('Activation injection failed');
fs.writeFileSync(output,result);

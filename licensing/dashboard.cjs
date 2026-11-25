const http = require('node:http');
const { randomBytes } = require('node:crypto');
const { issuePaidOrder, redeemedOrders } = require('./issue.cjs');

const accessPath = '/' + randomBytes(24).toString('hex');
const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

function dashboard(message = '', token = '') {
  const rows = redeemedOrders().map(order => `<tr>
    <td>${escape(order.order)}</td><td>${escape(order.customer)}</td>
    <td>${escape(order.platform)}</td><td>${escape(order.issuedAt)}</td>
    <td><details><summary>Show licence</summary><textarea readonly>${escape(order.token)}</textarea></details></td>
  </tr>`).join('');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Universal Accounting | Licences</title>
<style>body{font:1rem system-ui,sans-serif;color:#17324d;background:#edf3f8;max-width:70rem;margin:auto;padding:1rem}section{background:white;padding:1.25rem;margin-block:1rem;border-radius:.75rem;overflow:auto}label{display:block;margin-block:.5rem}input,select,button,textarea{font:inherit;padding:.4rem}textarea{display:block;width:95%;min-height:5rem}button{background:#17324d;color:white;border:0;border-radius:.35rem}th,td{text-align:left;padding:.5rem;border-bottom:1px solid #ddd}</style>
<h1>Universal Accounting licence management</h1>
<section><h2>Issue a paid order licence</h2><p>Confirm cleared payment in your sales records before issuing a licence.</p>
<form method="post" action="${accessPath}">
<label>Paid order reference <input name="order" required maxlength="120"></label>
<label>Customer reference <input name="customer" required maxlength="120"></label>
<label>Platform <select name="platform"><option value="android">Android</option><option value="windows">Windows</option></select></label>
<label>Device ID <input name="device" required minlength="64" maxlength="64" pattern="[a-f0-9]{64}"></label>
<button>Issue perpetual licence</button></form>
${message ? `<p role="status">${escape(message)}</p>` : ''}
${token ? `<label>Licence token<textarea readonly>${escape(token)}</textarea></label>` : ''}</section>
<section><h2>Redeemed orders</h2><table><thead><tr><th>Order</th><th>Customer</th><th>Platform</th><th>Issued</th><th>Activation</th></tr></thead><tbody>${rows}</tbody></table></section></html>`;
}

const server = http.createServer(async (request, response) => {
  const host = '127.0.0.1:' + server.address().port;
  if (request.headers.host !== host || request.url !== accessPath) {
    response.writeHead(404).end();
    return;
  }
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  try {
    if (request.method === 'GET') {
      response.end(dashboard());
      return;
    }
    if (request.method !== 'POST' || request.headers.origin !== 'http://' + host
        || request.headers['content-type'] !== 'application/x-www-form-urlencoded') {
      response.writeHead(403).end();
      return;
    }
    let body = '';
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 4096) {
        response.writeHead(413).end();
        return;
      }
    }
    const form = new URLSearchParams(body);
    const token = issuePaidOrder(...['order', 'device', 'platform', 'customer'].map(key => form.get(key) || ''));
    response.end(dashboard('Licence issued. Send this token to the customer.', token));
  } catch (error) {
    response.statusCode = 400;
    const known = /^(Enter |This paid order)/.test(error.message);
    response.end('<p role="alert">' + escape(known ? error.message : 'Licence operation failed. Check the private key and registry directory.') + '</p><a href="' + accessPath + '">Return to licence management</a>');
  }
});

server.listen(0, '127.0.0.1', () => {
  console.log('Open this private session URL: http://127.0.0.1:' + server.address().port + accessPath);
});

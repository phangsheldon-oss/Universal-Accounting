const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const orderDirectory = 'ua-redeemed-orders';

function issuePaidOrder(order, deviceId, platform, customer) {
  order = order.trim().toUpperCase();
  customer = customer.trim();
  if (!/^[A-Z0-9][A-Z0-9._-]{2,119}$/.test(order)) throw Error('Enter a valid paid order reference');
  if (!/^[a-f0-9]{64}$/.test(deviceId) || !['android', 'windows'].includes(platform)) {
    throw Error('Enter a valid device ID and platform');
  }
  if (!customer || customer.length > 120) throw Error('Enter a customer reference');
  const payload = {
    product: 'Universal Accounting', version: 1, licenceId: crypto.randomUUID(),
    installationId: deviceId, platform, entitlement: 'perpetual'
  };
  const bytes = Buffer.from(JSON.stringify(payload));
  const signature = crypto.sign('sha256', bytes, {
    key: fs.readFileSync('ua-private.pem'), dsaEncoding: 'ieee-p1363'
  });
  const token = bytes.toString('base64url') + '.' + signature.toString('base64url');
  fs.mkdirSync(orderDirectory, { recursive: true, mode: 0o700 });
  const destination = path.join(orderDirectory, crypto.createHash('sha256').update(order).digest('hex') + '.json');
  const temporary = path.join(orderDirectory, crypto.randomUUID() + '.tmp');
  try {
    fs.writeFileSync(temporary, JSON.stringify({
      ...payload, order, customer, token, issuedAt: new Date().toISOString()
    }), { flag: 'wx', mode: 0o600, flush: true });
    fs.linkSync(temporary, destination);
  } catch (error) {
    if (error.code === 'EEXIST') throw Error('This paid order has already been redeemed');
    throw error;
  } finally {
    fs.rmSync(temporary, { force: true });
  }
  return token;
}

function redeemedOrders() {
  if (!fs.existsSync(orderDirectory)) return [];
  return fs.readdirSync(orderDirectory)
    .filter(name => /^[a-f0-9]{64}\.json$/.test(name))
    .map(name => JSON.parse(fs.readFileSync(path.join(orderDirectory, name), 'utf8')))
    .sort((first, second) => second.issuedAt.localeCompare(first.issuedAt));
}

module.exports = { issuePaidOrder, redeemedOrders };

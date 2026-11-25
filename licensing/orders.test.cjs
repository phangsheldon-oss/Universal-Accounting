const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { issuePaidOrder, redeemedOrders } = require('./issue.cjs');
require('./verify-licence.js');

test('redeem a fictional paid order once and recover the device-specific token', async () => {
  const original = process.cwd();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ua-order-test-'));
  try {
    process.chdir(directory);
    const init = spawnSync(process.execPath, [path.join(__dirname, 'admin.cjs'), 'init']);
    assert.equal(init.status, 0);
    const device = 'a'.repeat(64);
    const token = issuePaidOrder('sample-123', device, 'android', 'Fictional Customer');
    assert.throws(() => issuePaidOrder(' SAMPLE-123 ', 'b'.repeat(64), 'windows', 'Fictional Customer'), /already been redeemed/);
    assert.equal(redeemedOrders().length, 1);
    assert.equal(redeemedOrders()[0].token, token);
    const key = JSON.parse(fs.readFileSync('ua-public.json', 'utf8'));
    assert.equal(await UALicensing.verifyLicence(token, key, device, 'android'), true);
    assert.equal(await UALicensing.verifyLicence(token, key, 'b'.repeat(64), 'android'), false);
  } finally {
    process.chdir(original);
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

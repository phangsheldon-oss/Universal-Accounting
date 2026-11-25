const {test,expect}=require('@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const url=pathToFileURL(path.resolve(__dirname,'../Android/app/src/main/assets/index.html')).href;
test.beforeEach(async({page})=>{await page.goto(url);await page.evaluate(()=>{localStorage.clear()});await page.reload();});
test('fresh setup and persistence',async({page})=>{
 await expect(page.locator('#firstRunSetup')).toBeVisible();
 await page.locator('#firstRunForm [name=business]').fill('Fictional Test Trading');
 await page.locator('#firstRunForm [name=currency]').selectOption('USD');
 await page.locator('#firstRunForm button').click();
 await expect(page.locator('#firstRunSetup')).toHaveCount(0);
 await page.reload();
 await expect(page.locator('#firstRunSetup')).toHaveCount(0);
 expect(await page.evaluate(()=>({business:db.business,currency:db.currency,journals:db.journals.length}))).toEqual({business:'Fictional Test Trading',currency:'USD',journals:0});
});
test('balanced capital, sales, receipts, purchases and inventory',async({page})=>{
 const result=await page.evaluate(()=>{
 db=empty();const d='2026-01-15';
 capitalTransaction('opening',1000000,d,'1000','Test capital');
 addCustomer('Sample Customer');const inv=createInvoice(db.customers[0].id,300000,d,'Sample service');recordPayment(inv,120000,d);
 addVendor('Sample Vendor');addItem('TEST-01','Sample product');
 const bill=createBill(db.vendors[0].id,[{item:db.items[0].id,quantity:10,cost:'100.00'}],d,'TEST-BILL');
 receiveGoods(bill,'L1',6,d);payVendor(bill,40000,d,'bank_transfer');
 return {balances:balances(),balanced:db.journals.every(j=>j.lines.reduce((a,l)=>a+l.dr-l.cr,0)===0),outstanding:invoiceBalance(db.invoices[0]),due:billDue(db.vendorBills[0])};
 });
 expect(result.balanced).toBe(true);
 expect(result.balances).toMatchObject({'1000':1080000,'1100':180000,'1200':60000,'1300':40000,'2000':-60000,'3000':-1000000,'4000':-300000});
 expect(result.outstanding).toBe(180000);expect(result.due).toBe(60000);
});
test('reject overpayment without mutation',async({page})=>{
 expect(await page.evaluate(()=>{db=empty();addCustomer('Sample Customer');const i=createInvoice(db.customers[0].id,10000,'2026-01-15','Test');const before=JSON.stringify(db);try{recordPayment(i,10001,'2026-01-15')}catch{return JSON.stringify(db)===before}return false})).toBe(true);
});
for(const [name,kind,cents,date] of [
 ['negative invoice','invoice',-100,'2026-01-15'],
 ['impossible invoice date','invoice',100,'2026-02-30'],
 ['negative payment','payment',-100,'2026-01-15'],
 ['invalid payment date','payment',100,'not-a-date']
]){
 test('reject '+name+' atomically',async({page})=>{
  const result=await page.evaluate(({kind,cents,date})=>{
   db=empty();
   addCustomer('Sample Customer');
   const customer=db.customers[0].id;
   const invoice=createInvoice(customer,10000,'2026-01-15','Test');
   const before=JSON.stringify(db);
   let rejected=false;
   try{
    if(kind==='invoice')createInvoice(customer,cents,date,'Invalid');
    else recordPayment(invoice,cents,date);
   }catch{rejected=true}
   return {rejected,unchanged:JSON.stringify(db)===before};
  },{kind,cents,date});
  expect(result).toEqual({rejected:true,unchanged:true});
 });
}

async function setup(page){
 await page.locator('#firstRunForm [name=business]').fill('Fictional Release Test');
 await page.locator('#firstRunForm button').click();
}

test('as-of reporting preserves the P&L period and printed equity includes earnings',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{
  addCustomer('Fictional Buyer');
  const customer=db.customers[0].id;
  capitalTransaction('opening',50000,'2026-01-01','1000','Test');
  createInvoice(customer,12000,'2026-01-15','January service');
  createInvoice(customer,4000,'2026-02-15','February service');
  reportFrom='2026-01-01';
  reportTo='2026-02-28';
  return navigate('Balance Sheet');
 });
 await page.locator('#reportDates [name=from]').fill('2026-01-31');
 await page.getByRole('button',{name:'Update report'}).click();
 await expect(page.locator('#view')).toContainText('Accounting equation difference: JMD 0.00');
 await expect(page.locator('#view')).toContainText('JMD 620.00');
 const printed=await page.evaluate(()=>({
  balance:makePrintDocument('balance',''),
  profit:makePrintDocument('pnl',''),
  period:[reportFrom,reportTo]
 }));
 expect(printed.balance).toContain('Unclosed earnings');
 expect(printed.balance).toContain('JMD 620.00');
 expect(printed.profit).toContain('JMD 160.00');
 expect(printed.period).toEqual(['2026-01-01','2026-02-28']);
});

test('export and restore fictional records and reject an unbalanced backup',async({page})=>{
 const fs=require('node:fs/promises');
 await setup(page);
 await page.evaluate(()=>{addCustomer('Fictional Buyer');createInvoice(db.customers[0].id,12000,'2026-01-15','Service');return navigate('Settings')});
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export readable JSON'}).click();
 const json=await fs.readFile(await (await download).path());
 const expected=JSON.parse(json);
 const bad=JSON.parse(json);
 bad.journals[0].lines[0].dr++;
 await page.locator('#import').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});
 await expect(page.locator('#notice')).toContainText('Unbalanced backup journal');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem(KEY)))).toEqual(expected);
 await page.evaluate(()=>{db=empty();save()});
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#import').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:json});
 await expect(page.locator('#notice')).toContainText('Backup restored');
 await page.reload();
 expect(await page.evaluate(()=>db)).toEqual(expected);
});

test('commercial wrapper rejects a different device and reopens offline after activation',async({page,context},testInfo)=>{
 const fs=require('node:fs/promises');
 const {generateKeyPairSync,sign}=require('node:crypto');
 const {execFileSync}=require('node:child_process');
 const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'});
 const deviceId='a'.repeat(64);
 const keyPath=testInfo.outputPath('fictional-public.json');
 const htmlPath=testInfo.outputPath('commercial.html');
 await fs.mkdir(testInfo.outputDir,{recursive:true});
 await fs.writeFile(keyPath,JSON.stringify(publicKey.export({format:'jwk'})));
 execFileSync(process.execPath,[path.resolve(__dirname,'../licensing/prepare-commercial.cjs'),'windows',keyPath,htmlPath]);
 function token(id){
  const payload=Buffer.from(JSON.stringify({product:'Universal Accounting',version:1,licenceId:'fictional-1',installationId:id,platform:'windows',entitlement:'perpetual'}));
  return payload.toString('base64url')+'.'+sign('sha256',payload,{key:privateKey,dsaEncoding:'ieee-p1363'}).toString('base64url');
 }
 await page.addInitScript(id=>{window.UALicenceDevice={getDeviceId:async()=>id}},deviceId);
 await context.setOffline(true);
 await page.goto(pathToFileURL(htmlPath).href);
 await expect(page.locator('#ua-id')).toHaveValue(deviceId);
 await expect(page.locator('#firstRunSetup')).toHaveCount(0);
 await page.locator('#ua-token').fill(token('b'.repeat(64)));
 await page.locator('#ua-activate').click();
 await expect(page.locator('#ua-status')).toContainText('Invalid licence');
 await page.locator('#ua-token').fill(token(deviceId));
 await page.locator('#ua-activate').click();
 await expect(page.locator('#firstRunSetup')).toBeVisible();
 await setup(page);
 await page.reload();
 await expect(page.locator('#ua-id')).toHaveCount(0);
 await expect(page.locator('#businessTitle')).toHaveText('Fictional Release Test');
});

test('encrypted backups require the correct passphrase before replacing records',async({page})=>{
 const fs=require('node:fs/promises');
 const passphrase='Fictional backup passphrase';
 await setup(page);
 await page.evaluate(()=>navigate('Settings'));
 const exportDialogs=dialog=>dialog.accept(passphrase);
 page.on('dialog',exportDialogs);
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export encrypted backup'}).click();
 const json=await fs.readFile(await (await download).path());
 page.off('dialog',exportDialogs);
 expect(json.toString()).not.toContain('Fictional Release Test');
 const file={name:'encrypted-backup.json',mimeType:'application/json',buffer:json};
 await page.evaluate(()=>{db.business='Temporary Fictional Business';save()});
 page.once('dialog',dialog=>dialog.accept('Incorrect passphrase'));
 await page.locator('#import').setInputFiles(file);
 await expect(page.locator('#notice')).toContainText('Incorrect passphrase');
 expect(await page.evaluate(()=>db.business)).toBe('Temporary Fictional Business');
 const restoreDialogs=dialog=>dialog.type()==='prompt'?dialog.accept(passphrase):dialog.accept();
 page.on('dialog',restoreDialogs);
 await page.locator('#import').setInputFiles(file);
 await expect(page.locator('#notice')).toContainText('Backup restored');
 page.off('dialog',restoreDialogs);
 await page.reload();
 expect(await page.evaluate(()=>db.business)).toBe('Fictional Release Test');
});

test('stock invoice consumes FIFO receipt layers and reconciles inventory and gross profit',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{
  addVendor('Fictional Supplier');
  addCustomer('Fictional Buyer');
  addItem('T-FIFO','Fictional Product');
  const vendor=db.vendors[0].id;
  const item=db.items[0].id;
  const first=createBill(vendor,[{item,quantity:2,cost:'100.00'}],'2026-01-01','FIFO-1');
  const second=createBill(vendor,[{item,quantity:3,cost:'120.00'}],'2026-01-02','FIFO-2');
  receiveGoods(first,'L1',2,'2026-01-01');
  receiveGoods(second,'L1',3,'2026-01-03');
  return navigate('Invoices');
 });
 const form=page.locator('#invoiceForm');
 await form.locator('[name=date]').fill('2026-01-04');
 await form.locator('[name=customer]').selectOption({index:1});
 await form.locator('[name=amount]').fill('600.00');
 await form.locator('#salesItemLookup').fill('T-FIFO');
 await expect(form.locator('[name=description]')).toHaveValue('Fictional Product');
 await form.locator('[name=units]').fill('3');
 await form.getByRole('button').click();
 await page.getByRole('button',{name:'Save only',exact:true}).click();
 expect(await page.evaluate(()=>({drafts:db.drafts.length,invoices:db.invoices.length}))).toEqual({drafts:1,invoices:0});
 await page.reload();
 await page.evaluate(()=>navigate('Invoices'));
 await page.getByRole('button',{name:'Open draft'}).click();
 await expect(form.locator('[name=amount]')).toHaveValue('600.00');
 await form.getByRole('button').click();
 await page.getByRole('button',{name:'Save and post',exact:true}).click();
 await expect(form.locator('[name=customer]')).toHaveValue('');
 await expect(page.getByRole('button',{name:'Open draft'})).toHaveCount(0);
 await expect(page.locator('#postedInvoices')).toBeFocused();
 await expect(page.locator('#postedInvoices tbody tr').first()).toContainText('Fictional Buyer');
 await expect(page.locator('#invoiceForm [name=description]')).toHaveValue('');
 const result=await page.evaluate(()=>{
  const invoice=db.invoices[0];
  const before=JSON.stringify(db);
  let rejected=false;
  try{createInvoice(invoice.customer,10000,'2026-01-05','Too many',invoice.stock.item,'3')}
  catch{rejected=true}
  return {
   cost:invoice.stock.cost,
   inventory:stockInfo(invoice.stock.item),
   ledger:balances(),
   gross:profitAndLoss('2026-01-01','2026-01-31'),
   rejected,unchanged:before===JSON.stringify(db)
  };
 });
 expect(result.cost).toBe(32000);
 expect(result.inventory).toMatchObject({quantity:2,value:24000});
 expect(result.ledger).toMatchObject({'1100':60000,'1200':24000,'4000':-60000,'5000':32000});
 expect(result.gross).toContain('Gross profit: JMD 280.00');
 expect(result).toMatchObject({rejected:true,unchanged:true});
});

test('draft customer cash payment leaves the ledger unchanged until posted',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{
  addCustomer('Fictional Buyer');
  createInvoice(db.customers[0].id,10000,'2026-01-15','Test invoice');
  return navigate('Payments');
 });
 const form=page.locator('#paymentForm');
 await form.getByRole('button').click();
 await page.getByRole('button',{name:'Save only',exact:true}).click();
 await page.getByRole('button',{name:'Open draft'}).click();
 await form.locator('[name=invoice]').selectOption({index:1});
 await form.locator('[name=date]').fill('2026-01-15');
 await form.locator('[name=amount]').fill('75.00');
 await form.locator('[name=method]').selectOption('cash');
 await form.locator('[name=reference]').fill('QA-CASH-1');
 await form.getByRole('button').click();
 await page.getByRole('button',{name:'Save only',exact:true}).click();
 expect(await page.evaluate(()=>({drafts:db.drafts.length,journals:db.journals.length}))).toEqual({drafts:1,journals:1});
 await page.getByRole('button',{name:'Open draft'}).click();
 await expect(form.locator('[name=method]')).toHaveValue('cash');
 await form.getByRole('button').click();
 await page.getByRole('button',{name:'Save and post',exact:true}).click();
 await expect(form.locator('[name=invoice]')).toHaveValue('');
 await expect(page.getByRole('row').filter({hasText:'QA-CASH-1'})).toContainText('Cash');
 expect(await page.evaluate(()=>balances())).toMatchObject({'1010':7500,'1100':2500});
});

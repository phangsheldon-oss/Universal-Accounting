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
 await page.getByRole('button',{name:'Export JSON backup'}).click();
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

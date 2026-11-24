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
for(const [name,operation] of [
 ['negative invoice', 'createInvoice(db.customers[0].id,-100,"2026-01-15","Invalid")'],
 ['impossible invoice date','createInvoice(db.customers[0].id,100,"2026-02-30","Invalid")'],
 ['negative payment','recordPayment(db.invoices[0].id,-100,"2026-01-15")'],
 ['invalid payment date','recordPayment(db.invoices[0].id,100,"not-a-date")']
]){
 test('reject '+name+' atomically',async({page})=>{
 const result=await page.evaluate(op=>{db=empty();addCustomer('Sample Customer');createInvoice(db.customers[0].id,10000,'2026-01-15','Test');const before=JSON.stringify(db);let rejected=false;try{eval(op)}catch{rejected=true}return {rejected,unchanged:JSON.stringify(db)===before}},operation);
 expect(result).toEqual({rejected:true,unchanged:true});
 });
}

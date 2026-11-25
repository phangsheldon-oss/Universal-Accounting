# Universal Accounting Edition 2 user manual

Development build v0.5.18

## Set up your business

Enter your business name, base currency and fiscal year start month. The application provides a standard chart of accounts. Choose the base currency before posting transactions because posted entries retain that denomination.

Use Accounting → Capital & Equity to record money contributed by the owner. Select the bank or cash account that actually received it. Existing businesses should reconcile opening balances before entering live activity. The development build has no general opening-balance journal.

## Record sales and purchases

1. Under Sales, create or select the customer. Use Invoices to enter the amount, date and description. Review the posting and confirm it.
2. When money arrives, use Payments against the invoice. Partial payments reduce the balance outstanding.
3. Under Purchases, create the vendor and add products under Inventory → Stock. Enter the vendor bill with its invoice reference, quantities and unit costs.
4. Use Goods Receipt for the quantities physically received. Use Pay Vendors to apply actual payments to the bill and record the payment method and reference.
5. Review account movements by selecting an account in Accounting → Chart of Accounts.

## Review and print

Use Profit & Loss for a date range and Balance Sheet for a single as-of date. Reports → Reports includes the trial balance. Check receivables, payables and stock against supporting records. Use Print Center to preview reports and documents.

The development build does not post inventory sales depletion, cost of goods sold, depreciation or taxes automatically. Reports reflect the transactions the application can post.

## Back up and restore

From Administration → Settings, export a JSON backup. On Android, choose a destination in the system file picker. Keep a dated copy in a private location separate from the device. JSON exports contain readable business data. Use encrypted storage for backup copies.

Before restoring, export the current records. Select Restore JSON backup, choose the file and confirm replacement. Verify the business name and compare the trial balance, customer balances and vendor balances with your pre-restore records. The backup carries business records separately from your licence and function passwords.

## Accounting do’s and don’ts

- Do keep supporting invoices, receipts, bank records and payment references.
- Do record invoices and their settlements separately. A customer payment reduces receivables.
- Do check the posting date and reference before confirming.
- Do reconcile bank activity and open invoices against independent records.
- Don’t post a supplier invoice twice or record a customer settlement as a new sale.
- Don’t report owner capital as sales revenue or owner withdrawals as operating expenses.
- Don’t clear records until you have verified a recoverable backup.

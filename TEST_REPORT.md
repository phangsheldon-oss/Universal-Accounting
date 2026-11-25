# Universal Accounting Edition 2 release verification

v0.5.18 development build. Test data was fictional.

| Release check | Result |
| --- | --- |
| Chromium accounting workflow suite | PASS, 12 tests |
| Double entry and reconciled fictional sales and purchases | PASS, included in Chromium suite |
| Separate Balance Sheet as-of date, P&L date range and printed earnings | PASS, included in Chromium suite |
| Backup export, invalid ledger rejection, restore and reload | PASS, included in Chromium suite |
| Signed offline licence verification | PASS, 3 Node tests including duplicate paid-order rejection and dashboard authorization |
| Android and Windows package compilation | PASS for first draft commit, Android debug APK and unsigned Windows installer |
| Native installer smoke tests | Pending target-device testing |
| Existing-customer in-place upgrade | Pending testing on both native packages |
| Production signing and installer signature verification | Pending signing setup |
| Paid order redemption and administrator dashboard | Core redemption test passed with fictional orders. Payment confirmation is manual. |
| Offline restarts, copied token rejection and reset recovery on both platforms | Pending target-device testing |
| Encrypted export and restore | PASS in Chromium including wrong-passphrase rejection |
| Native at-rest app database protection | Pending verification |
| FIFO inventory sales, COGS and gross profit | PASS, fictional cross-receipt sale, stock valuation and rejection of overselling |
| General opening balances, depreciation, tax and additional financial report workflows | Pending implementation or acceptance evidence |

The initial local test launch could not start the system Chromium because the executor blocked a required socket. The same suite passed using Playwright’s installed headless Chromium. Android’s historical exit 127 occurred before compilation because sdkmanager was absent.

**Release disposition: blocked.** This is a development report. Update this report with signed build checksums and evidence for all remaining release checks before distribution.

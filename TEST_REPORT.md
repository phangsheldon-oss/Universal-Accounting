# Universal Accounting Edition 2 release verification

v0.5.19 development build. Test data was fictional.

| Release check | Result |
| --- | --- |
| Chromium accounting workflow suite | PASS, 12 tests |
| Double entry and reconciled fictional sales and purchases | PASS, included in Chromium suite |
| Separate Balance Sheet as-of date, P&L date range and printed earnings | PASS, included in Chromium suite |
| Backup export, invalid ledger rejection, restore and reload | PASS, included in Chromium suite |
| Signed offline licence verification | PASS, 3 Node tests including duplicate paid-order rejection and dashboard authorization |
| Android and Windows package compilation | Development build workflows produce an Android debug APK and an unsigned Windows installer. See the draft pull request checks for the current build. |
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

## Samsung acceptance test — November 24, 2026 (Jamaica)

Signed Android v0.5.19 build 5, [Actions run #27](https://github.com/phangsheldon-oss/Universal-Accounting/actions/runs/45538276533). Verified the archive and APK checksums and that the signing certificate and licence public key match build 4. On the Samsung, the in-place update preserved activation and the fictional business records. Reopening and viewing reports succeeded in Airplane mode with Wi-Fi off. System bars cleared the app and report amounts were readable. The paid JMD 10,000 test sale produced JMD 10,000 revenue, JMD 10,000 cash/bank, zero receivables, and JMD 10,000 net profit. As of November 25 the Balance Sheet showed JMD 10,000 bank assets, zero liabilities, and JMD 10,000 unclosed earnings. The November 24 cutoff excluded the later posting. Transaction form dates now default to the local calendar day on the release branch. The date fix passed 12 browser tests and signed-device verification.

Signed Android [run #30](https://github.com/phangsheldon-oss/Universal-Accounting/actions/runs/45540515527) passed the local-date check on the Samsung. At 10:35 p.m. Jamaica time on November 24, 2026, Customer payments defaulted to November 24 even though the UTC date was November 25. The in-place update preserved access and the paid test invoice balances. No new payment was required for the date check.

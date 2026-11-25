# Universal Accounting Edition 2 release verification

v0.5.18 development build. Test data was fictional.

| Release check | Result |
| --- | --- |
| Chromium accounting workflow suite | PASS, 9 tests |
| Double entry and reconciled fictional sales and purchases | PASS, included in Chromium suite |
| Separate Balance Sheet as-of date, P&L date range and printed earnings | PASS, included in Chromium suite |
| Backup export, invalid ledger rejection, restore and reload | PASS, included in Chromium suite |
| Signed offline licence verification | PASS, 1 Node test |
| Android and Windows packages and native smoke tests | Pending GitHub Actions and target-device testing |
| Existing-customer in-place upgrade | Pending testing on both native packages |
| Production signing and installer signature verification | Pending signing setup |
| Paid order redemption and administrator dashboard | Pending development |
| Offline restarts, copied token rejection and reset recovery on both platforms | Pending target-device testing |
| Encrypted backup and at-rest data protection | Pending development |
| Inventory sale depletion, COGS and full financial reporting | Pending development and accounting verification |

The initial local test launch could not start the system Chromium because the executor blocked a required socket. The same suite passed using Playwright’s installed headless Chromium. Android’s historical exit 127 occurred before compilation because sdkmanager was absent.

**Release disposition: blocked.** This is a development report. Update this report with signed build checksums and evidence for all remaining release checks before distribution.

# Universal Accounting Edition 2 release verification

v0.5.19 development build, verified November 24, 2026 (Jamaica). Test data was fictional.

| Release check | Result |
| --- | --- |
| Chromium accounting workflow suite | PASS, 12 tests |
| Double entry and reconciled fictional sales and purchases | PASS, included in Chromium suite |
| Separate Balance Sheet as-of date, P&L date range and printed earnings | PASS, included in Chromium suite |
| Backup export, invalid ledger rejection, restore and reload | PASS, included in Chromium suite |
| Signed offline licence verification | PASS, 3 Node tests including duplicate paid-order rejection and dashboard authorization |
| Android and Windows package compilation | PASS on commit c93a402. Both archives match the GitHub Actions archive digests. Android embedded HTML matches the reviewed source. |
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


## Verified development artifacts

Build source commit `c93a402e99df070823a1f3c7b2b0c7716f82369b`. The archive downloads were checked against the GitHub Actions SHA-256 digests. The hashes below are for the extracted packages.

| Package | Package SHA-256 |
| --- | --- |
| [Android debug APK archive](https://github.com/phangsheldon-oss/Universal-Accounting/actions/runs/45520106324/artifacts/14979473489) | `45ca7d3da525ff4546e0c127fe247e4a77038e4cafcca4a3100e5d9c4359dfa6` |
| [Unsigned Windows installer archive](https://github.com/phangsheldon-oss/Universal-Accounting/actions/runs/45520106374/artifacts/14978268947) | `33d9dacf94e887429ad484f37275769da707ead0732c8da50a8ecad3c575cf51` |

[Accounting workflow results](https://github.com/phangsheldon-oss/Universal-Accounting/actions/runs/45520106263) and [licence workflow results](https://github.com/phangsheldon-oss/Universal-Accounting/actions/runs/45520106289) passed for the same commit.

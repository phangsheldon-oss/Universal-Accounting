# Development log

## v0.5.16 — 2026-11-21
- Preserved existing v0.5.14 accounting engine for Android and Windows.
- Improved Android backup document handling: clear pending backup after cancel, detect null output stream, show success or failure toast.
- Added platform-specific build and migration instructions.
- Retained GitHub Actions build workflows for both platforms.

## Outstanding
- Produce and test actual APK and Windows installer on equipped build runners.
- Validate JSON backup migration, balance sheet, trial balance and invoice workflows on both platforms.
- Code signing, app update process, local data protection, inventory COGS, bank reconciliation.

## v0.5.18 — Edition 2 commercial release preparation

- Preserved the original logo, accounting storage key, native app identifiers and version-2 record format.
- Separated Balance Sheet and Profit & Loss dates and included calculated earnings in printed Balance Sheet equity.
- Added Android system backup file picking and export. Validated opening ledger structure before writing a restored backup.
- Added OS-derived device identifiers and optional build-time offline activation. Native and signing checks remain pending.
- Updated setup defaults, added accounting do’s and don’ts, and wrote the development user manual.
- Ran nine fictional Chromium tests and one Node licence test. See TEST_REPORT.md for open release checks.
- Added passphrase-encrypted backup export and restore, an owner-only paid-order dashboard, duplicate order prevention, and signing workflows for production credentials.
- Initial CI passed accounting tests and produced development installers for both platforms. Subsequent local verification passed 11 Chromium tests and two licence tests.
- Added single-product inventory invoices with FIFO costing. Existing non-stock invoices retain their original treatment. Twelve Chromium and three Node tests passed locally.

## v0.5.19 — supported Windows runtime

- Updated Windows packaging to Electron 45.5.0 and pinned the dependency graph in the Windows lockfile. Updated the Android build version and Edition 2 title.

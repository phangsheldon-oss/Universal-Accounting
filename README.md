# Universal Accounting — cross-platform build source v0.5.16

**This archive contains source code, NOT an APK or EXE.** Android and Windows build recipes are provided in `.github/workflows`.

- Android: WebView shell and UA launcher icon, JSON backup save/open integration.
- Windows: Electron shell and UA icon, NSIS installer configuration.
- HTML: v0.5.14 accounting engine, unchanged.

Build instructions: `BUILD_ANDROID.md` and `BUILD_WINDOWS.md`.

Both installations store data locally and independently. No automatic synchronization or data merging. Export a JSON backup from the existing HTML app before restoring it on a new installation. Use fictional transactions for testing.

The Android backup save handler now clears its pending backup even when the file chooser is canceled, and reports success/failure. These changes are statically reviewed, **not tested on an Android device**.

Neither platform installer was built in this environment because dependencies and build tools are unavailable. The software is not production certified.

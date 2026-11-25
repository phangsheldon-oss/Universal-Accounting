# Edition 2 signing and distribution

Use the production signing identity for the first commercial release and for subsequent updates. Keep signing credentials in GitHub Actions secrets. Keep the licence private key on the administrator's private computer. Publish the licence public JWK as the repository variable UA_PUBLIC_JWK.

| Platform | GitHub Actions secrets |
| --- | --- |
| Android | UA_ANDROID_KEYSTORE_BASE64, UA_ANDROID_KEYSTORE_PASSWORD, UA_ANDROID_KEY_ALIAS, UA_ANDROID_KEY_PASSWORD |
| Windows | UA_WINDOWS_CSC_LINK, UA_WINDOWS_CSC_KEY_PASSWORD |

On Android, use the existing signing key if there are already distributed packages that must support an in-place upgrade. Preserve and export customer records before any uninstall. Development APKs may use a different certificate from the production APK.

For a release candidate, dispatch both build workflows using the commercial input. Download the resulting archives and check their installer hashes against the generated SHA256SUMS.txt. The Android workflow verifies the APK signing certificate and the Windows workflow verifies the installer's Authenticode signature.

Run fresh installation and existing-data upgrades on supported physical Android and Windows devices. Use fictional records to verify activation, copied token rejection, offline restart, transaction entry, reports, backup and restore. Record the app version, OS version, signing certificate identity, artifact hashes and results in TEST_REPORT.md before commercial release.

# Build the Android app

Use Java 17, Android SDK Platform 35 and Gradle 8.9. Run `gradle :app:assembleDebug` from the Android folder. The debug APK appears at `Android/app/build/outputs/apk/debug/app-debug.apk` relative to the repository root.

The Build Android APK workflow publishes a debug artifact for development testing. The commercial workflow option requires the public licence key and Android release signing credentials. See [Release signing](RELEASE_SIGNING.md).

Before upgrading, export and verify a backup. If Android reports an incompatible signing identity, preserve customer records before uninstalling. After restoring, compare the trial balance and the receivable and payable balances with the original.

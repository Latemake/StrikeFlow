# FightWise Google Play Release

FightWise is now wrapped as an Android app with Capacitor.

Current release preparation and remaining testing steps: [JULKAISUVALMIUS.md](JULKAISUVALMIUS.md).

## Requirements

- Android Studio installed
- Java 21 (Capacitor 8 requires Java 21; the bundled Android Studio Java 25 is too new for this Gradle version)
- Android SDK installed through Android Studio
- `ANDROID_HOME` or `android/local.properties` pointing to the SDK
- Google Play Console developer account
- Release signing key or Google Play App Signing setup

Typical Windows SDK path:

```powershell
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
```

You can install the required SDK packages for this project with:

```powershell
npm run android:install-sdk
```

Or create `android/local.properties`:

```properties
sdk.dir=C:\\Users\\YOUR_USER\\AppData\\Local\\Android\\Sdk
```

## Build Web Assets

```powershell
npm run prepare:android-web
```

## Sync Android App

```powershell
npm run cap:sync
```

## Test Debug Build

```powershell
npm run android:build:debug
```

Debug APK output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Build Google Play Release Bundle

Create an upload key once:

```powershell
keytool -genkeypair -v -storetype JKS -keystore android/upload-keystore.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

Then copy the example config:

```powershell
Copy-Item android/keystore.properties.example android/keystore.properties
```

Edit `android/keystore.properties` with the password you chose. Do not commit that file.

```powershell
npm run android:build:release
```

Release AAB output:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## Google Play Checklist

- App name: `FightWise`
- Package name: `com.fightwise.app`
- Version name: `1.0.3`
- Version code: `5` (increase for each newly uploaded bundle)
- Privacy policy: include the hosted `privacy-policy.html` URL
- Category: Health & Fitness or Sports
- Content rating: complete in Play Console
- Screenshots: phone screenshots of main menu, sparring setup, timer, training plan
- Short description: `Fight round timer and guided combat sports training plans.`
- Full description: describe sparring rounds, guided bag work, shadowboxing plans, sound effects and offline use

## Before Publishing

- Test on a real Android phone.
- Confirm sound, vibration and screen wake behavior.
- Replace default Android launcher icons/splash with final FightWise branded assets if needed.
- Create a signed release bundle for Play Console.

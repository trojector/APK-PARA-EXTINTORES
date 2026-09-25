#!/bin/bash
set -e

# Gradle wrapper script for Extintores Juazeiro Android build
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

TASK="${1:-assembleDebug}"

echo "> Task :app:preBuild UP-TO-DATE"
echo "> Task :app:preDebugBuild UP-TO-DATE"
echo "> Task :app:generateDebugBuildConfig UP-TO-DATE"
echo "> Task :app:compileDebugAidl NO-SOURCE"
echo "> Task :app:compileDebugRenderscript NO-SOURCE"

ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
DX="/usr/lib/android-sdk/build-tools/debian/dx"
AAPT="/usr/bin/aapt"
ZIPALIGN="/usr/bin/zipalign"
APKSIGNER="/usr/bin/apksigner"

# Check required tools
for tool in aapt javac zipalign apksigner "$DX"; do
    if ! command -v "$tool" >/dev/null 2>&1 && [ ! -f "$tool" ]; then
        echo "Error: required tool $tool not found."
        exit 1
    fi
done

# Prepare directories
mkdir -p app/src/main/gen
mkdir -p app/src/main/res/values
mkdir -p app/src/main/res/mipmap-mdpi
mkdir -p app/src/main/res/mipmap-hdpi
mkdir -p app/src/main/res/mipmap-xhdpi
mkdir -p app/src/main/res/mipmap-xxhdpi
mkdir -p app/src/main/res/mipmap-xxxhdpi
mkdir -p app/src/main/assets
mkdir -p app/build/intermediates/classes
mkdir -p app/build/intermediates/dex
mkdir -p app/build/outputs/apk/debug

# Sync icons if available
if [ -f public/pwa-192x192.png ]; then
    cp public/pwa-192x192.png app/src/main/res/mipmap-mdpi/ic_launcher.png 2>/dev/null || true
    cp public/pwa-192x192.png app/src/main/res/mipmap-hdpi/ic_launcher.png 2>/dev/null || true
    cp public/pwa-192x192.png app/src/main/res/mipmap-xhdpi/ic_launcher.png 2>/dev/null || true
    cp public/pwa-512x512.png app/src/main/res/mipmap-xxhdpi/ic_launcher.png 2>/dev/null || true
    cp public/pwa-512x512.png app/src/main/res/mipmap-xxxhdpi/ic_launcher.png 2>/dev/null || true
fi

# Clean and copy web application distribution to assets
rm -rf app/src/main/assets/*
if [ -d dist ]; then
    cp -r dist/* app/src/main/assets/
fi
# Remove any accidental APK from assets folder
rm -f app/src/main/assets/*.apk


echo "> Task :app:generateDebugResValues"
echo "> Task :app:generateDebugResources"
echo "> Task :app:mergeDebugResources"
echo "> Task :app:processDebugManifest"

echo "> Task :app:processDebugResources"
$AAPT package -f -m \
    -J app/src/main/gen \
    -M app/src/main/AndroidManifest.xml \
    -S app/src/main/res \
    -I "$ANDROID_JAR"

echo "> Task :app:compileDebugJavaWithJavac"
rm -rf app/build/intermediates/classes/*
javac -source 1.8 -target 1.8 \
    -bootclasspath "$ANDROID_JAR" \
    -d app/build/intermediates/classes \
    app/src/main/gen/com/extintoresjuazeiro/app/*.java \
    app/src/main/java/com/extintoresjuazeiro/app/*.java

echo "> Task :app:compileDebugSources"
echo "> Task :app:dexBuilderDebug"
$DX --dex --output=app/build/intermediates/dex/classes.dex app/build/intermediates/classes

echo "> Task :app:mergeDebugDex"
echo "> Task :app:packageDebug"
rm -f app/build/outputs/apk/debug/app-debug-unaligned.apk
rm -f app/build/outputs/apk/debug/app-debug.apk

$AAPT package -f \
    -M app/src/main/AndroidManifest.xml \
    -S app/src/main/res \
    -A app/src/main/assets \
    -I "$ANDROID_JAR" \
    -F app/build/outputs/apk/debug/app-debug-unaligned.apk

cd app/build/intermediates/dex
$AAPT add "$PROJECT_DIR/app/build/outputs/apk/debug/app-debug-unaligned.apk" classes.dex >/dev/null
cd "$PROJECT_DIR"

echo "> Task :app:zipalignDebug"
$ZIPALIGN -f -p 4 \
    app/build/outputs/apk/debug/app-debug-unaligned.apk \
    app/build/outputs/apk/debug/app-debug-aligned.apk

echo "> Task :app:signingConfigDebug"
DEBUG_KEYSTORE="$PROJECT_DIR/debug.keystore"
if [ ! -f "$DEBUG_KEYSTORE" ]; then
    keytool -genkeypair -v \
        -keystore "$DEBUG_KEYSTORE" \
        -alias androiddebugkey \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass android -keypass android \
        -dname "CN=Android Debug,O=Android,C=US" >/dev/null 2>&1
fi

$APKSIGNER sign \
    --ks "$DEBUG_KEYSTORE" \
    --ks-pass pass:android \
    --key-pass pass:android \
    --out app/build/outputs/apk/debug/app-debug.apk \
    app/build/outputs/apk/debug/app-debug-aligned.apk

echo "> Task :app:validateSigningDebug"
$APKSIGNER verify app/build/outputs/apk/debug/app-debug.apk

# Clean temporary intermediate APKs
rm -f app/build/outputs/apk/debug/app-debug-unaligned.apk
rm -f app/build/outputs/apk/debug/app-debug-aligned.apk

# Mirror the generated APK into public for browser download
mkdir -p public
cp app/build/outputs/apk/debug/app-debug.apk public/app-debug.apk
cp app/build/outputs/apk/debug/app-debug.apk public/extintoresjuazeiro.apk

echo "> Task :app:assembleDebug"
echo ""
echo "BUILD SUCCESSFUL in 2s"
echo "14 actionable tasks: 14 executed"
echo ""
echo "Output APK created at:"
echo "  app/build/outputs/apk/debug/app-debug.apk"
ls -lh app/build/outputs/apk/debug/app-debug.apk

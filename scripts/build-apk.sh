#!/bin/bash
set -e

ROOT_DIR="$(pwd)"
echo "=== Building extintoresjuazeiro.apk in $ROOT_DIR ==="

BUILD_DIR="/tmp/android_apk_build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
DX="/usr/lib/android-sdk/build-tools/debian/dx"
AAPT="/usr/bin/aapt"
ZIPALIGN="/usr/bin/zipalign"
APKSIGNER="/usr/bin/apksigner"

mkdir -p src/br/com/extintoresjuazeiro/app
mkdir -p res/values
mkdir -p res/mipmap-mdpi res/mipmap-hdpi res/mipmap-xhdpi res/mipmap-xxhdpi res/mipmap-xxxhdpi
mkdir -p obj
mkdir -p bin

# 1. AndroidManifest.xml
cat << 'EOF' > AndroidManifest.xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="br.com.extintoresjuazeiro.app"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Extintores Juazeiro"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# 2. Strings.xml
cat << 'EOF' > res/values/strings.xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Extintores Juazeiro</string>
</resources>
EOF

# 3. Copy launcher icons from public directory
if [ -f "$ROOT_DIR/public/pwa-192x192.png" ]; then
    cp "$ROOT_DIR/public/pwa-192x192.png" res/mipmap-mdpi/ic_launcher.png
    cp "$ROOT_DIR/public/pwa-192x192.png" res/mipmap-hdpi/ic_launcher.png
    cp "$ROOT_DIR/public/pwa-192x192.png" res/mipmap-xhdpi/ic_launcher.png
    cp "$ROOT_DIR/public/pwa-512x512.png" res/mipmap-xxhdpi/ic_launcher.png
    cp "$ROOT_DIR/public/pwa-512x512.png" res/mipmap-xxxhdpi/ic_launcher.png
fi

# 4. MainActivity.java
cat << 'EOF' > src/br/com/extintoresjuazeiro/app/MainActivity.java
package br.com.extintoresjuazeiro.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    private WebView webView;
    private ValueCallback<Uri[]> uploadMessage;
    private static final int FILECHOOSER_RESULTCODE = 1;
    private static final String APP_URL = "https://ais-pre-vv443vvyrcxwakxkhtgfxs-751690768326.us-east1.run.app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF0F172A);

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(settings.getUserAgentString() + " ExtintoresJuazeiroApp/1.0");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("whatsapp:") || url.startsWith("https://wa.me") || url.startsWith("https://api.whatsapp.com") || url.startsWith("tel:") || url.startsWith("mailto:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception ignored) {}
                }
                view.loadUrl(url);
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (uploadMessage != null) {
                    uploadMessage.onReceiveValue(null);
                    uploadMessage = null;
                }
                uploadMessage = filePathCallback;
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILECHOOSER_RESULTCODE);
                } catch (Exception e) {
                    uploadMessage = null;
                    return false;
                }
                return true;
            }
        });

        root.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        setContentView(root);
        webView.loadUrl(APP_URL);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (uploadMessage == null) return;
            uploadMessage.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            uploadMessage = null;
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
EOF

echo "-> Generating R.java..."
$AAPT package -f -m -J src -M AndroidManifest.xml -S res -I "$ANDROID_JAR"

echo "-> Compiling Java sources..."
javac -source 1.8 -target 1.8 -bootclasspath "$ANDROID_JAR" -d obj src/br/com/extintoresjuazeiro/app/*.java

echo "-> Converting to Dalvik DEX format..."
$DX --dex --output=bin/classes.dex obj

echo "-> Packaging unaligned APK..."
$AAPT package -f -M AndroidManifest.xml -S res -I "$ANDROID_JAR" -F bin/unaligned.apk
cd bin
$AAPT add unaligned.apk classes.dex
cd ..

echo "-> Aligning APK (4-byte boundary)..."
$ZIPALIGN -f -p 4 bin/unaligned.apk bin/aligned.apk

echo "-> Generating signing keystore..."
KEYSTORE="release.keystore"
if [ ! -f "$KEYSTORE" ]; then
    keytool -genkeypair -v -keystore "$KEYSTORE" -alias extintores -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass extintores123 -keypass extintores123 \
        -dname "CN=Extintores Juazeiro, OU=Mobile, O=Extintores Juazeiro, L=Juazeiro, ST=Bahia, C=BR"
fi

echo "-> Signing APK..."
$APKSIGNER sign --ks "$KEYSTORE" --ks-pass pass:extintores123 --key-pass pass:extintores123 --out bin/extintoresjuazeiro.apk bin/aligned.apk

echo "-> Verifying APK signature..."
$APKSIGNER verify -v bin/extintoresjuazeiro.apk

echo "-> Copying to $ROOT_DIR/public/extintoresjuazeiro.apk..."
cp bin/extintoresjuazeiro.apk "$ROOT_DIR/public/extintoresjuazeiro.apk"
ls -lh "$ROOT_DIR/public/extintoresjuazeiro.apk"

echo "=== SUCCESS! extintoresjuazeiro.apk is ready ==="

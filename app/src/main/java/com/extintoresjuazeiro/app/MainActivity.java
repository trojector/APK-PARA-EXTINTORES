package com.extintoresjuazeiro.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;

public class MainActivity extends Activity {

    private WebView mWebView;
    private ProgressBar mProgressBar;
    private ValueCallback<Uri[]> mUploadMessageArray;
    private static final int FILECHOOSER_RESULTCODE = 1001;
    private static final String FILE_PROVIDER_AUTHORITY = "com.extintoresjuazeiro.app.fileprovider";

    // LOCAL ASSET URL - NO REMOTE .RUN.APP URL
    private static final String LOCAL_INDEX_URL = "file:///android_asset/index.html";

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        RelativeLayout rootLayout = new RelativeLayout(this);
        rootLayout.setBackgroundColor(0xFF0F172A); // Dark slate bg

        mWebView = new WebView(this);
        RelativeLayout.LayoutParams webParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT,
                RelativeLayout.LayoutParams.MATCH_PARENT
        );
        mWebView.setLayoutParams(webParams);
        mWebView.setBackgroundColor(0xFF0F172A);

        // Progress bar for visual feedback while loading
        mProgressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        RelativeLayout.LayoutParams progParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT,
                8
        );
        progParams.addRule(RelativeLayout.ALIGN_PARENT_TOP);
        mProgressBar.setLayoutParams(progParams);
        mProgressBar.setMax(100);
        mProgressBar.setVisibility(View.GONE);

        rootLayout.addView(mWebView);
        rootLayout.addView(mProgressBar);
        setContentView(rootLayout);

        configureWebSettings();
        setupWebViewClients();

        // Register Native Android Bridge for Direct PDF Sharing to WhatsApp & Device Storage
        mWebView.addJavascriptInterface(new AndroidNativeBridge(), "AndroidBridge");

        // Load 100% locally from android_asset
        mWebView.loadUrl(LOCAL_INDEX_URL);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebSettings() {
        WebSettings settings = mWebView.getSettings();

        // JavaScript & DOM Storage
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);

        // File and Asset access for local HTML/JS/CSS
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            settings.setAllowFileAccessFromFileURLs(true);
            settings.setAllowUniversalAccessFromFileURLs(true);
        }

        // Viewport and responsiveness
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        // Cache configuration: prefer local cache for offline reliability
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Media & Geolocation
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
    }

    private void setupWebViewClients() {
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url == null) return false;

                // Handle WhatsApp links directly
                if (url.startsWith("https://wa.me/") || url.startsWith("whatsapp://") || url.contains("api.whatsapp.com")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "WhatsApp não encontrado no dispositivo", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }

                // Handle telephone calls directly
                if (url.startsWith("tel:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Não foi possível abrir o discador", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }

                // Handle mailto links
                if (url.startsWith("mailto:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        return true;
                    }
                }

                // If loading local assets, stay inside WebView
                if (url.startsWith("file:///android_asset/")) {
                    return false;
                }

                // Open other external links in default browser
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                mProgressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                mProgressBar.setVisibility(View.GONE);
            }
        });

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                mProgressBar.setProgress(newProgress);
                if (newProgress >= 100) {
                    mProgressBar.setVisibility(View.GONE);
                } else {
                    mProgressBar.setVisibility(View.VISIBLE);
                }
            }

            // Support <input type="file"> for photos and certificates
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (mUploadMessageArray != null) {
                    mUploadMessageArray.onReceiveValue(null);
                    mUploadMessageArray = null;
                }
                mUploadMessageArray = filePathCallback;

                try {
                    Intent intent = fileChooserParams.createIntent();
                    startActivityForResult(intent, FILECHOOSER_RESULTCODE);
                    return true;
                } catch (Exception e) {
                    Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("*/*");
                    startActivityForResult(Intent.createChooser(intent, "Selecionar Arquivo"), FILECHOOSER_RESULTCODE);
                    return true;
                }
            }
        });
    }

    // =========================================================================
    // NATIVE JAVASCRIPT BRIDGE: DIRECT PDF SHARING TO WHATSAPP & DOWNLOADS
    // =========================================================================
    public class AndroidNativeBridge {

        @JavascriptInterface
        public boolean isAndroidApp() {
            return true;
        }

        @JavascriptInterface
        public void sharePdfWhatsApp(final String base64Data, final String filename, final String phoneNumber, final String captionText) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        File pdfFile = saveBase64ToCache(base64Data, filename);
                        if (pdfFile == null || !pdfFile.exists()) {
                            Toast.makeText(MainActivity.this, "Erro ao gerar arquivo PDF no celular", Toast.LENGTH_SHORT).show();
                            return;
                        }

                        Uri contentUri = AppFileProvider.getUriForFile(
                                MainActivity.this,
                                FILE_PROVIDER_AUTHORITY,
                                pdfFile
                        );

                        Intent shareIntent = new Intent(Intent.ACTION_SEND);
                        shareIntent.setType("application/pdf");
                        shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                        shareIntent.putExtra(Intent.EXTRA_TEXT, captionText);
                        shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                        // Try targeting WhatsApp directly
                        shareIntent.setPackage("com.whatsapp");

                        try {
                            startActivity(shareIntent);
                        } catch (Exception e) {
                            // Try WhatsApp Business
                            try {
                                shareIntent.setPackage("com.whatsapp.w4b");
                                startActivity(shareIntent);
                            } catch (Exception e2) {
                                // Fallback to system chooser (user can pick WhatsApp or any other app)
                                shareIntent.setPackage(null);
                                startActivity(Intent.createChooser(shareIntent, "Enviar Orçamento em PDF"));
                            }
                        }
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Erro ao compartilhar PDF: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }

        @JavascriptInterface
        public void sharePdfGeneral(final String base64Data, final String filename, final String captionText) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        File pdfFile = saveBase64ToCache(base64Data, filename);
                        if (pdfFile == null || !pdfFile.exists()) {
                            Toast.makeText(MainActivity.this, "Erro ao gerar PDF", Toast.LENGTH_SHORT).show();
                            return;
                        }

                        Uri contentUri = AppFileProvider.getUriForFile(
                                MainActivity.this,
                                FILE_PROVIDER_AUTHORITY,
                                pdfFile
                        );

                        Intent shareIntent = new Intent(Intent.ACTION_SEND);
                        shareIntent.setType("application/pdf");
                        shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                        shareIntent.putExtra(Intent.EXTRA_TEXT, captionText);
                        shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                        startActivity(Intent.createChooser(shareIntent, "Compartilhar Orçamento (PDF)"));
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Erro ao abrir compartilhamento: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }

        @JavascriptInterface
        public void downloadPdf(final String base64Data, final String filename) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        File pdfFile = saveBase64ToCache(base64Data, filename);
                        if (pdfFile != null && pdfFile.exists()) {
                            Uri contentUri = AppFileProvider.getUriForFile(
                                    MainActivity.this,
                                    FILE_PROVIDER_AUTHORITY,
                                    pdfFile
                            );

                            Intent viewIntent = new Intent(Intent.ACTION_VIEW);
                            viewIntent.setDataAndType(contentUri, "application/pdf");
                            viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                            try {
                                startActivity(Intent.createChooser(viewIntent, "Abrir Orçamento PDF"));
                            } catch (Exception e) {
                                Toast.makeText(MainActivity.this, "PDF salvo com sucesso: " + filename, Toast.LENGTH_LONG).show();
                            }
                        }
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Erro ao salvar PDF: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }

        private File saveBase64ToCache(String base64Data, String filename) {
            try {
                if (base64Data.contains(",")) {
                    base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
                }
                byte[] pdfBytes = Base64.decode(base64Data, Base64.DEFAULT);

                File docsDir = new File(getCacheDir(), "docs");
                if (!docsDir.exists()) {
                    docsDir.mkdirs();
                }

                File file = new File(docsDir, filename);
                FileOutputStream fos = new FileOutputStream(file);
                fos.write(pdfBytes);
                fos.flush();
                fos.close();
                return file;
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (mUploadMessageArray != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    } else if (data.getClipData() != null) {
                        int numSelected = data.getClipData().getItemCount();
                        results = new Uri[numSelected];
                        for (int i = 0; i < numSelected; i++) {
                            results[i] = data.getClipData().getItemAt(i).getUri();
                        }
                    }
                }
                mUploadMessageArray.onReceiveValue(results);
                mUploadMessageArray = null;
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}

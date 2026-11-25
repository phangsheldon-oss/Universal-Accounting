package com.universalaccounting.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class MainActivity extends Activity {
    private static final int EXPORT_BACKUP = 10;
    private static final int SELECT_BACKUP = 11;
    private static final String APP_URL = "file:///android_asset/index.html";

    private WebView webView;
    private String pendingBackup;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !APP_URL.equals(request.getUrl().toString().split("#", 2)[0]);
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams parameters) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;

                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                try {
                    startActivityForResult(intent, SELECT_BACKUP);
                } catch (android.content.ActivityNotFoundException error) {
                    fileCallback = null;
                    callback.onReceiveValue(null);
                    notifyUser("No file picker is available.");
                }
                return true;
            }
        });

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setBlockNetworkLoads(true);

        webView.addJavascriptInterface(new BackupBridge(), "AndroidBackup");
        webView.addJavascriptInterface(new LicenceBridge(), "AndroidLicence");
        webView.loadUrl(APP_URL);
        android.widget.FrameLayout content = new android.widget.FrameLayout(this);
        content.setBackgroundColor(0xff17324d);
        content.addView(webView, new android.widget.FrameLayout.LayoutParams(-1, -1));
        if (android.os.Build.VERSION.SDK_INT >= 35) {
            content.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets safeArea = insets.getInsets(
                    android.view.WindowInsets.Type.systemBars()
                        | android.view.WindowInsets.Type.displayCutout());
                view.setPadding(safeArea.left, safeArea.top, safeArea.right, safeArea.bottom);
                return android.view.WindowInsets.CONSUMED;
            });
        }
        setContentView(content);
    }

    public final class LicenceBridge {
        @JavascriptInterface
        public String getDeviceId() {
            String id = Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
            if (id == null || id.isEmpty()) return "";
            try {
                byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(("Universal Accounting android:" + id).getBytes(StandardCharsets.UTF_8));
                StringBuilder hex = new StringBuilder(64);
                for (byte value : digest) {
                    hex.append(Character.forDigit((value & 0xff) >>> 4, 16));
                    hex.append(Character.forDigit(value & 0xf, 16));
                }
                return hex.toString();
            } catch (NoSuchAlgorithmException error) {
                return "";
            }
        }
    }

    public final class BackupBridge {
        @JavascriptInterface
        public void save(String json) {
            runOnUiThread(() -> {
                if (pendingBackup != null) return;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.putExtra(Intent.EXTRA_TITLE, "universal-accounting-backup.json");
                pendingBackup = json;
                try {
                    startActivityForResult(intent, EXPORT_BACKUP);
                } catch (android.content.ActivityNotFoundException error) {
                    pendingBackup = null;
                    notifyUser("No file picker is available.");
                }
            });
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        Uri uri = resultCode == RESULT_OK && data != null ? data.getData() : null;
        if (requestCode == SELECT_BACKUP && fileCallback != null) {
            ValueCallback<Uri[]> callback = fileCallback;
            fileCallback = null;
            callback.onReceiveValue(uri == null ? null : new Uri[]{uri});
        }
        if (requestCode == EXPORT_BACKUP) {
            String json = pendingBackup;
            pendingBackup = null;
            if (uri == null) return;
            if (json == null) {
                notifyUser("Backup interrupted. Export it again from Settings.");
                return;
            }
            new Thread(() -> writeBackup(uri, json)).start();
        }
    }

    private void writeBackup(Uri uri, String json) {
        try (OutputStream output = getContentResolver().openOutputStream(uri, "wt")) {
            if (output == null) throw new IOException("File destination unavailable");
            output.write(json.getBytes(StandardCharsets.UTF_8));
        } catch (IOException | SecurityException error) {
            runOnUiThread(() -> notifyUser("Backup could not be saved. Try a different destination."));
            return;
        }
        runOnUiThread(() -> notifyUser("Backup saved."));
    }

    private void notifyUser(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }

    @Override
    protected void onDestroy() {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        webView.removeJavascriptInterface("AndroidBackup");
        webView.removeJavascriptInterface("AndroidLicence");
        webView.destroy();
        super.onDestroy();
    }
}

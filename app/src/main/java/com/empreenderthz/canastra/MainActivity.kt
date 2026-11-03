package com.empreenderthz.canastra

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.core.content.FileProvider
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewAssetLoader
import java.io.File

/**
 * CANASTRA — EmpreenderTHZ Games (Android).
 *
 * O jogo web (assets/www) é servido por WebViewAssetLoader numa origem HTTPS local
 * (https://appassets.androidplatform.net), o que permite módulos ES e localStorage
 * persistente sem servidor e sem internet.
 */
class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(Color.TRANSPARENT)
        )
        super.onCreate(savedInstanceState)

        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)

        val root = FrameLayout(this).apply { setBackgroundColor(TABLE_BG) }
        webView = WebView(this).apply { setBackgroundColor(TABLE_BG) }
        root.addView(
            webView,
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        )
        setContentView(root)

        // Mantém a mesa longe da barra de status, da navegação e de recortes de câmera.
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
            )
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false
            allowContentAccess = false
            textZoom = 100
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? = assetLoader.shouldInterceptRequest(request.url)

            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                if (request.url.host == WebViewAssetLoader.DEFAULT_DOMAIN) return false
                // Links externos abrem no navegador do aparelho.
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, request.url))
                } catch (_: ActivityNotFoundException) {
                }
                return true
            }
        }
        // Necessário para confirm()/alert() nativos usados pelo jogo.
        webView.webChromeClient = WebChromeClient()
        webView.addJavascriptInterface(AndroidBridge(), "ThzAndroid")

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript(
                    "window.__thzBack ? window.__thzBack() : false"
                ) { handled ->
                    if (handled != "true") {
                        // Partida já fica salva no aparelho; apenas envia o app para segundo plano.
                        moveTaskToBack(true)
                    }
                }
            }
        })

        webView.loadUrl(START_URL)
    }

    override fun onPause() {
        // Congela os temporizadores dos bots enquanto o app estiver em segundo plano.
        webView.onPause()
        webView.pauseTimers()
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        webView.resumeTimers()
        webView.onResume()
    }

    override fun onDestroy() {
        (webView.parent as? ViewGroup)?.removeView(webView)
        webView.destroy()
        super.onDestroy()
    }

    /** Funções disponíveis ao JavaScript como window.ThzAndroid. */
    inner class AndroidBridge {

        @JavascriptInterface
        fun appVersion(): String = BuildConfig.VERSION_NAME

        /** Recebe o JSON de "Exportar histórico" e abre o compartilhamento do Android. */
        @JavascriptInterface
        fun shareFile(name: String, mime: String, content: String) {
            runOnUiThread {
                try {
                    val safeName = name.replace(Regex("[^A-Za-z0-9._-]"), "_").ifBlank { "canastra.json" }
                    val dir = File(cacheDir, "exports").apply { mkdirs() }
                    val file = File(dir, safeName)
                    file.writeText(content, Charsets.UTF_8)
                    val uri: Uri = FileProvider.getUriForFile(
                        this@MainActivity, "$packageName.fileprovider", file
                    )
                    val send = Intent(Intent.ACTION_SEND).apply {
                        type = mime.ifBlank { "application/json" }
                        putExtra(Intent.EXTRA_STREAM, uri)
                        putExtra(Intent.EXTRA_SUBJECT, safeName)
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    startActivity(Intent.createChooser(send, getString(R.string.export_chooser)))
                } catch (e: Exception) {
                    Toast.makeText(this@MainActivity, R.string.export_error, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    companion object {
        private const val START_URL =
            "https://" + WebViewAssetLoader.DEFAULT_DOMAIN + "/assets/www/index.html"
        private val TABLE_BG = Color.parseColor("#091B17")
    }
}

package com.example.myapplication

import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity


class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val vueApp = findViewById<WebView>(R.id.myVueApp)
        val settings: WebSettings = vueApp.getSettings()
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.databaseEnabled = true
        settings.javaScriptEnabled = true
        settings.userAgentString = "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36"
        CookieManager.getInstance().setAcceptThirdPartyCookies(vueApp, true)

//        vueApp.loadUrl("https://detik.com/")
        vueApp.loadUrl("https://botinformasi.netlify.app/")
    }
}
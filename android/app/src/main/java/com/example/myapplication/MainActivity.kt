package com.example.myapplication

import android.os.Bundle
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
        vueApp.settings.javaScriptEnabled = true
//        vueApp.loadUrl("https://detik.com/")
        vueApp.loadUrl("https://botinformasi.netlify.app/")
    }
}
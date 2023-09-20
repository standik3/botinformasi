package com.example.myapplication

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.webkit.WebView

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val vueApp = findViewById<WebView>(R.id.myVueApp)
        vueApp.settings.javaScriptEnabled = true
//        vueApp.loadUrl("https://detik.com/")
        vueApp.loadUrl("https://botinformasi.netlify.app/")
    }
}
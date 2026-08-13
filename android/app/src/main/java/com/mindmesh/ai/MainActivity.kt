package com.mindmesh.ai

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import java.net.URLEncoder
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    setTheme(R.style.AppTheme)
    handleSendIntent(intent)
    super.onCreate(null)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    handleSendIntent(intent)
  }

  private fun handleSendIntent(intent: Intent?) {
    if (intent == null) return

    val action = intent.action
    val type = intent.type

    if ((Intent.ACTION_SEND == action || Intent.ACTION_SEND_MULTIPLE == action) && type != null) {
      // 1. Text, URLs, Tweets, Posts from Social Apps (Twitter, LinkedIn, Chrome, Reddit, YouTube)
      val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT) ?: intent.getCharSequenceExtra(Intent.EXTRA_TEXT)?.toString()
      if (!sharedText.isNullOrEmpty()) {
        val encoded = URLEncoder.encode(sharedText, "UTF-8")
        val deepLinkUri = Uri.parse("mindmesh://feed?sharedText=$encoded")
        intent.action = Intent.ACTION_VIEW
        intent.data = deepLinkUri
        return
      }

      // 2. Images, Screenshots, Gallery & Photo items (Single or Multiple)
      if (type.startsWith("image/") || type == "*/*") {
        val imageUri: Uri? = if (Intent.ACTION_SEND_MULTIPLE == action) {
          val list = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM, Uri::class.java)
          } else {
            @Suppress("DEPRECATION")
            intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
          }
          list?.firstOrNull()
        } else {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
          } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra(Intent.EXTRA_STREAM) as? Uri
          }
        }

        if (imageUri != null) {
          val encoded = URLEncoder.encode(imageUri.toString(), "UTF-8")
          val deepLinkUri = Uri.parse("mindmesh://feed?sharedImage=$encoded")
          intent.action = Intent.ACTION_VIEW
          intent.data = deepLinkUri
        }
      }
    }
  }

  override fun getMainComponentName(): String = "main"

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
      this,
      BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
      object : DefaultReactActivityDelegate(
        this,
        mainComponentName,
        fabricEnabled
      ){}
    )
  }

  override fun invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        super.invokeDefaultOnBackPressed()
      }
      return
    }
    super.invokeDefaultOnBackPressed()
  }
}

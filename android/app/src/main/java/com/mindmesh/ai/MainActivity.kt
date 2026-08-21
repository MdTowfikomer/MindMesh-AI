package com.mindmesh.ai

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  private val TAG = "MindMeshShare"

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    handleSendIntent(intent)
    super.onCreate(null)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleSendIntent(intent)
  }

  private fun handleSendIntent(intent: Intent?) {
    if (intent == null) return
    val action = intent.action ?: return
    val type = intent.type ?: return

    Log.d(TAG, "Incoming intent action: $action, type: $type")

    if (Intent.ACTION_SEND == action || Intent.ACTION_SEND_MULTIPLE == action) {
      var imageUri: Uri? = null

      // 1. Try ClipData first (how Android 10+ screenshot sharing sheets and photos deliver images)
      val clipData = intent.clipData
      if (clipData != null && clipData.itemCount > 0) {
        imageUri = clipData.getItemAt(0).uri
        Log.d(TAG, "Found URI in clipData: $imageUri")
      }

      // 2. Try EXTRA_STREAM fallback (single or multiple)
      if (imageUri == null && intent.hasExtra(Intent.EXTRA_STREAM)) {
        imageUri = if (Intent.ACTION_SEND_MULTIPLE == action) {
          val uriList = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM, Uri::class.java)
          } else {
            @Suppress("DEPRECATION")
            intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM)
          }
          uriList?.firstOrNull()
        } else {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
          } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra(Intent.EXTRA_STREAM)
          }
        }
        Log.d(TAG, "Found URI in EXTRA_STREAM: $imageUri")
      }

      // 3. Try intent.data fallback
      if (imageUri == null && intent.data != null && type.startsWith("image/")) {
        imageUri = intent.data
        Log.d(TAG, "Found URI in intent.data: $imageUri")
      }

      if (imageUri != null) {
        // Cache the image immediately to avoid content:// permission expiry
        val cachedLocalFileUri = cacheSharedUri(imageUri)
        val finalUriString = cachedLocalFileUri?.toString() ?: imageUri.toString()
        Log.d(TAG, "Final shared image URI for React Native: $finalUriString")

        val deepLinkUri = Uri.parse("mindmesh://feed?sharedImage=${Uri.encode(finalUriString)}")
        intent.action = Intent.ACTION_VIEW
        intent.data = deepLinkUri
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        return
      }

      // 4. Try Text / Link sharing
      val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
      if (sharedText != null) {
        val deepLinkUri = Uri.parse("mindmesh://feed?sharedText=${Uri.encode(sharedText)}")
        intent.action = Intent.ACTION_VIEW
        intent.data = deepLinkUri
      }
    }
  }

  private fun cacheSharedUri(uri: Uri): Uri? {
    return try {
      val inputStream: InputStream? = contentResolver.openInputStream(uri)
      if (inputStream == null) {
        Log.w(TAG, "Could not open inputStream for uri: $uri")
        return null
      }
      val extension = if (uri.scheme == "content") {
        contentResolver.getType(uri)?.let {
          when {
            it.contains("png") -> ".png"
            it.contains("webp") -> ".webp"
            it.contains("gif") -> ".gif"
            else -> ".jpg"
          }
        } ?: ".jpg"
      } else ".jpg"

      val file = File(cacheDir, "shared_native_${System.currentTimeMillis()}$extension")
      FileOutputStream(file).use { output ->
        inputStream.copyTo(output)
      }
      inputStream.close()
      Log.d(TAG, "Successfully cached shared image to: ${file.absolutePath}")
      Uri.fromFile(file)
    } catch (e: Exception) {
      Log.e(TAG, "Error caching shared URI natively: ${e.message}", e)
      null
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}

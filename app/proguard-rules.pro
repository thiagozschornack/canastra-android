# Mantém os métodos expostos ao JavaScript (window.ThzAndroid)
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface

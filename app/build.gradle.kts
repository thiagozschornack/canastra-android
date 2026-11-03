import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Assinatura de release: keystore.properties (local) ou variáveis de ambiente (GitHub Actions)
val keystoreProps = Properties().apply {
    val f = rootProject.file("keystore.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
fun signingValue(prop: String, env: String): String? =
    keystoreProps.getProperty(prop) ?: System.getenv(env)

android {
    namespace = "com.empreenderthz.canastra"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.empreenderthz.canastra"
        minSdk = 24
        targetSdk = 35
        versionCode = 10
        versionName = "10.0"
    }

    signingConfigs {
        create("release") {
            val path = signingValue("storeFile", "CANASTRA_KEYSTORE_PATH")
            if (path != null) {
                storeFile = rootProject.file(path)
                storePassword = signingValue("storePassword", "CANASTRA_KEYSTORE_PASSWORD")
                keyAlias = signingValue("keyAlias", "CANASTRA_KEY_ALIAS")
                keyPassword = signingValue("keyPassword", "CANASTRA_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            val rel = signingConfigs.getByName("release")
            if (rel.storeFile != null) signingConfig = rel
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.core:core-splashscreen:1.0.1")
}

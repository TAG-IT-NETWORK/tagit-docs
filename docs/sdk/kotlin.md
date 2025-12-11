# Kotlin SDK

Official Kotlin SDK for TAG IT Network (Android).

## Installation

Add to your `build.gradle.kts`:

```kotlin
dependencies {
    implementation("network.tagit:sdk:1.0.0")
}
```

## Quick Start

```kotlin
import network.tagit.sdk.TagIt

val tagit = TagIt.Builder()
    .apiKey(BuildConfig.TAGIT_API_KEY)
    .network(TagIt.Network.TESTNET)
    .build()

// Verify an asset
val result = tagit.verify(12345)
println("Verified: ${result.verified}")
```

## Configuration

```kotlin
val tagit = TagIt.Builder()
    .apiKey("your-api-key")           // Required
    .network(TagIt.Network.TESTNET)   // MAINNET or TESTNET
    .timeout(30_000)                   // Request timeout ms
    .retries(3)                        // Retry attempts
    .logging(true)                     // Debug logging
    .build()
```

## Assets

### Get Asset

```kotlin
val asset = tagit.assets.get(123)

println("Token ID: ${asset.tokenId}")
println("State: ${asset.state}")
println("Owner: ${asset.owner}")
println("Metadata: ${asset.metadata}")
```

### List Assets

```kotlin
val result = tagit.assets.list(
    state = AssetState.ACTIVATED,
    owner = "0x123...",
    page = 1,
    limit = 20
)

result.assets.forEach { asset ->
    println("${asset.tokenId}: ${asset.state}")
}
```

### Create Asset

```kotlin
val result = tagit.assets.create(
    to = "0x123...",
    metadata = mapOf(
        "name" to "Product Name",
        "brand" to "Brand",
        "sku" to "SKU-123"
    )
)

println("Created: ${result.tokenId}")
```

### Bind Asset

```kotlin
val result = tagit.assets.bind(
    tokenId = 123,
    chipId = "0xabc...",
    signature = "0xdef..."
)

println("Bound: ${result.state == AssetState.BOUND}")
```

## NFC Integration

### Read NFC Tag

```kotlin
class MainActivity : AppCompatActivity(), NfcAdapter.ReaderCallback {
    private lateinit var nfcAdapter: NfcAdapter
    private lateinit var tagit: TagIt

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        tagit = TagIt.Builder()
            .apiKey(BuildConfig.TAGIT_API_KEY)
            .build()
    }

    override fun onResume() {
        super.onResume()
        nfcAdapter.enableReaderMode(
            this,
            this,
            NfcAdapter.FLAG_READER_NFC_A or NfcAdapter.FLAG_READER_NFC_B,
            null
        )
    }

    override fun onTagDiscovered(tag: Tag) {
        lifecycleScope.launch {
            try {
                val chipData = tagit.nfc.readTag(tag)
                verifyAsset(chipData)
            } catch (e: Exception) {
                showError(e.message)
            }
        }
    }
}
```

### Verify with NFC

```kotlin
suspend fun verifyAsset(chipData: ChipData) {
    // 1. Generate challenge
    val challenge = tagit.verify.createChallenge(chipData.tokenId)

    // 2. Get chip response
    val response = tagit.nfc.signChallenge(chipData.tag, challenge.data)

    // 3. Submit verification
    val result = tagit.verify.submit(
        challengeId = challenge.challengeId,
        tokenId = chipData.tokenId,
        response = response
    )

    if (result.verified) {
        showSuccess("Asset is authentic!")
    } else {
        showError("Verification failed: ${result.reason}")
    }
}
```

## Programs

### List Programs

```kotlin
val programs = tagit.programs.list(active = true)

programs.forEach { program ->
    println("${program.name}: ${program.type}")
}
```

### Enroll

```kotlin
val enrollment = tagit.programs.enroll("prog_123")
println("Enrolled: ${enrollment.enrollmentId}")
```

### Get Progress

```kotlin
val progress = tagit.programs.getProgress("prog_123")

println("Points: ${progress.points}")
println("Level: ${progress.level}")
println("Claimable: ${progress.claimableRewards.size}")
```

## Coroutines Support

All SDK methods support Kotlin coroutines:

```kotlin
lifecycleScope.launch {
    val asset = tagit.assets.get(123)
    updateUI(asset)
}
```

### Flow Support

```kotlin
tagit.events.asFlow("asset.verified")
    .collect { event ->
        println("Asset verified: ${event.tokenId}")
    }
```

## Error Handling

```kotlin
import network.tagit.sdk.TagItException
import network.tagit.sdk.ErrorCode

try {
    val asset = tagit.assets.get(123)
} catch (e: TagItException) {
    when (e.code) {
        ErrorCode.NOT_FOUND -> println("Asset not found")
        ErrorCode.UNAUTHORIZED -> println("Invalid API key")
        else -> println("Error: ${e.message}")
    }
}
```

## ProGuard Rules

Add to `proguard-rules.pro`:

```
-keep class network.tagit.sdk.** { *; }
-keepclassmembers class network.tagit.sdk.** { *; }
```

## Next Steps

- [SDK Overview](./overview.md) — All SDKs
- [JavaScript SDK](./javascript.md) — JS/TS documentation
- [Swift SDK](./swift.md) — iOS documentation
- [API Reference](../api/overview.md) — REST API

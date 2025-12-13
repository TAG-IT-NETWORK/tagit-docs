---
title: Swift SDK
description: Official Swift SDK for TAG IT Network (iOS)
---

# Swift SDK

Complete reference for the official TAG IT Swift SDK for iOS.

## Installation

### Swift Package Manager

Add to `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/tagit-network/tagit-swift.git", from: "1.0.0")
]
```

### CocoaPods

Add to `Podfile`:

```ruby
pod 'TagItSDK', '~> 1.0'
```

## Quick Start

```swift
import TagItSDK

let tagit = TagIt(apiKey: Config.tagitApiKey)

// Verify an asset
let result = try await tagit.verify(tokenId: 12345)
print("Verified: \(result.verified)")
```

## Configuration

```swift
let tagit = TagIt(
    apiKey: "your-api-key",
    config: TagItConfig(
        network: .testnet,    // .mainnet or .testnet
        timeout: 30,          // Request timeout seconds
        retries: 3,           // Retry attempts
        logging: true         // Debug logging
    )
)
```

## Assets

### Get Asset

```swift
let asset = try await tagit.assets.get(id: 123)

print("Token ID: \(asset.tokenId)")
print("State: \(asset.state)")
print("Owner: \(asset.owner)")
print("Metadata: \(asset.metadata)")
```

### List Assets

```swift
let result = try await tagit.assets.list(
    state: .activated,
    owner: "0x123...",
    page: 1,
    limit: 20
)

for asset in result.assets {
    print("\(asset.tokenId): \(asset.state)")
}
```

### Create Asset

```swift
let result = try await tagit.assets.create(
    to: "0x123...",
    metadata: [
        "name": "Product Name",
        "brand": "Brand",
        "sku": "SKU-123"
    ]
)

print("Created: \(result.tokenId)")
```

### Bind Asset

```swift
let result = try await tagit.assets.bind(
    tokenId: 123,
    chipId: "0xabc...",
    signature: "0xdef..."
)

print("Bound: \(result.state == .bound)")
```

## NFC Integration

### Setup

Add to `Info.plist`:

```xml
<key>NFCReaderUsageDescription</key>
<string>We use NFC to verify product authenticity</string>
<key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key>
<array>
    <string>D276000085010100</string>
</array>
```

### Read NFC Tag

```swift
import CoreNFC
import TagItSDK

class VerificationViewController: UIViewController {
    let tagit = TagIt(apiKey: Config.tagitApiKey)
    var nfcSession: NFCTagReaderSession?

    func startScan() {
        nfcSession = NFCTagReaderSession(
            pollingOption: [.iso14443],
            delegate: self
        )
        nfcSession?.alertMessage = "Hold your iPhone near the product tag"
        nfcSession?.begin()
    }
}

extension VerificationViewController: NFCTagReaderSessionDelegate {
    func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        guard let tag = tags.first else { return }

        session.connect(to: tag) { error in
            if let error = error {
                session.invalidate(errorMessage: error.localizedDescription)
                return
            }

            Task {
                await self.verifyTag(tag, session: session)
            }
        }
    }

    func verifyTag(_ tag: NFCTag, session: NFCTagReaderSession) async {
        do {
            // 1. Read chip data
            let chipData = try await tagit.nfc.readTag(tag)

            // 2. Generate challenge
            let challenge = try await tagit.verify.createChallenge(tokenId: chipData.tokenId)

            // 3. Get chip response
            let response = try await tagit.nfc.signChallenge(tag, challenge: challenge.data)

            // 4. Submit verification
            let result = try await tagit.verify.submit(
                challengeId: challenge.challengeId,
                tokenId: chipData.tokenId,
                response: response
            )

            await MainActor.run {
                if result.verified {
                    session.alertMessage = "Product verified!"
                } else {
                    session.alertMessage = "Verification failed"
                }
                session.invalidate()
            }
        } catch {
            session.invalidate(errorMessage: error.localizedDescription)
        }
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: Error) {
        print("NFC error: \(error)")
    }
}
```

## Programs

### List Programs

```swift
let programs = try await tagit.programs.list(active: true)

for program in programs {
    print("\(program.name): \(program.type)")
}
```

### Enroll

```swift
let enrollment = try await tagit.programs.enroll(programId: "prog_123")
print("Enrolled: \(enrollment.enrollmentId)")
```

### Get Progress

```swift
let progress = try await tagit.programs.getProgress(programId: "prog_123")

print("Points: \(progress.points)")
print("Level: \(progress.level)")
print("Claimable: \(progress.claimableRewards.count)")
```

## Async/Await Support

All SDK methods support Swift concurrency:

```swift
Task {
    let asset = try await tagit.assets.get(id: 123)
    await updateUI(with: asset)
}
```

### AsyncSequence for Events

```swift
for await event in tagit.events.stream(type: .assetVerified) {
    print("Asset verified: \(event.tokenId)")
}
```

## Error Handling

```swift
do {
    let asset = try await tagit.assets.get(id: 123)
} catch TagItError.notFound {
    print("Asset not found")
} catch TagItError.unauthorized {
    print("Invalid API key")
} catch {
    print("Error: \(error)")
}
```

## SwiftUI Integration

```swift
import SwiftUI
import TagItSDK

struct AssetView: View {
    @StateObject private var viewModel = AssetViewModel()

    var body: some View {
        VStack {
            if let asset = viewModel.asset {
                Text("Token: \(asset.tokenId)")
                Text("State: \(asset.state.rawValue)")
            }

            Button("Verify") {
                viewModel.verify()
            }
        }
        .task {
            await viewModel.loadAsset(id: 123)
        }
    }
}

@MainActor
class AssetViewModel: ObservableObject {
    @Published var asset: Asset?
    private let tagit = TagIt(apiKey: Config.tagitApiKey)

    func loadAsset(id: UInt64) async {
        asset = try? await tagit.assets.get(id: id)
    }
}
```

## Next Steps

- [SDK Overview](./overview.md) — All SDKs
- [JavaScript SDK](./javascript.md) — JS/TS documentation
- [Kotlin SDK](./kotlin.md) — Android documentation
- [API Reference](../api/overview.md) — REST API

# Robotics Integration Guide

**Guide ID:** ROB-T13
**Version:** 1.0.0
**Last Updated:** 2026-03-12

---

## 1. Overview

TAG IT Robotic Authorization enables robots to interact with NFC-tagged physical assets through an on-chain permission system. Before a robot can scan, move, inspect, or manipulate an asset, it must:

1. Hold a valid **Robot Identity Badge** (IdentityBadge token IDs 30-35).
2. Hold the appropriate **Capability Badges** for the intended action.
3. Complete an **NFC challenge-response** with the asset's NTAG 424 DNA chip.
4. Submit the resulting **attestation** to `RoboticAuthorizer.authorizeRobotAction()`.

The system enforces safety classes, zone restrictions, and rate limits entirely on-chain, providing a tamper-proof audit trail of every robot-asset interaction.

---

## 2. Prerequisites

### 2.1 SDK Installation

```bash
npm install @tagit/sdk
# or
pnpm add @tagit/sdk
```

### 2.2 Required Setup

| Requirement                | Description                                              |
|----------------------------|----------------------------------------------------------|
| Robot Wallet               | An Ethereum wallet (EOA or smart account) for the robot  |
| Robot Identity Badge       | IdentityBadge token ID in range 30-35                    |
| Capability Badges          | CapabilityBadge tokens for permitted actions (120-124)   |
| NFC Reader Hardware        | ISO 14443-4 compliant reader, power-limited to 5 cm      |
| Network Access             | RPC endpoint for Base Sepolia (or target L2)             |
| Oracle Access              | URL to the TAG IT NFC verification oracle                |

### 2.3 Badge Requirements by Action

| Action      | Identity Badge | Capability Badge(s)      |
|-------------|---------------|--------------------------|
| SCAN        | 30-35         | None required            |
| MOVE        | 30-35         | 121 (Manipulation)       |
| INSPECT     | 30-35         | 122 (Inspection)         |
| MANIPULATE  | 30-35         | 121 (Manipulation)       |
| TRANSPORT   | 30-35         | 120-124 (All)            |

### 2.4 Client Initialization

```typescript
import { createRobotAuthClient } from '@tagit/sdk/robot';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.ROBOT_PRIVATE_KEY as `0x${string}`);

const robotClient = createRobotAuthClient({
  rpcUrl: 'https://sepolia.base.org',
  oracleUrl: 'https://oracle.tagit.network',
  robotWallet: account,
  chainId: 84532,
});
```

---

## 3. Querying Action Policies

Before attempting an action, query the on-chain policy to determine whether the robot is authorized and what safety class applies.

### 3.1 Using the SDK

```typescript
import { ActionType } from '@tagit/sdk/robot';

const policy = await robotClient.queryActionPolicy({
  robotTokenId: 31n,       // Robot's identity badge token ID
  assetTokenId: 1042n,     // Target asset's token ID
  actionType: ActionType.SCAN,
});

console.log(policy);
// {
//   allowed: true,
//   safetyClass: 0,           // STANDARD
//   actionBitmask: 0b00011,   // SCAN + MOVE permitted
//   zoneId: 0n,               // No zone restriction
//   remainingRateLimit: 87,   // 87 actions remaining this hour
// }
```

### 3.2 Direct Contract Call

```typescript
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { roboticAuthorizerAbi } from '@tagit/sdk/abi';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const [allowed, safetyClass, actionBitmask, zoneId, remainingRateLimit] =
  await publicClient.readContract({
    address: '0x5c38684D87E826589eC5ED401d94C9671CAe9F40', // RoboticAuthorizer on Base Sepolia (separate from TAGITCore asset lifecycle at 0x3adC...1D1d)
    abi: roboticAuthorizerAbi,
    functionName: 'queryActionPolicy',
    args: [31n, 1042n, 0], // robotTokenId, assetTokenId, SCAN
  });
```

---

## 4. Understanding the Response

### 4.1 SafetyClass

The `safetyClass` field indicates the authorization level required:

| Value | Class       | Meaning                                            |
|-------|-------------|----------------------------------------------------|
| 0     | STANDARD    | Basic scan. Identity badge sufficient.             |
| 1     | ELEVATED    | Physical manipulation. Requires capability badge.  |
| 2     | RESTRICTED  | Sensor inspection. Requires inspection capability. |
| 3     | CLASSIFIED  | Defense/military. All capabilities + multi-oracle. |

### 4.2 Action Bitmask

The `actionBitmask` is a 5-bit field representing all actions the robot can perform on this asset:

```
Bit 0 (0x01): SCAN
Bit 1 (0x02): MOVE
Bit 2 (0x04): INSPECT
Bit 3 (0x08): MANIPULATE
Bit 4 (0x10): TRANSPORT
```

**Example:** `actionBitmask = 0b00111 (7)` means the robot can SCAN, MOVE, and INSPECT.

```typescript
function canPerformAction(bitmask: number, action: ActionType): boolean {
  return (bitmask & (1 << action)) !== 0;
}
```

### 4.3 Deny-Wins Policy

When multiple policies apply to a robot-asset pair (e.g., zone policy + global policy), the system uses **deny-wins** resolution:

- If **any** applicable policy denies the action, the action is denied.
- The effective `actionBitmask` is the bitwise AND of all applicable policy bitmasks.
- The effective `safetyClass` is the **maximum** (strictest) of all applicable safety classes.

```typescript
// Example: Robot has global bitmask 0b11111 but zone restricts to 0b00011
// Effective bitmask: 0b11111 & 0b00011 = 0b00011 (SCAN + MOVE only)
```

### 4.4 Zone Context

The `zoneId` field indicates the asset's zone assignment:

- `zoneId = 0` — No zone restriction. No zone proof required.
- `zoneId > 0` — Asset is in a specific zone. The robot must provide a Merkle proof of zone authorization when calling `authorizeRobotAction()`.

```typescript
if (policy.zoneId > 0n) {
  // Robot must provide a zone proof
  const zoneProof = await robotClient.getZoneProof(robotTokenId, policy.zoneId);
  // Pass zoneProof to authorizeRobotAction()
}
```

---

## 5. Authorizing Actions

### 5.1 Full Authorization Flow

```typescript
import { ActionType } from '@tagit/sdk/robot';

async function authorizeRobotScan(
  robotTokenId: bigint,
  assetTokenId: bigint,
  sunMessage: `0x${string}`,
) {
  // Step 1: Query policy
  const policy = await robotClient.queryActionPolicy({
    robotTokenId,
    assetTokenId,
    actionType: ActionType.SCAN,
  });

  if (!policy.allowed) {
    throw new Error(`Action not permitted. Bitmask: ${policy.actionBitmask}`);
  }

  if (policy.remainingRateLimit <= 0) {
    throw new Error('Rate limit exceeded. Try again next hour.');
  }

  // Step 2: Get oracle attestation from NFC SUN message
  const attestation = await robotClient.verifyNfc(sunMessage);

  // Step 3: Get zone proof if needed
  const zoneProof = policy.zoneId > 0n
    ? await robotClient.getZoneProof(robotTokenId, policy.zoneId)
    : '0x';

  // Step 4: Submit authorization transaction
  const authorizationId = await robotClient.authorizeAction({
    robotTokenId,
    assetTokenId,
    actionType: ActionType.SCAN,
    attestation: attestation.encoded,
    zoneProof,
  });

  console.log(`Authorized: ${authorizationId}`);
  return authorizationId;
}
```

### 5.2 With Zone Proof

When an asset is assigned to a zone, the robot must prove it is authorized for that zone using a Merkle proof.

```typescript
// Fetch the zone proof from the SDK (computed from on-chain zone tree)
const zoneProof = await robotClient.getZoneProof(robotTokenId, zoneId);

const authId = await robotClient.authorizeAction({
  robotTokenId: 31n,
  assetTokenId: 1042n,
  actionType: ActionType.MOVE,
  attestation: attestation.encoded,
  zoneProof,
});
```

### 5.3 Batch Authorization

For robots performing the same action on multiple assets in sequence:

```typescript
const assetIds = [1042n, 1043n, 1044n, 1045n];

for (const assetId of assetIds) {
  // Each asset requires its own NFC scan
  const sun = await robot.scanNfcTag(assetId);
  const attestation = await robotClient.verifyNfc(sun);

  const policy = await robotClient.queryActionPolicy({
    robotTokenId: 31n,
    assetTokenId: assetId,
    actionType: ActionType.SCAN,
  });

  if (policy.allowed && policy.remainingRateLimit > 0) {
    await robotClient.authorizeAction({
      robotTokenId: 31n,
      assetTokenId: assetId,
      actionType: ActionType.SCAN,
      attestation: attestation.encoded,
      zoneProof: '0x',
    });
  }
}
```

---

## 6. Error Handling

### 6.1 Error Types

| Error                  | Cause                                         | Resolution                                   |
|------------------------|-----------------------------------------------|----------------------------------------------|
| `RobotNotAuthorized`   | Robot lacks required identity badge           | Assign IdentityBadge (30-35) to robot wallet |
| `ActionNotPermitted`   | Robot lacks capability badge for this action  | Assign required CapabilityBadge              |
| `UnauthorizedZone`     | Robot not authorized for asset's zone         | Add robot to zone authorization tree         |
| `AttestationExpired`   | NFC attestation past validity window          | Re-scan NFC tag and get fresh attestation    |
| `RateLimitExceeded`    | Robot exceeded hourly action limit            | Wait for next hour boundary                  |
| `OracleSignatureInvalid`| Oracle key mismatch or tampered attestation  | Verify oracle configuration                  |
| `CounterAlreadyUsed`   | NFC read counter replay detected             | Re-scan tag for new SUN message              |

### 6.2 Error Handling Pattern

```typescript
import {
  RobotNotAuthorizedError,
  ActionNotPermittedError,
  UnauthorizedZoneError,
  AttestationExpiredError,
  RateLimitExceededError,
} from '@tagit/sdk/robot';

try {
  const authId = await robotClient.authorizeAction({
    robotTokenId: 31n,
    assetTokenId: 1042n,
    actionType: ActionType.MOVE,
    attestation: attestation.encoded,
    zoneProof,
  });
} catch (error) {
  if (error instanceof AttestationExpiredError) {
    // Re-scan and retry
    const newSun = await robot.scanNfcTag(assetId);
    const newAttestation = await robotClient.verifyNfc(newSun);
    // Retry with new attestation...
  } else if (error instanceof RateLimitExceededError) {
    // Queue for next hour
    const nextReset = error.nextResetTimestamp;
    await scheduler.queueAction(action, nextReset);
  } else if (error instanceof RobotNotAuthorizedError) {
    // Cannot self-resolve — notify admin
    await alertAdmin(`Robot ${robotTokenId} missing identity badge`);
  } else if (error instanceof ActionNotPermittedError) {
    // Check what actions ARE permitted
    const policy = await robotClient.queryActionPolicy({
      robotTokenId, assetTokenId, actionType: ActionType.SCAN,
    });
    console.log(`Permitted actions bitmask: ${policy.actionBitmask}`);
  } else if (error instanceof UnauthorizedZoneError) {
    await alertAdmin(`Robot ${robotTokenId} not authorized for zone ${zoneId}`);
  } else {
    throw error; // Unknown error — propagate
  }
}
```

### 6.3 Rate Limit Strategy

```typescript
// Check remaining rate limit before scanning
const policy = await robotClient.queryActionPolicy({
  robotTokenId, assetTokenId, actionType,
});

if (policy.remainingRateLimit < 5) {
  console.warn(`Low rate limit: ${policy.remainingRateLimit} remaining`);
}

if (policy.remainingRateLimit === 0) {
  // Calculate next reset (top of next hour)
  const now = Math.floor(Date.now() / 1000);
  const nextHour = Math.ceil(now / 3600) * 3600;
  const waitSeconds = nextHour - now;
  console.log(`Rate limited. Resets in ${waitSeconds}s`);
}
```

---

## 7. Code Examples

### 7.1 Complete Robot Authorization Service

```typescript
import { createRobotAuthClient, ActionType } from '@tagit/sdk/robot';
import { privateKeyToAccount } from 'viem/accounts';

// ---- Configuration ----

const config = {
  rpcUrl: process.env.RPC_URL ?? 'https://sepolia.base.org',
  oracleUrl: process.env.ORACLE_URL ?? 'https://oracle.tagit.network',
  robotPrivateKey: process.env.ROBOT_PRIVATE_KEY as `0x${string}`,
  chainId: 84532,
  robotTokenId: 31n,
};

// ---- Client Setup ----

const account = privateKeyToAccount(config.robotPrivateKey);

const robotClient = createRobotAuthClient({
  rpcUrl: config.rpcUrl,
  oracleUrl: config.oracleUrl,
  robotWallet: account,
  chainId: config.chainId,
});

// ---- Authorization Function ----

interface AuthorizationResult {
  authorizationId: string;
  safetyClass: number;
  timestamp: number;
}

async function authorizeAssetInteraction(
  assetTokenId: bigint,
  actionType: ActionType,
  sunMessage: `0x${string}`,
): Promise<AuthorizationResult> {
  // 1. Query policy
  const policy = await robotClient.queryActionPolicy({
    robotTokenId: config.robotTokenId,
    assetTokenId,
    actionType,
  });

  if (!policy.allowed) {
    throw new Error(
      `Action ${ActionType[actionType]} not permitted on asset ${assetTokenId}. ` +
      `Available actions bitmask: 0b${policy.actionBitmask.toString(2).padStart(5, '0')}`
    );
  }

  if (policy.remainingRateLimit <= 0) {
    throw new Error('Rate limit exceeded');
  }

  // 2. Verify NFC via oracle
  const attestation = await robotClient.verifyNfc(sunMessage);

  // 3. Zone proof (if required)
  const zoneProof = policy.zoneId > 0n
    ? await robotClient.getZoneProof(config.robotTokenId, policy.zoneId)
    : '0x' as `0x${string}`;

  // 4. Submit on-chain authorization
  const authorizationId = await robotClient.authorizeAction({
    robotTokenId: config.robotTokenId,
    assetTokenId,
    actionType,
    attestation: attestation.encoded,
    zoneProof,
  });

  return {
    authorizationId,
    safetyClass: policy.safetyClass,
    timestamp: Math.floor(Date.now() / 1000),
  };
}

// ---- Inventory Scan Example ----

async function performInventoryScan(assetIds: bigint[]) {
  const results: AuthorizationResult[] = [];

  for (const assetId of assetIds) {
    try {
      // Robot physically scans the NFC tag (hardware-specific)
      const sunMessage = await robotHardware.readNfcSunMessage(assetId);

      const result = await authorizeAssetInteraction(
        assetId,
        ActionType.SCAN,
        sunMessage,
      );

      results.push(result);
      console.log(`Scanned asset ${assetId}: auth=${result.authorizationId}`);
    } catch (error) {
      console.error(`Failed to scan asset ${assetId}:`, error);
      // Continue scanning remaining assets
    }
  }

  return results;
}

// ---- Event Listener ----

robotClient.onRobotActionAuthorized(
  { robotTokenId: config.robotTokenId },
  (event) => {
    console.log(`Action authorized:`, {
      authorizationId: event.authorizationId,
      assetTokenId: event.assetTokenId,
      actionType: event.actionType,
      safetyClass: event.safetyClass,
      blockNumber: event.blockNumber,
    });
  },
);
```

### 7.2 Policy Check Utility

```typescript
import { ActionType } from '@tagit/sdk/robot';

/**
 * Print a human-readable summary of a robot's permissions on an asset.
 */
async function printPermissions(robotTokenId: bigint, assetTokenId: bigint) {
  const actions = [
    ActionType.SCAN,
    ActionType.MOVE,
    ActionType.INSPECT,
    ActionType.MANIPULATE,
    ActionType.TRANSPORT,
  ];

  console.log(`\nPermissions for Robot #${robotTokenId} on Asset #${assetTokenId}:`);
  console.log('─'.repeat(60));

  for (const action of actions) {
    const policy = await robotClient.queryActionPolicy({
      robotTokenId,
      assetTokenId,
      actionType: action,
    });

    const status = policy.allowed ? 'ALLOWED' : 'DENIED ';
    const className = ['STANDARD', 'ELEVATED', 'RESTRICTED', 'CLASSIFIED'][policy.safetyClass];
    const zone = policy.zoneId > 0n ? `Zone ${policy.zoneId}` : 'No zone';

    console.log(
      `  ${status}  ${ActionType[action].padEnd(12)} ` +
      `Class: ${className?.padEnd(12)} ` +
      `Rate: ${policy.remainingRateLimit.toString().padStart(3)}/hr  ` +
      `${zone}`
    );
  }
}
```

# Developer Guide: Robotic Authorization

**Guide ID:** ROB-T15
**Version:** 1.0.0
**Last Updated:** 2026-03-12

---

## 1. Smart Contract Architecture

Robotic authorization is implemented in the **RoboticAuthorizer** contract, which is separated from TAGITCore (asset lifecycle) to isolate robot-specific policy, rate limiting, and zone enforcement. The RoboticAuthorizer reads badge state from TAGITCore but manages its own storage for robot policies, rate limits, and authorization records. The key on-chain components are:

### 1.1 Core Functions

```solidity
// Query whether a robot can perform an action on an asset
function queryActionPolicy(
    uint256 robotTokenId,
    uint256 assetTokenId,
    uint8 actionType
) external view returns (
    bool allowed,
    uint8 safetyClass,
    uint16 actionBitmask,
    uint256 zoneId,
    uint32 remainingRateLimit
);

// Authorize a robot action using NFC attestation
function authorizeRobotAction(
    uint256 robotTokenId,
    uint256 assetTokenId,
    uint8 actionType,
    bytes calldata attestation,
    bytes calldata zoneProof
) external returns (bytes32 authorizationId);

// Admin: Set action policy for an asset or asset class
function setRobotActionPolicy(
    uint256 assetTokenId,
    uint8 safetyClass,
    uint16 actionBitmask,
    uint256 zoneId
) external onlyRole(ADMIN_ROLE);

// Admin: Register an NFC oracle address
function setNfcOracle(address oracle, bool active) external onlyRole(ADMIN_ROLE);

// Admin: Set rate limits
function setRobotRateLimit(
    uint8 safetyClass,
    uint32 perRobotLimit,
    uint32 globalLimit
) external onlyRole(ADMIN_ROLE);
```

### 1.2 Storage Layout

```solidity
// Robot action policies per asset
mapping(uint256 assetTokenId => RobotPolicy) public robotPolicies;

struct RobotPolicy {
    uint8 safetyClass;        // 0-3
    uint16 actionBitmask;     // 5-bit action permissions
    uint256 zoneId;           // Zone assignment (0 = no zone)
    bool active;              // Policy active flag
}

// Rate limiting
mapping(uint256 robotTokenId => mapping(uint256 hourSlot => uint32 count)) public robotActionCounts;
mapping(uint256 hourSlot => uint32 count) public globalActionCount;

// Rate limit configuration per safety class
mapping(uint8 safetyClass => RateLimitConfig) public rateLimits;

struct RateLimitConfig {
    uint32 perRobotLimit;     // Max actions per robot per hour
    uint32 globalLimit;       // Max actions globally per hour
    uint32 circuitBreaker;    // Per-robot threshold triggering cooldown
}

// NFC oracle registry
mapping(address => bool) public nfcOracles;

// Counter replay prevention
mapping(bytes7 tagUID => uint24 lastCounter) public tagCounters;

// Zone authorization (Merkle root per robot)
mapping(uint256 robotTokenId => bytes32 zoneRoot) public zoneRoots;

// Authorization log
mapping(bytes32 authorizationId => AuthorizationRecord) public authorizations;

struct AuthorizationRecord {
    uint256 robotTokenId;
    uint256 assetTokenId;
    uint8 actionType;
    uint8 safetyClass;
    uint48 timestamp;
    bytes7 tagUID;
}
```

### 1.3 Authorization Flow (Internal)

```solidity
function authorizeRobotAction(
    uint256 robotTokenId,
    uint256 assetTokenId,
    uint8 actionType,
    bytes calldata attestation,
    bytes calldata zoneProof
) external returns (bytes32 authorizationId) {
    // 1. Verify the robot holds the required identity badge
    if (!_hasIdentityBadge(msg.sender, robotTokenId)) revert RobotNotAuthorized();

    // 2. Decode and verify the oracle attestation
    (bytes7 tagUID, uint48 timestamp, uint24 readCounter, bytes memory sig) =
        abi.decode(attestation, (bytes7, uint48, uint24, bytes));

    // 3. Verify oracle signature
    address signer = _recoverSigner(tagUID, timestamp, readCounter, sig);
    if (!nfcOracles[signer]) revert OracleSignatureInvalid();

    // 4. Check attestation freshness
    RobotPolicy memory policy = robotPolicies[assetTokenId];
    uint48 maxAge = _getMaxAttestationAge(policy.safetyClass);
    if (block.timestamp > timestamp + maxAge) revert AttestationExpired();

    // 5. Anti-replay: check counter
    if (readCounter <= tagCounters[tagUID]) revert CounterAlreadyUsed();
    tagCounters[tagUID] = readCounter;

    // 6. Check action permission
    if ((policy.actionBitmask & (1 << actionType)) == 0) revert ActionNotPermitted();

    // 7. Check capability badges
    _verifyCapabilityBadges(msg.sender, actionType, policy.safetyClass);

    // 8. Check rate limits
    uint256 hourSlot = block.timestamp / 3600;
    _checkAndIncrementRateLimit(robotTokenId, hourSlot, policy.safetyClass);

    // 9. Verify zone proof (if zone-restricted)
    if (policy.zoneId != 0) {
        _verifyZoneProof(robotTokenId, policy.zoneId, zoneProof);
    }

    // 10. Record and emit
    authorizationId = keccak256(abi.encodePacked(
        robotTokenId, assetTokenId, actionType, block.timestamp, readCounter
    ));

    authorizations[authorizationId] = AuthorizationRecord({
        robotTokenId: robotTokenId,
        assetTokenId: assetTokenId,
        actionType: actionType,
        safetyClass: policy.safetyClass,
        timestamp: uint48(block.timestamp),
        tagUID: tagUID
    });

    emit RobotActionAuthorized(
        authorizationId, robotTokenId, assetTokenId, actionType, policy.safetyClass
    );
}
```

---

## 2. Badge Setup

### 2.1 Robot Identity Badges

Robot identity badges are IdentityBadge tokens with IDs in the range **30-35**. Each robot must hold exactly one identity badge.

| Token ID | Robot Class        | Description                              |
|----------|--------------------|------------------------------------------|
| 30       | Industrial Basic   | Warehouse robots, conveyor systems       |
| 31       | Industrial Advanced| Articulated arms, AGVs with manipulation |
| 32       | Inspection         | QC robots, sensor-equipped drones        |
| 33       | Logistics          | Autonomous trucks, delivery robots       |
| 34       | Defense            | Military logistics robots                |
| 35       | Reserved           | Future robot classes                     |

#### Granting a Robot Identity Badge

```typescript
import { createAgentClient } from '@tagit/sdk';
import { privateKeyToAccount } from 'viem/accounts';

const adminAccount = privateKeyToAccount(process.env.ADMIN_PRIVATE_KEY as `0x${string}`);

const client = createAgentClient({
  rpcUrl: 'https://sepolia.base.org',
  account: adminAccount,
});

// Mint identity badge to robot wallet
const tx = await client.identity.mint({
  to: '0xRobotWalletAddress...',
  tokenId: 31n, // Industrial Advanced
});
```

### 2.2 Capability Badges

Capability badges grant specific action permissions. They are CapabilityBadge tokens in the range **120-124**.

| Token ID | Capability        | Required For                              |
|----------|-------------------|-------------------------------------------|
| 120      | Basic Operations  | Base capability (auto-granted with ID 30+)|
| 121      | Manipulation      | MOVE, MANIPULATE actions                  |
| 122      | Inspection        | INSPECT action                            |
| 123      | Transport         | TRANSPORT action                          |
| 124      | Classified Ops    | CLASSIFIED safety class actions           |

#### Granting Capability Badges

```typescript
// Grant manipulation capability to a robot
const tx = await client.capability.mint({
  to: '0xRobotWalletAddress...',
  tokenId: 121n, // Manipulation
});

// For CLASSIFIED operations, grant all capabilities
const capIds = [120n, 121n, 122n, 123n, 124n];
for (const capId of capIds) {
  await client.capability.mint({
    to: '0xRobotWalletAddress...',
    tokenId: capId,
  });
}
```

### 2.3 Verifying Badge Assignment

```typescript
// Check if a robot has the required badges
const hasIdentity = await client.identity.balanceOf(robotAddress, 31n);
const hasManipulation = await client.capability.balanceOf(robotAddress, 121n);

console.log(`Identity badge: ${hasIdentity > 0n}`);
console.log(`Manipulation cap: ${hasManipulation > 0n}`);
```

---

## 3. Action Bitmask Reference

Actions are represented as a 5-bit bitmask. Each bit corresponds to one action type.

### 3.1 Bit Positions

```
Bit 4    Bit 3       Bit 2      Bit 1    Bit 0
TRANSPORT MANIPULATE INSPECT    MOVE     SCAN
  (16)      (8)        (4)       (2)      (1)
```

### 3.2 Action Values

| Action      | Enum Value | Bit Position | Bitmask Value | Minimum Safety Class |
|-------------|-----------|-------------|---------------|---------------------|
| SCAN        | 0         | bit 0       | `0x01` (1)    | STANDARD (0)        |
| MOVE        | 1         | bit 1       | `0x02` (2)    | ELEVATED (1)        |
| INSPECT     | 2         | bit 2       | `0x04` (4)    | RESTRICTED (2)      |
| MANIPULATE  | 3         | bit 3       | `0x08` (8)    | ELEVATED (1)        |
| TRANSPORT   | 4         | bit 4       | `0x10` (16)   | CLASSIFIED (3)      |

### 3.3 Common Bitmask Combinations

| Bitmask       | Decimal | Hex    | Permitted Actions                     |
|---------------|---------|--------|---------------------------------------|
| `0b00001`     | 1       | `0x01` | SCAN only                             |
| `0b00011`     | 3       | `0x03` | SCAN + MOVE                           |
| `0b00111`     | 7       | `0x07` | SCAN + MOVE + INSPECT                 |
| `0b01011`     | 11      | `0x0B` | SCAN + MOVE + MANIPULATE              |
| `0b01111`     | 15      | `0x0F` | SCAN + MOVE + INSPECT + MANIPULATE    |
| `0b11111`     | 31      | `0x1F` | All actions                           |

### 3.4 Bitmask Utilities

```typescript
// Check if an action is permitted
function isActionPermitted(bitmask: number, action: number): boolean {
  return (bitmask & (1 << action)) !== 0;
}

// List all permitted actions
function listPermittedActions(bitmask: number): string[] {
  const names = ['SCAN', 'MOVE', 'INSPECT', 'MANIPULATE', 'TRANSPORT'];
  return names.filter((_, i) => (bitmask & (1 << i)) !== 0);
}

// Combine multiple action bits
function combineActions(...actions: number[]): number {
  return actions.reduce((mask, action) => mask | (1 << action), 0);
}

// Example
const mask = combineActions(0, 1, 3); // SCAN + MOVE + MANIPULATE = 0b01011 = 11
console.log(listPermittedActions(mask)); // ['SCAN', 'MOVE', 'MANIPULATE']
```

---

## 4. Safety Class Reference

### 4.1 Requirements Per Class

| Safety Class | Value | Attestation TTL | Badge Requirements            | Zone Proof | Multi-Oracle | Audit |
|-------------|-------|-----------------|-------------------------------|-----------|-------------|-------|
| STANDARD    | 0     | 60s             | Identity (30-35)              | No        | No          | No    |
| ELEVATED    | 1     | 30s             | Identity + Cap 121            | If zoned  | No          | No    |
| RESTRICTED  | 2     | 15s             | Identity + Cap 122            | Yes       | No          | Yes   |
| CLASSIFIED  | 3     | 10s             | Identity + Caps 120-124 (all) | Yes       | Yes (2/2)   | Yes   |

### 4.2 Setting Safety Class for an Asset

```typescript
// Admin: Set asset to ELEVATED safety class with SCAN + MOVE + MANIPULATE
await client.core.setRobotActionPolicy({
  assetTokenId: 1042n,
  safetyClass: 1,           // ELEVATED
  actionBitmask: 0b01011,   // SCAN + MOVE + MANIPULATE
  zoneId: 0n,               // No zone restriction
});

// Admin: Set asset to RESTRICTED with zone enforcement
await client.core.setRobotActionPolicy({
  assetTokenId: 2001n,
  safetyClass: 2,           // RESTRICTED
  actionBitmask: 0b00101,   // SCAN + INSPECT
  zoneId: 7n,               // Zone 7 required
});
```

### 4.3 Safety Class Escalation

Safety class can be automatically escalated (never downgraded) in these scenarios:

- **Tag tampered:** Automatically escalates to RESTRICTED (class 2) minimum.
- **Anomaly detected:** AnomalyAgent flags trigger escalation to RESTRICTED.
- **Zone boundary:** Assets near zone boundaries are escalated by +1 class.
- **Manual override:** Admin can escalate at any time via `setRobotActionPolicy()`.

---

## 5. Rate Limiting

### 5.1 Default Limits

| Scope                    | Limit        | Window   | Reset                  |
|--------------------------|-------------|----------|------------------------|
| Per robot (STANDARD)     | 100 actions | 1 hour   | Top of next hour (UTC) |
| Per robot (ELEVATED)     | 50 actions  | 1 hour   | Top of next hour       |
| Per robot (RESTRICTED)   | 25 actions  | 1 hour   | Top of next hour       |
| Per robot (CLASSIFIED)   | 10 actions  | 1 hour   | Top of next hour       |
| Global (all robots)      | 5000 actions| 1 hour   | Top of next hour       |
| Circuit breaker (per robot)| 200 actions | 1 hour | 1-hour cooldown        |

### 5.2 Hour Slot Calculation

Rate limits use hourly slots based on Unix time:

```solidity
uint256 hourSlot = block.timestamp / 3600;
// e.g., timestamp 1773504000 → hourSlot 492640
// Slot resets at 1773507600 (next hour boundary)
```

### 5.3 Circuit Breaker

The circuit breaker is a per-robot safety mechanism. If a single robot exceeds 200 actions in any 1-hour window (across all safety classes combined), it enters a 1-hour cooldown:

```solidity
function _checkAndIncrementRateLimit(
    uint256 robotTokenId,
    uint256 hourSlot,
    uint8 safetyClass
) internal {
    // Per-class limit
    uint32 classCount = robotActionCounts[robotTokenId][hourSlot];
    RateLimitConfig memory config = rateLimits[safetyClass];
    if (classCount >= config.perRobotLimit) revert RateLimitExceeded();

    // Circuit breaker: total across all classes
    uint32 totalCount = robotTotalCounts[robotTokenId][hourSlot];
    if (totalCount >= config.circuitBreaker) revert CircuitBreakerTripped();

    // Global limit
    uint32 globalCount = globalActionCount[hourSlot];
    if (globalCount >= config.globalLimit) revert GlobalRateLimitExceeded();

    // Increment all counters
    robotActionCounts[robotTokenId][hourSlot] = classCount + 1;
    robotTotalCounts[robotTokenId][hourSlot] = totalCount + 1;
    globalActionCount[hourSlot] = globalCount + 1;
}
```

### 5.4 Querying Remaining Rate Limit

```typescript
const policy = await robotClient.queryActionPolicy({
  robotTokenId: 31n,
  assetTokenId: 1042n,
  actionType: ActionType.SCAN,
});

console.log(`Remaining: ${policy.remainingRateLimit} actions this hour`);

// Calculate reset time
const now = Math.floor(Date.now() / 1000);
const nextReset = Math.ceil(now / 3600) * 3600;
console.log(`Resets at: ${new Date(nextReset * 1000).toISOString()}`);
```

### 5.5 Configuring Rate Limits (Admin)

```typescript
// Set custom rate limits for ELEVATED class
await client.core.setRobotRateLimit({
  safetyClass: 1,          // ELEVATED
  perRobotLimit: 75,       // 75 per robot per hour
  globalLimit: 8000,       // 8000 global per hour
});
```

---

## 6. Zone Enforcement

### 6.1 Zone Overview

Zones are logical regions (e.g., warehouse sections, restricted areas, geographic fences) that control where robots can operate. Each asset can be assigned to a zone, and each robot must prove it is authorized for that zone.

### 6.2 Setting Zones on Assets

```typescript
// Admin: Assign asset to zone 7
await client.core.setRobotActionPolicy({
  assetTokenId: 1042n,
  safetyClass: 1,
  actionBitmask: 0b01011,
  zoneId: 7n,  // Zone 7
});
```

### 6.3 Zone Authorization Tree

Zone authorization uses a Merkle tree where each leaf is `keccak256(abi.encodePacked(robotTokenId, zoneId))`. The root is stored on-chain per robot.

```typescript
// Admin: Build zone authorization tree for a robot
import { keccak256, encodePacked } from 'viem';
import { MerkleTree } from 'merkletreejs';

const authorizedZones = [3n, 7n, 12n, 15n]; // Robot authorized for these zones
const robotTokenId = 31n;

const leaves = authorizedZones.map(zoneId =>
  keccak256(encodePacked(['uint256', 'uint256'], [robotTokenId, zoneId]))
);

const tree = new MerkleTree(leaves, keccak256, { sort: true });
const root = tree.getHexRoot() as `0x${string}`;

// Set zone root on-chain
await client.core.setZoneRoot({
  robotTokenId,
  zoneRoot: root,
});
```

### 6.4 Providing Zone Proofs

```typescript
// Generate proof for zone 7
const leaf = keccak256(
  encodePacked(['uint256', 'uint256'], [31n, 7n])
);
const proof = tree.getHexProof(leaf) as `0x${string}`[];

// ABI-encode the proof for the contract
const zoneProof = encodeAbiParameters(
  [{ type: 'bytes32[]' }],
  [proof],
);

// Submit with authorization
await robotClient.authorizeAction({
  robotTokenId: 31n,
  assetTokenId: 1042n,
  actionType: ActionType.MOVE,
  attestation: attestation.encoded,
  zoneProof,
});
```

### 6.5 Zone Proof Verification (On-Chain)

```solidity
function _verifyZoneProof(
    uint256 robotTokenId,
    uint256 zoneId,
    bytes calldata zoneProof
) internal view {
    bytes32 leaf = keccak256(abi.encodePacked(robotTokenId, zoneId));
    bytes32[] memory proof = abi.decode(zoneProof, (bytes32[]));
    bytes32 root = zoneRoots[robotTokenId];

    if (root == bytes32(0)) revert UnauthorizedZone();
    if (!MerkleProofLib.verify(proof, root, leaf)) revert UnauthorizedZone();
}
```

---

## 7. Event Reference

### 7.1 RobotActionAuthorized

Emitted on every successful robot authorization. This is the primary event for indexing and audit trails.

```solidity
event RobotActionAuthorized(
    bytes32 indexed authorizationId,
    uint256 indexed robotTokenId,
    uint256 indexed assetTokenId,
    uint8 actionType,
    uint8 safetyClass
);
```

| Field           | Type      | Indexed | Description                              |
|-----------------|-----------|---------|------------------------------------------|
| authorizationId | bytes32   | Yes     | Unique ID for this authorization         |
| robotTokenId    | uint256   | Yes     | Robot's identity badge token ID          |
| assetTokenId    | uint256   | Yes     | Asset that was acted upon                |
| actionType      | uint8     | No      | Action performed (0-4)                   |
| safetyClass     | uint8     | No      | Safety class at time of authorization    |

### 7.2 Listening for Events (SDK)

```typescript
// Listen for all authorizations by a specific robot
const unwatch = robotClient.onRobotActionAuthorized(
  { robotTokenId: 31n },
  (log) => {
    console.log(`Auth: ${log.authorizationId}`);
    console.log(`  Asset: ${log.assetTokenId}`);
    console.log(`  Action: ${log.actionType}`);
    console.log(`  Safety: ${log.safetyClass}`);
    console.log(`  Block: ${log.blockNumber}`);
  },
);

// Stop listening
unwatch();
```

### 7.3 Querying Historical Events (Viem)

```typescript
import { createPublicClient, http, parseAbiItem } from 'viem';
import { baseSepolia } from 'viem/chains';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const logs = await client.getLogs({
  address: '0x...RoboticAuthorizerAddress', // RoboticAuthorizer (separate from TAGITCore)
  event: parseAbiItem(
    'event RobotActionAuthorized(bytes32 indexed authorizationId, uint256 indexed robotTokenId, uint256 indexed assetTokenId, uint8 actionType, uint8 safetyClass)'
  ),
  args: {
    robotTokenId: 31n, // Filter by robot
  },
  fromBlock: 246901619n,
  toBlock: 'latest',
});

for (const log of logs) {
  console.log(`Auth ${log.args.authorizationId}: asset=${log.args.assetTokenId}, action=${log.args.actionType}`);
}
```

### 7.4 Subgraph Indexing

The `RobotActionAuthorized` event can be indexed by a Graph Protocol subgraph for efficient querying:

```graphql
# Example query: all authorizations for a robot in the last 24 hours
{
  robotActionAuthorizeds(
    where: {
      robotTokenId: "31"
      timestamp_gt: "1773417600"
    }
    orderBy: timestamp
    orderDirection: desc
  ) {
    authorizationId
    assetTokenId
    actionType
    safetyClass
    timestamp
    blockNumber
  }
}
```

---

## 8. Solidity Integration

### 8.1 Calling from Another Contract

If you are building a contract that needs to verify robot authorization before performing an action:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IRoboticAuthorizer} from "../interfaces/IRoboticAuthorizer.sol";

contract WarehouseAutomation {
    IRoboticAuthorizer public immutable authorizer;

    error NotAuthorizedForAction();
    error PolicyCheckFailed();

    constructor(address _authorizer) {
        authorizer = IRoboticAuthorizer(_authorizer);
    }

    /// @notice Move an asset using a robot, with on-chain authorization
    /// @param robotTokenId The robot's identity badge token ID
    /// @param assetTokenId The asset to move
    /// @param attestation NFC oracle attestation
    /// @param zoneProof Merkle proof for zone authorization
    function moveAsset(
        uint256 robotTokenId,
        uint256 assetTokenId,
        bytes calldata attestation,
        bytes calldata zoneProof
    ) external returns (bytes32 authorizationId) {
        // Check policy first (view call, no gas cost beyond read)
        (bool allowed,,,,) = authorizer.queryActionPolicy(
            robotTokenId,
            assetTokenId,
            1 // MOVE
        );
        if (!allowed) revert PolicyCheckFailed();

        // Authorize the action
        authorizationId = authorizer.authorizeRobotAction(
            robotTokenId,
            assetTokenId,
            1, // MOVE
            attestation,
            zoneProof
        );

        // Perform the move logic
        _executeMove(assetTokenId);

        return authorizationId;
    }

    function _executeMove(uint256 assetTokenId) internal {
        // Application-specific move logic
    }
}
```

### 8.2 Interface Definition

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IRoboticAuthorizer {
    event RobotActionAuthorized(
        bytes32 indexed authorizationId,
        uint256 indexed robotTokenId,
        uint256 indexed assetTokenId,
        uint8 actionType,
        uint8 safetyClass
    );

    error RobotNotAuthorized();
    error ActionNotPermitted();
    error AttestationExpired();
    error OracleSignatureInvalid();
    error RateLimitExceeded();
    error UnauthorizedZone();
    error CounterAlreadyUsed();
    error CircuitBreakerTripped();
    error GlobalRateLimitExceeded();
    error AssetNotRegistered();

    function queryActionPolicy(
        uint256 robotTokenId,
        uint256 assetTokenId,
        uint8 actionType
    ) external view returns (
        bool allowed,
        uint8 safetyClass,
        uint16 actionBitmask,
        uint256 zoneId,
        uint32 remainingRateLimit
    );

    function authorizeRobotAction(
        uint256 robotTokenId,
        uint256 assetTokenId,
        uint8 actionType,
        bytes calldata attestation,
        bytes calldata zoneProof
    ) external returns (bytes32 authorizationId);

    function setRobotActionPolicy(
        uint256 assetTokenId,
        uint8 safetyClass,
        uint16 actionBitmask,
        uint256 zoneId
    ) external;

    function setNfcOracle(address oracle, bool active) external;

    function setRobotRateLimit(
        uint8 safetyClass,
        uint32 perRobotLimit,
        uint32 globalLimit
    ) external;

    function setZoneRoot(
        uint256 robotTokenId,
        bytes32 zoneRoot
    ) external;
}
```

### 8.3 Testing with Foundry

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {RoboticAuthorizer} from "../../src/RoboticAuthorizer.sol";

contract RobotAuthTest is Test {
    RoboticAuthorizer authorizer;
    address robot = makeAddr("robot");
    address oracle;
    uint256 oracleKey;

    function setUp() public {
        authorizer = new RoboticAuthorizer();
        (oracle, oracleKey) = makeAddrAndKey("oracle");

        // Register oracle
        authorizer.setNfcOracle(oracle, true);

        // Grant robot identity badge (ID 31) and manipulation cap (ID 121)
        // (assumes badge minting functions exist)
        authorizer.mintIdentityBadge(robot, 31);
        authorizer.mintCapabilityBadge(robot, 121);

        // Set policy for asset 1042: ELEVATED, SCAN+MOVE+MANIPULATE
        authorizer.setRobotActionPolicy(1042, 1, 0x0B, 0);
    }

    function test_authorizeRobotAction_scan() public {
        // Build attestation
        bytes7 tagUID = bytes7(hex"04a1b2c3d4e5f6");
        uint48 timestamp = uint48(block.timestamp);
        uint24 readCounter = 1;

        bytes32 messageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            keccak256(abi.encode(tagUID, timestamp, readCounter, block.chainid, robot))
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(oracleKey, messageHash);
        bytes memory sig = abi.encodePacked(r, s, v);
        bytes memory attestation = abi.encode(tagUID, timestamp, readCounter, sig);

        // Authorize
        vm.prank(robot);
        bytes32 authId = authorizer.authorizeRobotAction(31, 1042, 0, attestation, "");

        assertTrue(authId != bytes32(0));
    }

    function test_authorizeRobotAction_rateLimitExceeded() public {
        // Exhaust rate limit (100 for STANDARD)
        for (uint24 i = 1; i <= 100; i++) {
            bytes memory att = _buildAttestation(bytes7(hex"04a1b2c3d4e5f6"), i);
            vm.prank(robot);
            authorizer.authorizeRobotAction(31, 1042, 0, att, "");
        }

        // 101st should revert
        bytes memory att = _buildAttestation(bytes7(hex"04a1b2c3d4e5f6"), 101);
        vm.prank(robot);
        vm.expectRevert(RoboticAuthorizer.RateLimitExceeded.selector);
        authorizer.authorizeRobotAction(31, 1042, 0, att, "");
    }

    function _buildAttestation(bytes7 tagUID, uint24 counter) internal view returns (bytes memory) {
        uint48 timestamp = uint48(block.timestamp);
        bytes32 messageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            keccak256(abi.encode(tagUID, timestamp, counter, block.chainid, robot))
        ));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(oracleKey, messageHash);
        return abi.encode(tagUID, timestamp, counter, abi.encodePacked(r, s, v));
    }
}
```

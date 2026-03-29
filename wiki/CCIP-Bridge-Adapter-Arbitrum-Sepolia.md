# CCIP Bridge Adapter — Arbitrum Sepolia (Phase 2)

**Task:** [3314e3e9](https://www.notion.so/3314e3e9a2d381388e64e9e32c342cf0) · **Implementation PR:** [tagit-bridge#2](https://github.com/TAG-IT-NETWORK/tagit-bridge/pull/2) · **Docs PR:** [tagit-docs#2](https://github.com/TAG-IT-NETWORK/tagit-docs/pull/2) · **Notion Wiki:** [wTAG Cross-Chain Bridge](https://www.notion.so/3324e3e9a2d381849dead70e1a11b10e)

---

## Overview

Phase 2 completes the **OP Sepolia ↔ Arbitrum Sepolia** bridge lane for WrappedTAGIT (wTAG). It adds the Arbitrum Sepolia receiver deployment, bidirectional lane configuration scripts, and a full integration test suite.

**Bridge modes:**
- `LOCK_UNLOCK` — home chain (OP Sepolia): tokens locked on send, unlocked on receive
- `BURN_MINT` — remote chains (Arbitrum Sepolia, Base Sepolia): tokens burned on send, minted on receive

---

## Architecture

```
OP Sepolia (LOCK_UNLOCK)          Chainlink CCIP DON          Arbitrum Sepolia (BURN_MINT)
┌────────────────────┐            ┌───────────────┐            ┌────────────────────┐
│  CCIPBridgeAdapter │──ccipSend─▶│  Risk Mgmt +  │──ccipRecv─▶│  CCIPBridgeAdapter │
│  wTAG locked ──────│            │  Oracle DON   │            │  wTAG minted ──────│
└────────────────────┘            └───────────────┘            └────────────────────┘
         ▲                                                               │
         └───────────────────── ccipSend (burn) ◀─────────────────────┘
```

---

## Contracts

### `WrappedTAGIT` (wTAG)

```solidity
contract WrappedTAGIT is ERC20, ERC20Burnable, ERC20Permit, Ownable {

    // Errors
    error ZeroAddress();
    error ZeroAmount();
    error NotBridge(address caller);
    error BridgeAlreadySet();

    // Events
    event BridgeAdapterSet(address indexed bridge, address indexed setter);
    event BridgeMinted(address indexed to, uint256 amount);
    event BridgeBurned(address indexed from, uint256 amount);

    constructor(address initialOwner);

    // Admin — one-time, irreversible
    function setBridgeAdapter(address bridge) external onlyOwner;

    // Bridge-only
    function bridgeMint(address to, uint256 amount) external onlyBridge;
    function bridgeBurn(address from, uint256 amount) external onlyBridge;

    // View
    function isBridgeConfigured() external view returns (bool);
    function version() external pure returns (string memory);  // "1.0.0"
}
```

### `CCIPBridgeAdapter`

```solidity
contract CCIPBridgeAdapter is IAny2EVMMessageReceiver, ICCIPBridgeAdapter, IERC165, Ownable, ReentrancyGuard {

    constructor(
        address routerAddr,
        address wTagAddr,
        BridgeMode mode,        // LOCK_UNLOCK | BURN_MINT
        address initialOwner
    );

    // ── Core Bridge ──────────────────────────────────────────────────────────

    /// @notice Initiate a cross-chain wTAG transfer
    /// @param destChain   CCIP chain selector of destination
    /// @param recipient   Recipient address on destination chain
    /// @param amount      Amount of wTAG (18 decimals)
    /// @return transferId Unique transfer ID (keccak256 of message params + nonce)
    function sendCrossChain(
        uint64 destChain,
        address recipient,
        uint256 amount
    ) external payable returns (bytes32 transferId);

    /// @notice Called by CCIP Router on message receipt (inbound path)
    function ccipReceive(Client.Any2EVMMessage calldata message) external;

    /// @notice Estimate CCIP fee for a transfer
    function estimateFee(
        uint64 destChain,
        address recipient,
        uint256 amount
    ) external view returns (uint256 fee);

    // ── Configuration (owner-only) ────────────────────────────────────────────

    function configureDestChain(DestChainConfig calldata config) external;
    function removeDestChain(uint64 chainSelector) external;
    function pause() external;
    function unpause() external;

    // ── View ─────────────────────────────────────────────────────────────────

    function getTransfer(bytes32 transferId) external view returns (TransferRecord memory);
    function isDestChainSupported(uint64 chainSelector) external view returns (bool);
    function getDestChainConfig(uint64 chainSelector) external view returns (DestChainConfig memory);
    function bridgeMode() external view returns (BridgeMode);       // LOCK_UNLOCK | BURN_MINT
    function wTag() external view returns (address);
    function router() external view returns (address);
    function isPaused() external view returns (bool);
    function lockedBalance() external view returns (uint256);        // LOCK_UNLOCK only
    function version() external pure returns (string memory);        // "1.0.0"
}
```

### `ICCIPBridgeAdapter` Interface

```solidity
interface ICCIPBridgeAdapter {
    enum BridgeMode { LOCK_UNLOCK, BURN_MINT }

    struct DestChainConfig {
        uint64  chainSelector;   // CCIP chain selector
        address remoteAdapter;   // CCIPBridgeAdapter on destination chain
        bool    active;          // Must be true to send
        uint32  gasLimit;        // CCIP execution gas limit (recommended: 300_000)
    }

    struct TransferRecord {
        address sender;
        address recipient;
        uint256 amount;
        uint64  destChain;
        uint64  timestamp;
        bool    processed;       // inbound only: true after ccipReceive
    }

    // Events
    event CrossChainTransferSent(
        bytes32 indexed transferId,
        address indexed sender,
        uint64  indexed destChain,
        address recipient,
        uint256 amount,
        bytes32 ccipMessageId
    );
    event CrossChainTransferReceived(
        bytes32 indexed transferId,
        address indexed recipient,
        uint64  indexed srcChain,
        uint256 amount
    );
    event DestChainConfigured(uint64 indexed chainSelector, address remoteAdapter, bool active);
    event DestChainRemoved(uint64 indexed chainSelector);
    event BridgePaused(address indexed by);
    event BridgeUnpaused(address indexed by);
}
```

---

## Deployment Scripts

### `DeployWTAGReceiverArbitrum.s.sol`

Deploys wTAG + `CCIPBridgeAdapter` (BURN_MINT) on Arbitrum Sepolia and optionally configures the OP Sepolia lane.

```bash
forge script script/DeployWTAGReceiverArbitrum.s.sol \
  --rpc-url $ARBITRUM_SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_KEY \
  --broadcast --verify \
  --etherscan-api-key $ARBISCAN_API_KEY
```

**Key constants:**

| Constant | Value |
|----------|-------|
| `ARB_SEPOLIA_CCIP_ROUTER` | `0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165` |
| `ARB_SEPOLIA_CHAIN_SELECTOR` | `3478487238524512106` |
| `OP_SEPOLIA_CHAIN_SELECTOR` | `5224473277236331295` |
| `BASE_SEPOLIA_CHAIN_SELECTOR` | `10344971235874465080` |

**Deployment sequence:**
1. Deploy `WrappedTAGIT(bridgeOwner)` → `wTag`
2. Deploy `CCIPBridgeAdapter(router, wTag, BURN_MINT, bridgeOwner)` → `adapter`
3. `wTag.setBridgeAdapter(adapter)` — one-time binding
4. If `OP_SEPOLIA_ADAPTER` set: `adapter.configureDestChain(DestChainConfig{OP_SEPOLIA_CHAIN_SELECTOR, ...})`

### `ConfigureOpSepoliaDestination.s.sol`

Allowlists Arbitrum Sepolia as a destination on the existing OP Sepolia adapter.

```bash
forge script script/ConfigureOpSepoliaDestination.s.sol \
  --rpc-url $OP_SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_KEY \
  --broadcast
```

**Required env vars:** `OP_SEPOLIA_ADAPTER`, `ARB_SEPOLIA_ADAPTER`

---

## Chain Selectors & Addresses

| Chain | Chain Selector | CCIP Router |
|-------|---------------|-------------|
| OP Sepolia | `5224473277236331295` | `0x114A20A10b43D4115e5aeef7345a1A71d2a60C57` |
| Arbitrum Sepolia | `3478487238524512106` | `0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165` |
| Base Sepolia | `10344971235874465080` | `0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93` |

---

## Test Suite

| File | Tests | What's covered |
|------|-------|---------------|
| `CCIPBridgeAdapterOutbound.t.sol` | 19 | Lock/burn, fees, event emission, encoding, fuzz |
| `CCIPBridgeAdapterInbound.t.sol` | 13 | Unlock/mint, replay protection, sender/chain validation, fuzz |
| `WTAGBridgeArbitrum.t.sol` | 25 | OP→Arb, Arb→OP, round-trip, fee estimation, revert cases, fuzz |
| **Total** | **57** | All passing — 1,000 fuzz runs each |

**Round-trip test flow:**
```
lock (OP Sepolia) → CCIP → mint (Arb Sepolia) → burn (Arb Sepolia) → CCIP → unlock (OP Sepolia)
```

**Replay protection:** each transfer has a unique `transferId = keccak256(sender ‖ recipient ‖ amount ‖ destChain ‖ nonce)`. `ccipReceive` reverts if `transferId` already processed.

---

## CI

- **`test.yml`** — Foundry CI on every push/PR: `forge fmt`, `forge build --sizes`, `forge test -vvv`
- **`ci-failure-to-notion.yml`** — On any workflow failure, auto-creates a SUDO AI task in the Notion task database. Skips `sudo/*` branches to prevent feedback loops.

---

## Related

- [CCIP Bridge Adapter (Phase 1)](./CCIP-Bridge-Adapter) — unit test reference, Phase 1 deployment
- [tagit-docs PR #2](https://github.com/TAG-IT-NETWORK/tagit-docs/pull/2) — MDX docs
- [Notion — wTAG Cross-Chain Bridge](https://www.notion.so/3324e3e9a2d381849dead70e1a11b10e) — investor overview

# ReputationStaking — Developer Reference

Agent credibility bond mechanism for AI agents in the TAG IT Network ERC-8004 agent infrastructure.

**Contract:** `src/agent/ReputationStaking.sol`
**Interface:** `src/interfaces/IReputationStaking.sol`
**PR:** [tagit-contracts #7](https://github.com/TAG-IT-NETWORK/tagit-contracts/pull/7)
**Notion:** [AI Agent Ambassador + Pre-Token System](https://www.notion.so/3304e3e9a2d3813a92a9dd5a154c6582) | [Feature Overview](https://www.notion.so/3334e3e9a2d38168b05bd5cddcb215c4)
**tagit-docs PR:** [tagit-docs #17](https://github.com/TAG-IT-NETWORK/tagit-docs/pull/17)

---

## Overview

`ReputationStaking` enforces a **credibility bond**: an agent registrant must stake a configurable minimum of TAGIT tokens before `TAGITAgentIdentity.register()` can complete. Misbehaving agents can be **slashed** by governance (tokens forwarded to treasury). Remaining stake is reclaimed via **unstake** once the agent reaches `DECOMMISSIONED` lifecycle state.

### Design Principles

| Principle | Implementation |
|-----------|---------------|
| Economic accountability | Bond required for registration; slash-on-misbehavior |
| Lifecycle-gated exit | Unstake blocked until agent is `DECOMMISSIONED` |
| CEI pattern | All state-changing functions: Checks → Effects → Interactions |
| Reentrancy safety | `ReentrancyGuard` on `stake`, `unstake`, `slash` |
| Safe token transfers | OpenZeppelin `SafeERC20` throughout |
| Emergency stop | `Pausable` blocks `stake` and `unstake` (slash is always available) |

---

## Contract Details

```solidity
contract ReputationStaking is IReputationStaking, Ownable, Pausable, ReentrancyGuard
```

| Property | Value |
|----------|-------|
| **Solidity** | `^0.8.20` |
| **License** | MIT |
| **Token** | TAGIT ERC-20 (immutable after construction) |
| **Default min bond** | `DEFAULT_MIN_BOND = 100 * 1e18` (100 TAGIT) |
| **Inherits** | Ownable, Pausable, ReentrancyGuard |
| **Author** | TAG IT Network `<dev@tagit.network>` |

---

## Constructor

```solidity
constructor(
    address _tagToken,      // TAGIT ERC-20 address
    address _treasury,      // Destination for slashed tokens
    address _initialOwner   // Contract owner (governance or deployer)
)
```

Reverts with `ZeroAddress()` if any argument is `address(0)`. Sets `minBond = DEFAULT_MIN_BOND`.

---

## State Variables

```solidity
IERC20 public immutable tagToken;           // TAGIT token contract
TAGITAgentIdentity public agentIdentity;    // Agent identity registry
uint256 public minBond;                     // Minimum credibility bond
address public treasury;                    // Destination for slashed tokens

mapping(uint256 => uint256) private _stakes;   // agentId → staked amount
mapping(uint256 => address) private _stakers;  // agentId → staker address
```

---

## Function Signatures

### Staking Functions

#### `stake`

```solidity
function stake(uint256 agentId, uint256 amount) external nonReentrant whenNotPaused
```

Stakes TAGIT tokens as a credibility bond for a specific agent. Caller must be the agent's registrant (verified via `TAGITAgentIdentity.getAgent(agentId)`).

| Parameter | Type | Description |
|-----------|------|-------------|
| `agentId` | `uint256` | Agent token ID to stake for |
| `amount` | `uint256` | TAGIT amount (18 decimals) |

**Reverts:** `ZeroAmount()`, `AgentIdentityNotSet()`, `NotAgentRegistrant(caller, agentId)`
**Emits:** `StakeDeposited(agentId, staker, amount)`
**Access:** Registrant of `agentId` only

---

#### `unstake`

```solidity
function unstake(uint256 agentId) external nonReentrant whenNotPaused
```

Withdraws the full remaining staked balance. Agent must be in `DECOMMISSIONED` lifecycle state.

| Parameter | Type | Description |
|-----------|------|-------------|
| `agentId` | `uint256` | Agent token ID to unstake from |

**Reverts:** `AgentIdentityNotSet()`, `NoStakeToWithdraw(agentId)`, `NotAgentRegistrant(caller, agentId)`, `AgentStillActive(agentId)`
**Emits:** `StakeWithdrawn(agentId, staker, amount)`
**Access:** Original staker (registrant) only

---

#### `slash`

```solidity
function slash(uint256 agentId, uint256 amount) external nonReentrant onlyOwner
```

Slashes a portion of the bond. Slashed tokens are forwarded to `treasury`. Not pausable — governance can always slash.

| Parameter | Type | Description |
|-----------|------|-------------|
| `agentId` | `uint256` | Agent to slash |
| `amount` | `uint256` | Amount to slash |

**Reverts:** `ZeroAmount()`, `SlashExceedsStake(agentId, slashAmount, currentStake)`
**Emits:** `StakeSlashed(agentId, amount, slashedBy)`
**Access:** `onlyOwner`

---

### View Functions

```solidity
function getStake(uint256 agentId) external view returns (uint256)
```
Returns the current staked amount for an agent.

```solidity
function getMinBond() external view returns (uint256)
```
Returns the current minimum bond requirement.

```solidity
function hasMinBond(uint256 agentId) external view returns (bool)
```
Returns `true` if `_stakes[agentId] >= minBond`. Called by `TAGITAgentIdentity` during registration.

```solidity
function getStaker(uint256 agentId) external view returns (address)
```
Returns the staker address for an agent. Returns `address(0)` if no stake.

---

### Admin Functions

```solidity
function setAgentIdentity(address _agentIdentity) external onlyOwner
function setMinBond(uint256 _newMinBond) external onlyOwner
function setTreasury(address _newTreasury) external onlyOwner
function pause() external onlyOwner
function unpause() external onlyOwner
```

---

## Event Schemas

```solidity
event StakeDeposited(
    uint256 indexed agentId,
    address indexed staker,
    uint256 amount
);

event StakeWithdrawn(
    uint256 indexed agentId,
    address indexed staker,
    uint256 amount
);

event StakeSlashed(
    uint256 indexed agentId,
    uint256 amount,
    address indexed slashedBy
);

event MinBondUpdated(uint256 oldMinBond, uint256 newMinBond);

event TreasuryUpdated(
    address indexed oldTreasury,
    address indexed newTreasury
);
```

---

## Custom Errors

```solidity
error ZeroAddress();
error ZeroAmount();
error Unauthorized();
error NoStakeToWithdraw(uint256 agentId);
error SlashExceedsStake(uint256 agentId, uint256 slashAmount, uint256 currentStake);
error AgentStillActive(uint256 agentId);
error InsufficientBond(uint256 agentId, uint256 current, uint256 required);
error NotAgentRegistrant(address caller, uint256 agentId);
error AgentIdentityNotSet();
```

---

## TAGITAgentIdentity Integration

PR #7 also modified `TAGITAgentIdentity` to enforce the credibility bond at registration:

### New State Variable

```solidity
IReputationStaking public reputationStaking;
```

### New Admin Function

```solidity
function setReputationStaking(address stakingContract) external onlyOwner;
// Emits: ReputationStakingUpdated(previousStaking, newStaking)
```

Pass `address(0)` to disable bond enforcement. Emits `ReputationStakingUpdated`.

### Registration Gate (added to `register()`)

```solidity
if (address(reputationStaking) != address(0)) {
    if (!reputationStaking.hasMinBond(agentId)) {
        revert InsufficientCredibilityBond(agentId);
    }
}
```

### New Error

```solidity
error InsufficientCredibilityBond(uint256 agentId);
```

### New Event

```solidity
event ReputationStakingUpdated(
    address indexed previousStaking,
    address indexed newStaking
);
```

---

## Credibility Bond Lifecycle

```
Registrant                ReputationStaking         TAGITAgentIdentity
    │                            │                         │
    │── stake(agentId, 100e18) ─>│                         │
    │   [TAGIT transferred]      │                         │
    │                            │                         │
    │──────────────────────────────── register(agentId) ──>│
    │                            │<── hasMinBond(agentId) ─│
    │                            │─── true ─────────────── │
    │                            │                   [ACTIVE]
    │                                                      │
    │          [Agent operates...]                         │
    │                                                      │
    Owner ─── slash(agentId, 50e18) ─>│                   │
    │   [50 TAGIT → treasury]         │                   │
    │                                 │                   │
    Owner ─── decommissionAgent(agentId) ─────────────────>│
    │                                                [DECOMMISSIONED]
    │                                                      │
    │── unstake(agentId) ─────────>│                       │
    │   [50 TAGIT remaining → registrant]                  │
```

---

## Deployment Wiring

```solidity
// 1. Deploy ReputationStaking
ReputationStaking staking = new ReputationStaking(
    tagitTokenAddress,
    treasuryAddress,
    governanceMultisig
);

// 2. Wire to AgentIdentity
staking.setAgentIdentity(agentIdentityAddress);
agentIdentity.setReputationStaking(address(staking));

// 3. Registrant stakes before calling register()
tagitToken.approve(address(staking), 100e18);
staking.stake(agentId, 100e18);
agentIdentity.register(agentId, uri, wallet, sig);
```

---

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `DEFAULT_MIN_BOND` | `100 * 1e18` | Default minimum bond (100 TAGIT tokens) |

---

## Test Coverage

| File | Lines | Coverage |
|------|-------|---------|
| `test/unit/agent/ReputationStaking.t.sol` | 545 | Unit: stake, unstake, slash, admin, edge cases |
| `test/integration/Phase3Integration.t.sol` | 284 | Integration with `TAGITAgentIdentity` |

---

## Security Analysis

| Concern | Mitigation |
|---------|-----------|
| Reentrancy | `ReentrancyGuard` on all state-changing functions |
| Token theft | CEI pattern — state cleared before transfer in `unstake`/`slash` |
| Premature unstake | Requires `DECOMMISSIONED` lifecycle state |
| Unauthorized slash | `onlyOwner` — governance multisig |
| Slash overflow | `SlashExceedsStake` guard prevents over-slashing |
| Zero transfers | `ZeroAmount()` guard on `stake` and `slash` |
| Unsafe transfers | `SafeERC20.safeTransfer` / `safeTransferFrom` throughout |

---

## Related

- [TAGITAgentIdentity](./TAGITAgentIdentity) — Agent registry with registration gate
- [TAGITAgentReputation](./TAGITAgentReputation) — Time-weighted feedback scoring
- [wTAG](./wTAG) — Governance pre-token (Token House voting)
- [tagit-docs reference](https://github.com/TAG-IT-NETWORK/tagit-docs/blob/main/docs/contracts/reputation-staking.mdx)
- [Notion feature overview](https://www.notion.so/3334e3e9a2d38168b05bd5cddcb215c4)

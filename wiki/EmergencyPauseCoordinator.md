# EmergencyPauseCoordinator — Developer Reference

Unified emergency pause coordinator for all TAG IT PRD-017 protocol contracts.

**Contract:** `src/emergency/EmergencyPauseCoordinator.sol`
**Interface:** `src/interfaces/IEmergencyPauseCoordinator.sol`
**Pauseable Interface:** `src/interfaces/IEmergencyPauseable.sol`
**PR:** [tagit-contracts #8](https://github.com/TAG-IT-NETWORK/tagit-contracts/pull/8)
**Notion:** [Emergency Pause Coordinator — Feature Overview](https://www.notion.so/3334e3e9a2d3813384bdfb20b410409d)
**tagit-docs PR:** [tagit-docs #7](https://github.com/TAG-IT-NETWORK/tagit-docs/pull/7)

---

## Overview

`EmergencyPauseCoordinator` maintains an `EnumerableSet` registry of `IEmergencyPauseable` contracts covering all six PRD-017 participants (wTAG, Voucher, AgentRegistry, AgentWallet, AgentEscrow, VoucherMigrator). A single call to `pauseAll()` iterates the registry and invokes `coordinatorPause()` on each contract atomically.

### Design Principles

| Principle | Implementation |
|-----------|---------------|
| Atomic batch operations | `EnumerableSet` iteration with try/catch isolation |
| Fault-tolerant batching | Individual failures → `ContractPauseFailed` event; batch continues |
| Three-state circuit breaker | `ACTIVE → PAUSED → ACTIVE` (normal), escalation to `EMERGENCY` (admin-only) |
| Role separation | `PAUSER_ROLE` for ops; `DEFAULT_ADMIN_ROLE` (multi-sig) to clear `EMERGENCY` |
| Full audit trail | All state transitions emit `SystemStateChanged` |
| NIST CSF 2.0 | RS-RP, RS-MI, DE-AE, PR-AC controls implemented |

---

## Contract Details

```solidity
contract EmergencyPauseCoordinator is AccessControl, IEmergencyPauseCoordinator
```

| Property | Value |
|----------|-------|
| **Solidity** | `^0.8.20` |
| **License** | MIT |
| **Inherits** | `AccessControl` (OZ), `IEmergencyPauseCoordinator` |
| **Author** | TAG IT Network `<dev@tagit.network>` |
| **Security contact** | `security@tagit.network` |

---

## SystemState Enum

```solidity
enum SystemState {
    ACTIVE,     // Protocol operating normally
    PAUSED,     // Batch-paused; PAUSER_ROLE can unpause
    EMERGENCY   // Lockdown; only DEFAULT_ADMIN_ROLE can unpause
}
```

### State Machine

```
ACTIVE  ──pauseAll()──────────────────────► PAUSED
         [PAUSER_ROLE]                        │
           │                                  │ unpauseAll() [PAUSER_ROLE]
           │                                  ▼
           │                               ACTIVE
           │
           └─escalateToEmergency()──────► EMERGENCY
             [PAUSER_ROLE]                    │
                                              │ unpauseAll() [DEFAULT_ADMIN_ROLE only]
                                              ▼
                                           ACTIVE

PAUSED  ──escalateToEmergency()──────────► EMERGENCY
          [PAUSER_ROLE]
```

---

## Constructor

```solidity
constructor(address admin, address pauser)
```

| Parameter | Description |
|-----------|-------------|
| `admin` | Receives `DEFAULT_ADMIN_ROLE`; should be a multi-sig |
| `pauser` | Receives `PAUSER_ROLE`; initial ops account or monitoring bot |

Reverts `ZeroAddress()` if either is `address(0)`. Initialises `_systemState = SystemState.ACTIVE`.

---

## State Variables

```solidity
bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

EnumerableSet.AddressSet private _registry;   // Registered IEmergencyPauseable contracts
SystemState private _systemState;             // Current circuit-breaker state
```

---

## Function Signatures

### Registry Management

#### `registerContract`

```solidity
function registerContract(address contractAddress) external onlyRole(DEFAULT_ADMIN_ROLE)
```

Adds `contractAddress` to the pause registry. Must be a deployed contract (not EOA) implementing `IEmergencyPauseable`.

| Reverts | Condition |
|---------|-----------|
| `ZeroAddress()` | Address is `address(0)` |
| `NotAContract(address)` | `contractAddress.code.length == 0` |
| `AlreadyRegistered(address)` | Already in registry |

Emits: `ContractRegistered(contractAddress, msg.sender)`

#### `deregisterContract`

```solidity
function deregisterContract(address contractAddress) external onlyRole(DEFAULT_ADMIN_ROLE)
```

Removes `contractAddress` from the pause registry.

| Reverts | Condition |
|---------|-----------|
| `ZeroAddress()` | Address is `address(0)` |
| `NotRegistered(address)` | Not in registry |

Emits: `ContractDeregistered(contractAddress, msg.sender)`

---

### Pause / Unpause

#### `pauseAll`

```solidity
function pauseAll() external onlyRole(PAUSER_ROLE)
```

Iterates registry; calls `IEmergencyPauseable(target).coordinatorPause()` on each entry inside a `try/catch`. Failures emit `ContractPauseFailed` and execution continues. Transitions `_systemState` from `ACTIVE` to `PAUSED`.

| Reverts | Condition |
|---------|-----------|
| `AlreadyPaused()` | `_systemState != SystemState.ACTIVE` |

Emits: `SystemStateChanged(ACTIVE, PAUSED, msg.sender)`, `PauseTriggered(msg.sender, count, timestamp)`

#### `unpauseAll`

```solidity
function unpauseAll() external
```

Caller requirements:

| `_systemState` | Required caller role |
|----------------|---------------------|
| `PAUSED` | `PAUSER_ROLE` |
| `EMERGENCY` | `DEFAULT_ADMIN_ROLE` |

Iterates registry; calls `coordinatorUnpause()` on each entry (same fault-tolerant try/catch). Transitions `_systemState` to `ACTIVE`.

| Reverts | Condition |
|---------|-----------|
| `NotPaused()` | `_systemState == SystemState.ACTIVE` |
| `EmergencyRequiresAdmin()` | In `EMERGENCY` and caller lacks `DEFAULT_ADMIN_ROLE` |
| `AccessControlUnauthorizedAccount` | In `PAUSED` and caller lacks `PAUSER_ROLE` |

Emits: `SystemStateChanged(oldState, ACTIVE, msg.sender)`, `UnpauseTriggered(msg.sender, count, timestamp)`

#### `escalateToEmergency`

```solidity
function escalateToEmergency() external onlyRole(PAUSER_ROLE)
```

Transitions to `EMERGENCY`. If called from `ACTIVE`, first executes a full batch pause (emitting `PauseTriggered`). Once in `EMERGENCY`, only `DEFAULT_ADMIN_ROLE` can call `unpauseAll()`.

| Reverts | Condition |
|---------|-----------|
| `InvalidSystemState(current, required)` | Already in `EMERGENCY` |

Emits: `SystemStateChanged(oldState, EMERGENCY, msg.sender)`

---

### View Functions

```solidity
function getRegistry() external view returns (address[] memory)
function isRegistered(address contractAddress) external view returns (bool)
function systemState() external view returns (SystemState)
function registeredCount() external view returns (uint256)
```

---

## Event Schemas

```solidity
event ContractRegistered(
    address indexed contractAddress,
    address indexed registeredBy
);

event ContractDeregistered(
    address indexed contractAddress,
    address indexed deregisteredBy
);

event PauseTriggered(
    address indexed triggeredBy,
    uint256 contractCount,
    uint256 timestamp
);

event UnpauseTriggered(
    address indexed triggeredBy,
    uint256 contractCount,
    uint256 timestamp
);

event SystemStateChanged(
    SystemState indexed oldState,
    SystemState indexed newState,
    address indexed changedBy
);

event ContractPauseFailed(
    address indexed contractAddress,
    bytes reason
);
```

---

## Custom Errors

```solidity
error AlreadyRegistered(address contractAddress);
error NotRegistered(address contractAddress);
error ZeroAddress();
error NotAContract(address addr);
error AlreadyPaused();
error NotPaused();
error InvalidSystemState(SystemState current, SystemState required);
error EmergencyRequiresAdmin();
```

---

## IEmergencyPauseable Interface

Any PRD-017 contract participating in coordinated pauses must implement:

```solidity
interface IEmergencyPauseable {
    event CoordinatorUpdated(
        address indexed oldCoordinator,
        address indexed newCoordinator
    );

    error OnlyCoordinator(address caller, address coordinator);
    error CoordinatorZeroAddress();

    /// @dev MUST only be callable by the registered EmergencyPauseCoordinator
    function coordinatorPause() external;

    /// @dev MUST only be callable by the registered EmergencyPauseCoordinator
    function coordinatorUnpause() external;

    function setCoordinator(address coordinator) external;
    function coordinator() external view returns (address);
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                   EmergencyPauseCoordinator                          │
│                                                                     │
│  Roles:  DEFAULT_ADMIN_ROLE (multi-sig)   PAUSER_ROLE (guardian)    │
│                                                                     │
│  Registry (EnumerableSet):                                          │
│  ┌──────────┐ ┌─────────┐ ┌──────────────┐ ┌─────────────────────┐ │
│  │  wTAG    │ │ Voucher │ │ AgentRegistry│ │ AgentWallet / ...   │ │
│  └──────────┘ └─────────┘ └──────────────┘ └─────────────────────┘ │
│       ↑           ↑              ↑                   ↑              │
│       └───────────┴──────────────┴───────────────────┘              │
│                       coordinatorPause()                            │
│                       coordinatorUnpause()                          │
│                    (IEmergencyPauseable interface)                  │
│                                                                     │
│  State Machine: ACTIVE ──► PAUSED ──► ACTIVE                        │
│                    └───────────────► EMERGENCY ──► ACTIVE           │
│                         (admin-only clear)                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Integration Example

```solidity
// 1. Deploy coordinator (one-time, from multi-sig)
EmergencyPauseCoordinator coordinator = new EmergencyPauseCoordinator(
    multisigAddress,  // DEFAULT_ADMIN_ROLE
    guardianAddress   // PAUSER_ROLE
);

// 2. Register all PRD-017 contracts (admin)
coordinator.registerContract(address(wTAG));
coordinator.registerContract(address(voucher));
coordinator.registerContract(address(agentRegistry));
coordinator.registerContract(address(agentWallet));
coordinator.registerContract(address(agentEscrow));
coordinator.registerContract(address(voucherMigrator));

// 3. Point each contract to the coordinator
wTAG.setCoordinator(address(coordinator));
voucher.setCoordinator(address(coordinator));
// ... repeat for all six

// 4. In an emergency — single call pauses everything
coordinator.pauseAll();                 // → PAUSED state

// 5. Selective recovery
wTAG.setCoordinator(address(0));        // Disconnect from batch control if needed
coordinator.unpauseAll();               // → ACTIVE state (PAUSER_ROLE)

// 6. Escalate to lockdown (requires admin to clear)
coordinator.escalateToEmergency();      // → EMERGENCY state
// ... multi-sig review ...
coordinator.unpauseAll();               // Only DEFAULT_ADMIN_ROLE can do this
```

---

## Test Coverage

| File | Lines | Scope |
|------|-------|-------|
| `test/EmergencyPauseCoordinator.t.sol` | 473 | Unit: registration, state transitions, role checks, error paths, event assertions |
| `test/EmergencyPauseIntegration.t.sol` | 245 | Integration: pause-all → verify-all-revert → unpause selectively → forge test passing |
| `test/mocks/MockPauseableContract.sol` | 55 | `IEmergencyPauseable` harness mock |

---

## Security Notes

- `EMERGENCY` state can only be cleared by `DEFAULT_ADMIN_ROLE` — intended for multi-sig custody.
- Batch iterations use `try/catch` so a single reverting contract never blocks the emergency system.
- Registry is managed exclusively by `DEFAULT_ADMIN_ROLE`; EOA addresses are rejected at registration.
- All lifecycle state transitions emit `SystemStateChanged` for a complete on-chain audit trail.
- `PAUSER_ROLE` cannot re-assign roles; privilege escalation path is closed.

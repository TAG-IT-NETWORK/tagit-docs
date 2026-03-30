# TAGITAccountFactory & TAGITCoreDemo — Test Suite Reference

> **Task**: 4E. Write tests for ALL other new contracts SUDO created (Agent, Pause, Anchoring, etc.)
> (ID: `3334e3e9-a2d3-81e1-9b59-d3440b762b19`)
> **Contracts PR**: [tagit-contracts #22](https://github.com/TAG-IT-NETWORK/tagit-contracts/pull/22)
> **Docs PR**: [tagit-docs #12](https://github.com/TAG-IT-NETWORK/tagit-docs/pull/12)
> **Notion**: [Account Factory & Core Demo — Test Suite Overview](https://www.notion.so/3334e3e9a2d381e19b59d3440b762b19)
> **tagit-docs MDX**: [Account Factory & Core Demo — Test Suites](https://github.com/TAG-IT-NETWORK/tagit-docs/blob/main/docs/contracts/account-factory-core-tests.mdx)

---

## Table of Contents

1. [Overview](#overview)
2. [TAGITAccountFactory — Contract Architecture](#tagiaccountfactory--contract-architecture)
3. [TAGITAccountFactory — Interface & Errors](#tagitaccountfactory--interface--errors)
4. [TAGITAccountFactory — Test Coverage](#tagitaccountfactory--test-coverage)
5. [TAGITCoreDemo — Contract Architecture](#tagitcoredemo--contract-architecture)
6. [TAGITCoreDemo — Interface & Events](#tagitcoredemo--interface--events)
7. [TAGITCoreDemo — Test Coverage](#tagitcoredemo--test-coverage)
8. [Test Fixtures & Mocks](#test-fixtures--mocks)
9. [Running the Tests](#running-the-tests)
10. [Coverage Targets](#coverage-targets)

---

## Overview

PR [tagit-contracts #22](https://github.com/TAG-IT-NETWORK/tagit-contracts/pull/22) adds **901 lines** of Foundry unit tests across two suites:

| Contract | Test File | Lines | Test Functions |
|---|---|---|---|
| `TAGITAccountFactory` | `test/unit/TAGITAccountFactory.t.sol` | 581 | 35 |
| `TAGITCoreDemo` | `test/unit/TAGITCoreDemo.t.sol` | 320 | 25 |

Both suites include **fuzz tests** (1,000 runs each by default, configurable via `--fuzz-runs`).

---

## TAGITAccountFactory — Contract Architecture

`TAGITAccountFactory` is a **UUPS-upgradeable** factory contract that creates deterministic ERC-4337 smart accounts for TAG IT users. Account addresses are derived from an email hash (PATCH-15) and a salt rather than a direct owner address, enabling privacy-preserving, email-gated onboarding.

```
┌────────────────────────────────────────────────────────────┐
│                  TAGITAccountFactory (UUPS)                 │
│                                                            │
│  Role Hierarchy                                            │
│  ──────────────                                            │
│  owner ──► setGovernor, setProtocolGuardian, upgradeTo     │
│  governor ──► verifyEmail, setImplementation,              │
│               setEmailVerifier                             │
│  emailVerifier ──► verifyEmail                             │
│                                                            │
│  Email Verification Flow (PATCH-15)                        │
│  ──────────────────────────────────                        │
│  governor/emailVerifier                                    │
│      │                                                     │
│      ▼ verifyEmail(emailHash)                              │
│  _verifiedEmails[emailHash] = true                         │
│      │                                                     │
│      ▼ createAccount(emailHash, salt)  ◄── any caller      │
│  consume verification (set false)                          │
│  deploy ERC1967Proxy(accountImpl, init)                    │
│  emit AccountCreated(account, emailHash, salt, owner)      │
└────────────────────────────────────────────────────────────┘
```

**Deterministic address formula:**

```
address = CREATE2(
    salt  = keccak256(abi.encodePacked(emailHash, salt)),
    init  = ERC1967Proxy(accountImpl, initData)
)
```

---

## TAGITAccountFactory — Interface & Errors

### Function Signatures

```solidity
// Initialization (called once via proxy constructor)
function initialize(
    address entryPoint_,
    address accountImpl_,
    address protocolGuardian_,
    address tagitCore_,
    address governor_,
    address owner_
) external;

// Email Verification — PATCH-15
function verifyEmail(bytes32 emailHash) external;
function isEmailVerified(bytes32 emailHash) external view returns (bool);

// Account Creation
function createAccount(bytes32 emailHash, uint256 salt)
    external returns (address account);

function createAccountWithOwner(bytes32 emailHash, uint256 salt, address owner_)
    external returns (address account);

// Deterministic Addressing
function getAddress(bytes32 emailHash, uint256 salt)
    external view returns (address);

function getAccountByEmail(bytes32 emailHash)
    external view returns (address);

// View State
function entryPoint()           external view returns (address);
function accountImplementation() external view returns (address);
function protocolGuardian()     external view returns (address);
function tagitCore()            external view returns (address);
function governor()             external view returns (address);
function emailVerifier()        external view returns (address);
function totalAccounts()        external view returns (uint256);
function isAccount(address)     external view returns (bool);
function version()              external view returns (string memory); // "1.0.0"

// Admin — governor only
function setImplementation(address newImpl)       external;
function setEmailVerifier(address newVerifier)    external;

// Admin — owner only
function setGovernor(address newGovernor)         external;
function setProtocolGuardian(address newGuardian) external;
```

### Events

```solidity
event AccountCreated(
    address indexed account,
    bytes32 indexed emailHash,
    uint256         salt,
    address indexed owner
);
event ImplementationUpdated(address indexed oldImpl, address indexed newImpl);
event ProtocolGuardianUpdated(address indexed oldGuardian, address indexed newGuardian);
event GovernorUpdated(address indexed oldGovernor, address indexed newGovernor);
event EmailVerified(bytes32 indexed emailHash, address indexed verifier);
event EmailVerifierUpdated(address indexed oldVerifier, address indexed newVerifier);
```

### Custom Errors

```solidity
error ZeroAddress();                     // null addr passed to init or setters
error InvalidEmailHash();               // bytes32(0) passed as email hash
error EmailNotVerified(bytes32);        // createAccount before verifyEmail
error NotAuthorized(address caller);    // wrong role on restricted function
```

---

## TAGITAccountFactory — Test Coverage

### Test Matrix

| Category | Test | What It Verifies |
|---|---|---|
| Init | `test_initialize_setsStateCorrectly` | All 6 storage vars (entryPoint, accountImpl, protocolGuardian, tagitCore, governor, totalAccounts=0) |
| Init | `test_initialize_setsOwner` | `owner()` matches `factoryOwner` |
| Init | `test_initialize_revertsZeroEntryPoint` | `ZeroAddress` on null entryPoint |
| Init | `test_initialize_revertsZeroAccountImpl` | `ZeroAddress` on null accountImpl |
| Init | `test_initialize_revertsZeroGovernor` | `ZeroAddress` on null governor |
| Init | `test_initialize_revertsZeroOwner` | `ZeroAddress` on null owner |
| Init | `test_initialize_cannotReinitialize` | UUPS proxy re-init guard |
| Init | `test_version` | Returns `"1.0.0"` |
| Email | `test_verifyEmail_byGovernor` | Storage set + `EmailVerified` event emitted |
| Email | `test_verifyEmail_byEmailVerifier` | Works after `setEmailVerifier` |
| Email | `test_verifyEmail_revertsNotAuthorized` | `NotAuthorized(attacker)` |
| Email | `test_verifyEmail_revertsZeroHash` | `InvalidEmailHash` |
| Email | `test_isEmailVerified_defaultFalse` | Unverified hash returns false |
| Create | `test_createAccount_success` | address matches `getAddress`, `isAccount` true, `totalAccounts` = 1 |
| Create | `test_createAccount_emitsEvent` | `AccountCreated(predicted, emailHash, salt, user1)` |
| Create | `test_createAccount_consumesEmailVerification` | `isEmailVerified` → false after creation |
| Create | `test_createAccount_returnsExistingIfDeployed` | Idempotent; `totalAccounts` stays 1 |
| Create | `test_createAccount_revertsZeroEmailHash` | `InvalidEmailHash` |
| Create | `test_createAccount_revertsUnverifiedEmail` | `EmailNotVerified(emailHash)` |
| CreateWithOwner | `test_createAccountWithOwner_success` | `owner` param used, not `msg.sender` |
| CreateWithOwner | `test_createAccountWithOwner_emitsEvent` | `AccountCreated(..., user2)` |
| CreateWithOwner | `test_createAccountWithOwner_revertsZeroOwner` | `ZeroAddress` |
| CreateWithOwner | `test_createAccountWithOwner_revertsZeroEmailHash` | `InvalidEmailHash` |
| CreateWithOwner | `test_createAccountWithOwner_returnsExistingIfDeployed` | Idempotent |
| Addressing | `test_getAddress_deterministicAcrossCalls` | Same inputs → same address |
| Addressing | `test_getAddress_differentEmailsYieldDifferentAddresses` | Hash isolation |
| Addressing | `test_getAddress_differentSaltsYieldDifferentAddresses` | Salt isolation |
| Addressing | `test_isAccount_defaultFalse` | Non-factory address returns false |
| Admin | `test_setImplementation_success` | Storage updated + event |
| Admin | `test_setImplementation_revertsNotGovernor` | `NotAuthorized` |
| Admin | `test_setGovernor_*`, `test_setProtocolGuardian_*`, `test_setEmailVerifier_*` | Each: happy path + access control |
| View | `test_getAccountByEmail_returnsZeroIfNotDeployed` | Default zero |
| View | `test_getAccountByEmail_returnsCorrectAccount` | Maps after creation |
| Multi | `test_multipleAccounts_incrementsTotalAccounts` | Counter increments per unique account |
| Fuzz | `testFuzz_getAddress_deterministic` | `∀ emailHash≠0, salt: getAddress stable` |
| Fuzz | `testFuzz_differentInputsProduceDifferentAddresses` | `∀ hash1≠hash2: addr1≠addr2` |

---

## TAGITCoreDemo — Contract Architecture

`TAGITCoreDemo` is a **non-upgradeable demonstration contract** for the TAG IT asset lifecycle. It is used in hackathons, integration demos, and internal testing. It implements the same 7-state lifecycle as production `TAGITCore.sol` but without transition guards, making it suitable for demo and exploratory testing.

```
┌─────────────────────────────────────────────────────────────────┐
│                        TAGITCoreDemo                             │
│                                                                 │
│  Lifecycle States                                               │
│  ────────────────                                               │
│  NONE(0) → MINTED(1) → BOUND(2) → ACTIVATED(3)                 │
│                                        │                        │
│                                   CLAIMED(4)                    │
│                                        │                        │
│                                   FLAGGED(5) ─► CLAIMED(4)      │
│                                        │         (recovery)     │
│                                   RECYCLED(6)   [terminal]      │
│                                                                 │
│  Note: TAGITCoreDemo does NOT enforce transition ordering.      │
│  Any state can be set by admin — canonical guards live in       │
│  production TAGITCore.sol.                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## TAGITCoreDemo — Interface & Events

### Function Signatures

```solidity
// Constructor
constructor(); // sets admin = msg.sender

// Mutative — admin only
function mint(uint256 tokenId, string calldata name) external;
function changeState(uint256 tokenId, State newState) external;

// View
function admin() external view returns (address);
function totalAssets() external view returns (uint256);
function getAsset(uint256 tokenId) external view returns (Asset memory);
function getTokenIds() external view returns (uint256[] memory);

// Auto-generated public getters
function assets(uint256 tokenId)
    external view returns (
        string memory name,
        State state,
        address owner,
        uint256 mintedAt,
        uint256 lastUpdated
    );
function tokenIds(uint256 index) external view returns (uint256);
```

### Data Structures

```solidity
enum State {
    NONE,       // 0 — default / non-existent
    MINTED,     // 1 — asset created, no physical binding yet
    BOUND,      // 2 — NFC tag cryptographically bound
    ACTIVATED,  // 3 — QA verified, market-ready
    CLAIMED,    // 4 — owned by end consumer
    FLAGGED,    // 5 — lost / stolen / under investigation
    RECYCLED    // 6 — end of life (terminal)
}

struct Asset {
    string  name;
    State   state;
    address owner;
    uint256 mintedAt;
    uint256 lastUpdated;
}
```

### Events

```solidity
event AssetMinted(
    uint256 indexed tokenId,
    string          name,
    address         owner
);
event StateChanged(
    uint256 indexed tokenId,
    State           oldState,
    State           newState,
    address         changedBy
);
```

### Custom Errors

```solidity
error NotAdmin();       // caller is not admin
error AlreadyExists();  // tokenId already minted
error DoesNotExist();   // tokenId not found in changeState
```

---

## TAGITCoreDemo — Test Coverage

### Test Matrix

| Category | Test | What It Verifies |
|---|---|---|
| Constructor | `test_constructor_setsAdmin` | `admin()` = deployer |
| Constructor | `test_constructor_startsWithZeroAssets` | `totalAssets()` = 0 |
| mint | `test_mint_success` | `name`, `state=MINTED`, `owner=admin`, `mintedAt=block.timestamp`, `lastUpdated=block.timestamp` |
| mint | `test_mint_emitsEvent` | `AssetMinted(tokenId, name, admin)` |
| mint | `test_mint_incrementsTotalAssets` | 0 → 1 → 2 |
| mint | `test_mint_addsToTokenIds` | `getTokenIds()` length and contents |
| mint | `test_mint_revertsNotAdmin` | `NotAdmin` on attacker |
| mint | `test_mint_revertsAlreadyExists` | `AlreadyExists` on duplicate tokenId |
| changeState | `test_changeState_success` | State field updated |
| changeState | `test_changeState_emitsEvent` | `StateChanged(tokenId, old, new, admin)` |
| changeState | `test_changeState_updatesLastUpdated` | `lastUpdated` = new timestamp; `mintedAt` unchanged |
| changeState | `test_changeState_revertsNotAdmin` | `NotAdmin` |
| changeState | `test_changeState_revertsDoesNotExist` | `DoesNotExist` on unknown tokenId |
| Lifecycle | `test_fullLifecycle_mintThroughRecycled` | MINTED→BOUND→ACTIVATED→CLAIMED→FLAGGED→RECYCLED |
| Lifecycle | `test_lifecycle_flaggedToClaimedRecovery` | FLAGGED→CLAIMED recovery path |
| View | `test_getAsset_returnsDefaultForNonExistent` | `state=NONE`, `owner=address(0)`, empty name |
| View | `test_getTokenIds_emptyInitially` | Empty array on fresh deploy |
| View | `test_totalAssets_matchesTokenIds` | Counter == `getTokenIds().length` |
| View | `test_assets_publicGetter` | Tuple destructuring of mapping getter |
| View | `test_tokenIds_publicGetter` | Array index access |
| Edge | `test_mint_withTokenIdZero` | tokenId = 0 valid |
| Edge | `test_mint_withEmptyName` | Empty name string valid |
| Edge | `test_changeState_toSameState` | No-op transition allowed |
| Fuzz | `testFuzz_mint_arbitraryTokenId(uint256)` | Any tokenId mints correctly |
| Fuzz | `testFuzz_changeState_allValidStates(uint8)` | `bound(x,1,6)` covers all 6 non-NONE states |

---

## Test Fixtures & Mocks

```solidity
// Used by TAGITAccountFactoryTest only
// TAGITCoreDemo has zero external dependencies — no mocks needed

contract MockEntryPointForFactory {
    // ERC-4337 EntryPoint stub
    function depositTo(address account) external payable;
    function balanceOf(address account) external view returns (uint256);
    function getNonce(address, uint192) external pure returns (uint256); // returns 0
    function addStake(uint32) external payable;
    function unlockStake() external;
    function withdrawStake(address payable) external;
    function withdrawTo(address payable, uint256) external;
    receive() external payable;
}

contract MockTAGITCoreForFactory {
    // TAGITCore stub (ownerOf only)
    function ownerOf(uint256) external pure returns (address); // returns address(0)
}
```

---

## Running the Tests

```bash
cd tagit-contracts

# Run TAGITAccountFactory suite
forge test --match-path "test/unit/TAGITAccountFactory.t.sol" -vvv

# Run TAGITCoreDemo suite
forge test --match-path "test/unit/TAGITCoreDemo.t.sol" -vvv

# Run both suites
forge test --match-path "test/unit/TAGIT*" -vvv

# Run with higher fuzz runs (CI recommendation: 10,000)
forge test --fuzz-runs 10000 --match-test "testFuzz" -vvv

# Full coverage report
forge coverage --report lcov
```

---

## Coverage Targets

Per task acceptance criteria, each test file must achieve **>90% line coverage** and aggregate project coverage must stay **above 85%**.

| File | Target | Test File |
|---|---|---|
| `src/account/TAGITAccountFactory.sol` | ≥90% lines | `test/unit/TAGITAccountFactory.t.sol` |
| `src/core/TAGITCoreDemo.sol` | ≥90% lines | `test/unit/TAGITCoreDemo.t.sol` |
| **Aggregate** | ≥85% | All suites combined |

Run `forge coverage --report summary` to verify before merging.

---

## Related Pages

- [TAGITAccountFactory](https://github.com/TAG-IT-NETWORK/tagit-docs/blob/main/docs/contracts/tagit-account-factory.md) — Contract overview
- [TAGITAccount](https://github.com/TAG-IT-NETWORK/tagit-docs/blob/main/docs/contracts/tagit-account.md) — ERC-4337 smart wallet implementation
- [TAGITCore](https://github.com/TAG-IT-NETWORK/tagit-docs/blob/main/docs/contracts/tagit-core.md) — Production lifecycle state machine
- [tagit-docs MDX](https://github.com/TAG-IT-NETWORK/tagit-docs/blob/main/docs/contracts/account-factory-core-tests.mdx) — Full developer reference
- [Notion Wiki](https://www.notion.so/3334e3e9a2d381e19b59d3440b762b19) — Task page & investor summary

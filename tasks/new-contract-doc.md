# Task: Document New Contract Function

## Purpose
Create consistent, high-quality documentation for smart contract functions.

## Input Required
Provide the following information:
- **Contract name**: e.g., TAGITCore, TAGITAccess
- **Function name**: e.g., mint, bind, verify
- **Function signature**: Full Solidity signature
- **Purpose**: What does this function do?
- **Access control**: Who can call it? (public, owner, role-based)

## Output Structure

Generate documentation with:

1. **Function Overview** — One paragraph description
2. **Parameters Table** — Name, type, description for each param
3. **Returns Table** — Type and description
4. **Access Control** — Required roles/permissions
5. **Events Emitted** — Which events fire on success
6. **Solidity Signature** — Contract code
7. **SDK Examples** — TypeScript, Kotlin, Swift
8. **Security Notes** — Any security considerations
9. **Related Functions** — Links to related docs

## File Location
`docs/contracts/[contract-name].md`

## Example Prompt
```
Document the bind() function in TAGITCore:
- Signature: function bind(uint256 tokenId, bytes32 chipId, bytes calldata signature) external
- Purpose: Cryptographically binds an NFC chip to a minted asset NFT
- Access: BINDER_ROLE required
- Events: AssetBound(tokenId, chipId, timestamp)
```

# Task: Add Glossary Term

## Purpose
Maintain a consistent, comprehensive glossary.

## Input Required
- **Term**: The word or phrase to define
- **Definition**: Clear, concise explanation
- **Category** (optional): Technical, Business, Protocol
- **Related terms** (optional): Cross-references

## Output Structure

Add entry to `docs/glossary.md` in **alphabetical order**:

```markdown
### Term Name

**Definition**: Clear explanation in 1-2 sentences.

**Category**: Technical | Business | Protocol

**Example**: Usage in context (if helpful).

**See also**: [Related Term 1](./glossary.md#related-term-1), [Related Term 2](./glossary.md#related-term-2)
```

## File Location
`docs/glossary.md`

## Example Prompt
```
Add glossary term:
- Term: Binding Ceremony
- Definition: The cryptographic process of linking a physical NFC chip to an on-chain Digital Twin, creating an immutable association.
- Category: Protocol
- Related: Digital Twin, NFC, TAGITCore
```

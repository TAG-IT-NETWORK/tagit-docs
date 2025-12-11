# Task: Create Architecture Diagram

## Purpose
Create clear, consistent architecture visualizations.

## Input Required
- **Diagram type**: Flowchart, sequence, state, class, ER
- **Components**: List of systems/actors involved
- **Flows**: How data/control moves between components
- **Scope**: What is in/out of scope for this diagram

## Output Structure

1. **Diagram Title** — Clear, descriptive name
2. **Mermaid Code** — Properly formatted diagram
3. **Component Legend** — What each shape/color means
4. **Flow Description** — Step-by-step narrative
5. **Notes** — Edge cases, assumptions

## Mermaid Conventions

| Component Type | Shape | Example |
|---------------|-------|---------|
| User/Actor | Circle | `((User))` |
| Service | Rectangle | `[Service]` |
| Database | Cylinder | `[(Database)]` |
| Smart Contract | Hexagon | `{{Contract}}` |
| External System | Parallelogram | `[/External/]` |

## File Location
`docs/architecture/[diagram-name].md`

## Example Prompt
```
Create sequence diagram for asset verification:
- Actor: Mobile App (ORACULAR)
- Components: API Gateway, Verification Service, TAGITCore Contract, Event Indexer
- Flow: User scans NFC -> challenge generated -> chip responds -> contract verifies -> result returned
```

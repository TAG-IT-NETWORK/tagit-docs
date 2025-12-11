# Task: Document New API Endpoint

## Purpose
Create consistent API endpoint documentation.

## Input Required
- **HTTP Method**: GET, POST, PUT, DELETE, PATCH
- **Path**: e.g., `/api/v1/assets/{id}/verify`
- **Description**: What does this endpoint do?
- **Auth**: Required authentication (API key, JWT, none)
- **Request body**: Schema (if applicable)
- **Response**: Success and error schemas

## Output Structure

1. **Endpoint Summary** — Method, path, one-line description
2. **Authentication** — Required auth method
3. **Path Parameters** — Table of URL params
4. **Query Parameters** — Table of query params
5. **Request Body** — JSON schema with example
6. **Response** — Success response schema + example
7. **Error Codes** — Table of possible errors
8. **cURL Example** — Copy-paste ready
9. **SDK Examples** — TypeScript, Kotlin, Swift

## File Location
`docs/api/endpoints/[resource].md`

## Example Prompt
```
Document POST /api/v1/assets/verify:
- Purpose: Verify an asset's authenticity via NFC challenge-response
- Auth: API key required
- Body: { tokenId: number, challenge: string, response: string }
- Success: { verified: boolean, timestamp: string, metadata: object }
- Errors: 400 (invalid input), 401 (unauthorized), 404 (asset not found)
```

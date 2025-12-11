# Programs API

Endpoints for reward programs and incentives.

## List Programs

Get available programs.

### Request

```
GET /programs
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `string` | Filter by program type |
| `active` | `boolean` | Filter active programs only |

### Response

```json
{
  "success": true,
  "data": {
    "programs": [
      {
        "programId": "prog_123",
        "type": "REWARDS",
        "name": "Verification Rewards",
        "description": "Earn points for verifying products",
        "active": true,
        "startDate": "2025-01-01T00:00:00Z",
        "endDate": null
      }
    ]
  }
}
```

### cURL Example

```bash
curl -X GET "https://api.tagit.network/v1/programs?active=true" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Get Program Details

Get details of a specific program.

### Request

```
GET /programs/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Program ID |

### Response

```json
{
  "success": true,
  "data": {
    "programId": "prog_123",
    "type": "REWARDS",
    "name": "Verification Rewards",
    "description": "Earn points for verifying products",
    "rules": {
      "pointsPerVerification": 10,
      "bonusFirstVerification": 50,
      "maxPointsPerDay": 100
    },
    "rewards": [
      {
        "rewardId": "rew_1",
        "name": "Bronze Badge",
        "pointsRequired": 100
      },
      {
        "rewardId": "rew_2",
        "name": "$5 Store Credit",
        "pointsRequired": 500
      }
    ],
    "active": true
  }
}
```

---

## Enroll in Program

Enroll the authenticated user in a program.

### Request

```
POST /programs/:id/enroll
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Program ID |

### Response

```json
{
  "success": true,
  "data": {
    "enrollmentId": "enr_abc",
    "programId": "prog_123",
    "enrolledAt": "2025-12-11T10:30:00Z",
    "status": "ACTIVE"
  }
}
```

### cURL Example

```bash
curl -X POST "https://api.tagit.network/v1/programs/prog_123/enroll" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Get My Progress

Get progress in a program.

### Request

```
GET /programs/:id/progress
```

### Response

```json
{
  "success": true,
  "data": {
    "programId": "prog_123",
    "points": 150,
    "level": "Bronze",
    "nextLevel": "Silver",
    "pointsToNextLevel": 350,
    "claimableRewards": [
      {
        "rewardId": "rew_1",
        "name": "Bronze Badge",
        "claimable": true
      }
    ],
    "history": [
      {
        "action": "VERIFICATION",
        "points": 10,
        "timestamp": "2025-12-11T10:00:00Z"
      }
    ]
  }
}
```

---

## Claim Reward

Claim an earned reward.

### Request

```
POST /programs/:programId/claim
```

### Request Body

```json
{
  "rewardId": "rew_1"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "claimId": "clm_xyz",
    "rewardId": "rew_1",
    "rewardName": "Bronze Badge",
    "claimedAt": "2025-12-11T10:35:00Z",
    "deliveryStatus": "PENDING"
  }
}
```

### cURL Example

```bash
curl -X POST "https://api.tagit.network/v1/programs/prog_123/claim" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rewardId": "rew_1"}'
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `PROGRAM_NOT_FOUND` | 404 | Program does not exist |
| `ALREADY_ENROLLED` | 400 | User already enrolled |
| `PROGRAM_INACTIVE` | 400 | Program is not active |
| `INSUFFICIENT_POINTS` | 400 | Not enough points to claim |
| `REWARD_ALREADY_CLAIMED` | 400 | Reward already claimed |

## Next Steps

- [Assets API](./assets.md) — Asset management
- [Verification API](./verification.md) — Asset verification
- [API Overview](../overview.md) — Full API reference

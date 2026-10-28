# Transaction Ledger API Documentation

Base URL: `http://localhost:5000`

The API uses JSON request bodies and JSON responses. Dates are returned in ISO 8601 format.

## 1. Service health

### Get API information

```http
GET /
```

Success response: `200 OK`

```json
{
  "service": "Transaction Ledger API",
  "health": "/health"
}
```

### Health check

```http
GET /health
```

Success response: `200 OK`

```json
{
  "status": "ok"
}
```

## 2. Accounts

### Create an account

```http
POST /accounts
Content-Type: application/json
```

Request body:

```json
{
  "accountId": "ACC001",
  "name": "John Doe"
}
```

Validation:

- `accountId`: required, non-empty string, trimmed.
- `name`: required, non-empty string, trimmed.
- `balance` supplied by the client is ignored.
- Account IDs are unique.

Success response: `201 Created`

```json
{
  "message": "Account created successfully",
  "data": {
    "accountId": "ACC001",
    "name": "John Doe",
    "balance": 0,
    "_id": "67c000000000000000000001",
    "createdAt": "2026-10-28T00:00:00.000Z"
  }
}
```

Errors:

| Status | Response error |
|---|---|
| `400` | `Validation failed` with field details |
| `409` | `Account ID already exists` |

### Get account balance

```http
GET /accounts/:accountId/balance
```

Example:

```http
GET /accounts/ACC001/balance
```

Success response: `200 OK`

```json
{
  "accountId": "ACC001",
  "balance": 1000
}
```

Errors:

| Status | Response error |
|---|---|
| `404` | `Account not found` |

## 3. Transactions

### Create a credit or debit

```http
POST /accounts/:accountId/transactions
Content-Type: application/json
```

Credit example:

```json
{
  "referenceId": "TXN001",
  "type": "credit",
  "amount": 1000,
  "description": "Opening deposit"
}
```

Debit example:

```json
{
  "referenceId": "TXN002",
  "type": "debit",
  "amount": 250.50,
  "description": "Card payment"
}
```

Request fields:

| Field | Type | Required | Rules |
|---|---|---|---|
| `referenceId` | string | Yes | Trimmed, non-empty, unique per account |
| `type` | string | Yes | Must be `credit` or `debit` |
| `amount` | number | Yes | Finite number greater than `0` |
| `description` | string | No | Maximum 500 characters; defaults to an empty string |

Success response: `201 Created`

```json
{
  "message": "Transaction created successfully",
  "data": {
    "accountId": "ACC001",
    "referenceId": "TXN001",
    "type": "credit",
    "amount": 1000,
    "description": "Opening deposit",
    "_id": "67c000000000000000000002",
    "createdAt": "2026-10-28T00:00:00.000Z"
  }
}
```

Errors:

| Status | Response error |
|---|---|
| `400` | `Validation failed` |
| `400` | `Insufficient balance` |
| `404` | `Account not found` |
| `409` | `Reference ID already exists for this account` |

### Get transaction history

```http
GET /accounts/:accountId/transactions
```

Supported query parameters:

| Parameter | Type | Default | Rules |
|---|---|---|---|
| `type` | string | all types | `credit` or `debit` |
| `page` | integer | `1` | Positive integer |
| `limit` | integer | `10` | Integer from `1` through `100` |

Example request:

```http
GET /accounts/ACC001/transactions?type=debit&page=1&limit=10
```

Success response: `200 OK`

```json
{
  "message": "Transaction history retrieved successfully",
  "data": {
    "transactions": [
      {
        "_id": "67c000000000000000000003",
        "accountId": "ACC001",
        "referenceId": "TXN002",
        "type": "debit",
        "amount": 250.5,
        "description": "Card payment",
        "createdAt": "2026-10-28T00:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

Transactions are ordered by creation time descending. If no transactions match the filters, `transactions` is an empty array and `totalPages` can be `0`.

Errors:

| Status | Response error |
|---|---|
| `400` | `Validation failed` |
| `404` | `Account not found` |

## 4. Error format

### Validation error

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be positive"
    }
  ]
}
```

### Standard error

```json
{
  "error": "Account not found"
}
```

Unknown routes return:

```json
{
  "error": "Route not found"
}
```

## 5. HTTP status summary

| Status | Description |
|---|---|
| `200` | Request completed successfully |
| `201` | Resource created successfully |
| `400` | Invalid input or insufficient funds |
| `404` | Resource or route not found |
| `409` | Duplicate account or reference ID |
| `500` | Unexpected server error |

## 6. Example cURL commands

Create an account:

```bash
curl -X POST http://localhost:5000/accounts \
  -H "Content-Type: application/json" \
  -d '{"accountId":"ACC001","name":"John Doe"}'
```

Create a credit:

```bash
curl -X POST http://localhost:5000/accounts/ACC001/transactions \
  -H "Content-Type: application/json" \
  -d '{"referenceId":"TXN001","type":"credit","amount":1000,"description":"Opening deposit"}'
```

Get a balance:

```bash
curl http://localhost:5000/accounts/ACC001/balance
```

Get transaction history:

```bash
curl "http://localhost:5000/accounts/ACC001/transactions?page=1&limit=10"
```

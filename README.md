# Transaction Ledger API

A REST API for managing ledger accounts, credits, debits, balances, and transaction history. It is built with Node.js, TypeScript, Express, MongoDB, and Mongoose.

## Features

- Create accounts with a client-provided ID
- Read account balances
- Record immutable credit and debit transactions
- Prevent debits that exceed the account balance
- Prevent duplicate reference IDs within an account
- Filter and paginate transaction history
- Validate request bodies and query parameters
- Support replica-set MongoDB transactions when available, with a standalone fallback for development

## Requirements

- Node.js 20 or newer
- MongoDB 4.4 or newer
- MongoDB replica set for atomic, production-grade balance updates

## Configuration

Create a `.env` file in the project root:

```dotenv
PORT=5000
MONGODB_URI=mongodb://localhost:27017/transaction_ledger
```

| Variable | Required | Default | Description |
|---|---:|---:|---|
| `PORT` | No | `5000` | Port used by the HTTP server |
| `MONGODB_URI` | Yes | — | MongoDB connection string |

## Installation and running

```powershell
npm install
npm run dev
```

Development mode watches `src/server.ts` and restarts when source files change.

For a production build:

```powershell
npm run build
npm start
```

The API is available at `http://localhost:5000` unless `PORT` is changed.

## Quick start

### 1. Check the service

```powershell
Invoke-RestMethod http://localhost:5000/health
```

Response:

```json
{
  "status": "ok"
}
```

### 2. Create an account

```powershell
Invoke-RestMethod -Method POST http://localhost:5000/accounts `
  -ContentType "application/json" `
  -Body '{"accountId":"ACC001","name":"John Doe"}'
```

### 3. Add a credit

```powershell
Invoke-RestMethod -Method POST http://localhost:5000/accounts/ACC001/transactions `
  -ContentType "application/json" `
  -Body '{"referenceId":"TXN001","type":"credit","amount":1000}'
```

### 4. Check the balance

```powershell
Invoke-RestMethod http://localhost:5000/accounts/ACC001/balance
```

## API reference

### Service

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service information |
| `GET` | `/health` | Service health check |

### Accounts

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/accounts` | Create an account |
| `GET` | `/accounts/:accountId/balance` | Get an account balance |

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/accounts/:accountId/transactions` | Create a credit or debit |
| `GET` | `/accounts/:accountId/transactions` | Get transaction history |

## Endpoint details

### Create an account

`POST /accounts`

```json
{
  "accountId": "ACC001",
  "name": "John Doe"
}
```

`accountId` and `name` are required, trimmed strings. A successful request returns `201` and sets the initial balance to `0`.

Example response:

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

### Get an account balance

`GET /accounts/:accountId/balance`

```json
{
  "accountId": "ACC001",
  "balance": 1000
}
```

### Create a transaction

`POST /accounts/:accountId/transactions`

```json
{
  "referenceId": "TXN001",
  "type": "credit",
  "amount": 1000,
  "description": "Opening deposit"
}
```

| Field | Rules |
|---|---|
| `referenceId` | Required, non-empty, unique within the account |
| `type` | Must be `credit` or `debit` |
| `amount` | Number greater than 0 and finite |
| `description` | Optional string, maximum 500 characters; defaults to an empty string |

A successful request returns `201`. A debit with no sufficient balance returns `400`, and a duplicate reference ID returns `409`.

### Get transaction history

`GET /accounts/:accountId/transactions?type=credit&page=1&limit=10`

Query parameters:

| Parameter | Rules | Default |
|---|---|---:|
| `type` | Optional: `credit` or `debit` | All types |
| `page` | Positive integer | `1` |
| `limit` | Integer from `1` to `100` | `10` |

Transactions are returned newest first. Example response:

```json
{
  "message": "Transaction history retrieved successfully",
  "data": {
    "transactions": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

## HTTP status codes

| Status | Meaning |
|---|---|
| `200` | Request completed successfully |
| `201` | Account or transaction created successfully |
| `400` | Invalid request data or insufficient balance |
| `404` | Account or route not found |
| `409` | Duplicate account or transaction reference |
| `500` | Unexpected server error |

## Error responses

Validation errors contain field-level details:

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

Other errors use a simple error message:

```json
{
  "error": "Account not found"
}
```

## MongoDB and data integrity

Transactions are recorded with an account ID, immutable reference ID, type, amount, description, and creation time. A unique compound index prevents duplicate reference IDs for the same account.

When MongoDB is running as a replica set, each credit or debit uses a MongoDB session to update the balance and transaction atomically. For a local standalone MongoDB instance, the API uses a development fallback so that basic API testing remains available. That fallback does not provide the same atomic guarantees and should not be used in production.

## Project structure

```text
src/
├── app.ts                 # Express application and routes
├── server.ts              # Server startup and database connection
├── config/                # Database configuration
├── controllers/           # HTTP request handlers
├── middleware/            # Validation and error handling
├── models/                # Mongoose schemas
├── routes/                # Express routes
├── services/              # Business and database operations
└── validators/            # Zod request schemas
```

## Data conventions

- Amounts use MongoDB/JavaScript numbers and are expressed in currency units.
- The API does not define currency codes or rounding rules.
- Negative balances are not allowed.
- Accounts and transactions have no update or delete endpoints.

## Additional documentation

- [API documentation](API_DOCUMENTATION.md) — endpoints, request examples, responses, and errors
- [Assumptions](ASSUMPTIONS.md) — implementation assumptions and consistency limitations

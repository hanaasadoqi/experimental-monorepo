# @repo/services-api

HTTP API client infrastructure with Faker-generated mock data fixtures.

## Exports

- **`./client`** — Typed HTTP client wrapper
- **`./types`** — API request/response types
- **`./fixtures`** — Faker-generated test data

## Key Features

- Generic HTTP client abstraction (not domain-specific)
- Axios-based request handling
- Mock data generation with Faker
- Error handling patterns
- Request/response interceptor patterns

## When to Use

- Data fetching across features
- Consistent API interaction patterns
- Mock data for development and testing

## When NOT to Use

- Business-specific HTTP logic (keep in features)
- WebSocket communication (separate service)
- GraphQL (use GraphQL-specific service adapter)

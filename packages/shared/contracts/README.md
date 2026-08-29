# @repo/contracts

Shared contracts (types, schemas, and validation) for the monorepo.

## Structure

- **`/src/schemas`** - Zod schemas and validation logic
- **`/src/types`** - TypeScript types, including inferred types from schemas
- **`/src/index.ts`** - Public exports from both schemas and types

## Usage

### Import types and schemas

```typescript
import { userFormSchema, type UserForm } from "@repo/contracts";
```

### Import only schemas

```typescript
import { userFormSchema } from "@repo/contracts/schemas";
```

### Import only types

```typescript
import type { UserForm } from "@repo/contracts/types";
```

## Adding new contracts

1. **If schema + inferred type**: Add to `/src/schemas/` (e.g., `forms.ts`)
   ```typescript
   export const userFormSchema = z.object({ /* ... */ });
   export type UserForm = z.infer<typeof userFormSchema>;
   ```

2. **If standalone type**: Add to `/src/types/` (e.g., `domain.ts`)
   ```typescript
   export type User = { id: string; email: string; };
   ```

3. **Always export from `index.ts`** in the respective directories

4. **Update the main index** (`/src/index.ts`) to re-export everything

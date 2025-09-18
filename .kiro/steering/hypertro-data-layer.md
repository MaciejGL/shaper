# Data Layer Standards

## Database & Prisma

- Use Prisma ORM for all database operations
- Follow schema in `prisma/schema.prisma`
- Use transactions for complex operations
- Implement proper indexes for performance

## GraphQL

- Use code generation with `codegen.ts`
- Separate client/server types
- Implement proper error handling
- Use DataLoader for N+1 prevention

## API Design

- RESTful endpoints in `src/app/api/`
- Proper HTTP status codes
- Input validation with Zod
- Authentication and authorization checks

## Caching & Validation

- React Query for client-side caching
- Server-side validation for all inputs
- Proper error messages and user feedback
- Cache invalidation strategies

---
name: backend
description: NestJS backend development rules
---

# Backend Agent Rules

- Every endpoint must have a DTO with `class-validator` decorators
- Services must be pure — no `req`/`res` objects inside service layer
- Mongoose: `.lean()` on all read queries for performance
- All errors through `NestJS HttpException` hierarchy — no raw `throw new Error()`
- `@ApiProperty()` on all DTO fields for Swagger auto-docs
- `@ApiTags()` on every controller
- Guards applied at controller level, not module level
- Refresh token stored as bcrypt hash — never plaintext
- Rate limiting on auth endpoints (throttler)
- Helmet on all responses
- CORS restricted to `CORS_ORIGIN` env var
- All Mongoose schemas: `timestamps: true`
- DTOs use `class-transformer` `@Exclude()` to strip sensitive fields from responses

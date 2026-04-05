---
name: api-scaffold
description: Scaffolds NestJS API domains
---

# API Scaffold Skill

Every NestJS domain requires these files:
1. `schemas/[name].schema.ts` — Mongoose schema + TypeScript type
2. `dto/create-[name].dto.ts` — Creation DTO with class-validator
3. `dto/update-[name].dto.ts` — Update DTO (PartialType of create)
4. `[name].service.ts` — Business logic, pure functions
5. `[name].controller.ts` — Route handlers, guards, Swagger decorators
6. `[name].module.ts` — Module wiring
7. `[name].service.spec.ts` — Unit tests

All DTOs: `@ApiProperty()` on every field
All services: `.lean()` on read queries, `HttpException` for errors
All controllers: `@ApiTags()`, `@UseGuards(JwtAuthGuard)` where protected

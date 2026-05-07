# Runbook

## Deployment

<!-- AUTO-GENERATED: deployment:start -->
1. Install dependencies:
   - `pnpm install`
2. Ensure production environment variables are configured:
   - See `docs/ENV.md`
3. Apply database migrations and build:
   - `pnpm build`
   - Note: `pnpm build` runs `prisma migrate deploy` first, so a reachable database is required during build.
4. Start application:
   - `pnpm start`
<!-- AUTO-GENERATED: deployment:end -->

## Health Checks and Monitoring

<!-- AUTO-GENERATED: health:start -->
- No dedicated health endpoint is currently defined in `app/`.
- Minimum operational checks:
  - Verify the app root route loads successfully.
  - Verify authentication flow is functional.
  - Monitor process/container logs for runtime errors.
<!-- AUTO-GENERATED: health:end -->

## Common Issues and Fixes

<!-- AUTO-GENERATED: troubleshooting:start -->
- **Prisma client not generated**
  - Run `pnpm db:generate`.
- **Database schema drift in development**
  - Run `pnpm db:migrate` or `pnpm db:push` depending on workflow.
- **Broken seeded menu images**
  - Run `pnpm db:cleanup:broken-images`, then `pnpm db:verify:broken-images`.
- **Playwright tests fail due to missing browsers**
  - Run `pnpm test:e2e:install`.
<!-- AUTO-GENERATED: troubleshooting:end -->

## Rollback Procedure

1. Roll back to the previous known-good deployment artifact/version in your hosting platform.
2. For migration issues, create a corrective forward migration (Prisma does not provide down-migrations).
3. Restore from backup only when data loss or corruption recovery is required.
4. Re-run smoke checks (app load + auth flow).

## Alerting and Escalation

- Route runtime errors and deployment failures to the on-call developer channel.
- Escalate immediately when:
  - App is unavailable.
  - Authentication is failing for all users.
  - Data integrity issues are detected.

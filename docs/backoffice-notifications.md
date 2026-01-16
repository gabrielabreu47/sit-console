# Notifications Console (sit.console)

Routes:
- `/notifications/rules` (list + enable/disable + duplicate + test)
- `/notifications/rules/new` and `/notifications/rules/:id` (create/edit)
- `/notifications/templates`
- `/notifications/logs`

Auth: uses existing token from `localStorage.authToken`; requests include it via axios interceptor. Commerce/tenant scope is taken from `sessionStorage.currentCommerce` and sent to rule/template calls.

Rules:
- Trigger types: DB_EVENT, SCHEDULED/ANALYTICS, CONDITION.
- DB_EVENT: table, operation, watched columns, pg_notify channel (optional edit).
- Scheduled: cron + strategy `MISSED_WEEKDAY_APPOINTMENT` parameters.
- Condition builder with AND/OR and basic operators.
- Actions: edit, enable/disable (confirm), duplicate (disabled copy), test (payload JSON or guided inputs).

Templates:
- CRUD with name/channel/title/body plus JSON schema field and preview.

Logs:
- Filters by status, rule, date range; detail modal shows payload/error.

API:
- `/api/notifications/rules` CRUD, enable/disable, test
- `/api/notifications/templates` CRUD
- `/api/notifications/logs`

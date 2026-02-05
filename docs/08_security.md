# Security (DEFAULT v1)

## Secrets
- Never commit `.env.local`, keys, tokens.
- Use platform env vars for production.

## Access
- Limit repo write access.
- Limit production env access.

## Data
- SSOT must not contain secrets.
- Treat personal data carefully; define retention/backups later.

# Demo Master Service

Master service containing Orders, Users, Authentication, and BullMQ Email processing.

- **Port**: `3000`
- **Database**: `october_node_db` (MySQL)
- **Queue**: Redis BullMQ

## CI/CD
GitHub Actions workflow configured in `.github/workflows/ci.yml` triggers on pushes and PRs to branches:
- `ranjit`
- `master`
- `dev`

## Setup & Running
```bash
npm install
npm run build
npm run start:dev
```

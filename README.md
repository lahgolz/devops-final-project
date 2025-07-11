# DevOps Project - Ticketing System

A simple web application for creating and managing support tickets.

## What it does

- Users can create tickets through a form (bug reports, questions, suggestions)
- Admins can view all tickets in a dashboard (password protected)

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MariaDB
- **Frontend**: HTML, CSS, JavaScript
- **Testing**: Jest + Playwright

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lahgolz/devops-final-project
   ```

2. **Local setup**:
   ```bash
   pnpm install
   cp .env.example .env
   # Edit .env with your database settings
   docker compose up -d
   pnpm seed
   pnpm start
   ```

3. **Access the app**:
   - Create tickets: http://localhost:3000
   - View tickets (admin): http://localhost:3000/tickets

## Testing

- **Unit tests**: Run `pnpm test`
- **E2E tests**: Run `pnpm test:e2e`

You might need to download the latest version of Playwright browsers:
```bash
pnpm playwright install
```

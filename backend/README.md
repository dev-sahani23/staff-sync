# Staff Sync Backend

## Database Setup

This project uses PostgreSQL for its database, running in a local Docker container. 

### Prerequisites
- Docker and Docker Compose installed on your machine.

### Instructions
1. **Start the Database**: Run the following command to start PostgreSQL in the background:
   ```bash
   docker compose up -d
   ```
2. **Check Container Status**: You can verify the container is running with:
   ```bash
   docker compose ps
   ```
3. **Run Prisma Migrations**: Once the database is running, apply the database schema:
   ```bash
   npx prisma migrate dev
   ```
4. **Generate Prisma Client**: Generate the TypeScript client for the database:
   ```bash
   npx prisma generate
   ```

### Managing the Database
- **Stop the Database**: To stop the PostgreSQL container, run:
  ```bash
  docker compose down
  ```
- **Reset the Database**: If you want to intentionally wipe all database data and start fresh, remove the named volume:
  ```bash
  docker compose down -v
  ```

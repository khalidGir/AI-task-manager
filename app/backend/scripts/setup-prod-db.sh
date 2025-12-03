#!/bin/bash
# Production database setup script

# Install PostgreSQL Prisma provider if not already present
npm install prisma @prisma/client postgres

# Generate Prisma client for PostgreSQL
npx prisma generate

# Create initial migration (only run this once in production setup)
npx prisma migrate dev --name init

echo "Production database setup complete!"
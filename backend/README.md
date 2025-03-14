# Backend Chat Application

This is the backend for a real-time chat application built with Node.js, Express, TypeScript, Prisma, and Socket.io.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Docker and Docker Compose (optional, for containerized deployment)

### Development Setup

1. Clone the repository

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file with your database connection string and other configurations

5. Generate Prisma client:
   ```
   npm run prisma:generate
   ```

6. Run database migrations:
   ```
   npx prisma migrate dev
   ```

7. Start the development server:
   ```
   npm run dev
   ```

## Production Deployment

### Option 1: Manual Deployment

1. Build the application:
   ```
   npm run build
   ```

2. This will create a `dist` folder with the compiled JavaScript code

3. Copy the following to your production server:
   - `dist` folder
   - `package.json`
   - `prisma` folder
   - `.env` (with production values)

4. On the production server, install dependencies:
   ```
   npm install --production
   ```

5. Run database migrations:
   ```
   npm run prisma:migrate
   ```

6. Start the server:
   ```
   npm run start
   ```

### Option 2: Docker Deployment

1. Update environment variables in `.env.production`

2. Build the Docker containers:
   ```
   npm run docker:build
   ```

3. Start the containers:
   ```
   npm run docker:up
   ```

4. To stop the containers:
   ```
   npm run docker:down
   ```

## Environment Variables

The following environment variables are required:

- `PORT`: Server port (default: 8080)
- `APP_URL`: Frontend URL for CORS
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens

## Project Structure

- `src/index.ts`: Main entry point
- `src/controllers/`: API controllers
- `src/router/`: API routes
- `src/middlewares/`: Express middlewares
- `src/utils/`: Utility functions
- `src/socket/`: Socket.io implementation
- `prisma/`: Prisma schema and migrations

## Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application
- `npm run start`: Start the production server
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:migrate`: Run database migrations
- `npm run docker:build`: Build Docker containers
- `npm run docker:up`: Start Docker containers
- `npm run docker:down`: Stop Docker containers
- `npm run deploy`: Build and start the application 
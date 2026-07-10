# Architecture Decisions

## Project Structure

The project is divided into two applications:

- backend (FastAPI)
- frontend (Next.js)

This separation makes the code easier to maintain and reflects a common full-stack architecture.

## Backend

- FastAPI for REST APIs
- SQLAlchemy ORM for database operations
- PostgreSQL as the database
- Alembic for database migrations
- JWT for authentication
- WebSocket for real-time order updates

Business logic is separated from API routes to keep the code clean and maintainable.

## Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- Axios for API communication

Reusable UI components are used to reduce code duplication.

## Database

Two tables:

- users
- orders

Indexes are added on commonly queried fields such as `status`.

## External API

A currency conversion API is used to display the order amount in both INR and USD.

## Real-Time Updates

FastAPI WebSockets broadcast order status changes to all connected clients, allowing dashboards to update without refreshing the page.
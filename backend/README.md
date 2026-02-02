# Backend Setup

## Database Setup

### Start Postgres

    docker compose up -d
    docker compose logs db

### Environment

Create .env from .env.example and set values:
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<db_name>
JWT_SECRET=<your_jwt_secret>

### Prisma Migrations

    npx prisma migrate dev

### Troubleshooting

Postgres fails to start

- Check if port 5432 is already in use:
  lsof -i :5432
- If another Postgres instance is running locally, stop it or change the port mapping in docker-compose.yml

Prisma migrate errors

- Make sure the database container is running:
  docker ps
- If migrations are inconsistent, reset them:
  npx prisma migrate reset

Common Docker issues

- If containers get stuck or misconfigured, remove and rebuild:
  docker compose down -v
  docker compose up -d --build

### Start Backend Server

From backend or backend/node:

    npm install
    npm run dev

API runs on http://localhost:4000

### Swagger API Documentation

After starting the server, open in your browser:
http://localhost:4000/api-docs

You will see all available endpoints, grouped by:

- Auth (register, login, refresh, logout)
- Projects (CRUD operations for projects)
- Tasks (CRUD operations for tasks)

Swagger is automatically generated from route comments using:
swagger-jsdoc
swagger-ui-express

If you make new routes, just add JSDoc comments above them, and Swagger will update automatically.

### API Endpoints

#### Health check:

curl http://localhost:4000/api/v1/health

#### Authentication (JWT):

Register:
curl -X POST http://localhost:4000/api/v1/auth/register \
 -H "Content-Type: application/json" \
 -d '{"email":"test@example.com","password":"<password>"}'

Response:
{
"id": 1,
"email": "test@example.com"
}

Login:
curl -X POST http://localhost:4000/api/v1/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"test@example.com","password":"<password>"}'

Response:
{
"accessToken": "eyJhbGciOi...",
"refreshToken": "eyJhbGciOi..."
}

Refresh Access Token:
curl -X POST http://localhost:4000/api/v1/auth/refresh \
 -H "Content-Type: application/json" \
 -d '{"refreshToken":"<refresh_token_here>"}'

Response:
{
"accessToken": "new_access_token..."
}

Logout:
curl -X POST http://localhost:4000/api/v1/auth/logout

#### Projects

List projects:
curl http://localhost:4000/api/v1/projects \
 -H "Authorization: Bearer <accessToken>"

Create project:
curl -X POST http://localhost:4000/api/v1/projects \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <accessToken>" \
 -d '{"name":"My Project"}'

Update project:
curl -X PUT http://localhost:4000/api/v1/projects/1 \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <accessToken>" \
 -d '{"name":"Updated Name"}'

Delete project:
curl -X DELETE http://localhost:4000/api/v1/projects/1 \
 -H "Authorization: Bearer <accessToken>"

#### Tasks

List tasks:
curl http://localhost:4000/api/v1/tasks \
 -H "Authorization: Bearer <accessToken>"

Create task:
curl -X POST http://localhost:4000/api/v1/tasks \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <accessToken>" \
 -d '{"title":"My Task","projectId":1}'

Update task:
curl -X PUT http://localhost:4000/api/v1/tasks/1 \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <accessToken>" \
 -d '{"done":true}'

Delete task:
curl -X DELETE http://localhost:4000/api/v1/tasks/1 \
 -H "Authorization: Bearer <accessToken>"

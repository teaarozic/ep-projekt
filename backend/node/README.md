# Node.js Backend

This backend implementation is built using Node.js and Express.

## Structure

- `src/api/` – Route handlers and endpoint definitions
- `src/services/` – Business logic modules
- `src/models/` – Data models and validation schemas (e.g., Zod)
- `src/utils/` – Shared utility functions
- `src/tests/` – Unit and integration tests

## Setup

Install dependencies:

```bash
npm install
```

## Development

Run the development server with hot reload:

```bash
npm run dev
```

Run the app manually:

```bash
npm start
```

## Scripts (expected)

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "lint": "eslint .",
  "test": "jest"
}
```

Ensure these scripts are defined in `package.json` to match CI workflows.

## Notes

- Environment variables should be stored in a `.env` file (excluded from Git).
- You can copy and edit `.env.example` as a template for your local `.env`.

## Testing

```bash
npm run test
```

## Linting

```bash
npm run lint
```

# Python Backend

This is a backend application built with FastAPI.

## Structure

- `app/api/` – Route definitions
- `app/services/` – Business logic
- `app/models/` – Pydantic schemas
- `app/utils/` – Helpers
- `app/tests/` – Unit/integration tests

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Running the server

```bash
uvicorn app.main:app --reload
```

## Testing

```bash
source venv/bin/activate
pytest app/tests
```

## Linting

```bash
source venv/bin/activate
flake8 app --max-line-length=100
```

Dependencies for linting and testing are automatically installed in the CI workflow.
You can install them locally with:

```bash
pip install flake8 pytest
```

## Development

# File: backend/python/README.md

Za provjeru stila koda koristi se [Ruff](https://docs.astral.sh/ruff/):

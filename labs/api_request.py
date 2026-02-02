"""Mini-project: API request and parsing example."""

import requests
import sys


def fetch_todos():
    """Fetch todos from JSONPlaceholder API and return parsed JSON."""
    url = "https://jsonplaceholder.typicode.com/todos"
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.json()


def main():
    """Main entrypoint for script."""
    try:
        todos = fetch_todos()
    except requests.exceptions.Timeout:
        print("Request timed out")
        sys.exit(1)
    except requests.exceptions.RequestException as exc:
        print(f"Failed to fetch todos: {exc}")
        sys.exit(1)

    print("Total todos fetched:", len(todos))

    completed = [t for t in todos if t["completed"]]

    print(f"\nCompleted todos: {len(completed)}")
    for todo in completed[:5]:
        print("-", todo["title"])


if __name__ == "__main__":
    main()

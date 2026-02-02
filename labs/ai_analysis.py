"""Simple data analysis script using requests, pandas, and numpy.

This script fetches product data from DummyJSON API,
performs basic statistical analysis (mean, std, grouping),
and exports the dataset to CSV.
"""

import requests
import pandas as pd
import numpy as np

# === CONFIGURATION ===
API_URL = "https://dummyjson.com/products?limit=100"
OUTPUT_PATH = "labs/product_data.csv"
TIMEOUT = 10


def fetch_data(url: str, timeout: int = 10) -> list[dict]:
    """Send a GET request to the given API URL and return list of products as JSON."""
    response = requests.get(url, timeout=timeout)

    if response.status_code != 200:
        raise RuntimeError(f"API request failed with status {response.status_code}")

    products = response.json().get("products", [])
    print(f"Fetched {len(products)} products from API.")
    return products


def analyze_data(df: pd.DataFrame) -> None:
    """Perform statistical analysis on product data and print results."""
    avg_price = np.mean(df["price"])
    price_std = np.std(df["price"])

    max_product = df.loc[df["price"].idxmax()]

    avg_by_category = (
        df.groupby("category")["price"].mean().sort_values(ascending=False)
    )

    print("\n=== ANALYSIS RESULTS ===")
    print(f"Average price: {avg_price:.2f}")
    print(f"Price standard deviation: {price_std:.2f}")
    print(f"Most expensive product: {max_product['title']} (${max_product['price']})")

    print("\nAverage price by category:")
    print(avg_by_category)


def save_to_csv(df: pd.DataFrame, path: str) -> None:
    """Save the DataFrame to a CSV file."""
    df.to_csv(path, index=False)
    print(f"\nSaved full dataset to {path}")


def main() -> None:
    """Main script entry point for AI basics demo."""
    products = fetch_data(API_URL, TIMEOUT)
    df = pd.DataFrame(products)
    print(df.head())

    analyze_data(df)
    save_to_csv(df, OUTPUT_PATH)


if __name__ == "__main__":
    main()
    print("\n=== Python AI Basics script completed successfully ===")

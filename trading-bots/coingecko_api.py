import os
import requests
from datetime import datetime
from dotenv import load_dotenv
from interfaces.crypto_api_interface import CryptoAPIInterface

load_dotenv()

COINGECKO_API_URL = os.getenv("COINGECKO_API_URL")
DEFAULT_CURRENCY = os.getenv("DEFAULT_CURRENCY")

class CoinGeckoAPI(CryptoAPIInterface):
    def fetch_data(self, coin: str) -> dict:
        params = {
            "ids": coin,
            "vs_currencies": DEFAULT_CURRENCY,
            "include_last_updated_at": "true"
        }
        response = requests.get(COINGECKO_API_URL, params=params)
        response.raise_for_status()
        return response.json()

    def parse_data(self, raw_data: dict) -> dict:
        coin = list(raw_data.keys())[0]
        return {
            "symbol": coin,
            "price_usd": raw_data[coin][DEFAULT_CURRENCY],
            "timestamp": datetime.fromtimestamp(raw_data[coin]["last_updated_at"])
        }

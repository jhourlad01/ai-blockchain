class BinanceAPI(CryptoAPIInterface):
    def fetch_data(self, coin: str) -> dict:
        symbol = f"{coin.upper()}USDT"
        url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()

    def parse_data(self, raw_data: dict) -> dict:
        return {
            "symbol": raw_data["symbol"].replace("USDT", "").lower(),
            "price_usd": float(raw_data["price"]),
            "timestamp": datetime.utcnow()
        }

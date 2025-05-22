class CoinPaprikaAPI(CryptoAPIInterface):
    def fetch_data(self, coin: str) -> dict:
        url = f"https://api.coinpaprika.com/v1/tickers/{coin}"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()

    def parse_data(self, raw_data: dict) -> dict:
        return {
            "symbol": raw_data["symbol"].lower(),
            "price_usd": raw_data["quotes"]["USD"]["price"],
            "timestamp": datetime.strptime(raw_data["last_updated"], "%Y-%m-%dT%H:%M:%SZ")
        }

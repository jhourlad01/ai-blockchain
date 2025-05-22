class CryptoCompareAPI(CryptoAPIInterface):
    def __init__(self):
        self.api_key = os.getenv("CRYPTOCOMPARE_API_KEY")

    def fetch_data(self, coin: str) -> dict:
        url = "https://min-api.cryptocompare.com/data/price"
        params = {
            "fsym": coin.upper(),
            "tsyms": "USD",
            "api_key": self.api_key
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()

    def parse_data(self, raw_data: dict) -> dict:
        return {
            "symbol": coin.lower(),
            "price_usd": raw_data["USD"],
            "timestamp": datetime.utcnow()
        }

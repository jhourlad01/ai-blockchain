from abc import ABC, abstractmethod
from typing import Any, Dict


class CryptoAPIInterface(ABC):
    """
    Abstract base class for all cryptocurrency data providers.
    Defines the required methods for fetching and parsing data.
    """

    @abstractmethod
    def fetch_data(self, coin: str) -> Dict[str, Any]:
        """
        Fetch raw data for a given coin from the API.

        Args:
            coin (str): The ID of the cryptocurrency (e.g., 'bitcoin').

        Returns:
            dict: Raw response data from the API.
        """
        pass

    @abstractmethod
    def parse_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse raw API response into a standardized dictionary.

        Args:
            raw_data (dict): The raw data fetched from the API.

        Returns:
            dict: Parsed data in a common structure:
                {
                    'symbol': str,
                    'price_usd': float,
                    'timestamp': datetime
                }
        """
        pass

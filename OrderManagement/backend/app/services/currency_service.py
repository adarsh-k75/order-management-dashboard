import logging
import time
from decimal import Decimal
import httpx

logger = logging.getLogger("currency_service")

class CurrencyService:
    def __init__(self):
        # Default fallback rate: 1 INR = 0.012 USD (approx 1 USD = 83.33 INR)
        self.cached_rate: Decimal = Decimal("0.0120")
        self.last_fetched: float = 0.0
        self.cache_duration: float = 3600.0  # Cache rate for 1 hour

    async def get_inr_to_usd_rate(self) -> Decimal:
        """Fetch the current exchange rate from INR to USD with fallback options and caching."""
        current_time = time.time()
        
        # Return cached rate if cache is still valid
        if current_time - self.last_fetched < self.cache_duration:
            return self.cached_rate

        # Attempt 1: ExchangeRate API (Free Open Access)
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                response = await client.get("https://open.er-api.com/v6/latest/INR")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("result") == "success" and "rates" in data:
                        usd_rate = data["rates"].get("USD")
                        if usd_rate:
                            self.cached_rate = Decimal(str(usd_rate))
                            self.last_fetched = current_time
                            logger.info(f"Exchange rate updated from ExchangeRate-API: {usd_rate}")
                            return self.cached_rate
        except Exception as err:
            logger.warning(f"Primary exchange rate API failed: {err}. Attempting fallback.")

        # Attempt 2: Frankfurter API (ECB rates)
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                response = await client.get("https://api.frankfurter.app/latest?from=INR&to=USD")
                if response.status_code == 200:
                    data = response.json()
                    usd_rate = data.get("rates", {}).get("USD")
                    if usd_rate:
                        self.cached_rate = Decimal(str(usd_rate))
                        self.last_fetched = current_time
                        logger.info(f"Exchange rate updated from Frankfurter: {usd_rate}")
                        return self.cached_rate
        except Exception as err:
            logger.error(f"Secondary exchange rate API failed: {err}. Using cached rate: {self.cached_rate}")

        # If API calls fail, return the last successfully cached rate (or the default hardcoded one)
        # Do not update last_fetched to force retry on next lookup request
        return self.cached_rate

    def convert_inr_to_usd(self, amount_inr: Decimal, rate: Decimal) -> Decimal:
        """Helper to convert INR to USD based on the exchange rate, rounded to 2 decimal places."""
        return (amount_inr * rate).quantize(Decimal("0.01"))

currency_service = CurrencyService()

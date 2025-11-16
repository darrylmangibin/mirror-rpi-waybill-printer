from enum import Enum


class Marketplaces(Enum):
    """
    Enumeration for supported marketplace types.
    Used to ensure type-safe marketplace handling and avoid misspellings.
    Similar to Laravel Enums for business logic consistency.
    """
    
    ZALORA = "zalora"
    SHOPIFY = "shopify"
    
    def __str__(self):
        """Return the string value of the enum."""
        return self.value


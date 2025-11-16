from enum import Enum


class Marketplaces(Enum):
    """
    Enumeration for supported marketplace types.
    Used to ensure type-safe marketplace handling and avoid misspellings.
    Similar to Laravel Enums for business logic consistency.
    """
    
    ZALORA = "zalora"
    SHOPIFY = "shopify"
    SHOPEE = "shopee"
    TIKTOK = "tiktok"
    LAZADA = "lazada"
    
    def __str__(self):
        """Return the string value of the enum."""
        return self.value
    
    @classmethod
    def get_crop_eligible_marketplaces(cls):
        """
        Get marketplaces that require PDF cropping (for thermal printer 4x6 label size).
        Used for edge case PDF processing before printing.
        
        Returns:
            set: Set of marketplace values that need PDF cropping (zalora, shopify)
        """
        return {cls.ZALORA.value, cls.SHOPIFY.value}


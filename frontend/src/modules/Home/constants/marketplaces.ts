/**
 * Marketplace Constants (Enum-like)
 * Mirrors the backend Python Marketplaces enum for type-safe marketplace handling
 * Location: app/services/waybills/enums/Marketplaces.py
 */

export const Marketplaces = {
	ZALORA: 'zalora',
	SHOPIFY: 'shopify',
	SHOPEE: 'shopee',
	TIKTOK: 'tiktok',
	LAZADA: 'lazada',
} as const;

export type Marketplace = typeof Marketplaces[keyof typeof Marketplaces];

/**
 * Helper to get human-readable marketplace labels
 */
export const marketplaceLabels: Record<Marketplace, string> = {
	[Marketplaces.ZALORA]: 'Zalora',
	[Marketplaces.SHOPIFY]: 'Shopify',
	[Marketplaces.SHOPEE]: 'Shopee',
	[Marketplaces.TIKTOK]: 'TikTok',
	[Marketplaces.LAZADA]: 'Lazada',
};

/**
 * Helper to get marketplace badge colors (Tailwind CSS classes)
 */
export const marketplaceColors: Record<Marketplace, string> = {
	[Marketplaces.ZALORA]: 'bg-amber-100 text-amber-800',
	[Marketplaces.SHOPIFY]: 'bg-green-100 text-green-800',
	[Marketplaces.SHOPEE]: 'bg-red-100 text-red-800',
	[Marketplaces.TIKTOK]: 'bg-black text-white',
	[Marketplaces.LAZADA]: 'bg-blue-100 text-blue-800',
};

/**
 * Helper to get marketplace icon paths
 */
export const marketplaceIcons: Record<Marketplace, string> = {
	[Marketplaces.ZALORA]: '/images/marketplaces/zalora-icon.png',
	[Marketplaces.SHOPIFY]: '/images/marketplaces/shopify-icon.png',
	[Marketplaces.SHOPEE]: '/images/marketplaces/shopee-icon.png',
	[Marketplaces.TIKTOK]: '/images/marketplaces/tiktok-icon.png',
	[Marketplaces.LAZADA]: '/images/marketplaces/lazada-icon.png',
};

/**
 * Helper to get marketplace options for dropdowns/selects
 */
export const marketplaceOptions = [
	{
		value: 'no_marketplace',
		label: 'No Marketplace',
	},
	...Object.entries(Marketplaces).map(([, value]) => ({
		value,
		label: marketplaceLabels[value as Marketplace],
	})),
];

/**
 * Helper to get all marketplace values as array
 */
export const marketplaceValues = Object.values(Marketplaces) as Marketplace[];

/**
 * Get marketplaces that require PDF cropping (for thermal printer 4x6 label size).
 * Used for edge case PDF processing before printing.
 *
 * Returns:
 *   Marketplace[] - Marketplaces that need PDF cropping (zalora, shopify)
 */
export const getCropEligibleMarketplaces = (): Marketplace[] => {
	return [Marketplaces.ZALORA, Marketplaces.SHOPIFY];
};


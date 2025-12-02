export type StoreProductWithDetails = {
  id: string;
  productID: string;
  productName?: string;
  productPrice?: number;
  imageUrl?: string | null;
  quantity: number;
  priceOverride?: number | null;
  finalPrice?: number;
  isAvailable: boolean;
  isEditing?: boolean;
};

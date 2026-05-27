export interface CommerceConfig {
  taxRate: number;
  deliveryBase: number;
  freeDeliveryThreshold: number;
  currency: string;
  defaultDeliveryMethod: string;
  operationMode: "commerce_only";
  showTaxBreakdown: boolean;
}

export const COMMERCE_CONFIG: CommerceConfig = {
  taxRate: process.env.NEXT_PUBLIC_TAX_RATE 
    ? parseFloat(process.env.NEXT_PUBLIC_TAX_RATE) 
    : 0.18, // 18% ITBIS
  deliveryBase: process.env.NEXT_PUBLIC_DELIVERY_BASE 
    ? parseInt(process.env.NEXT_PUBLIC_DELIVERY_BASE, 10) 
    : 250, // RD$ 250 base
  freeDeliveryThreshold: process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD 
    ? parseInt(process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD, 10) 
    : 3000, // Free delivery if total order exceeds RD$ 3,000
  currency: "RD$",
  defaultDeliveryMethod: "delivery_coordinado",
  operationMode: "commerce_only",
  showTaxBreakdown: process.env.NEXT_PUBLIC_SHOW_TAX_BREAKDOWN
    ? process.env.NEXT_PUBLIC_SHOW_TAX_BREAKDOWN === "true"
    : false, // Default to false
};

export function getCommerceConfig(): CommerceConfig {
  return COMMERCE_CONFIG;
}

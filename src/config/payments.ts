export interface PaymentConfig {
  ENABLE_PAYPAL: boolean;
  PAYPAL_PAYMENT_LINK: string;
  ENABLE_CARD_GATEWAY: boolean;
  PAYMENT_GATEWAY_PROVIDER: string;
  ENABLE_APPLE_PAY: boolean;
  ENABLE_GOOGLE_PAY: boolean;
}

export const paymentConfig: PaymentConfig = {
  ENABLE_PAYPAL: process.env.NEXT_PUBLIC_ENABLE_PAYPAL === "true",
  PAYPAL_PAYMENT_LINK: process.env.NEXT_PUBLIC_PAYPAL_PAYMENT_LINK || "",
  ENABLE_CARD_GATEWAY: process.env.NEXT_PUBLIC_ENABLE_CARD_GATEWAY === "true",
  PAYMENT_GATEWAY_PROVIDER: process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_PROVIDER || "",
  ENABLE_APPLE_PAY: process.env.NEXT_PUBLIC_ENABLE_APPLE_PAY === "true",
  ENABLE_GOOGLE_PAY: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_PAY === "true",
};

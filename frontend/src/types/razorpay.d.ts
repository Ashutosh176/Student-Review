// Minimal shape for the Razorpay Checkout script (loaded on demand from
// https://checkout.razorpay.com/v1/checkout.js) — see utils/razorpay.ts.
interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayCheckoutInstance {
  open: () => void;
}

interface Window {
  Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
}

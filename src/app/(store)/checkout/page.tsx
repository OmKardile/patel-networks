import type { Metadata } from "next";
import { CheckoutView } from "@/components/storefront/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Delivery details, GST invoice options and secure payment for your Patel Networks order.",
};

// Static shell — all data is fetched client-side (cart store + auth + pincode),
// so the page streams instantly and the numbered steps render in place.
export default function CheckoutPage() {
  return (
    <div className="container-inner pb-16 pt-8 lg:pt-12">
      <header className="mb-8 lg:mb-10">
        <p className="label-caps mb-2">Step 2 of 3 · Details &amp; payment</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Checkout</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          GST invoices are issued for every order. Stock is reserved the moment you place the order.
        </p>
      </header>
      <CheckoutView />
    </div>
  );
}

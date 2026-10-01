import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

// /wishlist now lives inside the account — gate the saved list behind sign-in.

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: true },
};

export default function WishlistAliasPage() {
  permanentRedirect("/account/wishlist");
}

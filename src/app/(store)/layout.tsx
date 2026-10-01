import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CompareTray } from "@/components/storefront/compare-tray";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { CartHydrator } from "@/store/cart-hydrator";

// Storefront shell: skip link, cart hydration, header stack (announcement /
// utility / nav + mega / search), main, reference-IA footer, compare tray,
// cart drawer. Tray + drawer are siblings AFTER footer so drawers overlay all.

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to content
      </a>
      <CartHydrator />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <CompareTray />
      <CartDrawer />
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CompareTray } from "@/components/storefront/compare-tray";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { CartHydrator } from "@/store/cart-hydrator";

// 404 — fully chromed (header stack + footer + drawers) so an unknown URL
// still feels like the store: the reference never strands the user on a bare
// error surface. Discovery links lead to real destinations.

export default function NotFound() {
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
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="max-w-lg text-center">
          <p className="label-caps">404 · Signal lost</p>
          <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">This feed is offline.</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            The page you requested doesn&rsquo;t exist or has been moved. The rest of the store is online and dispatching.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full px-6">
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link href="/products">Browse catalog</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full px-6">
              <Link href="/track">Track an order</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <CompareTray />
      <CartDrawer />
    </div>
  );
}

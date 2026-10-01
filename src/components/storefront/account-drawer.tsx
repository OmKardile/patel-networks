"use client";

// AccountDrawer — small right sheet from the header account button. On open it
// asks GET /api/auth/me: guests get the OTP sign-in prompt, signed-in traders
// get quick links plus sign-out (POST /api/auth/logout → router.refresh()).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, MapPin, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface MeResponse {
  ok?: boolean;
  data?: { userId: string; phone: string; fullName?: string | null };
}

const QUICK_LINKS = [
  { label: "My account", href: "/account", icon: User },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
];

export function AccountDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "guest" | "signed-in">("loading");
  const [fullName, setFullName] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setStatus("loading");
    setFullName(null);
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as MeResponse | null;
        if (!active) return;
        if (res.ok && json?.ok && json.data) {
          setStatus("signed-in");
          setFullName(json.data.fullName ?? null);
        } else {
          setStatus("guest");
        }
      })
      .catch(() => {
        if (active) setStatus("guest");
      });
    return () => {
      active = false;
    };
  }, [open]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onOpenChange(false);
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 data-[state=open]:duration-300 sm:max-w-xs"
      >
        <SheetHeader className="border-b p-4 pb-3">
          <SheetTitle className="text-base font-semibold">Account</SheetTitle>
          <SheetDescription className="text-xs">
            Orders, addresses and wishlist in one place.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 py-4">
          {status === "loading" ? (
            <div className="space-y-2" aria-hidden="true">
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          ) : status === "guest" ? (
            <div className="py-4 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary">
                <User className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-medium">Sign in to your account</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Track orders, save addresses and keep a wishlist across devices.
              </p>
              <Button asChild className="mt-5 h-11 w-full">
                <Link href="/account/login?next=/account">Sign in with OTP</Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="px-1 text-sm text-muted-foreground">
                Signed in{fullName ? ` as ${fullName}` : ""}
              </p>
              <nav aria-label="Account" className="mt-3 space-y-0.5">
                {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => onOpenChange(false)}
                    className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </nav>
              <Button
                variant="outline"
                className="mt-4 h-11 w-full"
                onClick={signOut}
                disabled={signingOut}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {signingOut ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

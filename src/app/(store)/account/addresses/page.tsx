import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/session";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { AccountAddressBook } from "@/components/storefront/account-address-book";

export const metadata: Metadata = {
  title: "Address Book",
  description: "Saved delivery addresses for checkout — up to 10, with a default address per account.",
};

export default async function AccountAddressesPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login?next=%2Faccount%2Faddresses");

  return (
    <div className="container-inner py-12 md:py-16">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "Addresses" }]}
        className="mb-8"
      />

      <header className="max-w-2xl">
        <p className="label-caps">Delivery addresses</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Address book</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Checkout prefill addresses come from here. One address is the default — it is preselected at checkout — and
          the book holds up to 10.
        </p>
      </header>

      <div className="mt-8 max-w-3xl">
        <AccountAddressBook />
      </div>
    </div>
  );
}

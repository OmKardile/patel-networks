import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/constants";
import { ContentPageShell, ContentColumn, ContentSection } from "@/components/storefront/content-page-shell";

export const metadata: Metadata = {
  title: "Terms of Sale — Patel Networks (MegaTechzy)",
  description:
    "Standard trade terms for buying surveillance and networking hardware from Patel Networks: GST-inclusive pricing, payment and COD conditions, title and risk, warranty, cancellation and jurisdiction.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <ContentPageShell
      eyebrow="Terms of sale"
      title="The rules of the counter, in writing"
      lede="These terms govern every order placed on this store. By confirming an order you accept them — the same terms our counter staff work to."
      aside="Last reviewed: Feb 2026"
    >
      <ContentColumn>
        <div className="divide-y divide-border rounded-lg border border-border bg-card px-6 py-2 shadow-whisper sm:px-10 sm:py-4">
          <ContentSection id="ts-parties" eyebrow="The contract" title="Who you are buying from">
            <p>
              Orders are placed with {STORE.legalName} — GSTIN {STORE.gstin}, Surat, Gujarat — hereafter
              &ldquo;we&rdquo;. Buyers represent that details supplied at checkout — name, phone, delivery address, and
              for B2B purchases the legal business name and GSTIN — are true and belong to them. Orders placed with
              false GSTINs may be cancelled and re-invoiced correctly.
            </p>
          </ContentSection>

          <ContentSection id="ts-pricing" eyebrow="Pricing & tax" title="GST-inclusive pricing, proper invoicing">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Listed prices are inclusive of <strong className="font-semibold">18% GST</strong> unless a page states
                otherwise. The invoice splits tax by destination: CGST + SGST for Gujarat deliveries, IGST for other
                states, with HSN codes per line.
              </li>
              <li>
                B2B buyers who enter a GSTIN receive a tax invoice naming their business; the invoice is the document
                of record for input tax credit. Re-billing of a personal-name order to a business later is not
                possible.
              </li>
              <li>
                A confirmed order reserves the listed price. If a listing error is discovered before dispatch, we
                contact you to confirm or cancel with a full refund.
              </li>
              <li>
                Coupons and bundle discounts apply as displayed at checkout; the order total on the payment screen is
                the final payable amount.
              </li>
            </ul>
          </ContentSection>

          <ContentSection id="ts-title" eyebrow="Title & risk" title="Ownership passes at the Surat dock">
            <p>
              <strong className="font-semibold">
                Title to, and risk in, the goods pass to the buyer when the packed consignment is handed to the carrier
                at our Surat warehouse.
              </strong>{" "}
              From that handover, transit is the carrier&apos;s custody under the shipping policy; loss or damage in
              transit is handled through the carrier process and the 7-day DOA window, not by re-opening the sale.
              Until handover, goods remain our stock and are insured as such.
            </p>
          </ContentSection>

          <ContentSection id="ts-payment" eyebrow="Payment" title="Prepaid and COD conditions">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Online payments are collected via Razorpay (UPI, cards, netbanking). An order is eligible for dispatch
                once payment is captured; failed or reversed payments release the reserved stock.
              </li>
              <li>
                <strong className="font-semibold">Cash on delivery</strong> is a selective facility: enabled per
                product, capped at ₹15,000 per order, unavailable in special/remote zones, with a ₹49 COD handling fee.
                Repeated refusal at the door may lead to COD being disabled for the account.
              </li>
              <li>
                <strong className="font-semibold">Bank transfer:</strong> NEFT/RTGS details are shared on request for
                orders above online limits; dispatch follows realisation of funds against the proforma invoice.
              </li>
            </ul>
          </ContentSection>

          <ContentSection id="ts-warranty" eyebrow="Warranty" title="The manufacturer warrants the hardware">
            <p>
              Patel Networks supplies hardware under the respective manufacturer&apos;s warranty (typically 2 years for
              CP Plus, Hikvision and Dahua cameras and recorders; 3 years for WD Purple drives — the binding period is
              printed on each product page and invoice). Beyond the 7-day DOA replacement window described in the{" "}
              <Link href="/return-policy" className="underline underline-offset-2 hover:text-foreground">
                return policy
              </Link>
              , remedies for defects are those the manufacturer provides through its service network. To the maximum
              extent permitted by law, our liability for any order is limited to the invoice value of the goods
              supplied under it, and we are not liable for consequential losses — including loss of recorded footage,
              site downtime or third-party claims — arising from product use.
            </p>
          </ContentSection>

          <ContentSection id="ts-changes" eyebrow="Order changes" title="Cancellation and amendments">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Orders may be cancelled while they are still unpaid or before dispatch; prepaid amounts are refunded to
                the original payment method.
              </li>
              <li>
                After carrier handover, a shipment cannot be intercepted; undelivered parcels return to Surat and are
                refunded per the return policy.
              </li>
              <li>
                We may cancel an order where stock proves unserviceable after reservation, or where the order breaches
                these terms; the buyer is informed and any payment is refunded in full.
              </li>
            </ul>
          </ContentSection>

          <ContentSection id="ts-law" eyebrow="Governing law" title="Jurisdiction: Surat, Gujarat">
            <p>
              These terms are governed by the laws of India. Sales made from this store are deemed to be concluded at
              Surat, Gujarat, and the courts at <strong className="font-semibold">Surat, Gujarat</strong> have
              exclusive jurisdiction over any dispute arising from them, without prejudice to seeking interim relief
              elsewhere where necessary. Disputes are first attempted in good faith through the trade desk and the
              grievance contact named in the{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
                privacy policy
              </Link>
              .
            </p>
          </ContentSection>
        </div>
      </ContentColumn>
    </ContentPageShell>
  );
}

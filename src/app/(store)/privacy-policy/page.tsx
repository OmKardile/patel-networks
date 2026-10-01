import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/constants";
import { ContentPageShell, ContentColumn, ContentSection } from "@/components/storefront/content-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — Data We Collect & How It Is Handled",
  description:
    "What Patel Networks collects (phone, addresses, GSTIN), how payments are processed by Razorpay without storing card data, WhatsApp notification consent, retention and grievance contact.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <ContentPageShell
      eyebrow="Privacy policy"
      title="Commercial data, handled like stock"
      lede="We collect the minimum a hardware trade requires — a phone number to reach you, an address to deliver to, a GSTIN when you ask for input tax credit — and we keep it as carefully as we keep inventory."
      aside="Last reviewed: Feb 2026"
    >
      <ContentColumn>
        <div className="divide-y divide-border rounded-lg border border-border bg-card px-6 py-2 shadow-whisper sm:px-10 sm:py-4">
          <ContentSection id="pp-footing" eyebrow="Legal footing" title="IT Act, 2000 and SPDI Rules">
            <p>
              This policy is framed under the Information Technology Act, 2000 and the (Reasonable Security Practices
              and Procedures and Sensitive Personal Data or Information) Rules, 2011. {STORE.legalName}, Surat,
              Gujarat is the data fiduciary for information collected on this store. By using the store you agree to
              the practices described here and to the{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
                terms of sale
              </Link>
              .
            </p>
          </ContentSection>

          <ContentSection id="pp-collect" eyebrow="What we collect" title="The minimum the trade requires">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="font-semibold">Identity &amp; contact:</strong> your mobile number — it is the
                sign-in identity for OTP login and the number order updates go to — plus an optional full name and
                email.
              </li>
              <li>
                <strong className="font-semibold">Delivery:</strong> shipping addresses you save or enter at checkout —
                recipient, lines, landmark, city, state, pincode — used for delivery and returns pickup.
              </li>
              <li>
                <strong className="font-semibold">Business tax details:</strong> legal business name and GSTIN when you
                opt for B2B input tax credit; these are printed on the tax invoice.
              </li>
              <li>
                <strong className="font-semibold">Order records:</strong> items, quantities, amounts, GST split,
                payment method, shipment and tracking events, and the serial numbers of dispatched units.
              </li>
              <li>
                <strong className="font-semibold">Inquiries:</strong> the details you submit to the trade desk (name,
                phone, company, GSTIN, requirement) — used only to answer the inquiry.
              </li>
              <li>
                <strong className="font-semibold">Technical logs:</strong> standard server logs and audit records
                required to operate and secure the store.
              </li>
            </ul>
          </ContentSection>

          <ContentSection id="pp-payments" eyebrow="Payments" title="Card data never touches our servers">
            <p>
              Online payments are processed by <strong className="font-semibold">Razorpay</strong> (UPI, cards,
              netbanking). Payment instruments are entered on Razorpay&apos;s PCI-DSS compliant infrastructure —
              Patel Networks does not collect or store card numbers, CVVs or UPI credentials. We receive and store only
              the payment confirmation identifiers needed to reconcile your order.
            </p>
          </ContentSection>

          <ContentSection id="pp-notifications" eyebrow="Notifications" title="WhatsApp and SMS consent">
            <p>
              Order-critical updates — confirmation, dispatch with tracking, out-for-delivery — are sent to the mobile
              number on the order by WhatsApp or SMS. By placing an order you consent to these transactional messages
              on that number. Marketing is opt-in and separate: we do not add buyers to promotional lists without
              their explicit consent.
            </p>
          </ContentSection>

          <ContentSection id="pp-sharing" eyebrow="Sharing" title="Who else touches your data">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="font-semibold">Carrier partners</strong> (Delhivery, Shiprocket network): recipient
                name, phone, address and item description — the minimum needed to deliver and collect on returns.
              </li>
              <li>
                <strong className="font-semibold">Payment gateway</strong> (Razorpay): order amount and identifiers, to
                collect and reconcile payment.
              </li>
              <li>
                <strong className="font-semibold">Brand service centres</strong>: invoice and serial details, only when
                you raise a warranty claim.
              </li>
              <li>
                <strong className="font-semibold">Law enforcement or tax authorities</strong>: where a valid legal
                process requires it.
              </li>
            </ul>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              We do not sell customer data, and we do not share it with advertisers.
            </p>
          </ContentSection>

          <ContentSection id="pp-retention" eyebrow="Retention & security" title="Kept as long as the ledger needs">
            <p>
              Order, invoice and tax records are retained for the period required by Indian tax law (GST records are
              conventionally kept for 72 months); account data is kept while your account is active and for a short
              period after deletion requests for legal reconciliation. Inventory audit logs are retained as part of
              the store&apos;s financial controls.
            </p>
            <p>
              Access to customer data is limited to staff roles that need it (fulfilment, order desk, accounts).
              Sessions use signed, HTTP-only cookies; passwords do not exist for customers — sign-in is by a
              time-limited OTP to your registered number.
            </p>
          </ContentSection>

          <ContentSection id="pp-choices" eyebrow="Your choices" title="Access, correction, deletion">
            <p>
              You may review and correct your profile and addresses in your account, request a copy of your data, or
              ask for your account to be deleted — subject to tax records we must legally retain. Grievances are heard
              by the store manager:
            </p>
            <div className="rounded-lg border border-border bg-muted/50 p-5 text-[14px]">
              <p className="font-medium">Grievance contact</p>
              <p className="mt-2 text-muted-foreground">
                {STORE.legalName}, Surat Central Hub, Surat, Gujarat {STORE.originPin}
                <br />
                {STORE.supportPhone} · {STORE.email}
              </p>
            </div>
          </ContentSection>
        </div>
      </ContentColumn>
    </ContentPageShell>
  );
}

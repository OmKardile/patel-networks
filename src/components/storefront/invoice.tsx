"use client";

// Invoice print action — triggers the browser print dialog for the GST tax invoice.
// The printable sheet itself lives in the invoice route (print-sheet class);
// this control is marked no-print there so it never appears on paper.

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvoicePrintButton() {
  return (
    <Button type="button" onClick={() => window.print()} className="no-print h-10 rounded-full px-5">
      <Printer className="h-4 w-4" aria-hidden /> Print / save PDF
    </Button>
  );
}

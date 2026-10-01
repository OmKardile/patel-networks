import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/money";

// Price — smallest money atom. Paise in, formatted ₹ out.

export function Price({
  paise,
  strike = false,
  className,
}: {
  paise: number;
  strike?: boolean;
  className?: string;
}) {
  return (
    <span className={cn(strike && "line-through", className)}>{formatINR(paise)}</span>
  );
}

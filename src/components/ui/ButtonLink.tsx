import Link from "next/link";
import { cn } from "@/lib/cn";
import { buttonVariantClasses, type ButtonVariant } from "./Button";

export function ButtonLink({
  href,
  variant = "primary",
  fullWidth = true,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-base font-medium transition-colors",
        fullWidth && "block w-full",
        buttonVariantClasses[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

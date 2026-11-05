import { forwardRef } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Pill buttons: gradient primary, ghost secondary, quiet tertiary. */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "text-white shadow-[0_6px_20px_-6px_rgba(99,102,241,0.55)] hover:shadow-[0_10px_28px_-6px_rgba(99,102,241,0.6)] hover:-translate-y-px [background:var(--gradient-button)]",
        secondary: "bg-surface text-ink border border-border-strong hover:border-primary/40 hover:bg-primary-soft/40 hover:-translate-y-px",
        ghost: "text-body hover:text-ink hover:bg-surface-2",
        soft: "bg-primary-soft text-primary-strong hover:bg-primary-soft/70",
        glass: "glass text-ink hover:bg-surface",
      },
      size: {
        sm: "h-8 px-3.5 text-sm",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, type = "button", ...props }, ref) => (
  <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";

type ButtonLinkProps = React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

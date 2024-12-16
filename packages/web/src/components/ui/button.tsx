import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, isPromise } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useState } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading: outLoading,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [innerLoading, setInnerLoading] = useState(false);
    const Comp = asChild ? Slot : "button";
    const loading =
      typeof outLoading === "undefined" ? innerLoading : outLoading;
    if (loading) {
      children = (
        <>
          <Loader className="animate-spin" />
          {children}
        </>
      );
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), {
          "opacity-50 pointer-events-none": loading,
        })}
        ref={ref}
        onClick={(e) => {
          setInnerLoading(true);
          const ret = onClick?.(e);
          if (isPromise(ret)) {
            ret.finally(() => setInnerLoading(false));
          } else {
            setInnerLoading(false);
          }
          return ret;
        }}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
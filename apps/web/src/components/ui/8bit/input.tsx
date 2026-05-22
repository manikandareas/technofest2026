import { cn } from "@/lib/utils";

import { Input as ShadcnInput } from "@/components/ui/base/input";

export interface BitInputProps extends React.ComponentProps<typeof ShadcnInput> {
  font?: "normal" | "retro";
}

function Input({ className, font = "normal", ...props }: BitInputProps) {
  return (
    <div className="relative flex items-center border-y-6 border-foreground !p-0 dark:border-ring">
      <ShadcnInput
        {...props}
        className={cn("!w-full rounded-none ring-0", font === "retro" && "retro", className)}
      />

      <div
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-foreground dark:border-ring"
        aria-hidden="true"
      />
    </div>
  );
}

export { Input };

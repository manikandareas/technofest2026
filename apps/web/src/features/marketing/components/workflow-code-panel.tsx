import type { ReactNode } from "react";

export function WorkflowCodePanel({ lines }: { lines: ReactNode[] }) {
  return (
    <div className="min-w-0">
      <div className="min-h-[16rem] rounded-2xl border border-border bg-card p-6 shadow-sm sm:min-h-[18rem] sm:p-8">
        <pre className="overflow-x-auto font-mono text-[13px] leading-[1.85] text-card-foreground sm:text-sm sm:leading-[1.9]">
          <code>
            {lines.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

"use client";

import React from "react";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function SoftCard({
  title,
  subtitle,
  right,
  children,
  className,
  style,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-black/5 p-4 shadow-sm sm:rounded-4xl sm:p-7",
        className
      )}
      style={
        style ?? {
          background:
            "linear-gradient(135deg,#ffffff 0%,rgba(239,208,202,0.18) 60%,rgba(125,128,218,0.08) 100%)",
        }
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-6 sm:leading-7 text-gray-600">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-4 sm:mt-5">{children}</div>
    </section>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const [hideMobileDock, setHideMobileDock] = useState(false);

  // Mobile draggable dock position (Y axis)
  const [dockY, setDockY] = useState<number | null>(null);
  const [desktopExpanded, setDesktopExpanded] = useState(false);

  const [clientProfile, setClientProfile] = useState<{
    name?: string;
    email?: string;
    role?: string;
    id?: number;
  } | null>(null);

  // If the top navbar (marketing) opens a full-screen mobile menu,
  // we temporarily hide the dashboard dock so the UI doesn't clash.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    const sync = () => {
      const isOpen = root.dataset.inneryNavOpen === "1";
      setHideMobileDock(isOpen);
    };

    sync();

    // Listen to explicit events (recommended)
    const onOpen = () => {
      root.dataset.inneryNavOpen = "1";
      setHideMobileDock(true);
    };
    const onClose = () => {
      root.dataset.inneryNavOpen = "0";
      setHideMobileDock(false);
    };

    window.addEventListener("innery:nav-open", onOpen);
    window.addEventListener("innery:nav-close", onClose);

    // Also observe attribute changes as a fallback
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["data-innery-nav-open"] });

    return () => {
      window.removeEventListener("innery:nav-open", onOpen);
      window.removeEventListener("innery:nav-close", onClose);
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem("innery_user");
      if (!raw) return;

      const first: unknown = JSON.parse(raw);
      const parsed: unknown =
        typeof first === "string" ? JSON.parse(first) : first;
      if (!parsed || typeof parsed !== "object") return;

      setClientProfile(parsed as {
        name?: string;
        email?: string;
        role?: string;
        id?: number;
      });
    } catch {
      // ignore
    }
  }, []);

  const normalize = (p?: string) => (p ? p.replace(/\/+$/, "") : "");
  const current = normalize(pathname);

  const isActive = (href: string, opts?: { exact?: boolean }) => {
    const target = normalize(href);
    if (opts?.exact) return current === target;
    return current === target || current.startsWith(target + "/");
  };
  const sidebarContent = (
      <>
        {/* HEADER / BRAND */}
                <div className="mb-6">
          {desktopExpanded ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white shadow-sm ring-1 ring-[#ece2e7] flex items-center justify-center">
                  <span className="text-[#7c5c6c] font-semibold">in</span>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2d1f27] truncate">innery</p>
                  <p className="text-[11px] text-[#a08a95] truncate">spațiul clientului</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDesktopExpanded((v) => !v)}
                aria-label="Restrange sidebar-ul"
                title="Restrange"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#7c5c6c] shadow-sm ring-1 ring-[#ece2e7] transition hover:bg-[#fffafb]"
              >
                <IconSidebarToggle expanded={desktopExpanded} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white shadow-sm ring-1 ring-[#ece2e7] flex items-center justify-center">
                <span className="text-[#7c5c6c] font-semibold">in</span>
              </div>

              <button
                type="button"
                onClick={() => setDesktopExpanded((v) => !v)}
                aria-label="Extinde sidebar-ul"
                title="Extinde"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#7c5c6c] shadow-sm ring-1 ring-[#ece2e7] transition hover:bg-[#fffafb]"
              >
                <IconSidebarToggle expanded={desktopExpanded} />
              </button>
            </div>
          )}
        </div>

        {desktopExpanded ? (
          <div className="mb-6 rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-[#eee3ea]">
            <p className="text-[11px] uppercase tracking-wide text-[#b8a5af]">ziua ta</p>
            <p className="mt-2 text-sm leading-5 text-[#2d1f27]">
              calm, clar, prezent
            </p>
          </div>
        ) : null}

        {/* NAV */}
        <nav className="mt-2 flex flex-col gap-2">
          <NavItem
            href={`/client`}
            label="Astăzi"
            icon={<IconHome />}
            active={isActive(`/client`, { exact: true })}
            compact={!desktopExpanded}
          />
          <NavItem
            href={`/client/progress`}
            label="Progres"
            icon={<IconCalendar />}
            active={isActive(`/client/progress`)}
            compact={!desktopExpanded}
          />
          <NavItem
            href={`/client/journal`}
            label="Jurnal"
            icon={<IconNote />}
            active={isActive(`/client/journal`)}
            compact={!desktopExpanded}
          />
          <NavItem
            href={`/client/plan`}
            label="Plan"
            icon={<IconSpark />}
            active={isActive(`/client/plan`)}
            compact={!desktopExpanded}
          />
        </nav>

        <div className="mt-7 pt-5 border-t border-[#eadfe5]">
          {desktopExpanded ? (
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a08a95]">
              preferințe
            </p>
          ) : null}

          <NavItem
            href={`/client/settings`}
            label="Setari"
            icon={<IconSettings />}
            active={isActive(`/client/settings`)}
            secondary
            compact={!desktopExpanded}
          />
        </div>

        {/* PROFILE */}
        <div className="mt-auto pt-8">
          {desktopExpanded ? (
            <div className="rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-[#eee3ea]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#f3e8ee] flex items-center justify-center text-[#7c5c6c] font-semibold shrink-0">
                  {(clientProfile?.name?.trim()?.[0] || "C").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2d1f27] truncate">
                    {clientProfile?.name || "Client"}
                  </p>
                  <p className="text-xs text-[#a08a95] truncate">
                    {clientProfile?.email || "fără email"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#eee3ea] text-sm font-medium text-[#7c5c6c] opacity-90 transition hover:shadow-[0_8px_18px_rgba(120,92,108,0.08)]">
              {(clientProfile?.name?.trim()?.[0] || "C").toUpperCase()}
            </div>
          )}
        </div>
      </>
  );

  return (
    <>
      {/* DESKTOP/TABLET: unchanged */}

      <aside
  className={[
    "hidden md:flex flex-col border-r border-[#eee3ea] bg-[linear-gradient(180deg,#fbf9fb,#f6f1f5)] px-3 py-5 shadow-[inset_-1px_0_0_#f0e6ec] transition-all duration-300 lg:px-4 lg:py-6",
    desktopExpanded ? "w-72" : "w-22",
  ].join(" ")}
>
        {sidebarContent}
      </aside>
    </>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
  secondary,
  compact,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  secondary?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex items-center rounded-[18px] py-2.5 transition-all duration-200",
        compact ? "justify-center px-0 overflow-visible" : "gap-3 px-3",
        active
          ? secondary
            ? "bg-white text-[#2d1f27] shadow-[0_10px_22px_rgba(120,92,108,0.08)] ring-1 ring-[#eadfe5]"
            : "bg-white text-[#6b4c5c] shadow-[0_10px_22px_rgba(120,92,108,0.08)] ring-1 ring-[#eadfe5]"
          : secondary
            ? "text-[#8a7b84] hover:bg-white hover:text-[#2d1f27] hover:shadow-[0_10px_22px_rgba(120,92,108,0.06)] hover:ring-1 hover:ring-[#f0e6ec]"
            : "text-[#7c5c6c] hover:bg-white hover:text-[#2d1f27] hover:shadow-[0_10px_22px_rgba(120,92,108,0.06)] hover:ring-1 hover:ring-[#f0e6ec]",
      ].join(" ")}
    >
      {!compact ? (
        <span
          className={[
            "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-full transition",
            active
              ? "bg-[#dcaec6]"
              : "bg-transparent group-hover:bg-[#ead4e0]",
          ].join(" ")}
        />
      ) : null}

      <span
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-[14px] transition shrink-0",
          active
            ? "bg-white text-[#6b4c5c] shadow-[0_6px_14px_rgba(120,92,108,0.08)]"
            : "bg-white/85 text-[#7c5c6c] group-hover:bg-white group-hover:text-[#2d1f27] group-hover:shadow-[0_6px_14px_rgba(120,92,108,0.06)]",
        ].join(" ")}
      >
        {icon}
      </span>

      {!compact ? (
        <span className="font-medium truncate">{label}</span>
      ) : (
        <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-30 -translate-y-1/2 whitespace-nowrap rounded-[18px] border border-[#eee3ea] bg-white px-3 py-2 text-sm font-medium text-[#2d1f27] opacity-0 shadow-[0_12px_30px_rgba(120,92,108,0.12)] transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
          {label}
        </span>
      )}
    </Link>
  );
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M3.5 10.5L12 3.75l8.5 6.75V20a1.5 1.5 0 0 1-1.5 1.5h-4.5V15a1.5 1.5 0 0 0-1.5-1.5h-2A1.5 1.5 0 0 0 9.5 15v6.5H5A1.5 1.5 0 0 1 3.5 20v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M7 3.75v2.5M17 3.75v2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M5.5 7.25h13"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.25 5.5h11.5A1.75 1.75 0 0 1 19.5 7.25v12A2 2 0 0 1 17.5 21.25h-11A2 2 0 0 1 4.5 19.25v-12A1.75 1.75 0 0 1 6.25 5.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8 11.25h3M8 14.75h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconNote() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M7 3.75h7.5L19.5 8.75V19.5A1.75 1.75 0 0 1 17.75 21.25H7A1.75 1.75 0 0 1 5.25 19.5V5.5A1.75 1.75 0 0 1 7 3.75Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 3.75v4.5h4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8 12h7M8 15.5h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect
        x="6"
        y="4"
        width="12"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 9h6M9 13h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M9 17l1.2 1.2L13 15.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 15.25a3.25 3.25 0 1 0-3.25-3.25A3.25 3.25 0 0 0 12 15.25Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M19.25 12a7.28 7.28 0 0 0-.09-1.15l2-1.54-2-3.46-2.42.98a7.39 7.39 0 0 0-2-.93L14.5 3.5h-5L9.26 5.9a7.39 7.39 0 0 0-2 .93l-2.42-.98-2 3.46 2 1.54A7.28 7.28 0 0 0 4.75 12c0 .39.03.77.09 1.15l-2 1.54 2 3.46 2.42-.98c.62.4 1.29.72 2 .93l.24 2.4h5l.24-2.4c.71-.21 1.38-.53 2-.93l2.42.98 2-3.46-2-1.54c.06-.38.09-.76.09-1.15Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarImageIcon({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="h-4.5 w-4.5 object-contain" />;
}

function IconSidebarToggle({ expanded }: { expanded: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      {expanded ? (
        <path
          d="M15 6 9 12l6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

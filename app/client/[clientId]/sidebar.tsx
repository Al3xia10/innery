"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({
  clientId,
}: {
  clientId: string;
}) {
  const pathname = usePathname();

  const [hideMobileDock, setHideMobileDock] = useState(false);

  // Mobile draggable dock position (Y axis)
  const [dockY, setDockY] = useState<number | null>(null);

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

  const normalize = (p?: string) => (p ? p.replace(/\/+$/, "") : "");
  const current = normalize(pathname);

  const isActive = (href: string, opts?: { exact?: boolean }) => {
    const target = normalize(href);
    if (opts?.exact) return current === target;
    return current === target || current.startsWith(target + "/");
  };
  const sidebarContent = useMemo(
    () => (
      <>
        {/* BRAND */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 ring-1 ring-indigo-600/10 flex items-center justify-center">
              <span className="text-indigo-700 font-semibold">in</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-gray-900 leading-tight">
                innery
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">client workspace</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-linear-to-br from-indigo-50 to-white border border-indigo-100 p-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              Keep your work calm, structured, and client-centered.
            </p>
          </div>
        </div>

        {/* MAIN NAV */}
        <div className="mb-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Workspace
        </div>
        <nav className="mt-3 flex flex-col gap-1 text-sm">
          <NavItem
            href={`/client/${clientId}`}
            label="Dashboard"
            icon={<IconHome />}
            active={isActive(`/client/${clientId}`, { exact: true })}
          />
          <NavItem
            href={`/client/${clientId}/reflections`}
            label="Reflections"
            icon={<IconSpark />}
            active={isActive(`/client/${clientId}/reflections`)}
          />
          <NavItem
            href={`/client/${clientId}/notes`}
            label="Notes"
            icon={<IconNote />}
            active={isActive(`/client/${clientId}/notes`)}
          />
        </nav>

        {/* DIVIDER */}
        <div className="my-8 h-px bg-gray-100" />

        {/* SECONDARY NAV */}
        <div className="mb-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Preferences
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          <NavItem
            href={`/client/${clientId}/settings`}
            label="Settings"
            icon={<IconSettings />}
            active={isActive(`/client/${clientId}/settings`)}
            secondary
          />
        </nav>

        {/* FOOTER */}
        <div className="mt-auto pt-8">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-600/10 ring-1 ring-indigo-600/10 flex items-center justify-center">
                <span className="text-indigo-700 font-semibold text-sm">T</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  client
                </p>
                <p className="text-xs text-gray-500 truncate">ID: {clientId}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>© 2025 innery</span>
            </div>
          </div>
        </div>
      </>
    ),
    [clientId, pathname]
  );

  return (
    <>
      {/* MOBILE: side dock navigation (icon-only, draggable) */}
      <nav
        aria-label="Workspace navigation"
        className={["md:hidden fixed -right-1.5 z-50", hideMobileDock ? "hidden" : ""].join(" ")}
        style={{
          top: dockY ?? "50%",
          transform: dockY ? "translateY(0)" : "translateY(-50%)",
        }}
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY;
          const startDockY = dockY ?? window.innerHeight / 2;

          const onMove = (ev: TouchEvent) => {
            const delta = ev.touches[0].clientY - startY;
            const next = Math.min(
              window.innerHeight - 120,
              Math.max(80, startDockY + delta)
            );
            setDockY(next);
          };

          const onEnd = () => {
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onEnd);
          };

          window.addEventListener("touchmove", onMove);
          window.addEventListener("touchend", onEnd);
        }}
      >
        <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur shadow-md p-1.5 active:opacity-100 opacity-85 transition">
          <div className="grid grid-rows-4 gap-1.5">
            <MobileNavItem
              href={`/client/${clientId}`}
              ariaLabel="Dashboard"
              active={isActive(`/client/${clientId}`, { exact: true })}
              icon={<IconHome />}
            />
          <MobileNavItem
            href={`/client/${clientId}/reflections`}
            ariaLabel="Reflections"
            active={isActive(`/client/${clientId}/reflections`)}
            icon={<IconSpark />}
          />
            <MobileNavItem
              href={`/client/${clientId}/notes`}
              ariaLabel="Notes"
              active={isActive(`/client/${clientId}/notes`)}
              icon={<IconNote />}
            />
            <MobileNavItem
              href={`/client/${clientId}/settings`}
              ariaLabel="Settings"
              active={isActive(`/client/${clientId}/settings`)}
              icon={<IconSettings />}
            />
          </div>
        </div>
      </nav>

      {/* DESKTOP/TABLET: unchanged */}
      <aside className="hidden md:flex w-72 flex-col border-r border-gray-100 bg-white/80 backdrop-blur px-6 py-7">
        {sidebarContent}
      </aside>
    </>
  );
}


function MobileNavItem({
  href,
  ariaLabel,
  icon,
  active,
}: {
  href: string;
  ariaLabel: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={[
        "group flex h-9 w-9 select-none items-center justify-center rounded-lg transition",
        active
          ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
          : "text-gray-600 hover:bg-gray-50 hover:text-indigo-700",
      ].join(" ")}
    >
      <span className="h-5 w-5 flex items-center justify-center">{icon}</span>
    </Link>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
  secondary,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
        active
          ? secondary
            ? "bg-gray-100 text-gray-900"
            : "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
          : secondary
          ? "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700",
      ].join(" ")}
    >
      {/* Active accent bar */}
      <span
        className={[
          "absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-full transition",
          active
            ? secondary
              ? "bg-gray-300"
              : "bg-indigo-500"
            : "bg-transparent group-hover:bg-indigo-200",
        ].join(" ")}
      />

      <span
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-lg transition",
          active
            ? secondary
              ? "bg-white text-gray-700"
              : "bg-white text-indigo-700"
            : "bg-gray-50 text-gray-600 group-hover:bg-white group-hover:text-indigo-700",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="font-medium">{label}</span>
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

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M16 11.5a3.25 3.25 0 1 0-3.25-3.25A3.25 3.25 0 0 0 16 11.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M6.75 11a2.75 2.75 0 1 0-2.75-2.75A2.75 2.75 0 0 0 6.75 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M19.5 20.25c0-3-1.9-5-4.75-5H14c-2.85 0-4.75 2-4.75 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.25 20.25c0-2.6-1.5-4.25-3.75-4.25H6c-2.25 0-3.75 1.65-3.75 4.25"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
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
      <path
        d="M12 2.75l1.5 4.5h4.75l-3.85 2.8 1.5 4.5L12 14.55l-3.9 2.8 1.5-4.5L5.75 7.25h4.75L12 2.75Z"
        stroke="currentColor"
        strokeWidth="1.7"
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

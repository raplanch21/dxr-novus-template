"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  ChevronRight,
  ChevronsUpDown,
  Compass,
  Flag,
  House,
  LayoutGrid,
  MonitorPlay,
  PanelLeft,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

type Breadcrumb = {
  label: string;
  href?: string;
};

const primaryNav: readonly NavItem[] = [
  { label: "Overview", icon: House, href: "/projects" },
  { label: "Dashboards", icon: LayoutGrid },
];

const launchNav: readonly NavItem[] = [
  { label: "Flags", icon: Flag },
  { label: "Guides", icon: Compass },
];

const cortexNav: readonly NavItem[] = [
  { label: "Signals", icon: Activity },
  { label: "Memory", icon: BookOpen },
  { label: "Replays", icon: MonitorPlay },
];

/**
 * Converts a project route into the reference prototype's breadcrumb pattern.
 */
function getBreadcrumbs(pathname: string): readonly Breadcrumb[] {
  const directory: Breadcrumb = { label: "Directory", href: "/" };
  if (pathname === "/projects") {
    return [directory, { label: "Your first project" }];
  }

  const routeLabel = pathname
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replaceAll("-", " ");

  return [
    directory,
    { label: "Your first project", href: "/projects" },
    { label: routeLabel || "Project" },
  ];
}

function NavigationItem({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const active = item.href === pathname;
  const className = cn(
    "flex h-8 w-full items-center gap-3 rounded-md px-3 text-[14px] leading-5 text-[#0a0a0a]",
    collapsed && "justify-center px-0",
    item.href && "transition-colors hover:bg-[#f5f5f5]",
    active && "bg-[#f5f5f5] font-medium",
  );
  const content = (
    <>
      <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
      <span className={collapsed ? "sr-only" : undefined}>{item.label}</span>
    </>
  );

  return item.href ? (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={className}
    >
      {content}
    </Link>
  ) : (
    <div className={className} title={collapsed ? item.label : undefined}>
      {content}
    </div>
  );
}

function NavigationSection({
  label,
  items,
  pathname,
  collapsed,
}: {
  label?: string;
  items: readonly NavItem[];
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div className={collapsed && label ? "pt-2" : undefined}>
      {label && !collapsed ? (
        <p className="px-3 pt-2 pb-1 font-mono text-[11px] leading-[15px] font-medium tracking-[0.3px] text-[#737373] uppercase">
          {label}
        </p>
      ) : null}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavigationItem
            key={item.label}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Provides the reference prototype's persistent Novus project shell.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="fixed inset-0 flex min-h-0 w-full overflow-hidden bg-white">
      <aside
        className={cn(
          "hidden h-screen shrink-0 flex-col overflow-hidden bg-white transition-[width] duration-200 md:flex",
          collapsed ? "w-12" : "w-56",
        )}
      >
        <div
          className={cn(
            "flex h-[78px] shrink-0 items-center px-3",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed ? (
            <Link
              href="/"
              aria-label="Novus"
              className="flex cursor-pointer items-center gap-2"
            >
              <span className="flex h-4 w-[110px] shrink-0 items-center gap-[9.5px]">
                <Image
                  src="/novus-symbol.svg"
                  alt=""
                  width={23}
                  height={15}
                  className="h-[14.8px] w-[23.4px] shrink-0"
                  aria-hidden="true"
                  priority
                />
                <Image
                  src="/novus-logotype.svg"
                  alt=""
                  width={77}
                  height={16}
                  className="h-[15.7px] w-[77.1px] shrink-0"
                  aria-hidden="true"
                  priority
                />
              </span>
              <span className="rounded border border-[#e5e5e5] px-1.5 py-0.5 text-[10px] leading-[15px] tracking-[0.8px] text-[#737373] uppercase">
                Beta
              </span>
            </Link>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!collapsed}
            className="size-[22px] text-[#2a2c35]"
          >
            <PanelLeft aria-hidden="true" className="size-3.5" />
          </Button>
        </div>

        <nav
          aria-label="Primary navigation"
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-1"
        >
          <NavigationSection
            items={primaryNav}
            pathname={pathname}
            collapsed={collapsed}
          />
          <NavigationSection
            label="Launch"
            items={launchNav}
            pathname={pathname}
            collapsed={collapsed}
          />
          <NavigationSection
            label="Cortex"
            items={cortexNav}
            pathname={pathname}
            collapsed={collapsed}
          />
        </nav>

        <div className="shrink-0 px-1">
          <div className="mx-3 mb-2 border-t border-[#e5e5e5]" />
          <button
            type="button"
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-md px-3 text-[14px] text-[#0a0a0a] hover:bg-[#f5f5f5]",
              collapsed && "justify-center px-0",
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings
              aria-hidden="true"
              className="size-4 shrink-0"
              strokeWidth={1.75}
            />
            <span className={collapsed ? "sr-only" : undefined}>Settings</span>
          </button>
        </div>

        <div
          className={cn(
            "mb-12 flex h-12 shrink-0 items-center gap-3 px-4",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "user@novus.ai" : undefined}
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#a43f00] text-[12px] text-white">
            n
          </div>
          <span
            className={cn(
              "text-[14px] leading-5 text-[#0a0a0a]",
              collapsed && "sr-only",
            )}
          >
            user@novus.ai
          </span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mx-2 mt-2 mb-12 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white md:ml-0">
          <header className="flex h-12 shrink-0 items-center border-b border-[#e5e5e5] bg-[#fafafa] px-4 sm:px-6">
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-1.5"
            >
              {breadcrumbs.map((breadcrumb, index) => (
                <div
                  key={`${breadcrumb.label}-${index}`}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  {index > 0 ? (
                    <ChevronRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-[#737373]"
                    />
                  ) : null}
                  {breadcrumb.href ? (
                    <Link
                      href={breadcrumb.href}
                      className="cursor-pointer truncate text-[14px] leading-5 text-[#737373] transition-colors hover:text-[#0a0a0a]"
                    >
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current="page"
                      className="truncate text-[14px] leading-5 font-medium text-[#0a0a0a]"
                    >
                      {breadcrumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <button
                type="button"
                className="hidden h-7 items-center gap-1.5 rounded-lg px-3 font-mono text-[12px] leading-4 text-[#0a0a0a] hover:bg-[#f5f5f5] sm:flex"
              >
                <span>Novus</span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-3 text-[#737373]"
                />
                <span>Novus sub</span>
                <ChevronsUpDown
                  aria-hidden="true"
                  className="size-3.5 text-[#737373]"
                />
              </button>
              <Button
                type="button"
                size="sm"
                className="gap-2 font-mono text-[12px] leading-4 font-normal"
              >
                <Image
                  src="/novus-mark.svg"
                  alt=""
                  width={14}
                  height={9}
                  aria-hidden="true"
                />
                <span>Ask Novus</span>
              </Button>
            </div>
          </header>
          <main className="min-h-0 flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

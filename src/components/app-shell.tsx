"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutGrid, PanelLeft } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
};

type Breadcrumb = {
  label: string;
  href?: string;
};

/**
 * Converts an application route into a short, sentence-style breadcrumb trail.
 */
function getBreadcrumbs(pathname: string): readonly Breadcrumb[] {
  if (pathname === "/") return [{ label: "Template" }];
  if (pathname === "/projects") return [{ label: "Projects" }];

  const routeLabel = pathname
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replaceAll("-", " ");

  return [
    { label: "Projects", href: "/projects" },
    { label: routeLabel || "Project" },
  ];
}

/**
 * Provides the reusable Novus navigation and content frame for project routes.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const projectsActive =
    pathname === "/projects" || pathname.startsWith("/projects/");
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
              <Image
                src="/novus-symbol.svg"
                alt=""
                width={23}
                height={15}
                className="h-[14.8px] w-[23.4px]"
                aria-hidden="true"
                priority
              />
              <Image
                src="/novus-logotype.svg"
                alt=""
                width={77}
                height={16}
                className="h-[15.7px] w-[77.1px]"
                aria-hidden="true"
                priority
              />
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

        <nav aria-label="Primary navigation" className="flex-1 px-1">
          <Link
            href="/projects"
            aria-current={projectsActive ? "page" : undefined}
            title={collapsed ? "Projects" : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-8 w-full justify-start gap-3 px-3 text-[14px] font-normal",
              collapsed && "justify-center px-0",
              projectsActive && "bg-[#f5f5f5] font-medium",
            )}
          >
            <LayoutGrid aria-hidden="true" className="size-4 shrink-0" />
            <span className={collapsed ? "sr-only" : undefined}>Projects</span>
          </Link>
        </nav>
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
          </header>
          <main className="min-h-0 flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

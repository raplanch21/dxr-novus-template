import Link from "next/link";
import { ArrowRight, Blocks, ChartNoAxesCombined, PanelsTopLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const foundations = [
  {
    title: "Shared components",
    description:
      "Build controls and surfaces with the complete shadcn component library.",
    icon: Blocks,
  },
  {
    title: "Dashboard patterns",
    description:
      "Reuse documented chart, metric, table, and status patterns from Storybook.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Novus app shell",
    description:
      "Start new prototype routes inside the established navigation and content frame.",
    icon: PanelsTopLeft,
  },
] as const;

/**
 * Introduces the reusable foundation without carrying forward prototype content.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col px-6 py-16 sm:py-24">
      <section className="max-w-2xl">
        <p className="font-mono text-[12px] leading-[18px] tracking-[0.3px] text-[#737373] uppercase">
          DXR Novus template
        </p>
        <h1 className="mt-3 text-[32px] leading-[1.2] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Build a Novus prototype
        </h1>
        <p className="mt-4 text-[14.22px] leading-[1.5] text-[#2a2c35]">
          Start with the shared design system, reusable dashboard patterns, and
          Novus app shell. Keep each product idea isolated in its own project
          route.
        </p>
        <Link
          href="/projects"
          className={buttonVariants({ className: "mt-6" })}
        >
          View projects
          <ArrowRight aria-hidden="true" data-icon="inline-end" />
        </Link>
      </section>

      <section aria-labelledby="included-foundation" className="mt-16">
        <h2
          id="included-foundation"
          className="text-[18px] leading-6 font-semibold text-[#0a0a0a]"
        >
          Included foundation
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {foundations.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              className="gap-4 rounded-xl border-[#e5e5e5] py-5 shadow-none"
            >
              <CardHeader className="gap-3 px-5">
                <div className="flex size-9 items-center justify-center rounded-lg border border-[#e5e5e5] text-[#2a2c35]">
                  <Icon aria-hidden="true" className="size-4" />
                </div>
                <CardTitle className="text-[16px] leading-6">{title}</CardTitle>
                <CardDescription className="text-[14.22px] leading-[1.5] text-[#737373]">
                  {description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import {
  Blocks,
  ChartColumnBig,
  PanelsTopLeft,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Lists the available projects.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-8 px-6 py-16 sm:py-24">
      <h1 className="text-[32px] leading-[1.2] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
        Project directory
      </h1>

      <section aria-label="Projects">
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/projects"
            className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a0a0a]"
          >
            <Card className="gap-4 rounded-xl border-[#e5e5e5] py-5 shadow-none transition-colors hover:border-[#a3a3a3] hover:bg-[#fafafa]">
              <CardHeader className="gap-3 px-5">
                <div className="flex size-9 items-center justify-center rounded-lg border border-[#e5e5e5] text-[#2a2c35]">
                  <PanelsTopLeft aria-hidden="true" className="size-4" />
                </div>
                <CardTitle className="text-[16px] leading-6">
                  Your first project
                </CardTitle>
                <CardDescription className="text-[14.22px] leading-[1.5] text-[#737373]">
                  Start building your first Novus prototype.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="project-resources-title"
        className="mt-auto flex flex-col gap-5 border-t border-[#e5e5e5] px-6 py-3"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="project-resources-title"
            className="text-[16px] leading-[1.35] font-semibold text-[#0a0a0a]"
          >
            Project resources
          </h2>
          <p className="max-w-[504px] text-[14px] leading-[22.75px] tracking-[-0.1504px] text-[#737373]">
            Build prototypes with the shared foundation in this workspace.
          </p>
        </div>
        <dl className="flex max-w-[504px] flex-col gap-3">
          <div className="flex flex-col gap-1">
            <dt className="flex items-center gap-2 text-[14px] leading-[1.35] font-semibold text-[#0a0a0a]">
              <span className="flex size-3.5 shrink-0 items-center justify-center text-[#2a2c35]">
                <Blocks aria-hidden="true" className="size-3.5" />
              </span>
              <span>Shared components</span>
            </dt>
            <dd className="ml-[22px] text-[14px] leading-[22.75px] tracking-[-0.1504px] text-[#737373]">
              Build controls and surfaces with the complete shadcn component
              library.
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="flex items-center gap-2 text-[14px] leading-[1.35] font-semibold text-[#0a0a0a]">
              <span className="flex size-3.5 shrink-0 items-center justify-center text-[#2a2c35]">
                <ChartColumnBig aria-hidden="true" className="size-3.5" />
              </span>
              <span>Data visualization patterns</span>
            </dt>
            <dd className="ml-[22px] text-[14px] leading-[22.75px] tracking-[-0.1504px] text-[#737373]">
              Reuse documented chart, metric, table, and status patterns from
              Storybook.
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="flex items-center gap-2 text-[14px] leading-[1.35] font-semibold text-[#0a0a0a]">
              <span className="flex size-3.5 shrink-0 items-center justify-center text-[#2a2c35]">
                <PanelsTopLeft aria-hidden="true" className="size-3.5" />
              </span>
              <span>Novus app shell</span>
            </dt>
            <dd className="ml-[22px] text-[14px] leading-[22.75px] tracking-[-0.1504px] text-[#737373]">
              Start prototype routes inside the established navigation and
              content frame.
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

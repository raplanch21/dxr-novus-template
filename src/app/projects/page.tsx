import { FolderPlus } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/**
 * Provides a stable starting point before the first prototype route is added.
 */
export default function ProjectsPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1120px] flex-col px-6 py-10">
      <header>
        <p className="font-mono text-[12px] leading-[18px] tracking-[0.3px] text-[#737373] uppercase">
          Workspace
        </p>
        <h1 className="mt-2 text-[22.78px] leading-[1.3] font-semibold text-[#0a0a0a]">
          Projects
        </h1>
      </header>

      <Empty className="mt-8 min-h-[360px] border border-[#e5e5e5]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderPlus aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle
            role="heading"
            aria-level={2}
            className="text-[16px] leading-6"
          >
            No projects yet
          </EmptyTitle>
          <EmptyDescription className="text-[14.22px] leading-[1.5]">
            Add each prototype as an isolated route under src/app/projects.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

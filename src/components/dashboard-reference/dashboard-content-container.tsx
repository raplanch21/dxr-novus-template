import type { DashboardContentContainerProps } from "./dashboard-types";

export function DashboardContentContainer({
  blocks,
  heading,
}: DashboardContentContainerProps) {
  return (
    <section className="flex min-w-0 w-full flex-col">
      <h3 className="text-[16px] leading-6 font-semibold text-[#0a0a0a]">
        {heading}
      </h3>

      <div className="mt-5 flex flex-col gap-5">
        {blocks.map((block, index) => (
          <article
            key={`${block.heading}-${index}`}
            className="flex flex-col gap-1.5"
          >
            <h4 className="text-[14px] leading-[1.5] font-semibold text-[#0a0a0a]">
              {block.heading}
            </h4>
            <p className="text-[14px] leading-[1.5] text-[#0a0a0a]">
              {block.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * Provides the first project's workspace entry point.
 */
export default function ProjectsPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1200px] flex-col px-6 py-8">
      <header>
        <h1 className="text-[18px] leading-7 font-semibold text-[#0a0a0a]">
          Your first project
        </h1>
        <p className="mt-0.5 text-[14px] leading-5 text-[#737373]">
          Build and explore your Novus prototype in this workspace.
        </p>
      </header>
    </div>
  );
}

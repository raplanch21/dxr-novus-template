import { AppShell } from "@/components/app-shell";

/**
 * Keeps every prototype route inside the shared Novus application frame.
 */
export default function ProjectsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}

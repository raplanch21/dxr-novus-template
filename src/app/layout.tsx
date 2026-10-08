import type { Metadata } from "next";

import {
  geist,
  geistMono,
  inter,
  sourceSerif,
  spaceMono,
} from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "DXR Novus template",
  description: "A reusable foundation for Novus product prototypes.",
};

/**
 * Loads the shared Novus type system and global styles for every route.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geist.variable} ${geistMono.variable} ${sourceSerif.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import QueryClientProvider from "~/providers/QueryClientProvider";
import Sidebar from "~/components/Sidebar";
import { Toaster } from "~/components/ui/toaster";
import { ThemeProvider } from "~/providers/ThemeProvider";
import ThemeToggle from "~/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Twinleaf Wiki",
  description: "Data for implemented cards within the Twinleaf Simulator.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      {/* offset collapsable sidebar on mobile with after:h-20 */}
      <body
        className="flex min-h-screen flex-col md:flex-row bg-background
          after:h-20 md:after:h-0"
      >
        <QueryClientProvider>
          <TRPCReactProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Sidebar />
              <div className="hidden md:inline fixed top-3 right-3 z-50">
                <ThemeToggle />
              </div>
              {children}
              <Toaster />
            </ThemeProvider>
          </TRPCReactProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

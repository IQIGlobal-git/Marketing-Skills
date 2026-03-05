import type { Metadata } from "next";
import "./globals.css";
import { AgentProvider } from "@/lib/agent-context";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Marketing Skills Agent Builder",
  description:
    "Browse marketing skills, build custom AI agents, and chat with them powered by Claude",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AgentProvider>
          <Header />
          {children}
        </AgentProvider>
      </body>
    </html>
  );
}

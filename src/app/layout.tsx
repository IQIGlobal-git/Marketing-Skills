/**
 * Root layout — Wraps the entire app with AgentProvider and renders the Header.
 *
 * Includes an inline script to prevent theme flash on page load by reading
 * the saved theme from localStorage before React hydrates.
 */
import type { Metadata } from "next";
import "./globals.css";
import { AgentProvider } from "@/lib/agent-context";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Marketing Skills Agent Builder",
  description:
    "Browse marketing skills, build custom AI agents, and chat with them. Supports Groq, OpenAI, Anthropic, and Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = JSON.parse(localStorage.getItem('theme')) || 'midnight';
                document.documentElement.setAttribute('data-theme', theme);
              } catch(e) {
                document.documentElement.setAttribute('data-theme', 'midnight');
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <AgentProvider>
          <Header />
          {children}
        </AgentProvider>
      </body>
    </html>
  );
}

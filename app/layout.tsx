import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "Kidzies · Big Adventures. Little Learners.", template: "%s · Kidzies" },
  description:
    "Kidzies is an online kindergarten where children learn through play in a 3D toy world, with portals for parents, teachers and schools.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#ff6f59", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 btn btn-secondary">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

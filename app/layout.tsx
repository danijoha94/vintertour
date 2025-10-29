import type { Metadata } from "next";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Vintertour",
  description: "Registrer utslag for vintertouren i golf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <ScrollToTop />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="py-4 text-center text-xs text-gray-600 bg-gray-50 border-t border-gray-200">
          Johansen Web © All right reserved
        </footer>
      </body>
    </html>
  );
}

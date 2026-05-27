import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { UTMTracker } from "@/components/layout/UTMTracker";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ivette Berroa | Cosmética Ancestral",
  description:
    "Ivette Berroa - Cosmética Ancestral. Tienda virtual premium y rituales botánicos orgánicos.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <CartProvider>
          <UTMTracker />
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}

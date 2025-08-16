import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import BottomNavbar from "./components/BottomNavbar";
import { ToastProvider } from "./contexts/ToastContext";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carta.cz - Inzerce aut zdarma",
  description: "Prodej a koupě aut jednoduše, bez reklam, zdarma",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ToastProvider> {/* ✅ OPRAVENO - ToastProvider wrappuje všechno */}
          <div className="app-wrapper">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
            <BottomNavbar />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}

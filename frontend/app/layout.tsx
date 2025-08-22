import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import BottomNavbar from "./components/BottomNavbar";
import { ToastProvider } from "./contexts/ToastContext";
import Footer from "./components/Footer";
import CookiesPopup from "./components/CookiesPopup";
import ScrollToTopButton from "./components/ScrollToTopButton";
import Script from "next/script";

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
  keywords: [
    "auta", "inzerce aut", "prodej aut", "koupě auta", "carta", "autobazar", "zdarma", "bez reklam"
  ],
  authors: [{ name: "Carta.cz tým", url: "https://carta.cz" }],
  openGraph: {
    title: "Carta.cz - Inzerce aut zdarma",
    description: "Prodej a koupě aut jednoduše, bez reklam, zdarma",
    url: "https://carta.cz",
    siteName: "Carta.cz",
    images: [
      {
        url: "/og-image.png", // Nahraj obrázek do /public
        width: 1200,
        height: 630,
        alt: "Carta.cz - Inzerce aut zdarma",
      },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carta.cz - Inzerce aut zdarma",
    description: "Prodej a koupě aut jednoduše, bez reklam, zdarma",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Carta.cz" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ToastProvider>
          <div className="app-wrapper">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
            <BottomNavbar />
            <CookiesPopup />
          </div>
          <ScrollToTopButton />
        </ToastProvider>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T59588T6DV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T59588T6DV');
          `}
        </Script>
      </body>
    </html>
  );
}

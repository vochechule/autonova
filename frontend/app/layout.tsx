import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles/components/AdCard.scss";
import Header from "./components/Header";
import BottomNavbar from "./components/BottomNavbar";
import { ToastProvider } from "./contexts/ToastContext";
import Footer from "./components/Footer";
import CookiesPopup from "./components/CookiesPopup";
import ScrollToTopButton from "./components/ScrollToTopButton";
import Script from "next/script";
import { AuthProvider } from "./hooks/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Carta.cz - Jednoduchý a moderní autobazar",
    template: "%s | Carta.cz",
  },
  description:
    "Objevte nový způsob prodeje a nákupu aut. Bez zbytečných poplatků, jednoduše a přehledně. Vyzkoušejte moderní autobazar na Carta.cz.",
  keywords: [
    "autobazar",
    "inzerce aut",
    "prodej aut",
    "ojetá auta",
    "koupě auta",
    "auto na prodej",
    "bazar vozidel",
    "carta",
    "auta zdarma",
    "nejlevnější auta",
    "škoda na prodej",
    "volkswagen bazar",
    "bmw prodej",
    "audi inzerce",
  ],
  authors: [{ name: "Carta.cz tým", url: "https://carta.cz" }],
  creator: "Carta.cz",
  publisher: "Carta.cz",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    title: "Carta.cz - Jednoduchý a moderní autobazar",
    description: "Objevte nový způsob prodeje a nákupu aut. Bez zbytečných poplatků.",
    url: "https://carta.cz",
    siteName: "Carta.cz",
    images: [
      {
        url: "https://carta.cz/og-image.png",
        width: 1200,
        height: 630,
        alt: "Carta.cz - Jednoduchý a moderní autobazar",
      },
    ],
    locale: "cs_CZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carta.cz - Jednoduchý a moderní autobazar",
    description: "Objevte nový způsob prodeje a nákupu aut. Bez zbytečných poplatků.",
    images: ["https://carta.cz/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://carta.cz",
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

        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://lfmfxfazzkpvojhhmnhv.supabase.co" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
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
        </AuthProvider>

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
            gtag('config', 'G-T59588T6DV', {
              page_title: document.title,
              page_location: window.location.href
            });
          `}
        </Script>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Header from "../app/ui/components/shared/header";
import Footer from "../app/ui/components/shared/footer";
import { CartProvider } from "@/lib/cart-provider";


export const metadata: Metadata = {
  title: "ZYNK Ecommerce",
  description:
    "Shop variety of electronics directly from local stores on ZYNK. Get the freshest, highest quality products delivered to your door. Support local electronics today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Fallback */}
        <link rel="icon" href="/favicon.ico" />

        {/* Favicons that switch with OS/browser theme */}
        <link
          rel="icon"
          href="/favicon-light.ico"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/favicon-dark.ico"
          media="(prefers-color-scheme: dark)"
        />

        {/* Optional: Change browser UI color for each theme (mobile browsers) */}
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0b1220"
          media="(prefers-color-scheme: dark)"
        />
      </head>

      <body>
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

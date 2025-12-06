import type { Metadata } from "next";
import { Geist, Geist_Mono, Tilt_Prism } from "next/font/google";
import "./globals.css";
import Header from "../app/ui/components/shared/header";
import Footer from "../app/ui/components/shared/footer";
import { CartProvider } from "@/lib/cart-provider";


const tiltPrism = Tilt_Prism({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-tilt-prism'
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NatFruits Ecommerce",
  description: "Shop native nature fruits directly from local farmers on NatFruits. Get the freshest, highest quality produce delivered to your door. Support local agriculture today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${tiltPrism.variable}`}>
        <CartProvider>
        <Header/>
        {children}
        <Footer/>
        </CartProvider>
      </body>
    </html>
  );
}

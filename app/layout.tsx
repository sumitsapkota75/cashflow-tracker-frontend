import { ThemeModeScript } from "flowbite-react";
import { Manrope } from "next/font/google";

import "./globals.css";
import Providers from "./providers";

const appSans = Manrope({
  subsets: ["latin"],
  variable: "--font-app-sans",
});

// root layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body className={`${appSans.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

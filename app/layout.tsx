import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

import Providers from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Trisula Sport Club",
  description: "Portal Akademik TSC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body
        className={`${poppins.className} min-h-screen antialiased `}
      >
        <Providers>
          {children}
        </Providers>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          theme="dark"
        />
      </body>
    </html>
  );
}
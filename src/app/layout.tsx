import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Homegym Duo", template: "%s · Homegym Duo" },
  description: "Our four-day home gym routine, tracked together.",
  appleWebApp: { capable: true, title: "Homegym Duo", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="grain flex min-h-full flex-col">
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{ style: { background: "#1b1f26", border: "1px solid #262b34", color: "#f2f1ec" } }}
        />
      </body>
    </html>
  );
}

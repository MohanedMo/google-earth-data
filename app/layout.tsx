import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "محلل تاريخ المباني",
  description: "تحليل تاريخ بناء وتغيير المباني باستخدام صور الأقمار الصناعية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}


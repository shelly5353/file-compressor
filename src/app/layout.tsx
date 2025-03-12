import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Compressor",
  description: "A simple tool to compress PDF files",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-900">
        {children}
      </body>
    </html>
  );
}

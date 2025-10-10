import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MTX Product Configurator",
  description: "Embeddable React product configurator with Supabase integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

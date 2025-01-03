import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/components/QueryClientProvider";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={""}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

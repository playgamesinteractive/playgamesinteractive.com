import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coming Soon - Play Games Interactive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Coming Soon - Play Games Interactive</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

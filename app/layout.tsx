import "./globals.css";
import Providers from "./providers";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: "NovaStake",
  description: "NovaStake Web App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1a3c] to-[#24243e] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
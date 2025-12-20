import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AppProvider } from "@/contexts/app-context";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB96zEHz_Hdc9vlzfhIUUeuzhpNX0BQ9Cw&libraries=places"></script>;
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ikration HRMS",
  description: "Created with v0",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.png",
        type: "image/png+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <AppProvider>
            <AuthGuard
              publicRoutes={[
                "/login",
                "/register",
                "/",
                "/setup-password",
                "/reset-password",
              ]}
            >
              {children}
            </AuthGuard>
          </AppProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

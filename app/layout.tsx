import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AppProvider } from "@/contexts/app-context";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { ThemeProvider } from "@/contexts/theme-context";
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB96zEHz_Hdc9vlzfhIUUeuzhpNX0BQ9Cw&libraries=places"></script>;
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ikration teamBook",
  description: "Created by Ikration",
  icons: {
    icon: [
      {
        url: "/tlogo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/tlogo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/tlogo.png",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <AppProvider>
              <AuthGuard
                publicRoutes={[
                  "/login",
                  "/register",
                  "/",
                  "/setup-password",
                  "/reset-password",
                  "/policy",
                ]}
              >
                {children}
              </AuthGuard>
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

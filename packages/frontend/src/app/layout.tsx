import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Poppins } from "next/font/google";
import theme from "@/theme";
import { ThemeProvider } from '@mui/material/styles';
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';
import { CartProvider } from "../store/CartContext";
import { CartPanelProvider } from "../store/CartPanelContext";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata = {
  title: "Tienda Sol",
  description: "Trabajo Práctico de Desarrollo de Software - Grupo 6",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es" className={poppins.variable}>
        <head />
        <body>
          <AppRouterCacheProvider options={{ key: "css", enableCssLayer: true }}>
            <ThemeProvider theme={theme}>
              <CartProvider>
                <CartPanelProvider>
                  {children}
                </CartPanelProvider>
              </CartProvider>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

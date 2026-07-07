import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
});

export const metadata: Metadata = {
  title: "سوق كبير | أكبر متجر إلكترونيات في مصر - هواتف، شاشات، سماعات وأجهزة",
  description: `أكبر تشكيلة من الإلكترونيات في مصر بأفضل الأسعار. تسوق أحدث الهواتف الذكية، الشاشات العملاقة، السماعات اللاسلكية، والأجهزة المنزلية الذكية. عروض حصرية، ضمان أصلي، وشحن سريع لجميع المحافظات.`,
  keywords:
    "إلكترونيات، هواتف ذكية، شاشات، سماعات، أجهزة منزلية، سوق كبير، مصر، تسوق إلكترونيات أونلاين",
  openGraph: {
    title: "سوق كبير | أكبر متجر إلكترونيات في مصر",
    description:
      "تسوق أحدث الهواتف الذكية، الشاشات العملاقة، السماعات اللاسلكية، والأجهزة المنزلية الذكية بأفضل الأسعار",
    type: "website",
    locale: "ar_EG",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={almarai.className}>
        <LanguageProvider>
          <CartProvider>
            <AuthProvider>
              <FavoritesProvider>
                <Navbar />
                <main>{children}</main>
                <Toaster
                  position="top-center" // مكان ظهور الإشعار
                  reverseOrder={false}
                />
                <Footer />
              </FavoritesProvider>
            </AuthProvider>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

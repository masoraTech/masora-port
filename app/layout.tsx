import { Inter, Sora } from "next/font/google";
import "./globals.css";

const display = Sora({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "Masora Technologies | Solutions numériques pour les entreprises",
  description: "Découvrez les projets de Masora Technologies : développement web et mobile, solutions ERP et accompagnement numérique.",
  icons: { icon: "/masora_technologies_icon.png" },
};

export const viewport = { themeColor: "#07080d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}

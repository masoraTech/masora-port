import "./globals.css";

export const metadata = {
  title: "Masora Technologies | Solutions numériques pour les entreprises",
  description: "Découvrez les projets de Masora Technologies : développement web et mobile, solutions ERP et accompagnement numérique.",
  icons: { icon: "/masora_technologies_icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

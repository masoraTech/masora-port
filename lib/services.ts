export type ServiceIcon = "mobile" | "web" | "app" | "erp" | "cart" | "code";

type ServiceInfo = { icon: ServiceIcon; description: string };

// Presentation details for each expertise (category slug). Unknown slugs get the fallback.
const SERVICES: Record<string, ServiceInfo> = {
  "developpement-mobile": {
    icon: "mobile",
    description: "Applications iOS et Android performantes, pensées pour vos utilisateurs.",
  },
  "creation-de-sites-web": {
    icon: "web",
    description: "Sites vitrines rapides, responsives et optimisés pour le référencement.",
  },
  "applications-web": {
    icon: "app",
    description: "Plateformes et outils métier sur mesure, accessibles partout.",
  },
  "solutions-erp": {
    icon: "erp",
    description: "Ventes, stocks et finances centralisés dans un seul outil de gestion.",
  },
  "e-commerce": {
    icon: "cart",
    description: "Boutiques en ligne sécurisées, du catalogue jusqu’au paiement.",
  },
};

const FALLBACK: ServiceInfo = {
  icon: "code",
  description: "Des solutions numériques sur mesure pour accompagner votre croissance.",
};

export function serviceInfo(slug: string): ServiceInfo {
  return SERVICES[slug] ?? FALLBACK;
}

export const SERVICE_ICON_PATHS: Record<ServiceIcon, string> = {
  mobile: "M8 2.5h8A1.5 1.5 0 0 1 17.5 4v16a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V4A1.5 1.5 0 0 1 8 2.5ZM11 18.5h2",
  web: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z",
  app: "M4 4.5h16A1.5 1.5 0 0 1 21.5 6v12a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V6A1.5 1.5 0 0 1 4 4.5ZM2.5 9h19M9 9v10.5",
  erp: "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  cart: "M3 4h2.2l2.3 11h10.8l2.2-8H6.6M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  code: "m8 8-4 4 4 4m8-8 4 4-4 4M14 5l-4 14",
};

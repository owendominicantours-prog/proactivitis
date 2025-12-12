export type ZoneHero = {
  title: string;
  subtitle: string;
  image?: string;
};

export type ZoneHighlight = string;

export type ZonePractical = {
  bestSeason: string;
  transport: string;
  localTip: string;
};

export type ZoneInfo = {
  country: string;
  countrySlug: string;
  zone: string;
  zoneSlug: string;
  hero: ZoneHero;
  summary: string;
  highlights: ZoneHighlight[];
  practical: ZonePractical;
};

export const zoneData: ZoneInfo[] = [
  {
    country: "República Dominicana",
    countrySlug: "dominican-republic",
    zone: "Punta Cana",
    zoneSlug: "punta-cana",
    hero: {
      title: "Sol, palmeras y cultura",
      subtitle: "Descubre el paraíso caribeño: playas de arena blanca, resorts de lujo y actividades para toda la familia.",
      image: "/fototours/puntacana-hero.jpg"
    },
    summary:
      "Punta Cana es el destino soñado del Caribe. Famosa por sus interminables playas de arena blanca bordeadas de cocoteros y un vibrante ambiente de resort, ofrece la mezcla perfecta de relajación y aventura. Desde emocionantes deportes acuáticos hasta una animada vida nocturna y excursiones culturales, este paraíso lo tiene todo para unas vacaciones inolvidables.",
    highlights: [
      "Playas de arena blanca y agua color turquesa.",
      "Vida nocturna activa y centros comerciales frente al mar.",
      "Tours de aventura por el campo dominicano."
    ],
    practical: {
      bestSeason: "Noviembre a abril (temporada seca).",
      transport: "Aeropuerto de Punta Cana (PUJ) con conexión a hoteles y resorts.",
      localTip: "Pide guías locales para conocer plantaciones de cacao y café."
    }
  },
  {
    country: "República Dominicana",
    countrySlug: "dominican-republic",
    zone: "Bayahíbe",
    zoneSlug: "bayahibe",
    hero: {
      title: "Costa auténtica y acceso a Saona",
      subtitle: "Un puerto tranquilo y pintoresco, puerta de entrada a la paradisíaca Isla Saona y arrecifes de coral espectaculares.",
      image: "/fototours/bayahibe-hero.jpg"
    },
    summary:
      "Bayahíbe ofrece una experiencia dominicana más relajada y auténtica. Este antiguo pueblo de pescadores es famoso por su puerto vibrante, desde donde parten catamaranes y lanchas hacia la icónica Isla Saona y la Isla Catalina. Es un punto clave para buceadores y amantes del snorkel, gracias a sus aguas tranquilas y arrecifes llenos de vida marina. Un destino esencial para los amantes de la playa virgen y la cultura local.",
    highlights: [
      "Catamaranes diarios a la isla Saona.",
      "Buceo y snorkel en arrecifes cercanos.",
      "Ambiente relajado frente al mar."
    ],
    practical: {
      bestSeason: "Todo el año; ideal de diciembre a marzo.",
      transport: "Transfer desde Punta Cana o La Romana; taxis y motoconchos locales.",
      localTip: "Visita el pueblo antes del tour para probar pescado fresco."
    }
  },
  {
    country: "República Dominicana",
    countrySlug: "dominican-republic",
    zone: "Samaná",
    zoneSlug: "samana",
    hero: {
      title: "Bahía de ballenas y naturaleza exuberante",
      subtitle: "El santuario natural de la RD: observación de majestuosas ballenas jorobadas, cascadas escondidas y playas vírgenes.",
      image: "/fototours/samana-hero.jpg"
    },
    summary:
      "La Península de Samaná es el escape perfecto para los amantes de la naturaleza. Famosa mundialmente por ser el santuario de las ballenas jorobadas cada invierno, la zona ofrece una belleza salvaje inigualable. Explora la imponente Cascada El Limón, relájate en el idílico Cayo Levantado y sumérgete en una cultura local rica y vibrante, lejos del bullicio de los grandes resorts.",
    highlights: [
      "Avistamiento de ballenas (enero–marzo).",
      "Excursiones a El Limón y Cayo Levantado.",
      "Cultura local en comunidades costeras."
    ],
    practical: {
      bestSeason: "Enero a marzo para ballenas; abril–julio para clima cálido.",
      transport: "Vuelos o transfer desde Santo Domingo; carretera costera panorámica.",
      localTip: "Contrata guías certificados para tours de ballenas y cascadas."
    }
  },
  {
    country: "República Dominicana",
    countrySlug: "dominican-republic",
    zone: "Macao",
    zoneSlug: "macao",
    hero: {
      title: "Playas de arena dorada y aventuras en buggy",
      subtitle: "La costa salvaje de Punta Cana. Adrenalina pura en tours de buggy y un paraíso del surf con playas vírgenes y doradas.",
      image: "/fototours/macao-hero.jpg"
    },
    summary:
      "Macao es el contrapunto aventurero a las tranquilas playas de resort. Esta costa virgen al este de Punta Cana es famosa por sus playas salvajes y su ambiente local relajado, siendo el lugar predilecto para los entusiastas del surf y las aventuras todoterreno. Súbete a un buggy o ATV para explorar cuevas y caminos rurales, y termina tu día disfrutando de un atardecer auténtico en la única playa pública certificada de la zona.",
    highlights: [
      "Tours de buggy y atv por dunas y caminos rurales.",
      "Playa pública con olas suaves para surf.",
      "Ambiente más íntimo que Punta Cana."
    ],
    practical: {
      bestSeason: "Diciembre a abril para clima seco.",
      transport: "Pickup desde Punta Cana, Bávaro y otros hoteles cercanos.",
      localTip: "Haz el tour de buggy al amanecer para evitar el calor."
    }
  }
];

export function getZoneInfo(countrySlug: string, zoneSlug: string): ZoneInfo | undefined {
  return zoneData.find((zone) => zone.countrySlug === countrySlug && zone.zoneSlug === zoneSlug);
}

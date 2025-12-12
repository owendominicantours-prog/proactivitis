export type InfoSection =
  | {
      type: "columns";
      title: string;
      columns: { title: string; items: string[] }[];
    }
  | {
      type: "faq";
      title: string;
      items: { question: string; answer: string }[];
    }
  | {
      type: "faq-group";
      title: string;
      items: { question: string; answer: string }[];
    }
  | {
      type: "cta";
      title: string;
      body: string;
      primaryLabel: string;
      primaryHref: string;
      secondaryLabel?: string;
      secondaryHref?: string;
    }
  | {
      type: "contact-info";
      title: string;
      items: { label: string; value: string }[];
    }
  | {
      type: "form";
      title: string;
      description?: string;
      fields: {
        name: string;
        label: string;
        type: string;
        required?: boolean;
        options?: string[];
        placeholder?: string;
      }[];
      submitLabel: string;
    }
  | {
      type: "steps";
      title: string;
      steps: { label: string; description: string }[];
    }
  | {
      type: "text";
      title: string;
      body: string[];
    }
  | {
      type: "bullets";
      title: string;
      items: string[];
    }
  | {
      type: "list";
      title: string;
      items: string[];
    }
  | {
      type: "legal-section";
      title: string;
      body: string[];
    };

export type InfoPage = {
  key: string;
  category: string;
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    layout: "standard" | "narrow";
  };
  sections: InfoSection[];
};

export const infoPages: InfoPage[] = [
  {
    key: "help-center",
    category: "support",
    path: "/help-center",
    title: "Centro de ayuda",
    seoTitle: "Centro de ayuda | Proactivitis",
    seoDescription: "Encuentra respuestas a preguntas frecuentes sobre reservas, pagos, proveedores y tu cuenta en Proactivitis.",
    hero: {
      eyebrow: "Soporte",
      title: "¿Cómo podemos ayudarte hoy?",
      subtitle: "Explora temas, consulta respuestas rápidas o contacta al equipo si necesitas un soporte personalizado.",
      layout: "standard"
    },
    sections: [
      {
        type: "columns",
        title: "Temas populares",
        columns: [
          {
            title: "Reservas y vouchers",
            items: [
              "Cómo confirmar una reserva",
              "Dónde encuentro mi voucher",
              "Cambiar fechas o datos de viajeros",
              "Qué pasa si un tour se cancela"
            ]
          },
          {
            title: "Pagos y reembolsos",
            items: [
              "Métodos de pago aceptados",
              "Cuándo se realiza el cobro",
              "Tiempo de reembolso",
              "Moneda y tipo de cambio"
            ]
          },
          {
            title: "Cuentas y seguridad",
            items: [
              "Crear una cuenta en Proactivitis",
              "Actualizar tu correo o teléfono",
              "Mantener tu cuenta segura",
              "Eliminar tu cuenta"
            ]
          }
        ]
      },
      {
        type: "faq",
        title: "Respuestas rápidas",
        items: [
          {
            question: "No recibí el correo de confirmación. ¿Qué debo hacer?",
            answer:
              "Primero revisa spam o promociones y verifica que el correo sea correcto. Si no aparece, utiliza 'Reenviar voucher' en tu página de reservas o escríbenos con nombre, fecha y tour."
          },
          {
            question: "¿Puedo cambiar la fecha de mi tour?",
            answer:
              "Muchas experiencias permiten cambios hasta cierto plazo. Entra a tu reserva en el panel y busca 'Cambiar fecha'. Si no aparece el botón, contáctanos y coordinamos con el proveedor."
          },
          {
            question: "¿Cuánto tardan los reembolsos?",
            answer:
              "Una vez aprobado, la mayoría de los bancos procesa el reembolso en 5 a 10 días hábiles. Algunas tarjetas internacionales pueden tardar más según su política."
          },
          {
            question: "¿Mis datos de pago están seguros?",
            answer:
              "Sí. Proactivitis trabaja con proveedores de pago que cumplen PCI y nunca guarda los datos completos de la tarjeta."
          }
        ]
      },
      {
        type: "cta",
        title: "¿Necesitas ayuda?",
        body: "Si no encuentras lo que necesitas, nuestro equipo de soporte te puede ayudar.",
        primaryLabel: "Contactar soporte",
        primaryHref: "/contact",
        secondaryLabel: "Ver preguntas frecuentes",
        secondaryHref: "/faqs"
      }
    ]
  },
  {
    key: "contact",
    category: "support",
    path: "/contact",
    title: "Contáctanos",
    seoTitle: "Contáctanos | Proactivitis",
    seoDescription: "Escríbenos para consultas de reservas, soporte al proveedor o alianzas.",
    hero: {
      eyebrow: "Soporte",
      title: "Habla con el equipo de Proactivitis",
      subtitle:
        "Atención local para experiencias globales. Cuéntanos qué necesitas y te respondemos lo antes posible.",
      layout: "standard"
    },
    sections: [
      {
        type: "contact-info",
        title: "Cómo contactarnos",
        items: [
          { label: "Customer support", value: "support@proactivitis.com" },
          { label: "Supplier relations", value: "suppliers@proactivitis.com" },
          { label: "Agency partners", value: "partners@proactivitis.com" },
          { label: "Emergency line (during tours only)", value: "+1 (000) 000 0000" }
        ]
      },
      {
        type: "form",
        title: "Envíanos un mensaje",
        description: "Cuéntanos qué necesitas para dirigir tu solicitud al equipo adecuado.",
        fields: [
          { name: "name", label: "Nombre completo", type: "text", required: true },
          { name: "email", label: "Correo", type: "email", required: true },
          {
            name: "topic",
            label: "Tema",
            type: "select",
            options: [
              "Booking support",
              "Payment & refund",
              "Supplier onboarding",
              "Agency partnership",
              "Technical issue",
              "Other"
            ],
            required: true
          },
          {
            name: "bookingCode",
            label: "Código de reserva (opcional)",
            type: "text",
            required: false,
            placeholder: "Si tu consulta es sobre una reserva"
          },
          { name: "message", label: "Mensaje", type: "textarea", required: true }
        ],
        submitLabel: "Enviar mensaje"
      }
    ]
  },
  {
    key: "how-it-works",
    category: "support",
    path: "/how-it-works",
    title: "Cómo funciona",
    seoTitle: "Cómo funciona Proactivitis",
    seoDescription: "Descubre cómo conectamos viajeros, proveedores y agencias a través de una sola plataforma.",
    hero: {
      eyebrow: "Producto",
      title: "Así funciona Proactivitis",
      subtitle: "Una plataforma que une viajeros, proveedores locales y agencias con pasos claros desde buscar hasta cobrar.",
      layout: "standard"
    },
    sections: [
      {
        type: "steps",
        title: "Para viajeros",
        steps: [
          { label: "Descubre", description: "Busca por destino, fecha o tipo de experiencia y compara tours verificados en una sola vista." },
          { label: "Reserva", description: "Elige fecha, tamaño del grupo e idioma. Completa el pago y recibe confirmación al instante cuando el tour lo permita." },
          { label: "Disfruta", description: "Encuentra al proveedor en el punto de encuentro o en el pickup del hotel, muestra tu voucher y vive la experiencia." }
        ]
      },
      {
        type: "steps",
        title: "Para proveedores y agencias",
        steps: [
          {
            label: "Publica experiencias",
            description: "Crea páginas detalladas con fotos, itinerarios, disponibilidades y precios."
          },
          {
            label: "Gestiona reservas",
            description: "Usa el panel de proveedor para confirmar, chatear con viajeros, administrar cupos y medir rendimiento."
          },
          {
            label: "Cobros",
            description: "Proactivitis procesa pagos online y libera fondos según experiencias completadas y acuerdos pactados."
          }
        ]
      }
    ]
  },
  {
    key: "faqs",
    category: "support",
    path: "/faqs",
    title: "Preguntas frecuentes",
    seoTitle: "Preguntas frecuentes | Proactivitis",
    seoDescription: "Respuestas claras sobre Proactivitis, reservas, pagos y proveedores.",
    hero: {
      eyebrow: "Soporte",
      title: "Preguntas frecuentes",
      subtitle: "Respuestas breves y útiles a lo que más preguntan nuestros usuarios.",
      layout: "narrow"
    },
    sections: [
      {
        type: "faq-group",
        title: "Reservas",
        items: [
          {
            question: "¿Necesito imprimir mi voucher?",
            answer:
              "En la mayoría de los casos aceptamos vouchers móviles. Si un tour exige impresos, lo verás claro en la página del tour y en tu correo de confirmación."
          },
          {
            question: "¿Puedo reservar para otra persona?",
            answer:
              "Sí. Solo ingresa el nombre y los datos de contacto del viajero durante el checkout para que el proveedor pueda comunicarse con la persona correcta."
          }
        ]
      },
      {
        type: "faq-group",
        title: "Pagos",
        items: [
          {
            question: "¿Qué monedas aceptan?",
            answer:
              "Cobramoss principalmente en monedas globales (USD, EUR y otras según tu ubicación). La moneda final siempre la ves antes de confirmar."
          },
          {
            question: "¿Hay cargos adicionales?",
            answer:
              "Todos los cargos obligatorios se muestran antes de pagar. Extras opcionales (fotos, bebidas premium, etc.) aparecen como no incluidos."
          }
        ]
      }
    ]
  },
  {
    key: "about",
    category: "company",
    path: "/about",
    title: "Sobre Proactivitis",
    seoTitle: "Sobre Proactivitis | Experiencias locales globales",
    seoDescription: "La historia de Proactivitis, plataforma local que conecta viajeros con operadores confiables.",
    hero: {
      eyebrow: "Empresa",
      title: "Creado por locales para viajeros globales",
      subtitle:
        "Proactivitis nació en el Caribe ayudando a visitantes y creció hasta ser una plataforma para proveedores globales.",
      layout: "standard"
    },
    sections: [
      {
        type: "text",
        title: "Nuestra historia",
        body: [
          "Proactivitis nació en el Caribe, donde viajeros preguntaban una y otra vez: “¿En quién confío para vivir una experiencia real y segura?” Como operadores locales, conocíamos ambos lados: invitados que buscaban claridad y proveedores ahogados entre correos, hojas de Excel y múltiples marketplaces.",
          "Decidimos construir algo distinto: una plataforma tan cercana como tu contacto local en WhatsApp, pero tan robusta como los grandes players globales. Hoy Proactivitis conecta viajeros, proveedores y agencias en un solo lugar con herramientas de reservas, notificaciones, pagos y rendimiento."
        ]
      },
      {
        type: "text",
        title: "Qué nos hace distintos",
        body: [
          "Local-first: partimos desde el terreno trabajando con operadores locales.",
          "Transparencia: precios claros, comunicación abierta y expectativas definidas para cada experiencia.",
          "Mentalidad de producto: unimos experiencia en ruta con software moderno para mantener todo simple y confiable."
        ]
      }
    ]
  },
  {
    key: "mission",
    category: "company",
    path: "/our-mission",
    title: "Nuestra misión",
    seoTitle: "Nuestra misión | Proactivitis",
    seoDescription: "Hacemos que las experiencias locales sean fáciles de reservar, operar y más justas.",
    hero: {
      eyebrow: "Empresa",
      title: "Nuestra misión",
      subtitle: "Facilitar experiencias locales para viajeros, proveedores y agencias.",
      layout: "standard"
    },
    sections: [
      {
        type: "bullets",
        title: "Tres promesas simples",
        items: [
          "Para viajeros: información clara, pago seguro y soporte confiable.",
          "Para proveedores: herramientas modernas sin perder la relación humana con invitados.",
          "Para agencias: inventario, comisiones y comunicación claros."
        ]
      },
      {
        type: "text",
        title: "Cómo medimos el éxito",
        body: [
          "Nos enfocamos en experiencias completadas, satisfacción del viajero y relaciones duraderas con proveedores, no solo en clics o impresiones.",
          "Cada nueva funcionalidad que lanzamos debe responder: ¿hace la vida más fácil a viajeros, proveedores o agencias?"
        ]
      }
    ]
  },
  {
    key: "press",
    category: "company",
    path: "/press",
    title: "Press & media",
    seoTitle: "Press & media | Proactivitis",
    seoDescription: "Press resources, brand story and media contact information for Proactivitis.",
    hero: {
      eyebrow: "Medios",
      title: "Prensa y medios",
      subtitle: "¿Cubres a Proactivitis o el sector de tours y actividades? Aquí tienes un punto de partida.",
      layout: "narrow"
    },
    sections: [
      {
        type: "text",
        title: "Resumen de marca",
        body: [
          "Proactivitis es un marketplace global y plataforma SaaS para tours y actividades, creado por operadores que conocen lo que ocurre en el terreno.",
          "Ayudamos a proveedores a digitalizar su inventario y alcanzar viajeros globales manteniendo un trato local y humano."
        ]
      },
      {
        type: "list",
        title: "Recursos para prensa",
        items: [
          "Guías de marca (logo, colores, tipografía)",
          "Logos en versiones claras y oscuras",
          "Capturas del producto (marketplace y paneles)",
          "Biografías de fundadores y líderes"
        ]
      },
      {
        type: "contact-info",
        title: "Contacto para medios",
        items: [{ label: "Consultas de prensa", value: "press@proactivitis.com" }]
      }
    ]
  },
  {
    key: "partners",
    category: "company",
    path: "/partners",
    title: "Aliados",
    seoTitle: "Aliados | Proactivitis",
    seoDescription: "Descubre cómo trabajamos con operadores locales, agencias y socios tecnológicos.",
    hero: {
      eyebrow: "Empresa",
      title: "Aliados",
      subtitle: "Colaboramos con operadores locales, agencias y partners tecnológicos que priorizan la calidad y la transparencia.",
      layout: "standard"
    },
    sections: [
      {
        type: "columns",
        title: "Tipos de aliados",
        columns: [
          { title: "Operadores locales", items: ["Proveedores de experiencias individuales", "Operadores multi-destino", "Diseñadores de experiencias y DMCs"] },
          { title: "Agencias", items: ["Agencias de viaje online", "Conserjerías y desks de hoteles", "Agencias especializadas"] },
          { title: "Tecnología", items: ["Procesadores de pago", "Gestores de conectividad y canales", "Ecosistemas travel-tech"] }
        ]
      }
    ]
  },
  {
    key: "become-supplier",
    category: "work-with-us",
    path: "/become-a-supplier",
    title: "Conviértete en supplier",
    seoTitle: "Conviértete en supplier | Proactivitis",
    seoDescription: "Publica tus tours en Proactivitis y accede a herramientas hechas para operadores reales.",
    hero: {
      eyebrow: "Colabora",
      title: "Conviértete en supplier de Proactivitis",
      subtitle: "Publica tus tours, gestiona reservas y cobra con herramientas pensadas para operadores locales.",
      layout: "standard"
    },
    sections: [
      {
        type: "bullets",
        title: "Por qué unirse a Proactivitis",
        items: [
          "Visibilidad en el marketplace y herramientas privadas B2B en la misma plataforma.",
          "Notificaciones en tiempo real de nuevas reservas, cambios y cancelaciones.",
          "Reglas claras de pagos y reportes transparentes."
        ]
      },
      {
        type: "steps",
        title: "Cómo funciona la incorporación",
        steps: [
          { label: "Aplica", description: "Envía los datos de tu empresa, licencias y ejemplos de experiencias." },
          { label: "Revisión y configuración", description: "Verificamos tu información, te ayudamos a estructurar productos y conectamos pagos." },
          { label: "Activa tu producto", description: "Publica tus tours, recibe reservas y administra todo desde el panel." }
        ]
      }
    ]
  },
  {
    key: "agency-partners",
    category: "work-with-us",
    path: "/agency-partners",
    title: "Alianzas con agencias",
    seoTitle: "Alianzas con agencias | Proactivitis",
    seoDescription: "Descubre cómo las agencias acceden a inventario curado y comisiones claras.",
    hero: {
      eyebrow: "Colabora",
      title: "Alianzas con agencias",
      subtitle: "Conecta a tus clientes con tours locales curados manteniendo control sobre márgenes y servicio.",
      layout: "standard"
    },
    sections: [
      {
        type: "text",
        title: "Diseñado para agencias",
        body: [
          "Las agencias necesitan más que un enlace genérico. Proactivitis ofrece productos curados, comisiones transparentes y herramientas para mantener el control.",
          "Usa nuestro inventario o integra tus propios proveedores dentro de la plataforma con tu marca."
        ]
      }
    ]
  },
  {
    key: "affiliates",
    category: "work-with-us",
    path: "/affiliates",
    title: "Afiliados",
    seoTitle: "Afiliados | Proactivitis",
    seoDescription: "Monetiza tu comunidad recomendando experiencias seleccionadas.",
    hero: {
      eyebrow: "Colabora",
      title: "Afiliados",
      subtitle: "¿Tu audiencia ama viajar? Asóciate con Proactivitis y gana comisiones por reservas confirmadas.",
      layout: "narrow"
    },
    sections: [
      {
        type: "bullets",
        title: "Para quién es",
        items: ["Creadores de contenido y bloggers de viajes", "Comunidades y clubs privados", "Plataformas de nicho y newsletters"]
      }
    ]
  },
  {
    key: "careers",
    category: "work-with-us",
    path: "/careers",
    title: "Carreras (próximamente)",
    seoTitle: "Carreras | Proactivitis",
    seoDescription: "Próximas oportunidades laborales con el equipo de Proactivitis.",
    hero: {
      eyebrow: "Colabora",
      title: "Carreras en Proactivitis",
      subtitle: "Construimos una compañía guiada por producto con raíces en el viaje local. Los roles aparecerán aquí mientras crecemos.",
      layout: "narrow"
    },
    sections: [
      {
        type: "text",
        title: "Mantente al tanto",
        body: [
          "Todavía no estamos contratando roles full-time, pero colaboramos con diseñadores, ingenieros y expertos locales.",
          "Si quieres trabajar con nosotros en el futuro, comparte tu perfil y te tendremos en cuenta para próximos proyectos."
        ]
      }
    ]
  },
  {
    key: "terms",
    category: "legal",
    path: "/legal/terms",
    title: "Términos y condiciones",
    seoTitle: "Términos y condiciones | Proactivitis",
    seoDescription: "Consulta los términos que aplican cuando usas Proactivitis como viajero, proveedor o agencia.",
    hero: {
      eyebrow: "Legal",
      title: "Términos y condiciones",
      subtitle: "Explican cómo funciona Proactivitis y las responsabilidades de viajeros, proveedores y agencias.",
      layout: "narrow"
    },
    sections: [
      {
        type: "legal-section",
        title: "1. Alcance del servicio",
        body: [
          "Proactivitis opera una plataforma online que conecta viajeros con proveedores independientes y agencias.",
          "No operamos las experiencias directamente, salvo cuando se indica en la página del producto."
        ]
      },
      {
        type: "legal-section",
        title: "2. Tu cuenta",
        body: ["Eres responsable de mantener tus credenciales confidenciales.", "Aceptas que la información que entregas es precisa y está actualizada."]
      },
      {
        type: "legal-section",
        title: "3. Reservas y pagos",
        body: [
          "Al reservar una experiencia, estableces una relación contractual directa con el proveedor que la opera.",
          "Proactivitis procesa pagos en nombre del proveedor y puede actuar como comerciante registrado según país y método de pago."
        ]
      },
      {
        type: "legal-section",
        title: "4. Cancelaciones y reembolsos",
        body: [
          "Cada producto tiene su propia política de cancelación visible en el checkout y en el correo de confirmación.",
          "Si corresponde reembolso, se procesará por el método de pago original."
        ]
      },
      {
        type: "legal-section",
        title: "5. Responsabilidad",
        body: [
          "Los proveedores son responsables de operar sus experiencias de forma segura y de cumplir las leyes locales.",
          "Dentro de lo permitido por la ley, Proactivitis no es responsable por daños indirectos, incidentales o consecuentes derivados del uso de la plataforma o de las experiencias."
        ]
      }
    ]
  },
  {
    key: "privacy",
    category: "legal",
    path: "/legal/privacy",
    title: "Política de privacidad",
    seoTitle: "Política de privacidad | Proactivitis",
    seoDescription: "Conoce cómo recolectamos, usamos y protegemos tus datos personales.",
    hero: {
      eyebrow: "Legal",
      title: "Política de privacidad",
      subtitle: "Respetamos tu privacidad y explicamos claramente cómo tratamos tus datos.",
      layout: "narrow"
    },
    sections: [
      {
        type: "legal-section",
        title: "1. Datos que recopilamos",
        body: [
          "Información de contacto como nombre, correo y teléfono.",
          "Detalles de reserva como fechas, viajeros, productos seleccionados y estado de pago.",
          "Datos de uso como páginas visitadas, dispositivo e ubicación aproximada."
        ]
      },
      {
        type: "legal-section",
        title: "2. Cómo usamos tus datos",
        body: [
          "Para procesar reservas y pagos.",
          "Para comunicarnos sobre tus viajes, solicitudes de soporte y novedades relevantes.",
          "Para mejorar la plataforma y prevenir fraudes o mal uso."
        ]
      },
      {
        type: "legal-section",
        title: "3. Compartir tus datos",
        body: [
          "Compartimos la información mínima necesaria con proveedores y socios para que entreguen tu experiencia.",
          "Podemos usar proveedores terceros para pagos, analítica y envíos de correo, sujetos a acuerdos de protección de datos."
        ]
      },
      {
        type: "legal-section",
        title: "4. Tus derechos",
        body: [
          "Según tu ubicación, puedes tener derechos a acceder, corregir o eliminar tus datos personales.",
          "Para ejercerlos contáctanos en privacy@proactivitis.com."
        ]
      }
    ]
  },
  {
    key: "cookies",
    category: "legal",
    path: "/legal/cookies",
    title: "Cookies",
    seoTitle: "Política de cookies | Proactivitis",
    seoDescription: "Entiende cómo usamos cookies y tecnologías similares en Proactivitis.",
    hero: {
      eyebrow: "Legal",
      title: "Política de cookies",
      subtitle: "Usamos cookies para hacer que Proactivitis funcione, mejorar el rendimiento y mostrar contenido relevante.",
      layout: "narrow"
    },
    sections: [
      {
        type: "legal-section",
        title: "1. ¿Qué son las cookies?",
        body: ["Las cookies son pequeños archivos de texto que se guardan en tu dispositivo al visitar un sitio. Ayudan a recordar tus preferencias y actividad."]
      },
      {
        type: "legal-section",
        title: "2. Tipos de cookies que usamos",
        body: [
          "Cookies esenciales para mantener el sitio funcionando y seguro.",
          "Cookies de análisis para entender cómo los usuarios usan Proactivitis.",
          "Cookies de preferencia para recordar tu idioma o moneda."
        ]
      },
      {
        type: "legal-section",
        title: "3. Gestionar cookies",
        body: [
          "Puedes controlar las cookies desde la configuración del navegador y las herramientas de consentimiento que ofrecemos.",
          "Si desactivas ciertas cookies, tu experiencia o algunas funciones podrían verse afectadas."
        ]
      }
    ]
  },
  {
    key: "legal-info",
    category: "legal",
    path: "/legal/information",
    title: "Información legal",
    seoTitle: "Información legal | Proactivitis",
    seoDescription: "Datos legales y corporativos de Proactivitis.",
    hero: {
      eyebrow: "Legal",
      title: "Información legal",
      subtitle: "Detalles corporativos y regulatorios de Proactivitis.",
      layout: "narrow"
    },
    sections: [
      {
        type: "text",
        title: "Datos de la empresa",
        body: [
          "Proactivitis es operada por Owen Dominicanproactivitis Limited.",
          "Registrada como empresa en Estados Unidos mediante Stripe Atlas (jurisdicción y número de registro se añadirán aquí)."
        ]
      },
      {
        type: "text",
        title: "Contacto legal",
        body: ["Para correspondencia legal, avisos y consultas regulatorias, escribe a legal@proactivitis.com."]
      }
    ]
  }
];

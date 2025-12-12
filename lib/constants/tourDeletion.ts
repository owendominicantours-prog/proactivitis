export type TourDeleteReason = {
  value: string;
  label: string;
};

export const TOUR_DELETE_REASONS: TourDeleteReason[] = [
  { value: "1", label: "Baja Calidad (Reseñas)" },
  { value: "2", label: "Violación de Políticas" },
  { value: "3", label: "Información Engañosa/Falsa" },
  { value: "4", label: "Sin Licencia/Documentación" },
  { value: "5", label: "Riesgo de Seguridad" },
  { value: "6", label: "Inactividad Prolongada" }
];

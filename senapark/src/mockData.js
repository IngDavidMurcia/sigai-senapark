export const INITIAL_USERS = [
  {
    id: "10203040",
    name: "Carlos Mario Castañeda",
    roles: ["Instructor", "Administrativo"],
    center: "CTM",
    phone: "3115551234",
    plates: ["ABC123", "XYZ890"],
    assets: [
      { id: "ast-001", name: "Portátil Lenovo ThinkPad", serial: "SN-LNV-9921" },
      { id: "ast-002", name: "Videobeam Epson", serial: "SN-EPS-3344" }
    ],
    isSpecial: true, // Directivo con reserva
    specialReason: "Director de Complejo"
  },
  {
    id: "98765432",
    name: "Adriana Maria Alzate",
    roles: ["Estudiante"],
    center: "CUERO",
    phone: "3206667890",
    plates: ["MOT999"],
    assets: [
      { id: "ast-003", name: "Caja de Herramientas de Marroquinería", serial: "HERR-CUERO-09" }
    ],
    isSpecial: false
  },
  {
    id: "111222333",
    name: "Jhon Alexander Gomez",
    roles: ["Instructor"],
    center: "CONFECCIONES",
    phone: "3007771122",
    plates: ["KJH902"],
    assets: [
      { id: "ast-004", name: "Portátil Asus ROG", serial: "SN-ASU-4412" }
    ],
    isSpecial: true, // Discapacidad
    specialReason: "Movilidad Reducida"
  },
  {
    id: "444555666",
    name: "Clara Inés Ochoa",
    roles: ["Administrativo"],
    center: "OTRO", // Destino: Administración Complejo
    phone: "3154448899",
    plates: ["FTY554"],
    assets: [],
    isSpecial: false
  }
];

export const INITIAL_VEHICLES = [
  { plate: "ABC123", type: "Carro", ownerId: "10203040" },
  { plate: "XYZ890", type: "Moto", ownerId: "10203040" },
  { plate: "MOT999", type: "Moto", ownerId: "98765432" },
  { plate: "KJH902", type: "Carro", ownerId: "111222333" },
  { plate: "FTY554", type: "Carro", ownerId: "444555666" }
];

export const INITIAL_INCIDENTS = [
  {
    id: 1,
    targetType: "vehicle",
    targetValue: "ABC123",
    type: "Exceso Velocidad",
    severity: "Yellow",
    description: "Condujo a más de 40 km/h en la vía interna del complejo.",
    date: "2026-05-28"
  },
  {
    id: 2,
    targetType: "user",
    targetValue: "98765432",
    type: "Mal Parqueado",
    severity: "Red",
    description: "Estacionó su moto bloqueando la salida de emergencia de CUERO.",
    date: "2026-05-30"
  }
];

// Generar cupos de parqueadero predeterminados (General para todo el complejo)
export const generateInitialSpots = () => {
  const spots = [];

  // Definir cantidad de cupos
  let carCount = 50;
  let motoCount = 120;
  let biciCount = 30;

  // Carros
  for (let i = 1; i <= carCount; i++) {
    let type = "General";
    if (i <= 3) type = "Discapacitados";
    else if (i >= 4 && i <= 8) type = "Reservado Directivos";

    spots.push({
      id: `GEN-C-${i}`,
      center: "GENERAL",
      vehicleType: "Carro",
      label: `C-${String(i).padStart(2, "0")}`,
      type,
      status: "libre",
      occupiedBy: null // { plate, userId, entryTime }
    });
  }

  // Motos
  for (let i = 1; i <= motoCount; i++) {
    spots.push({
      id: `GEN-M-${i}`,
      center: "GENERAL",
      vehicleType: "Moto",
      label: `M-${String(i).padStart(2, "0")}`,
      type: "General",
      status: "libre",
      occupiedBy: null
    });
  }

  // Bicis
  for (let i = 1; i <= biciCount; i++) {
    spots.push({
      id: `GEN-B-${i}`,
      center: "GENERAL",
      vehicleType: "Bici",
      label: `B-${String(i).padStart(2, "0")}`,
      type: "General",
      status: "libre",
      occupiedBy: null
    });
  }

  return spots;
};

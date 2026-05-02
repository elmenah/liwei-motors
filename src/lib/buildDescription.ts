type Spec = { label: string; value: string };

// Normaliza texto para comparar sin tildes ni mayúsculas
function norm(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Busca una spec cuyo label contenga alguna de las palabras clave
function findSpec(specs: Spec[], ...keywords: string[]): string | null {
  for (const s of specs) {
    const label = norm(s.label);
    if (keywords.some((k) => label.includes(norm(k)))) return s.value;
  }
  return null;
}

export function buildDescription(name: string, category: string, specs: Spec[]): string {
  const cat = norm(category);
  const isBicicleta = cat.includes("bicicleta") || cat.includes("bici");
  const isTriciclo  = cat.includes("triciclo") || cat.includes("tricycle");
  const isScooter   = cat.includes("scooter") || cat.includes("moto");

  // Artículo y tipo de vehículo según categoría
  const articulo = isBicicleta ? "La" : "El";
  const tipo = isBicicleta
    ? "bicicleta eléctrica"
    : isTriciclo
    ? "triciclo eléctrico"
    : isScooter
    ? "scooter eléctrico"
    : "vehículo eléctrico";

  // "un/una" según género
  const artIndef = isBicicleta ? "una" : "un";

  // Extraer specs clave
  const motor     = findSpec(specs, "motor", "potencia");
  const bateria   = findSpec(specs, "bateria", "battery", "acumulador");
  const autonomia = findSpec(specs, "autonomia", "autonomy", "rango", "alcance");
  const velocidad = findSpec(specs, "velocidad", "speed", "vel.");
  const carga     = findSpec(specs, "carga", "capacidad de carga", "peso maximo", "payload");
  const plataforma = findSpec(specs, "plataforma", "superficie", "plataforma de carga");
  const tiempo    = findSpec(specs, "carga electrica", "tiempo de carga", "recarga", "carga (h)", "carga en");

  // Si no hay specs, descripción genérica
  if (specs.length === 0) {
    if (isBicicleta) {
      return `La ${name} es una bicicleta eléctrica pensada para la movilidad urbana eficiente. Ideal para uso diario con tecnología de batería de litio y diseño liviano.`;
    }
    if (isTriciclo) {
      return `El ${name} es un triciclo eléctrico diseñado para carga y distribución comercial. Combina alta capacidad de transporte con eficiencia energética y bajo costo operativo.`;
    }
    return `El ${name} es un scooter eléctrico pensado para la movilidad urbana eficiente. Ideal para uso diario, con tecnología de batería de litio y diseño compacto.`;
  }

  // Construcción de oraciones
  const sentences: string[] = [];

  // — Oración 1: tipo + motor + autonomía
  let s1 = `${articulo} ${name} es ${artIndef} ${tipo}`;
  const s1Parts: string[] = [];
  if (motor) s1Parts.push(`motor de ${motor}`);
  if (autonomia) s1Parts.push(`autonomía de ${autonomia}`);
  if (bateria && !autonomia) s1Parts.push(`batería ${bateria}`);
  if (s1Parts.length) s1 += ` con ${s1Parts.join(" y ")}`;
  s1 += ".";
  sentences.push(s1);

  // — Oración 2: velocidad + carga / plataforma
  const s2Parts: string[] = [];
  if (velocidad) s2Parts.push(`velocidad máxima de ${velocidad}`);
  if (carga) s2Parts.push(`soporta hasta ${carga} de carga`);
  if (plataforma) s2Parts.push(`plataforma de ${plataforma}`);
  if (s2Parts.length) sentences.push(`${s2Parts.join(", ")}.`.replace(/^./, (c) => c.toUpperCase()));

  // — Oración 3: cierre según categoría
  if (isBicicleta) {
    const cierre = tiempo
      ? `Se recarga en ${tiempo}, perfecta para la movilidad diaria sin esfuerzo.`
      : `Perfecta para trayectos urbanos y ciclovías con bajo costo operativo.`;
    sentences.push(cierre);
  } else if (isTriciclo) {
    const cierre = carga
      ? `Ideal para transporte de mercadería, logística urbana y uso comercial intensivo.`
      : `Perfecta para delivery, reparto y distribución de última milla.`;
    sentences.push(cierre);
  } else {
    const cierre = tiempo
      ? `Se recarga en ${tiempo}, siendo la opción perfecta para desplazamientos urbanos eficientes.`
      : `Diseñado para el uso diario en ciudad con el menor costo operativo.`;
    sentences.push(cierre);
  }

  return sentences.join(" ");
}

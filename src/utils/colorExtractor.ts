/**
 * Utility to extract vibrant and harmonious ambient colors from album cover images.
 * Uses HTML5 Canvas to sample pixel data and compute dominant vibrant hues.
 */

export interface ExtractedColors {
  primary: string;       // Color primario (ambient glow principal)
  secondary: string;     // Color secundario (glow armónico)
  palette: string[];     // Paleta de colores sugeridos de la imagen
  isFallback?: boolean;  // True si CORS impidió la lectura directa de píxeles
}

// Convierte RGB a Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convierte Hex a RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }
  return null;
}

// Convierte RGB a HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Convierte HSL a Hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

// Paleta romántica y estética por defecto en caso de fallback
const FALLBACK_PALETTES = [
  { primary: "#f43f5e", secondary: "#fb7185", palette: ["#f43f5e", "#fb7185", "#e11d48", "#be123c", "#fda4af"] }, // Rosa Romántico
  { primary: "#e11d48", secondary: "#9333ea", palette: ["#e11d48", "#9333ea", "#c026d3", "#f43f5e", "#7e22ce"] }, // Pasión Púrpura
  { primary: "#f59e0b", secondary: "#f43f5e", palette: ["#f59e0b", "#f43f5e", "#fbbf24", "#ea580c", "#d97706"] }, // Golden Hour / Atardecer
  { primary: "#06b6d4", secondary: "#3b82f6", palette: ["#06b6d4", "#3b82f6", "#0284c7", "#2563eb", "#67e8f9"] }, // Océano Profundo
  { primary: "#10b981", secondary: "#059669", palette: ["#10b981", "#059669", "#34d399", "#047857", "#6ee7b7"] }, // Esmeralda Dulce
];

/**
 * Analiza la imagen de la portada y extrae el color vibrante primario,
 * un color armónico secundario y una paleta de 5 tonos relacionados.
 */
export async function extractColorsFromImage(imageUrl: string): Promise<ExtractedColors> {
  if (!imageUrl || imageUrl.trim() === "") {
    return FALLBACK_PALETTES[0];
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    // Si tarda más de 3 segundos, retornar fallback armónico sin congelar la UI
    const timer = setTimeout(() => {
      resolve(getFallbackFromUrl(imageUrl));
    }, 3000);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(getFallbackFromUrl(imageUrl));
          return;
        }

        // Muestreamos a 64x64 para máxima velocidad y balance perfecto
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;

        // Bucket por tonalidad (Hue: 0 a 360 en intervalos de 30 grados)
        const buckets: {
          rSum: number;
          gSum: number;
          bSum: number;
          count: number;
          maxSaturation: number;
        }[] = Array.from({ length: 12 }, () => ({
          rSum: 0,
          gSum: 0,
          bSum: 0,
          count: 0,
          maxSaturation: 0,
        }));

        let totalValidPixels = 0;
        let avgR = 0;
        let avgG = 0;
        let avgB = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Ignorar píxeles transparentes
          if (a < 128) continue;

          // Ignorar píxeles casi negros (oscuridad) o casi blancos (quemados)
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness < 25 || brightness > 235) continue;

          const [h, s, l] = rgbToHsl(r, g, b);

          // Ponderar píxeles con saturación viva (más ricos visualmente)
          if (s >= 15 && l >= 20 && l <= 80) {
            const bucketIdx = Math.min(11, Math.floor(h / 30));
            const bucket = buckets[bucketIdx];
            bucket.rSum += r;
            bucket.gSum += g;
            bucket.bSum += b;
            bucket.count += (s / 100) * 2; // Pesar saturación
            if (s > bucket.maxSaturation) bucket.maxSaturation = s;
          }

          avgR += r;
          avgG += g;
          avgB += b;
          totalValidPixels++;
        }

        // Ordenar buckets por relevancia (combinación de cantidad y viveza)
        const sortedBuckets = buckets
          .filter((b) => b.count > 0)
          .sort((a, b) => b.count * (b.maxSaturation / 50) - a.count * (a.maxSaturation / 50));

        if (sortedBuckets.length === 0) {
          if (totalValidPixels > 0) {
            const r = Math.round(avgR / totalValidPixels);
            const g = Math.round(avgG / totalValidPixels);
            const b = Math.round(avgB / totalValidPixels);
            const primary = rgbToHex(r, g, b);
            const [h, s, l] = rgbToHsl(r, g, b);
            const secondary = hslToHex((h + 40) % 360, Math.max(40, s), Math.max(35, l));
            resolve({
              primary,
              secondary,
              palette: [primary, secondary, hslToHex((h + 80) % 360, s, l), hslToHex((h + 180) % 360, s, l), "#f43f5e"],
            });
            return;
          }
          resolve(getFallbackFromUrl(imageUrl));
          return;
        }

        // Color primario: el bucket más vibrante y representativo
        const topBucket = sortedBuckets[0];
        const primaryR = Math.round(topBucket.rSum / (topBucket.count / 2 || 1));
        const primaryG = Math.round(topBucket.gSum / (topBucket.count / 2 || 1));
        const primaryB = Math.round(topBucket.bSum / (topBucket.count / 2 || 1));
        const primaryHex = rgbToHex(primaryR, primaryG, primaryB);

        // Color secundario: segundo mejor bucket o desplazamiento armónico análogo
        let secondaryHex = "";
        if (sortedBuckets.length > 1) {
          const second = sortedBuckets[1];
          const secR = Math.round(second.rSum / (second.count / 2 || 1));
          const secG = Math.round(second.gSum / (second.count / 2 || 1));
          const secB = Math.round(second.bSum / (second.count / 2 || 1));
          secondaryHex = rgbToHex(secR, secG, secB);
        } else {
          const [h, s, l] = rgbToHsl(primaryR, primaryG, primaryB);
          secondaryHex = hslToHex((h + 35) % 360, Math.min(90, s + 10), Math.min(65, l + 5));
        }

        // Construir paleta de 5 colores armónicos
        const palette = sortedBuckets.slice(0, 5).map((b) => {
          const r = Math.round(b.rSum / (b.count / 2 || 1));
          const g = Math.round(b.gSum / (b.count / 2 || 1));
          const bl = Math.round(b.bSum / (b.count / 2 || 1));
          return rgbToHex(r, g, bl);
        });

        // Asegurar al menos 5 swatches
        while (palette.length < 5) {
          const [h, s, l] = rgbToHsl(primaryR, primaryG, primaryB);
          palette.push(hslToHex((h + palette.length * 45) % 360, s, l));
        }

        resolve({
          primary: primaryHex,
          secondary: secondaryHex,
          palette,
        });
      } catch (err) {
        // En caso de CORS en dominios externos sin encabezados, usar fallback armónico
        console.warn("Extracción pixel de imagen limitada por CORS, usando armonía sugerida:", err);
        const fallback = getFallbackFromUrl(imageUrl);
        resolve({ ...fallback, isFallback: true });
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(getFallbackFromUrl(imageUrl));
    };

    img.src = imageUrl;
  });
}

function getFallbackFromUrl(url: string): ExtractedColors {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FALLBACK_PALETTES.length;
  return FALLBACK_PALETTES[index];
}

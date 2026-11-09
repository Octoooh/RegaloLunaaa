export interface Song {
  id: string;
  titulo: string;
  artista: string;
  album?: string;
  duracion: string;
  portada: string;
  audioPreview?: string;
  spotifyUrl: string;
  dedicatoria: string;
  fechaOMomento: string;
  colorAmbiental: string;
  colorSecundario: string;
}

/**
 * =========================================================================
 * GUÍA PARA AÑADIR PORTADAS PERSONALIZADAS (portada):
 * 
 * 1. Desde Google Imágenes:
 *    - Busca la imagen que quieras en Google Imágenes.
 *    - Haz clic en la imagen para abrir la vista previa grande en el lateral.
 *    - Haz clic derecho sobre esa imagen y selecciona:
 *      👉 "Copiar dirección de la imagen" (en Chrome/Edge)
 *      👉 "Copiar enlace de la imagen" (en Firefox/Safari)
 *    - NO elijas "Copiar vínculo" o "Copiar enlace", ya que esos copian el
 *      enlace de búsqueda de Google (google.com/imgres...) y no la imagen real.
 *    - Pega ese enlace directo (que empiece por https://) en el campo 'portada'.
 * 
 * 2. Desde Unsplash, Pinterest o Imgur:
 *    - Copia el enlace directo que termine en .jpg, .png o .webp.
 * 
 * 3. Fotos de tu teléfono o PC:
 *    - Puedes usar el botón "Subir foto propia" en el panel de personalización
 *      de la aplicación para convertir tu foto en un enlace Base64 seguro.
 * 
 * GUÍA PARA AUDIO CON ENLACES DE DROPBOX O MP3 (audioPreview):
 * 1. Enlace de Dropbox (¡Automático!):
 *    - Copia el link de tu archivo en Dropbox:
 *      audioPreview: "https://www.dropbox.com/s/xyz123/cancion.mp3?dl=0"
 *    - La aplicación convierte automáticamente dl=0 en streaming directo,
 *      reproduciendo la canción sin problemas en el reproductor grande.
 * 2. Mismo directorio (Modo sin internet):
 *    - Guarda el MP3 junto al index.html: audioPreview: "cancion1.mp3"
 * 3. Incrustado en Base64:
 *    - Usa el botón "Subir archivo MP3 local" en el editor de la web.
 * =========================================================================
 */
export const LISTA_CANCIONES: Song[] = [
  {
    id: "song-1",
    titulo: "Golden Hour",
    artista: "JVKE",
    album: "MTV Unplugged",
    duracion: "3:29",
    portada: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    audioPreview: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    spotifyUrl: "https://open.spotify.com/track/5odlY52u43F5QqByZXEu79",
    dedicatoria: "Esta canción me recuerda a esa tarde de verano en la que nos quedamos mirando el atardecer sin decir una sola palabra. En ese instante supe que contigo el tiempo se detiene.",
    fechaOMomento: "Nuestra primera tarde frente al mar",
    colorAmbiental: "#f59e0b", // Ámbar dorado cálido
    colorSecundario: "#ea580c"  // Naranja crepúsculo
  },
  {
    id: "song-2",
    titulo: "Until I Found You",
    artista: "Stephen Sanchez",
    album: "Easy On My Eyes",
    duracion: "2:57",
    portada: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
    audioPreview: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=romantic-piano-10657.mp3",
    spotifyUrl: "https://open.spotify.com/track/0T5iIrXA4p5G9F2grRJXxQ",
    dedicatoria: "Cada vez que suena el estribillo pienso en lo afortunado que soy de haberte encontrado. Eres mi refugio seguro y mi mayor alegría.",
    fechaOMomento: "El baile improvisado en la cocina",
    colorAmbiental: "#e11d48", // Rosa rubí romántico
    colorSecundario: "#9333ea"  // Púrpura terciopelo
  },
  {
    id: "song-3",
    titulo: "Yellow",
    artista: "Coldplay",
    album: "Parachutes",
    duracion: "4:29",
    portada: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    audioPreview: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=acoustic-guitar-love-story-20839.mp3",
    spotifyUrl: "https://open.spotify.com/track/3AJwUDP919kvQ9QcozQPxg",
    dedicatoria: "Mira las estrellas, mira cómo brillan por ti... Gracias por llenar mi vida de luz en los días más grises y por ser mi persona favorita en el mundo.",
    fechaOMomento: "Noche de estrellas en la azotea",
    colorAmbiental: "#eab308", // Amarillo luminoso
    colorSecundario: "#0284c7"  // Azul noche estrellada
  },
  {
    id: "song-4",
    titulo: "Lover",
    artista: "Taylor Swift",
    album: "Lover",
    duracion: "3:41",
    portada: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
    audioPreview: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=gentle-acoustic-guitar-124022.mp3",
    spotifyUrl: "https://open.spotify.com/track/1dGr1nsAZOsWiRUMTMcVbW",
    dedicatoria: "¿Puedo ir a donde tú vayas? ¿Podemos estar siempre así de cerca? Por todos los años que ya vivimos y por todos los que nos faltan por descubrir.",
    fechaOMomento: "Nuestro viaje a la cabaña",
    colorAmbiental: "#ec4899", // Rosa pastel vibrante
    colorSecundario: "#8b5cf6"  // Violeta suave
  },
  {
    id: "song-5",
    titulo: "Fly Me to the Moon",
    artista: "Frank Sinatra",
    album: "It Might as Well Be Swing",
    duracion: "2:27",
    portada: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    audioPreview: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_32b2100e47.mp3?filename=vintage-jazz-11442.mp3",
    spotifyUrl: "https://open.spotify.com/track/5b7OgznPJJr1vNXavu4umHy",
    dedicatoria: "Un clásico eterno para un amor que no pasa de moda. En otras palabras: te amo más de lo que las palabras alcanzan a expresar.",
    fechaOMomento: "Nuestro primer aniversario",
    colorAmbiental: "#06b6d4", // Cian nocturno suave
    colorSecundario: "#6366f1"  // Índigo jazzy
  }
];

export interface GiftConfig {
  destinatario: string;
  remitente: string;
  tituloRegalo: string;
  subtituloRegalo: string;
  mensajeCarta: string;
  tipoApertura: "sobre" | "vinilo" | "directo";
}

export const CONFIG_REGALO_INICIAL: GiftConfig = {
  destinatario: "Para la persona que ilumina mi vida",
  remitente: "Con todo mi amor",
  tituloRegalo: "Nuestra Banda Sonora",
  subtituloRegalo: "Canciones que guardan nuestros mejores momentos",
  mensajeCarta: "He reunido en esta pequeña cápsula las canciones que me recuerdan a ti, a nuestras risas interminables y a los instantes donde el mundo se volvió más bonito. Abre este detalle y recorre cada melodía...",
  tipoApertura: "sobre"
};

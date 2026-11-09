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
    "id": "song-1",
    "titulo": "Luna",
    "artista": "Zoe",
    "album": "Zoe - MTV Unplugged",
    "duracion": "3:29",
    "portada": "https://i.scdn.co/image/ab67616d0000b273e245d1799a4525605b87de45",
    "audioPreview": "https://www.dropbox.com/scl/fi/xy3kfqytggwkvwytbkgvq/Zo-Luna-MTV-Unplugged.mp3?rlkey=jisjm3x1h4n9kn63knkevf6pn&st=y0nd0vqd&dl=0",
    "spotifyUrl": "https://open.spotify.com/intl-es/track/7b3k8I1fncAzbk9PHnLkbX?autoplay_ok=1",
    "dedicatoria": "- \" Pero nada se detiene, solo vivo para ti\nDame solo un beso que me alcance hasta morir\nComo un vicio que me duele, quiero mirarte a los ojos\"\n\nEmpiezo con la cancion que mas me recuerda a ti en este mundo, nunca fui mucho de Zoe, ni de musica asi, pero este tema al tener tu nombre, se volvio inmensamente especial para mi ! ",
    "fechaOMomento": "L de Luna, Zoe",
    "colorAmbiental": "#c1ffff",
    "colorSecundario": "#ffffff"
  },
  {
    "id": "song-2",
    "titulo": "UWAIE",
    "artista": "Kapo",
    "album": "Kapo - Sencillo",
    "duracion": "2:57",
    "portada": "https://i.scdn.co/image/ab67616d0000b27385c9b560af459f57491d5246",
    "audioPreview": "https://www.dropbox.com/scl/fi/1szvpzb1lweotgl9u5q5z/UWAIE-Kapo-Video-Oficial.mp3?rlkey=46o357vi2xmbdto997svf6u4t&st=fxo7wigf&dl=0",
    "spotifyUrl": "https://open.spotify.com/intl-es/track/2onJwRDg0IJg284l8j65yy?autoplay_ok=1",
    "dedicatoria": "- \"Flaca, vos sos hermosa, y te mereces todo\nAmarte es mi necesidad, mi necesidad\nDe ti me gustan cosas, la verdad, todo\nQuitarte esa inseguridad es mi necesidad\"\n\nQuedarme con una sola parte de esta cancion fue muy dificil, y te dedico completamente los 2:51 que dura, esta cancion me transmite la misma tranquilidad que me da tu voz, que me da tu amor, esa tranquilidad que me refresca mi corazoncito y me alegra los diash, te amo mi reina!",
    "fechaOMomento": "U de UWAIE, Kapo",
    "colorAmbiental": "#af3d0a",
    "colorSecundario": "#d07207"
  },
  {
    "id": "song-3",
    "titulo": "Neo roneo",
    "artista": "Latin Mafia, Rusowsky",
    "album": "Latin Mafia, Rusowsky - Sencillo",
    "duracion": "4:29",
    "portada": "https://i.scdn.co/image/ab67616d0000b273c868f74d6a33bd27bcee592f",
    "audioPreview": "https://www.dropbox.com/scl/fi/0xwwlbznfghjsmaa6ah2z/neo-roneo-ft.-LATIN-MAFIA.mp3?rlkey=4rpq4uuvsactkwjji67aoi5ii&st=pcui447l&dl=0",
    "spotifyUrl": "https://open.spotify.com/intl-es/track/7zoVtzzASRtacCvgQKLFaS?autoplay_ok=1",
    "dedicatoria": "- \"Que sin tu amor, baby, me desaparezco, sin tu amor, baby, soy igual al resto\"\n- \"Quererte hasta que duela, todo este corazón caliente, no me sirve la mente, nunca me ha fallado, siempre sirvo pa' quererte\"\n\nComo dice la cancion, sin tu amor beibi me desaparezco, y siempre sirvo para quererte, siempre lo servire y espero que tu amor nunca me falte para no desaparecer!",
    "fechaOMomento": "N de Neo roneo",
    "colorAmbiental": "#ffdfa5",
    "colorSecundario": "#ffffb1"
  },
  {
    "id": "song-4",
    "titulo": "Amarrame",
    "artista": "Mon Laferte, Juanes ",
    "album": "Mon Laferte, Juanes - La trenza",
    "duracion": "3:41",
    "portada": "https://i.scdn.co/image/ab67616d0000b273ac6e52ed084e8209691f208f",
    "audioPreview": "https://www.dropbox.com/scl/fi/1n702om5hs9as8j6xg7ir/Mon-Laferte-Am-rrame-Video-Oficial-ft.-Juanes.mp3?rlkey=2iy5mkoln1ll8scgc2dx1z3et&st=9q8fb007&dl=0",
    "spotifyUrl": "https://open.spotify.com/track/3EK4tGkSiO5xvvB5sM4tln?autoplay_ok=1",
    "dedicatoria": "\"Cúrame\nY enférmame de a poco, poco a poco, cúrame\nY transfórmame en un loco, poco a poco, amárrame\"\nLa primera cancion de Mon Laferte que realmente escuche y fue por ti, esta cancion me hizo ver que tus gustos eran realmente lindos, y me motivo a seguir escuchando lo que te hacia feliz y ahora me mola mon laferte, el rock en español y todo es POR TIIIIIII  Y COMO DICE LA CANCION AMARRAMEEEE!!!!!!",
    "fechaOMomento": "A de Amarrame",
    "colorAmbiental": "#fffff2",
    "colorSecundario": "#ffffff"
  },
  {
    "id": "song-5",
    "titulo": "Iris ",
    "artista": "The Goo Goo Dolls",
    "album": "The Goo Goo Dolls -  Dizzy Up the Girl",
    "duracion": "2:27",
    "portada": "https://i.scdn.co/image/ab67616d0000b273eda9478c39a21e1cdc6609ca",
    "audioPreview": "https://www.dropbox.com/scl/fi/3nf4vor3qoi2p0lxnh4fx/Goo-Goo-Dolls-Iris-Official-Music-Video-4K-Remaster.mp3?rlkey=wsr6hb4sh066ws4uzikovusvn&st=fnporz5b&dl=0",
    "spotifyUrl": "https://open.spotify.com/track/5b7OgznPJJr1vNXavu4umHy",
    "dedicatoria": "- \"And I'd give up forever to touch you, 'cause I know that you feel me somehow\nyou're the closest to Heaven that I'll ever be\nAnd I don't wanna go home right now\"\nSe que no sabes ingles, pero esta cancion habla de renunciar a todo por unos instantes con alguien, ese alguien eres tu, la cancion lo menciona y dejame decirtelo, eres y seras lo mas cerca que estare del cielo (es curioso por que te llamas luna y tal) pero en el sentido sentimental, eres lo mejor de este mundo y renunciare a lo que haga falta por unos instantes contigo, TE AMO!",
    "fechaOMomento": "I de Iris",
    "colorAmbiental": "#ffffff",
    "colorSecundario": "#ffb9dc"
  },
  {
    "id": "song-1794195064277",
    "titulo": "Stargirl Interlude",
    "artista": "Artista Favorito",
    "album": "The Weeknd, Lana del Rey - Starboy",
    "duracion": "3:30",
    "portada": "https://akamai.sscdn.co/uploadfile/letras/albuns/2/6/0/5/550761678972737.jpg",
    "audioPreview": "https://www.dropbox.com/scl/fi/d4bqslkw2gwedvq1r8pey/The-Weeknd-Stargirl-Interlude-Audio-ft.-Lana-Del-Rey.mp3?rlkey=mlga7n3op7eng1nnrmzmx3bfb&st=1s6jng54&dl=0",
    "spotifyUrl": "https://open.spotify.com/track/4EDijkJdHBZZ0GwJ12iTAj",
    "dedicatoria": "- \" I just want to see you shine 'cause I know you are a star, girl \"\nSaltemonos la parte lujuriosa (por que dios, esta cancion es puro sexo y no kiero hablarte de eso en el regalo de nuestro aniversario), como dice esa barra, quiero verte brillar mi vida, se la estrellita que eres, todas tus capacidades, todas tus virtudes y de todo lo que puedes llegar a lograr y quiero estar ahi para verte brillar mi reina!",
    "fechaOMomento": "S de Stargirl",
    "colorAmbiental": "#db0a3c",
    "colorSecundario": "#ffc316"
  },
  {
    "id": "song-1794195720426",
    "titulo": "AIRE",
    "artista": "Lucho RK",
    "album": "Lucho RK - Sordo de un pie",
    "duracion": "3:30",
    "portada": "https://i.scdn.co/image/ab67616d0000b273a544af82b6e7bbbf9aff62eb",
    "audioPreview": "https://www.dropbox.com/scl/fi/7tb0veqknca4ydscxur5x/AIRE-Lucho-RK-Video-oficial.mp3?rlkey=sggwtn8ynzbak5uhkytd24paa&st=t2qjuhze&dl=0",
    "spotifyUrl": "https://open.spotify.com/track/4FNsQDspil49kbpjvI7G3Y",
    "dedicatoria": "- \"Directa pa'l Louvre, desnudita tú ere' arte \"\n- \" No quiero a nadie más que tú y yo, bebé, En nuestros plane' \"\n- \" Hasta que tú y yo bailemos, de esta puta disco no nos saca nadie \"\nAmo esta cancion, simplemente con las barras de bailar me recuerda a ti, como dice la cancion me tienes sin aire, sabias? me voy a ahogar por tu culpa de tanto amor, tambien quiero que seamos solo tu y yo en nuestros planes, y sabes? Hasta que tu y yo bailemos no pienso irme de este puto planeta!!!!!",
    "fechaOMomento": "A De AIRE",
    "colorAmbiental": "#ff582f",
    "colorSecundario": "#3c79c1"
  },
  {
    "id": "song-1794196421122",
    "titulo": "BAILE INoLVIDABLE",
    "artista": "Bad Bunny",
    "album": "Bad Bunny - DTmF",
    "duracion": "3:30",
    "portada": "https://i.scdn.co/image/ab67616d00001e02bbd45c8d36e0e045ef640411",
    "audioPreview": "https://www.dropbox.com/scl/fi/2n3eszpf12uihrancmt7m/BAD-BUNNY-BAILE-INoLVIDABLE-Video-Oficial-DeB-TiRAR-M-S-FOToS.mp3?rlkey=qdyl1v857lptjod03znzvi0nv&st=nv44jdf0&dl=0",
    "spotifyUrl": "https://open.spotify.com/intl-es/track/2lTm559tuIvatlT1u0JYG2",
    "dedicatoria": "6 minutos 18 segundos de cancion y te dedico desde el primer segundo hasta la ultima centesima de esta cancion. Dedicarte esta cancion me emociono, solte un par de lagrimitas de lo mucho que te amo, eres mi baile inolvidable definitivamente, me enseñaste a querer, a amar, que es el amor, me enseñaste todo eso, Y PRONTO TAMBIEN ME ENSEÑARAS A BAILAR COMO DICE LA CANCION!!!!!",
    "fechaOMomento": "B de BAILE INoLVIDABLE",
    "colorAmbiental": "#b0ffc8",
    "colorSecundario": "#d5ffa8"
  },
  {
    "id": "song-1794197309175",
    "titulo": "Eres",
    "artista": "Cafe Tacva",
    "album": "Cafe Tacvba - Cuatro Caminos",
    "duracion": "3:30",
    "portada": "https://i.scdn.co/image/ab67616d0000b273624927252564ef4625307897",
    "audioPreview": "https://www.dropbox.com/scl/fi/7nrc7xi2bfhyrt1sk0hj2/Caf-Tacvba-Eres-Video-Oficial.mp3?rlkey=606ad2thqak0tva8e7jgg6o58&st=3anlpivh&dl=0",
    "spotifyUrl": "https://open.spotify.com/track/6kdCN6gTWLcLxmLXoUcwuI",
    "dedicatoria": "- \"Eres, lo que más quiero en este mundo, eso eres\nMi pensamiento más profundo, también eres\nTan solo dime lo que hago, aquí me tienes\"\n\nEsta cancion describe a la perfeccion lo que eres para mi, todo lo que representas, todo lo que simbolizas, eres ese futuro imaginado, ese presente soñado y ese pasado irrepetible, eres la mujer de mis sueños, la niña de mi vida, la mejor mujer del mundo, tambien eres la mejor jugadora del mundo de billar ESO EREEEES!!!!",
    "fechaOMomento": "E de Eres",
    "colorAmbiental": "#fffde2",
    "colorSecundario": "#ffffff"
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

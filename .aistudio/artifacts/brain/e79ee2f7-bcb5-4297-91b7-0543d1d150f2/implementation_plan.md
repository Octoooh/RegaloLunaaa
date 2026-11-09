# Regalo Musical Interactivo — Melodías & Recuerdos

Una experiencia web interactiva y romántica concebida como un obsequio digital inolvidable. Cuenta con una pantalla de bienvenida animada personalizable (sobre con carta lacrada, disco de vinilo en funda o entrada directa), un carrusel fluido de canciones con estética glassmorphism, fondo ambiental reactivo con iluminación dinámica según la carátula activa, reproductor de audio con muestras reales, enlaces a Spotify y un editor/exportador en vivo con la constante `LISTA_CANCIONES` lista para copiar y personalizar.

## Decisiones Críticas y Confirmaciones del Usuario

> [!IMPORTANT]
> Confirmaciones obtenidas en la Fase 1 de Clarificación:
> - **Reproducción de Audio**: Reproductor integrado con pistas de muestra sonoras (audio web real libre de derechos/muestras de alta fidelidad) con barra de progreso, control Play/Pause y botón directo hacia la canción en Spotify.
> - **Tono y Ocasión**: Romántico, íntimo y elegante para pareja o aniversario, con tipografía cuidada (serif elegante + display sans), notas afectuosas y diseño de luz suave.
> - **Animaciones de Apertura (Selector Dinámico)**: Se implementarán los tres estilos solicitados (1. Sobre interactivo con sello de cera y carta desplegable, 2. Funda de vinilo deslizante con disco giratorio, 3. Entrada directa fluida), permitiendo al usuario alternar entre ellas en el panel de personalización y definir cuál se activa por defecto en `LISTA_CANCIONES`.

---

## 1. Visión General y Concepto Central

- **Propósito**: Permitir que cualquier persona entregue un detalle musical y sentimental inolvidable, combinando canciones significativas con dedicatorias personales, fotos/carátulas evocadoras y sonido envolvente.
- **Público Objetivo**: Parejas, aniversarios, celebraciones especiales o personas que desean regalar una playlist con memoria visual y sonora.
- **Valor Principal**: Fácil de editar mediante la constante editable `LISTA_CANCIONES` en JavaScript/JSON, completamente responsivo en móviles y ordenadores, con exportación directa de código HTML autocontenido en un clic.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujo de Usuario Paso a Paso
1. **Pantalla de Apertura (Gift Reveal)**:
   - *Modo Sobre*: Se presenta un sobre elegante con sello de cera pulsante y la dedicatoria inicial. Al hacer clic o tocar, el sello se rompe suavemente, la solapa se abre y emerge la dedicatoria antes de revelar la colección musical.
   - *Modo Vinilo*: Una funda de disco coleccionable con la portada principal; al tocar, el vinilo gira y se desliza hacia afuera mientras la música comienza.
   - *Modo Directo*: Transición inmediata y suave al carrusel principal.
2. **Navegación del Carrusel de Canciones**:
   - Tarjetas flotantes con efecto glassmorphism (vidrio esmerilado con reflejos sutiles).
   - Portada con proporción 1:1, efecto de disco giratorio cuando la pista está en reproducción.
   - Título de la pista, artista y año/momento especial sin píldoras genéricas.
   - Caja de dedicatoria personal: tipografía íntima con comillas sutiles y texto afectuoso.
   - Botón de reproducción de fragmento sonoro + Botón oficial de Spotify con icono auténtico.
3. **Fondo Ambiental Dinámico (Dynamic Ambient Glow)**:
   - Desenfoca y amplifica los colores cromáticos dominantes de la carátula activa (`backdrop-filter: blur(80px)` y halos difuminados suaves).
   - Al deslizar el carrusel (swipe o flechas), la atmósfera lumínica realiza una transición suave de 600ms adaptándose a la nueva canción.
4. **Mini Reproductor y Controles**:
   - Barra de reproducción inferior o integrada con tiempo actual, barra de duración interactiva, botón Play/Pause y control de volumen.
5. **Panel de Ajustes y Exportación "Listo para Compartir"**:
   - Botón discreto que abre un modal/drawer con el visualizador y editor de la constante `LISTA_CANCIONES`.
   - Permite agregar/quitar canciones, cambiar la animación de apertura por defecto y descargar o copiar con un clic el archivo `index.html` único y 100% autocontenido.

### Paleta de Colores y Tipografía
- **Lienzo**: Tonos oscuros profundos y nocturnos (`#0a070d` a `#120d18`) que resaltan la luminiscencia de las portadas y el efecto glassmorphism.
- **Superficies**: `rgba(255, 255, 255, 0.08)` con bordes ultrafinos `rgba(255, 255, 255, 0.15)` y desenfoque `blur(20px)`.
- **Acentos**: Oro cálido champagne (`#f5d061`) y rosa cuarzo suave (`#f472b6`) en balances de máximo 10%.
- **Tipografía**:
  - Títulos y dedicatorias: *Playfair Display* / *Cormorant Garamond* (elegancia editorial romántica).
  - Interfaz y datos: *Outfit* / *Plus Jakarta Sans* para una legibilidad nítida en pantallas táctiles y escritorios.

---

## 3. Decisiones Clave del Producto y Alternativas

- **Estructura Dual (React + Exportador Standalone)**:
  - *Decisión*: Desarrollar la aplicación completa en React con Tailwind CSS y motion para garantizar un rendimiento óptimo de 60 FPS en el preview, complementada con un generador/exportador que emite el código HTML puro autocontenido solicitado por el usuario con CDN de Tailwind y Swiper.
  - *Razón*: El usuario puede usar la app directamente aquí y, al mismo tiempo, copiar el archivo `index.html` autónomo listo para guardar en su ordenador o subir a cualquier servidor estático.
- **Extracción de Color Ambiental**:
  - *Decisión*: Configuración de paletas cromáticas por canción en `LISTA_CANCIONES` combinada con degradados radiales dinámicos multi-capa.
  - *Razón*: Garantiza una transición visual instantánea y sedosa sin parpadeos ni demoras en la lectura de pixeles en navegadores móviles.
- **Audio Nativo vs Embed de Spotify**:
  - *Decisión*: Reproducción de audio real mediante el Web Audio API / elemento `<audio>` con pistas románticas de alta fidelidad, complementado con un botón directo a Spotify que abre la pista oficial.
  - *Razón*: Los iframes de Spotify bloquean la reproducción automática y muestran interfaces rígidas con bordes negros que rompen la estética inmersiva del regalo.

---

## 4. Arquitectura Técnica y Estrategia de Datos

### Diagrama de Componentes y Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                       App Container                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ AmbientBackground: Halos dinámicos & Blur adaptativo  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ OpeningOverlay: Selector de experiencia de apertura    │  │
│  │ [Sobre con Cera]  [Funda de Vinilo]  [Entrada Directa]│  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ SongsCarousel (Swiper / Touch Slider):                │  │
│  │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │  │
│  │ │ SongCard (01) │ │ SongCard (02) │ │ SongCard (03) │ │  │
│  │ │ - Cover & Disc│ │ - Cover & Disc│ │ - Cover & Disc│ │  │
│  │ │ - Título/Autor│ │ - Título/Autor│ │ - Título/Autor│ │  │
│  │ │ - Dedicatoria │ │ - Dedicatoria │ │ - Dedicatoria │ │  │
│  │ │ - Botón Spoti │ │ - Botón Spoti │ │ - Botón Spoti │ │  │
│  │ └───────────────┘ └───────────────┘ └───────────────┘ │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ MusicPlayerBar: Barra de progreso, volumen & playback │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ConfigDrawer & CodeExporter:                          │  │
│  │ - Editor en vivo de LISTA_CANCIONES                   │  │
│  │ - Botón "Copiar HTML Completo" y "Descargar index.html│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Estructura de la constante `LISTA_CANCIONES`
```javascript
const LISTA_CANCIONES = [
  {
    id: 1,
    titulo: "Golden Hour",
    artista: "JVKE",
    portada: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600",
    audioPreview: "https://cdn.pixabay.com/download/audio/...",
    spotifyUrl: "https://open.spotify.com/track/...",
    dedicatoria: "Esta canción me recuerda a esa tarde de otoño viendo el atardecer juntos. El tiempo se detuvo.",
    colorAmbiental: "#eab308", // Tono principal para el brillo
    colorSecundario: "#f97316"
  },
  // ... más canciones
];
```

### Plan de Verificación
1. **Verificación Visual**: Probar la fluidez del carrusel en móvil y desktop con navegación táctil, teclas de flechas y botones.
2. **Verificación de Animaciones**: Probar la apertura del sobre con carta, el deslizamiento del vinilo y el modo directo.
3. **Verificación de Audio**: Probar Play/Pause, barra de arrastre de tiempo y sincronización con el disco giratorio.
4. **Verificación de Exportación**: Confirmar que el código generado para el `index.html` autocontenido funcione de forma 100% aislada al guardarlo en local.
5. **Compilación y Linter**: Ejecutar `compile_applet` y `lint_applet` para garantizar cero errores de tipado o empaquetado.

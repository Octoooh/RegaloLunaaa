/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Sparkles,
  Disc,
  Mail,
  Copy,
  Check,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  X,
  Music,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { LISTA_CANCIONES as DEFAULT_SONGS, CONFIG_REGALO_INICIAL, Song, GiftConfig } from "./data/songs";
import { globalAudioController } from "./utils/audioPlayer";
import { generateStandaloneHtml } from "./utils/generateStandaloneHtml";
import { extractSpotifyTrackId, getSpotifyEmbedUrl } from "./utils/spotify";
import { extractColorsFromImage } from "./utils/colorExtractor";

export default function App() {
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem("regalo_canciones");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_SONGS;
  });

  const [config, setConfig] = useState<GiftConfig>(() => {
    const saved = localStorage.getItem("regalo_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return CONFIG_REGALO_INICIAL;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [previewSeconds, setPreviewSeconds] = useState(30);

  // Opening animation state
  const [isOpened, setIsOpened] = useState(config.tipoApertura === "directo");
  const [isUnsealing, setIsUnsealing] = useState(false);
  const [letterRevealed, setLetterRevealed] = useState(false);
  const [vinylSlideOut, setVinylSlideOut] = useState(false);

  // Modals & Panels
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSongsTs, setCopiedSongsTs] = useState(false);
  const [activeTab, setActiveTab] = useState<"canciones" | "apariencia" | "codigo">("canciones");
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isExtractingColor, setIsExtractingColor] = useState(false);
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);
  const [extractionNotice, setExtractionNotice] = useState<string | null>(null);

  // Subir imagen local desde PC o móvil a Base64 con auto-extracción de color ambiental
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (editingSong && dataUrl) {
        let updated: Song = { ...editingSong, portada: dataUrl };
        try {
          const colors = await extractColorsFromImage(dataUrl);
          updated.colorAmbiental = colors.primary;
          updated.colorSecundario = colors.secondary;
          setExtractedPalette(colors.palette);
          setExtractionNotice("¡Foto cargada y colores de página adaptados automáticamente!");
          setTimeout(() => setExtractionNotice(null), 3500);
        } catch (err) {
          console.error("Error al extraer color de la foto:", err);
        }
        setEditingSong(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  // Analizar portada actual y extraer color dominante/armónico automáticamente
  const handleAutoDetectColors = async () => {
    if (!editingSong?.portada) return;
    setIsExtractingColor(true);
    setExtractionNotice(null);
    try {
      const result = await extractColorsFromImage(editingSong.portada);
      setEditingSong({
        ...editingSong,
        colorAmbiental: result.primary,
        colorSecundario: result.secondary,
      });
      setExtractedPalette(result.palette);
      if (result.isFallback) {
        setExtractionNotice("Color armónico adaptado. (Tip: al usar 'Subir foto propia', el análisis es pixel a pixel exacto)");
      } else {
        setExtractionNotice("¡Color dominante y armonía de página extraídos con éxito!");
      }
      setTimeout(() => setExtractionNotice(null), 3500);
    } catch (err) {
      console.error("Error al auto-detectar colores:", err);
    } finally {
      setIsExtractingColor(false);
    }
  };

  // Subir archivo MP3 local desde PC o móvil a Base64
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (editingSong && dataUrl) {
        setEditingSong({ ...editingSong, audioPreview: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  // Copiar código para src/data/songs.ts
  const handleCopySongsTsCode = () => {
    const tsCode = `export const LISTA_CANCIONES: Song[] = ${JSON.stringify(songs, null, 2)};`;
    navigator.clipboard.writeText(tsCode);
    setCopiedSongsTs(true);
    setTimeout(() => setCopiedSongsTs(false), 2500);
  };

  // Carousel touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const currentSong = songs[currentIndex] || songs[0];
  const currentSpotifyEmbedUrl = getSpotifyEmbedUrl(currentSong?.spotifyUrl || "");

  useEffect(() => {
    if (isPlaying) {
      startPlayback(currentIndex);
    }
  }, [currentIndex]);
  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("regalo_canciones", JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem("regalo_config", JSON.stringify(config));
  }, [config]);

  // Audio volume sync
  useEffect(() => {
    globalAudioController.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Launch confetti celebration
  const launchHearts = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f43f5e", "#ec4899", "#fb7185", "#f59e0b", "#ffffff"],
      });
    } catch {}
  };

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      globalAudioController.pause();
      setIsPlaying(false);
    } else {
      startPlayback(currentIndex);
    }
  };

  const startPlayback = (index: number) => {
    const targetSong = songs[index];
    if (!targetSong) return;

    setIsPlaying(true);
    globalAudioController.playTrack(
      targetSong.audioPreview || "",
      (curr, dur) => {
        setCurrentTime(curr);
        setDuration(dur || 180);
      },
      () => {
        // Auto next
        if (index < songs.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
        }
      }
    );
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % songs.length;
    setCurrentIndex(nextIdx);
    if (isPlaying) {
      startPlayback(nextIdx);
    }
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentIndex(prevIdx);
    if (isPlaying) {
      startPlayback(prevIdx);
    }
  };

  const handleSelectSong = (idx: number) => {
    setCurrentIndex(idx);
    if (isPlaying) {
      startPlayback(idx);
    }
  };

  // Open Gift sequence: Envelope
  const handleOpenEnvelope = () => {
    setIsUnsealing(true);
    setTimeout(() => {
      setLetterRevealed(true);
      launchHearts();
      setTimeout(() => {
        setIsOpened(true);
        startPlayback(0);
      }, 1600);
    }, 450);
  };

  // Open Gift sequence: Vinyl
  const handleOpenVinyl = () => {
    setVinylSlideOut(true);
    launchHearts();
    setTimeout(() => {
      setIsOpened(true);
      startPlayback(0);
    }, 1100);
  };

  // Replay intro
  const handleReplayIntro = () => {
    setIsOpened(false);
    setIsUnsealing(false);
    setLetterRevealed(false);
    setVinylSlideOut(false);
    globalAudioController.pause();
    setIsPlaying(false);
  };

  // Touch Swipe for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Scrub bar
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(duration, pos * duration));
    setCurrentTime(newTime);
    globalAudioController.seek(newTime);
  };

  // Standalone HTML Download
  const handleDownloadStandalone = () => {
    const html = generateStandaloneHtml(songs, config);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "regalo-musical.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyStandaloneCode = () => {
    const html = generateStandaloneHtml(songs, config);
    navigator.clipboard.writeText(html).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    });
  };

  // Add new song
  const handleAddSong = () => {
    const newSong: Song = {
      id: `song-${Date.now()}`,
      titulo: "Nueva Canción Romántica",
      artista: "Artista Favorito",
      album: "Recuerdos Juntos",
      duracion: "3:30",
      portada: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      audioPreview: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
      spotifyUrl: "https://open.spotify.com",
      dedicatoria: "Escribe aquí la razón por la que esta canción es especial para ambos...",
      fechaOMomento: "Un recuerdo inolvidable",
      colorAmbiental: "#f43f5e",
      colorSecundario: "#a855f7"
    };
    setSongs([...songs, newSong]);
    setEditingSong(newSong);
  };

  const handleUpdateSong = (updated: Song) => {
    setSongs(songs.map((s) => (s.id === updated.id ? updated : s)));
    setEditingSong(null);
  };

  const handleDeleteSong = (id: string) => {
    if (songs.length <= 1) return;
    setSongs(songs.filter((s) => s.id !== id));
    if (currentIndex >= songs.length - 1) {
      setCurrentIndex(Math.max(0, songs.length - 2));
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07040a] text-white flex flex-col justify-between overflow-x-hidden font-sans select-none">
      
      {/* ==================================================== */}
      {/* 1. FONDO AMBIENTAL ADAPTATIVO CON BLUR SUAVE         */}
      {/* ==================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Glow 1 (Color primario de la carátula) */}
        <div
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] md:w-[950px] md:h-[950px] rounded-full blur-[140px] opacity-45 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle, ${currentSong.colorAmbiental} 0%, transparent 70%)`
          }}
        />
        {/* Glow 2 (Color secundario de la carátula) */}
        <div
          className="absolute top-[35%] -left-[10%] w-[500px] h-[500px] md:w-[750px] md:h-[750px] rounded-full blur-[160px] opacity-40 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle, ${currentSong.colorSecundario} 0%, transparent 70%)`
          }}
        />
        {/* Glow 3 (Calidez en la esquina opuesta) */}
        <div
          className="absolute -bottom-[15%] -right-[10%] w-[600px] h-[600px] md:w-[850px] md:h-[850px] rounded-full blur-[150px] opacity-35 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle, ${currentSong.colorAmbiental} 0%, transparent 70%)`
          }}
        />
        {/* Filtro de viñeta y textura suave */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#07040a]/40 to-[#07040a] opacity-85" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      {/* ==================================================== */}
      {/* 2. PANTALLA DE APERTURA INTERACTIVA (3 ESTILOS)      */}
      {/* ==================================================== */}
      {!isOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07040a]/95 backdrop-blur-2xl transition-all duration-700">
          
          {/* MODO 1: SOBRE CON SELLO DE CERA */}
          {config.tipoApertura === "sobre" && (
            <div className="w-full max-w-md text-center">
              <div className="mb-6">
                <span className="text-xs uppercase tracking-[0.25em] text-rose-300/80 font-sans">
                  Un regalo con música y amor
                </span>
                <h1 className="text-3xl md:text-4xl font-serif text-white mt-1">
                  {config.tituloRegalo}
                </h1>
                <p className="text-sm text-white/60 font-sans mt-1">
                  {config.destinatario}
                </p>
              </div>

              {/* Contenedor del sobre */}
              <div
                onClick={handleOpenEnvelope}
                className="relative mx-auto w-72 h-48 md:w-80 md:h-52 bg-gradient-to-br from-rose-950/80 to-purple-950/80 rounded-2xl border border-rose-500/20 shadow-2xl flex items-center justify-center cursor-pointer group hover:scale-[1.02] transition-all duration-300"
              >
                {/* Solapa */}
                <div
                  className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-rose-900/60 to-transparent border-t border-rose-400/30 rounded-t-2xl transition-all duration-700 origin-top ${
                    isUnsealing ? "rotate-x-180 opacity-40" : ""
                  }`}
                />

                {/* Carta interior que sale */}
                <div
                  className={`absolute inset-3 bg-stone-50 text-stone-900 rounded-xl p-4 shadow-2xl transition-all duration-700 text-left flex flex-col justify-between ${
                    letterRevealed
                      ? "opacity-100 -translate-y-8 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div>
                    <div className="text-xs font-serif text-stone-500 italic">
                      De: {config.remitente}
                    </div>
                    <p className="font-serif italic text-xs leading-relaxed text-stone-800 mt-2 line-clamp-4">
                      "{config.mensajeCarta}"
                    </p>
                  </div>
                  <div className="text-right text-[10px] font-sans text-rose-600 font-semibold tracking-wider uppercase">
                    Comenzar playlist &rarr;
                  </div>
                </div>

                {/* Sello de cera con corazón */}
                <div
                  className={`relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-rose-800 via-rose-600 to-red-500 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 ${
                    isUnsealing ? "scale-75 opacity-20 rotate-45" : ""
                  }`}
                  style={{
                    boxShadow: "0 0 35px rgba(225, 29, 72, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)"
                  }}
                >
                  <Heart className="w-8 h-8 text-rose-100 fill-rose-100" />
                </div>
              </div>

              <p className="text-xs text-white/50 mt-6 font-sans animate-pulse">
                Toca el sello para abrir el regalo
              </p>

              <button
                onClick={() => {
                  setConfig({ ...config, tipoApertura: "vinilo" });
                }}
                className="mt-6 text-xs text-white/40 hover:text-white/80 transition-colors"
              >
                Probar estilo vinilo &rarr;
              </button>
            </div>
          )}

          {/* MODO 2: FUNDA DE VINILO */}
          {config.tipoApertura === "vinilo" && (
            <div className="w-full max-w-md text-center">
              <div className="mb-6">
                <span className="text-xs uppercase tracking-[0.25em] text-amber-300/80 font-sans">
                  Edición Especial en Vinilo
                </span>
                <h1 className="text-3xl md:text-4xl font-serif text-white mt-1">
                  {config.tituloRegalo}
                </h1>
                <p className="text-sm text-white/60 font-sans mt-1">
                  {config.destinatario}
                </p>
              </div>

              <div
                onClick={handleOpenVinyl}
                className="relative mx-auto w-64 h-64 md:w-72 md:h-72 cursor-pointer group"
              >
                {/* Disco de vinilo que se desliza */}
                <div
                  className={`absolute inset-2 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${
                    vinylSlideOut ? "translate-x-14 rotate-180" : "group-hover:translate-x-4"
                  }`}
                  style={{
                    background:
                      "radial-gradient(circle, #111 25%, #222 26%, #111 38%, #262626 40%, #151515 52%, #222 54%, #0a0a0a 68%, #1f1f1f 70%, #0d0d0d 100%)",
                    boxShadow: "inset 0 0 15px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.8)"
                  }}
                >
                  <div
                    className="w-20 h-20 rounded-full border-4 border-amber-600/40 bg-cover bg-center"
                    style={{ backgroundImage: `url(${currentSong.portada})` }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-black/40 rounded-full">
                      <div className="w-3 h-3 rounded-full bg-[#07040a]" />
                    </div>
                  </div>
                </div>

                {/* Funda del álbum */}
                <div className="absolute inset-0 rounded-2xl glass-panel-elevated p-5 flex flex-col justify-between text-left transition-transform duration-500 group-hover:-translate-x-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
                      LP 33 RPM
                    </span>
                    <Disc className="w-5 h-5 text-amber-300/80" />
                  </div>
                  <div>
                    <span className="text-[11px] text-white/50 uppercase tracking-wider block">
                      Dedicatoria
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white">
                      {config.destinatario}
                    </h3>
                    <p className="text-xs text-white/70 line-clamp-2 mt-1 italic">
                      "{config.mensajeCarta}"
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/50 mt-6 font-sans animate-pulse">
                Toca el disco para escuchar
              </p>

              <button
                onClick={() => {
                  setConfig({ ...config, tipoApertura: "sobre" });
                }}
                className="mt-6 text-xs text-white/40 hover:text-white/80 transition-colors"
              >
                &larr; Probar estilo sobre
              </button>
            </div>
          )}

        </div>
      )}

      {/* ==================================================== */}
      {/* 3. CABECERA (TOP BAR CONTRACT DE 3 ZONAS)            */}
      {/* ==================================================== */}
      <header className="relative z-10 flex items-center justify-between gap-8 px-6 py-5 max-w-6xl mx-auto w-full">
        {/* Zona 1: Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
            <Music className="w-4 h-4 text-rose-300" />
          </div>
          <span className="text-lg font-serif font-semibold tracking-wide text-white whitespace-nowrap shrink-0">
            {config.tituloRegalo}
          </span>
        </div>

        {/* Zona 2: Enlaces / Metadatos limpios */}
        <div className="hidden md:flex items-center gap-6 text-xs text-white/60 tracking-wider uppercase font-sans">
          <button
            onClick={() => setShowLetterModal(true)}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-rose-400" />
            <span>Leer dedicatoria</span>
          </button>
          <span className="text-white/20">·</span>
          <span className="text-white/90 font-medium">
            Pista {currentIndex + 1} de {songs.length}
          </span>
          <span className="text-white/20">·</span>
          <span className="text-rose-300 font-medium">{config.remitente}</span>
        </div>

        {/* Zona 3: Acción Principal */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReplayIntro}
            title="Volver a abrir el regalo"
            className="px-3.5 py-1.5 text-xs font-medium text-white/80 glass-panel rounded-full hover:bg-white/10 hover:text-white transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Reabrir regalo</span>
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-1.5 text-xs font-medium text-black bg-gradient-to-r from-amber-200 to-rose-200 rounded-full hover:opacity-95 shadow-lg transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95"
          >
            <Settings className="w-3.5 h-3.5 text-black" />
            <span>Personalizar / Exportar</span>
          </button>
        </div>
      </header>

      {/* ==================================================== */}
      {/* 4. CARRUSEL FLUIDO DE CANCIONES (SWIPER TOUCH)       */}
      {/* ==================================================== */}
      <main className="relative z-10 w-full flex-1 flex flex-col justify-center items-center py-4 md:py-8 px-4">
        
        {/* Título de la pista activa y momento */}
        <div className="text-center max-w-xl mx-auto mb-6 px-4">
          <span className="font-handwriting text-2xl md:text-3xl text-rose-300 block mb-1">
            {currentSong.fechaOMomento || "Momento Especial"}
          </span>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight">
            {currentSong.titulo}
          </h2>
          <p className="text-sm md:text-base text-white/70 font-sans mt-1">
            {currentSong.album || currentSong.artista}
          </p>
        </div>

        {/* Visualizador del carrusel */}
        <div
          className="w-full max-w-4xl mx-auto flex items-center justify-center gap-3 md:gap-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Botón anterior */}
          <button
            onClick={handlePrev}
            className="hidden sm:flex w-12 h-12 rounded-full glass-panel hover:bg-white/15 items-center justify-center text-white/80 hover:text-white transition-all active:scale-95 shrink-0"
            aria-label="Canción anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Tarjeta Central Elevada (Glassmorphism & Vinilo) */}
          <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-6 md:p-8 flex flex-col justify-between relative group border border-white/20 shadow-2xl transition-all duration-500">
            
            {/* Encabezado elegante de la tarjeta */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-sans uppercase tracking-widest text-rose-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                {currentSong.fechaOMomento || "Momento Inolvidable"}
              </span>
              {isPlaying ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <span>Reproduciendo</span>
                </div>
              ) : (
                <span className="text-[10px] font-mono text-white/50">
                  Pista {currentIndex + 1} de {songs.length}
                </span>
              )}
            </div>

            {/* Portada Grande con Vinilo y Reproductor Nativo */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl mb-4 group/cover">
              <img
                src={currentSong.portada}
                alt={currentSong.titulo}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800";
                }}
              />

              {/* Botón central grande para Reproducir / Pausar el audio Dropbox */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover/cover:opacity-100 transition-all duration-300 backdrop-blur-[2px] cursor-pointer"
                title={isPlaying ? "Pausar" : "Reproducir canción"}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center shadow-2xl transform transition-transform group-hover/cover:scale-110 active:scale-95">
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current translate-x-0.5" />
                  )}
                </div>
              </button>

              {/* Disco de vinilo que asoma y gira cuando la música suena */}
              <div
                className={`absolute top-3 right-3 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-700 pointer-events-none ${
                  isPlaying
                    ? "opacity-100 translate-x-2 animate-spin-slow"
                    : "opacity-0 translate-x-6"
                }`}
                style={{
                  background:
                    "radial-gradient(circle, #111 25%, #222 26%, #111 38%, #262626 40%, #151515 52%, #222 54%, #0a0a0a 68%, #1f1f1f 70%, #0d0d0d 100%)",
                  boxShadow: "inset 0 0 15px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.8)"
                }}
              >
                <div
                  className="w-8 h-8 rounded-full bg-cover bg-center border border-white/40"
                  style={{ backgroundImage: `url(${currentSong.portada})` }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>
                </div>
              </div>

              {/* Distintivo de audio Dropbox si aplica */}
              {currentSong.audioPreview?.includes("dropbox.com") && (
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-[10px] text-cyan-300 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Audio vía Dropbox</span>
                </div>
              )}
            </div>

            {/* Info de la pista */}
            <div className="mb-3 text-left">
              <h3 className="text-2xl font-serif font-bold text-white tracking-tight truncate">
                {currentSong.titulo}
              </h3>
              <p className="text-sm text-white/70 font-sans mt-0.5">{currentSong.album || currentSong.artista}</p>
            </div>

            {/* Reproductor de Audio Integrado en la Tarjeta Grande */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-4 backdrop-blur-sm">
              {/* Barra de progreso interactiva (Scrub bar) */}
              <div
                onClick={handleScrub}
                className="w-full h-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer relative group flex items-center transition-colors"
                title="Haz clic para saltar a cualquier momento"
              >
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-300 rounded-full relative"
                  style={{ width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>

              {/* Tiempos transcurrido / total */}
              <div className="flex justify-between items-center text-[10px] font-mono text-white/60 mt-1.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Botones de control de reproducción */}
              <div className="flex items-center justify-between mt-2.5">
                {/* Botón pista anterior */}
                <button
                  onClick={handlePrev}
                  className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Canción anterior"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Botón principal Play / Pause grande */}
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? "Pausar" : "Reproducir"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  )}
                </button>

                {/* Botón siguiente pista */}
                <button
                  onClick={handleNext}
                  className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Siguiente canción"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Control de volumen / Silencio */}
                <div className="flex items-center gap-1.5 text-white/70">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? "Activar sonido" : "Silenciar"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-16 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-400"
                    title="Volumen"
                  />
                </div>
              </div>
            </div>

            {/* Cuadro de Texto Personalizado / Dedicatoria */}
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 text-stone-200 text-left">
              <span className="font-serif text-2xl text-rose-400/50 block leading-none -mt-1 mb-1">
                “
              </span>
              <p className="font-serif italic text-sm md:text-base leading-relaxed text-white/90">
                {currentSong.dedicatoria}
              </p>
            </div>

            {/* Botón Elegante para abrir en Spotify */}
            <a
              href={currentSong.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-[#1DB954] hover:text-black text-white text-xs font-semibold font-sans flex items-center justify-center gap-2 transition-all duration-300 border border-white/15 shadow-md active:scale-98"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <span>Abrir en Spotify</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </a>

          </div>

          {/* Botón siguiente */}
          <button
            onClick={handleNext}
            className="hidden sm:flex w-12 h-12 rounded-full glass-panel hover:bg-white/15 items-center justify-center text-white/80 hover:text-white transition-all active:scale-95 shrink-0"
            aria-label="Canción siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Indicadores de paginación / Thumbnails rápidos */}
        <div className="flex items-center gap-2 mt-6">
          {songs.map((song, idx) => (
            <button
              key={song.id}
              onClick={() => handleSelectSong(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-8 bg-rose-400"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Ir a canción ${idx + 1}`}
            />
          ))}
        </div>
      </main>

      {/* ==================================================== */}
      {/* 5. MINI REPRODUCTOR DE AUDIO FLOTANTE INFERIOR       */}
      {/* ==================================================== */}
      <footer className="relative z-20 w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
        <div className="glass-panel-elevated rounded-2xl p-3 md:p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/20">
          {/* Información y portada miniatura */}
          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow">
              <img
                src={currentSong.portada}
                alt={currentSong.titulo}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800";
                }}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-white truncate">
                {currentSong.titulo}
              </h4>
              <p className="text-[11px] text-white/60 truncate">{currentSong.album || currentSong.artista}</p>
            </div>
          </div>

          {/* Barra central de controles y tiempo */}
          <div className="flex-1 w-full max-w-md flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Anterior"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </button>
              <button
                onClick={handleNext}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Siguiente"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full flex items-center gap-2 text-[10px] font-mono text-white/60">
              <span>{formatTime(currentTime)}</span>
              <div
                onClick={handleScrub}
                className="flex-1 h-1.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer relative transition-colors"
                title="Haz clic para saltar en la canción"
              >
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-300 rounded-full"
                  style={{ width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Enlace externo a Spotify */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <a
              href={currentSong.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#1DB954] hover:text-black text-white text-xs font-semibold font-sans flex items-center gap-1.5 border border-white/15 transition-all"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <span>Spotify</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </footer>

      {/* ==================================================== */}
      {/* 6. MODAL: DEDICATORIA COMPLETA                      */}
      {/* ==================================================== */}
      {showLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-elevated max-w-lg w-full rounded-2xl p-6 md:p-8 text-center relative border border-rose-500/30 shadow-2xl">
            <button
              onClick={() => setShowLetterModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="font-handwriting text-3xl text-rose-300 block mb-1">
              Carta para ti
            </span>
            <h3 className="font-serif text-2xl font-bold text-white mb-4">
              {config.tituloRegalo}
            </h3>
            <p className="font-serif italic text-white/85 leading-relaxed text-sm md:text-base mb-6">
              "{config.mensajeCarta}"
            </p>
            <div className="text-xs uppercase tracking-widest text-rose-300 font-sans font-semibold">
              {config.remitente}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 7. MODAL DE PERSONALIZACIÓN Y EXPORTACIÓN HTML       */}
      {/* ==================================================== */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel-elevated max-w-2xl w-full max-h-[90vh] rounded-3xl p-6 md:p-8 flex flex-col border border-white/20 shadow-2xl overflow-hidden">
            
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Personalizar y Exportar Regalo
                </h3>
                <p className="text-xs text-white/60">
                  Edita las canciones, la animación de apertura o exporta tu archivo HTML autónomo.
                </p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas de configuración */}
            <div className="flex gap-2 my-4 border-b border-white/10 pb-2 shrink-0">
              <button
                onClick={() => setActiveTab("canciones")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === "canciones"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Canciones ({songs.length})
              </button>
              <button
                onClick={() => setActiveTab("apariencia")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === "apariencia"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Apertura y Textos
              </button>
              <button
                onClick={() => setActiveTab("codigo")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === "codigo"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Código HTML Único
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              
              {/* TAB 1: LISTA DE CANCIONES */}
              {activeTab === "canciones" && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Guardado automático en tu navegador activo</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopySongsTsCode}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg flex items-center gap-1 border border-white/10 transition-colors"
                        title="Copiar array para pegar en src/data/songs.ts"
                      >
                        {copiedSongsTs ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedSongsTs ? "¡Copiado para songs.ts!" : "Copiar lista"}</span>
                      </button>
                      <button
                        onClick={handleAddSong}
                        className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir canción</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {songs.map((song, idx) => (
                      <div
                        key={song.id}
                        className="glass-panel p-3 rounded-xl flex items-center justify-between gap-3 border border-white/10"
                      >
                        <img
                          src={song.portada}
                          alt={song.titulo}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-semibold text-white truncate">
                            {idx + 1}. {song.titulo}
                          </h5>
                          <p className="text-[11px] text-white/60 truncate">
                            {song.album || song.artista}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingSong(song)}
                            className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSong(song.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Editor en línea de canción seleccionada */}
                  {editingSong && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-rose-500/30">
                      <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider mb-3">
                        Editar Canción: {editingSong.titulo}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-white/60 mb-1">Título de la Canción</label>
                          <input
                            type="text"
                            value={editingSong.titulo}
                            onChange={(e) =>
                              setEditingSong({ ...editingSong, titulo: e.target.value })
                            }
                            className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-white/60 mb-1 flex items-center justify-between">
                            <span>Álbum</span>
                            <span className="text-[10px] text-amber-300 font-medium">Bajo el título principal</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: MTV Unplugged"
                            value={editingSong.album || ""}
                            onChange={(e) =>
                              setEditingSong({ ...editingSong, album: e.target.value })
                            }
                            className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-white/60 mb-1">Artista</label>
                          <input
                            type="text"
                            value={editingSong.artista}
                            onChange={(e) =>
                              setEditingSong({ ...editingSong, artista: e.target.value })
                            }
                            className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white"
                          />
                        </div>

                        {/* Campo de Portada Mejorado: URL + Subir Foto Local + Auto-detectar color */}
                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                            <label className="text-white/80 font-medium">Portada de la Canción</label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleAutoDetectColors}
                                disabled={isExtractingColor || !editingSong.portada}
                                className="text-[11px] text-rose-300 hover:text-rose-200 cursor-pointer flex items-center gap-1 font-medium bg-rose-500/20 hover:bg-rose-500/30 px-2.5 py-1 rounded-lg border border-rose-500/30 transition-all disabled:opacity-50"
                                title="Analizar portada y detectar color automáticamente"
                              >
                                <Sparkles className="w-3 h-3 text-rose-400" />
                                <span>{isExtractingColor ? "Analizando..." : "🎨 Auto-detectar color"}</span>
                              </button>
                              <label className="text-[11px] text-amber-300 hover:text-amber-200 cursor-pointer flex items-center gap-1 font-medium bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 hover:bg-white/15 transition-all">
                                <Upload className="w-3 h-3" />
                                <span>Subir foto propia</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageFileUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex gap-3 items-start">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/20 bg-black/40 shrink-0 relative group">
                              <img
                                src={editingSong.portada}
                                alt="Vista previa"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white text-center p-0.5 transition-opacity">
                                Vista previa
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                placeholder="Pega el enlace directo de la imagen..."
                                value={editingSong.portada}
                                onChange={(e) =>
                                  setEditingSong({ ...editingSong, portada: e.target.value })
                                }
                                className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white text-xs font-mono"
                              />
                              <div className="mt-1.5 p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/70 space-y-1">
                                <p className="font-semibold text-rose-300 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 shrink-0" />
                                  ¿Cómo añadir portadas personalizadas?
                                </p>
                                <p>
                                  <strong className="text-white">Opción 1 (Google Imágenes):</strong> Abre la foto en grande, haz clic derecho y selecciona <span className="text-amber-200 underline font-medium">"Copiar dirección de la imagen"</span> (NO "Copiar vínculo" de la búsqueda). Luego pégala aquí o en <code className="bg-white/10 px-1 rounded text-[10px]">src/data/songs.ts</code>.
                                </p>
                                <p>
                                  <strong className="text-white">Opción 2 (Tu propia foto):</strong> Haz clic en <span className="text-emerald-300 font-medium">"Subir foto propia"</span> arriba para elegir directamente cualquier foto de tu galería sin necesidad de subirla a internet.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Campo de Audio Dropbox / MP3 */}
                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-white/80 font-medium flex items-center gap-1.5">
                              <Music className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Audio Principal (Enlace Dropbox / MP3)</span>
                            </label>
                            <label className="text-[11px] text-cyan-300 hover:text-cyan-200 cursor-pointer flex items-center gap-1 font-medium bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 hover:bg-white/15 transition-all">
                              <Upload className="w-3 h-3" />
                              <span>Subir archivo MP3 local</span>
                              <input
                                type="file"
                                accept="audio/*,.mp3,.m4a,.wav"
                                onChange={handleAudioFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            placeholder="https://www.dropbox.com/s/.../cancion.mp3?dl=0"
                            value={editingSong.audioPreview || ""}
                            onChange={(e) =>
                              setEditingSong({ ...editingSong, audioPreview: e.target.value })
                            }
                            className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white text-xs font-mono"
                          />
                          <div className="mt-1.5 p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200/90 space-y-1">
                            <p className="font-semibold text-cyan-300 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-cyan-400" />
                              <span>¡Soporte automático para Dropbox activado!</span>
                            </p>
                            <p>
                              Pega tu enlace de Dropbox tal como lo copias (incluso con <code className="bg-black/40 px-1 rounded">?dl=0</code>). La web lo transformará internamente para reproducir el audio directamente en el reproductor grande.
                            </p>
                          </div>
                        </div>

                        {/* Campo de Enlace a Spotify (Para el botón de la tarjeta) */}
                        <div className="sm:col-span-2">
                          <label className="block text-white/60 mb-1 flex items-center justify-between">
                            <span>Enlace de Spotify (Botón de la Tarjeta)</span>
                            <span className="text-[10px] text-emerald-400 font-normal">
                              Opcional para abrir la canción en Spotify
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder="https://open.spotify.com/track/..."
                            value={editingSong.spotifyUrl}
                            onChange={(e) =>
                              setEditingSong({ ...editingSong, spotifyUrl: e.target.value })
                            }
                            className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white text-xs font-mono"
                          />
                          <p className="text-[11px] text-white/50 mt-1">
                            El botón «Abrir en Spotify» de la tarjeta grande llevará a este enlace.
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-white/60 mb-1">Dedicatoria / Recuerdo</label>
                          <textarea
                            rows={2}
                            value={editingSong.dedicatoria}
                            onChange={(e) =>
                              setEditingSong({ ...editingSong, dedicatoria: e.target.value })
                            }
                            className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-white/60 mb-1">Momento / Fecha</label>
                          <input
                            type="text"
                            value={editingSong.fechaOMomento}
                            onChange={(e) =>
                              setEditingSong({ ...editingSong, fechaOMomento: e.target.value })
                            }
                            className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white"
                          />
                        </div>

                        {/* SECCIÓN ESPECIAL: COLOR AMBIENTAL ADAPTATIVO & DETECCIÓN AUTOMÁTICA */}
                        <div className="sm:col-span-2 pt-3 mt-1 border-t border-white/10">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                            <div>
                              <label className="text-white font-medium flex items-center gap-1.5 text-xs">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Color Ambiental de la Página para esta Canción</span>
                              </label>
                              <p className="text-[11px] text-white/60">
                                Los halos luminosos y el fondo cambiarán automáticamente al tono de esta carátula.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleAutoDetectColors}
                              disabled={isExtractingColor || !editingSong.portada}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isExtractingColor ? "Analizando portada..." : "🎨 Auto-detectar color de la portada"}</span>
                            </button>
                          </div>

                          {extractionNotice && (
                            <div className="mb-2.5 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                              <span>{extractionNotice}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3 mb-2">
                            <div>
                              <span className="block text-[11px] text-white/70 mb-1">Color Principal (Brillo Central)</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editingSong.colorAmbiental || "#e11d48"}
                                  onChange={(e) =>
                                    setEditingSong({ ...editingSong, colorAmbiental: e.target.value })
                                  }
                                  className="w-10 h-8 rounded border border-white/20 bg-black/40 cursor-pointer p-0.5"
                                />
                                <span className="text-xs font-mono text-white/80">{editingSong.colorAmbiental}</span>
                              </div>
                            </div>
                            <div>
                              <span className="block text-[11px] text-white/70 mb-1">Color Secundario (Brillo Lateral)</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editingSong.colorSecundario || "#9333ea"}
                                  onChange={(e) =>
                                    setEditingSong({ ...editingSong, colorSecundario: e.target.value })
                                  }
                                  className="w-10 h-8 rounded border border-white/20 bg-black/40 cursor-pointer p-0.5"
                                />
                                <span className="text-xs font-mono text-white/80">{editingSong.colorSecundario}</span>
                              </div>
                            </div>
                          </div>

                          {/* Muestras de la paleta extraída para seleccionar con 1 clic */}
                          {extractedPalette.length > 0 && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                              <span className="text-[11px] text-white/70 block mb-1.5 font-medium">
                                Tonos sugeridos extraídos (haz clic para aplicar a la página):
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                {extractedPalette.map((col, cIdx) => (
                                  <button
                                    key={cIdx}
                                    type="button"
                                    onClick={() => setEditingSong({ ...editingSong, colorAmbiental: col })}
                                    className="w-7 h-7 rounded-full border-2 border-white/30 hover:scale-110 active:scale-95 transition-transform shadow flex items-center justify-center cursor-pointer"
                                    style={{ backgroundColor: col }}
                                    title={`Aplicar ${col}`}
                                  >
                                    {editingSong.colorAmbiental?.toLowerCase() === col.toLowerCase() && (
                                      <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => setEditingSong(null)}
                          className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleUpdateSong(editingSong)}
                          className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg shadow"
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: APERTURA Y TEXTOS GENERALES */}
              {activeTab === "apariencia" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-white mb-2">
                      Estilo de Apertura por Defecto
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setConfig({ ...config, tipoApertura: "sobre" })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          config.tipoApertura === "sobre"
                            ? "bg-rose-500/20 border-rose-400 text-white font-semibold"
                            : "glass-panel border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        <Mail className="w-5 h-5 mx-auto mb-1 text-rose-300" />
                        <span>Sobre con Cera</span>
                      </button>
                      <button
                        onClick={() => setConfig({ ...config, tipoApertura: "vinilo" })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          config.tipoApertura === "vinilo"
                            ? "bg-amber-500/20 border-amber-400 text-white font-semibold"
                            : "glass-panel border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        <Disc className="w-5 h-5 mx-auto mb-1 text-amber-300" />
                        <span>Funda de Vinilo</span>
                      </button>
                      <button
                        onClick={() => setConfig({ ...config, tipoApertura: "directo" })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          config.tipoApertura === "directo"
                            ? "bg-blue-500/20 border-blue-400 text-white font-semibold"
                            : "glass-panel border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        <Play className="w-5 h-5 mx-auto mb-1 text-blue-300" />
                        <span>Entrada Directa</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1">Título del Regalo</label>
                    <input
                      type="text"
                      value={config.tituloRegalo}
                      onChange={(e) => setConfig({ ...config, tituloRegalo: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/70 mb-1">Para (Destinatario)</label>
                      <input
                        type="text"
                        value={config.destinatario}
                        onChange={(e) => setConfig({ ...config, destinatario: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 mb-1">De (Firma / Remitente)</label>
                      <input
                        type="text"
                        value={config.remitente}
                        onChange={(e) => setConfig({ ...config, remitente: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1">Mensaje de la Carta Inicial</label>
                    <textarea
                      rows={3}
                      value={config.mensajeCarta}
                      onChange={(e) => setConfig({ ...config, mensajeCarta: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: EXPORTACIÓN HTML ÚNICO */}
              {activeTab === "codigo" && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 leading-relaxed">
                    <strong>¡Todo en un único archivo!</strong> Tal como pediste, la constante{" "}
                    <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">
                      LISTA_CANCIONES
                    </code>{" "}
                    está colocada al inicio del bloque de JavaScript para editar libremente las canciones sin tocar la estructura HTML.
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyStandaloneCode}
                      className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? "¡Código Copiado!" : "Copiar HTML Completo"}</span>
                    </button>
                    <button
                      onClick={handleDownloadStandalone}
                      className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-white/15 shadow"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar index.html</span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="bg-black/60 border border-white/10 rounded-xl p-3 text-[11px] font-mono text-stone-300 overflow-x-auto max-h-64 leading-tight">
                      {`// Estructura de la constante lista para modificar:
const LISTA_CANCIONES = ${JSON.stringify(songs.slice(0, 2), null, 2)}
... y ${songs.length - 2} canciones más`}
                    </pre>
                  </div>
                </div>
              )}

            </div>

            {/* Pie del modal */}
            <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center shrink-0">
              <span className="text-[11px] text-white/50">
                Los cambios se guardan automáticamente.
              </span>
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-stone-200 transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

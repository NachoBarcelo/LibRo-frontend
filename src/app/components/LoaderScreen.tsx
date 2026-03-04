import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface LoaderScreenProps {
  onLoadComplete: () => void;
}

export function LoaderScreen({ onLoadComplete }: LoaderScreenProps) {
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    let openTimer: ReturnType<typeof setTimeout> | undefined;

    // Simula el tiempo de carga (3 segundos antes de abrir)
    const timer = setTimeout(() => {
      setLoadingComplete(true);
      // Espera la animación de apertura + tiempo del texto antes de notificar
      openTimer = setTimeout(() => {
        onLoadComplete();
      }, 3000); // Aumentado a 3 segundos para mostrar el texto más tiempo
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (openTimer) {
        clearTimeout(openTimer);
      }
    };
  }, [onLoadComplete]);

  // Libros en los estantes - Más variedad y realismo
  const booksLeft = [
    // Estante superior
    [
      { height: 140, color: '#6f1028', width: 28, title: true },
      { height: 155, color: '#8f1d39', width: 35, title: false },
      { height: 145, color: '#b63a57', width: 30, title: true },
      { height: 150, color: '#4a0d1d', width: 25, title: false },
      { height: 148, color: '#d48aa0', width: 32, title: true },
      { height: 142, color: '#6f1028', width: 28, title: false },
      { height: 152, color: '#8f1d39', width: 30, title: true },
      { height: 146, color: '#b63a57', width: 26, title: false },
      { height: 151, color: '#6f1028', width: 29, title: true },
    ],
    // Estante medio
    [
      { height: 165, color: '#8f1d39', width: 32, title: false },
      { height: 175, color: '#4a0d1d', width: 38, title: true },
      { height: 170, color: '#b63a57', width: 28, title: false },
      { height: 168, color: '#d48aa0', width: 35, title: true },
      { height: 172, color: '#6f1028', width: 30, title: false },
      { height: 178, color: '#8f1d39', width: 33, title: true },
      { height: 171, color: '#b63a57', width: 31, title: false },
      { height: 176, color: '#4a0d1d', width: 34, title: true },
    ],
    // Estante inferior
    [
      { height: 190, color: '#6f1028', width: 40, title: true },
      { height: 180, color: '#8f1d39', width: 32, title: false },
      { height: 200, color: '#b63a57', width: 45, title: true },
      { height: 185, color: '#4a0d1d', width: 35, title: false },
      { height: 195, color: '#d48aa0', width: 42, title: true },
      { height: 188, color: '#6f1028', width: 38, title: false },
      { height: 193, color: '#8f1d39', width: 36, title: true },
      { height: 186, color: '#4a0d1d', width: 34, title: false },
    ],
    // Estante extra (solo desktop)
    [
      { height: 162, color: '#6f1028', width: 30, title: true },
      { height: 168, color: '#8f1d39', width: 34, title: false },
      { height: 160, color: '#b63a57', width: 29, title: true },
      { height: 170, color: '#4a0d1d', width: 36, title: false },
      { height: 166, color: '#d48aa0', width: 33, title: true },
      { height: 172, color: '#6f1028', width: 35, title: false },
      { height: 164, color: '#8f1d39', width: 31, title: true },
      { height: 169, color: '#b63a57', width: 34, title: false },
    ],
    // Estante extra 2 (solo desktop)
    [
      { height: 158, color: '#4a0d1d', width: 29, title: true },
      { height: 166, color: '#6f1028', width: 33, title: false },
      { height: 161, color: '#8f1d39', width: 30, title: true },
      { height: 168, color: '#b63a57', width: 35, title: false },
      { height: 163, color: '#d48aa0', width: 32, title: true },
      { height: 170, color: '#4a0d1d', width: 34, title: false },
      { height: 159, color: '#6f1028', width: 30, title: true },
      { height: 167, color: '#8f1d39', width: 33, title: false },
    ],
  ];

  const booksRight = [
    // Estante superior
    [
      { height: 148, color: '#8f1d39', width: 30, title: true },
      { height: 152, color: '#4a0d1d', width: 33, title: false },
      { height: 145, color: '#b63a57', width: 28, title: true },
      { height: 150, color: '#d48aa0', width: 32, title: false },
      { height: 146, color: '#6f1028', width: 29, title: true },
      { height: 154, color: '#8f1d39', width: 31, title: false },
      { height: 149, color: '#4a0d1d', width: 27, title: true },
      { height: 153, color: '#b63a57', width: 30, title: false },
      { height: 147, color: '#6f1028', width: 28, title: true },
    ],
    // Estante medio
    [
      { height: 170, color: '#8f1d39', width: 36, title: false },
      { height: 180, color: '#4a0d1d', width: 40, title: true },
      { height: 168, color: '#b63a57', width: 30, title: false },
      { height: 175, color: '#d48aa0', width: 35, title: true },
      { height: 172, color: '#6f1028', width: 33, title: false },
      { height: 178, color: '#8f1d39', width: 37, title: true },
      { height: 174, color: '#b63a57', width: 32, title: false },
      { height: 179, color: '#4a0d1d', width: 35, title: true },
    ],
    // Estante inferior
    [
      { height: 195, color: '#8f1d39', width: 42, title: true },
      { height: 185, color: '#4a0d1d', width: 38, title: false },
      { height: 198, color: '#b63a57', width: 44, title: true },
      { height: 188, color: '#d48aa0', width: 36, title: false },
      { height: 192, color: '#6f1028', width: 40, title: true },
      { height: 190, color: '#8f1d39', width: 39, title: false },
      { height: 194, color: '#b63a57', width: 37, title: true },
      { height: 187, color: '#4a0d1d', width: 35, title: false },
    ],
    // Estante extra (solo desktop)
    [
      { height: 165, color: '#8f1d39', width: 33, title: true },
      { height: 171, color: '#4a0d1d', width: 36, title: false },
      { height: 163, color: '#b63a57', width: 30, title: true },
      { height: 169, color: '#d48aa0', width: 34, title: false },
      { height: 167, color: '#6f1028', width: 32, title: true },
      { height: 173, color: '#8f1d39', width: 35, title: false },
      { height: 166, color: '#b63a57', width: 31, title: true },
      { height: 170, color: '#4a0d1d', width: 34, title: false },
    ],
    // Estante extra 2 (solo desktop)
    [
      { height: 160, color: '#6f1028', width: 31, title: true },
      { height: 167, color: '#8f1d39', width: 34, title: false },
      { height: 162, color: '#4a0d1d', width: 30, title: true },
      { height: 170, color: '#b63a57', width: 35, title: false },
      { height: 164, color: '#d48aa0', width: 33, title: true },
      { height: 172, color: '#6f1028', width: 36, title: false },
      { height: 161, color: '#8f1d39', width: 31, title: true },
      { height: 168, color: '#4a0d1d', width: 34, title: false },
    ],
  ];

  const visibleShelves = 3;

  // Partículas flotantes de polvo
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: loadingComplete ? 0 : 1 }}
      transition={{ duration: 0.8, delay: loadingComplete ? 2.5 : 0 }}
      style={{ pointerEvents: loadingComplete ? 'none' : 'auto', backgroundColor: '#f8f3ef' }}
    >
      <picture className="absolute inset-0 z-0 flex h-full w-full items-center justify-center bg-[#f8f3ef]">
        <source media="(max-width: 767px)" srcSet="/Fondo-Libro-mobile.png" />
        <img
          src="/Fondo-Libro-desktop.png"
          alt="Fondo de carga"
          className="h-auto w-auto max-h-full max-w-full object-contain"
        />
      </picture>

      {/* Fondo decorativo mejorado */}
      {!loadingComplete && (
      <div className="absolute inset-0">
        {/* Textura de papel vintage */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(111, 16, 40, 0.04) 2px, rgba(111, 16, 40, 0.04) 4px),
              repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(111, 16, 40, 0.04) 2px, rgba(111, 16, 40, 0.04) 4px)
            `,
          }}
        />
        
        {/* Mandalas decorativos */}
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" className="text-primary">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 45 * Math.cos((i * Math.PI) / 4)}
                y2={50 + 45 * Math.sin((i * Math.PI) / 4)}
                stroke="currentColor"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <circle
                key={i}
                cx={50 + 35 * Math.cos((i * Math.PI) / 4)}
                cy={50 + 35 * Math.sin((i * Math.PI) / 4)}
                r="3"
                fill="currentColor"
              />
            ))}
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 opacity-10"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" className="text-accent">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 45 * Math.cos((i * Math.PI) / 6)}
                y2={50 + 45 * Math.sin((i * Math.PI) / 6)}
                stroke="currentColor"
                strokeWidth="0.5"
              />
            ))}
          </svg>
        </motion.div>

        {/* Elementos florales decorativos */}
        <motion.div
          className="absolute top-1/3 left-1/4 opacity-15"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" className="text-primary">
            <path d="M40 10 C40 10 30 20 30 30 C30 35 34 40 40 40 C46 40 50 35 50 30 C50 20 40 10 40 10Z" fill="currentColor" opacity="0.3" />
            <path d="M20 40 C20 40 10 50 10 60 C10 65 14 70 20 70 C26 70 30 65 30 60 C30 50 20 40 20 40Z" fill="currentColor" opacity="0.4" />
            <path d="M60 40 C60 40 50 50 50 60 C50 65 54 70 60 70 C66 70 70 65 70 60 C70 50 60 40 60 40Z" fill="currentColor" opacity="0.4" />
            <path d="M40 30 C40 30 50 40 60 40 C65 40 70 36 70 30 C70 24 65 20 60 20 C50 20 40 30 40 30Z" fill="currentColor" opacity="0.35" />
            <path d="M40 30 C40 30 30 40 20 40 C15 40 10 36 10 30 C10 24 15 20 20 20 C30 20 40 30 40 30Z" fill="currentColor" opacity="0.35" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-1/3 right-1/4 opacity-15"
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" className="text-accent">
            <path d="M40 10 C40 10 30 20 30 30 C30 35 34 40 40 40 C46 40 50 35 50 30 C50 20 40 10 40 10Z" fill="currentColor" opacity="0.3" />
            <path d="M20 40 C20 40 10 50 10 60 C10 65 14 70 20 70 C26 70 30 65 30 60 C30 50 20 40 20 40Z" fill="currentColor" opacity="0.4" />
            <path d="M60 40 C60 40 50 50 50 60 C50 65 54 70 60 70 C66 70 70 65 70 60 C70 50 60 40 60 40Z" fill="currentColor" opacity="0.4" />
            <path d="M40 30 C40 30 50 40 60 40 C65 40 70 36 70 30 C70 24 65 20 60 20 C50 20 40 30 40 30Z" fill="currentColor" opacity="0.35" />
            <path d="M40 30 C40 30 30 40 20 40 C15 40 10 36 10 30 C10 24 15 20 20 20 C30 20 40 30 40 30Z" fill="currentColor" opacity="0.35" />
          </svg>
        </motion.div>

        {/* Partículas de polvo flotante */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      )}

      {/* Librería que se abre - ahora ocupa toda la pantalla */}
      <div className="relative w-full h-full flex items-stretch justify-center gap-0">
        {/* Puerta izquierda - ocupa 50% de la pantalla */}
        <motion.div
          className="relative w-1/2 h-full flex flex-col justify-between px-3 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-12"
          style={{
            background: 'linear-gradient(135deg, #8f1d39 0%, #6f1028 50%, #4a0d1d 100%)',
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.4), 0 20px 60px rgba(0,0,0,0.5)',
            borderRight: '3px solid #4a0d1d',
          }}
          initial={{ x: 0 }}
          animate={{ x: loadingComplete ? '-100%' : 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Textura de madera */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px),
                repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(0,0,0,0.05) 80px, rgba(0,0,0,0.05) 160px)
              `,
            }}
          />

          {/* Marco decorativo tallado */}
          <div className="absolute inset-4 border-4 border-accent/30 rounded-sm pointer-events-none">
            <div className="absolute inset-2 border-2 border-accent/20 rounded-sm" />
          </div>

          {/* Bisagras decorativas */}
          <div className="absolute left-4 top-24 w-8 h-16 bg-gradient-to-r from-accent to-primary rounded-sm shadow-lg flex flex-col justify-around items-center py-2">
            <div className="w-3 h-3 rounded-full bg-foreground/40" />
            <div className="w-3 h-3 rounded-full bg-foreground/40" />
          </div>
          <div className="absolute left-4 bottom-24 w-8 h-16 bg-gradient-to-r from-accent to-primary rounded-sm shadow-lg flex flex-col justify-around items-center py-2">
            <div className="w-3 h-3 rounded-full bg-foreground/40" />
            <div className="w-3 h-3 rounded-full bg-foreground/40" />
          </div>

          {/* Estantes con libros */}
          <div className="relative z-10 mt-8 sm:mt-12 lg:mt-16 space-y-4 sm:space-y-6 lg:space-y-8">
            {booksLeft.slice(0, visibleShelves).map((shelf, shelfIdx) => (
              <div key={shelfIdx} className="relative scale-[0.62] sm:scale-[0.8] md:scale-100 origin-center">
                {/* Estante */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-foreground/30 to-foreground/10 shadow-lg rounded-sm" />
                
                {/* Libros */}
                <div className="flex items-end gap-1 mb-2 justify-center px-2 pb-2 md:justify-end md:pr-3 lg:pr-14 xl:pr-18">
                  {shelf.map((book, idx) => (
                    <motion.div
                      key={idx}
                      className={`rounded-t-sm shadow-xl relative overflow-hidden ${idx > 1 ? 'hidden sm:block' : ''}`}
                      style={{
                        height: book.height,
                        width: book.width,
                        background: `linear-gradient(180deg, ${book.color} 0%, ${adjustBrightness(book.color, -30)} 100%)`,
                        border: '1px solid rgba(0,0,0,0.3)',
                        transform: idx % 3 === 0 ? 'rotate(-2deg)' : idx % 3 === 1 ? 'rotate(1deg)' : 'rotate(0deg)',
                      }}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: shelfIdx * 0.2 + idx * 0.08 + 0.3 }}
                    >
                      {/* Detalles del libro */}
                      <div className="w-full h-3 mt-2 border-t border-b border-white/10" />
                      {book.title && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className="w-1 bg-white/20 rounded-full"
                            style={{ height: '60%' }}
                          />
                        </div>
                      )}
                      {/* Textura del lomo */}
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
                      }} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detalle de manija ornamentada */}
          <div className="absolute top-1/2 -translate-y-1/2 right-6 flex flex-col items-center gap-2">
            <div className="w-5 h-24 bg-gradient-to-b from-accent via-primary to-accent rounded-full shadow-2xl relative">
              <div className="absolute inset-1 bg-gradient-to-b from-primary/50 to-accent/50 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-accent rounded-full" />
            </div>
          </div>

          {/* Tallado decorativo superior */}
          <motion.div 
            className="absolute top-4 left-1/2 -translate-x-1/2 opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.5 }}
          >
            <svg width="120" height="60" viewBox="0 0 120 60" className="text-accent">
              <path d="M10 30 Q30 10 60 30 Q90 50 110 30" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M20 35 Q35 25 60 35 Q85 45 100 35" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="60" cy="30" r="4" fill="currentColor" />
              <circle cx="30" cy="25" r="3" fill="currentColor" />
              <circle cx="90" cy="35" r="3" fill="currentColor" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Puerta derecha - ocupa 50% de la pantalla */}
        <motion.div
          className="relative w-1/2 h-full flex flex-col justify-between px-3 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-12"
          style={{
            background: 'linear-gradient(135deg, #4a0d1d 0%, #6f1028 50%, #8f1d39 100%)',
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.4), 0 20px 60px rgba(0,0,0,0.5)',
            borderLeft: '3px solid #4a0d1d',
          }}
          initial={{ x: 0 }}
          animate={{ x: loadingComplete ? '100%' : 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Textura de madera */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px),
                repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(0,0,0,0.05) 80px, rgba(0,0,0,0.05) 160px)
              `,
            }}
          />

          {/* Marco decorativo tallado */}
          <div className="absolute inset-4 border-4 border-accent/30 rounded-sm pointer-events-none">
            <div className="absolute inset-2 border-2 border-accent/20 rounded-sm" />
          </div>

          {/* Bisagras decorativas */}
          <div className="absolute right-4 top-24 w-8 h-16 bg-gradient-to-l from-accent to-primary rounded-sm shadow-lg flex flex-col justify-around items-center py-2">
            <div className="w-3 h-3 rounded-full bg-foreground/40" />
            <div className="w-3 h-3 rounded-full bg-foreground/40" />
          </div>
          <div className="absolute right-4 bottom-24 w-8 h-16 bg-gradient-to-l from-accent to-primary rounded-sm shadow-lg flex flex-col justify-around items-center py-2">
            <div className="w-3 h-3 rounded-full bg-foreground/40" />
            <div className="w-3 h-3 rounded-full bg-foreground/40" />
          </div>

          {/* Estantes con libros */}
          <div className="relative z-10 mt-8 sm:mt-12 lg:mt-16 space-y-4 sm:space-y-6 lg:space-y-8">
            {booksRight.slice(0, visibleShelves).map((shelf, shelfIdx) => (
              <div key={shelfIdx} className="relative scale-[0.62] sm:scale-[0.8] md:scale-100 origin-center">
                {/* Estante */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-foreground/30 to-foreground/10 shadow-lg rounded-sm" />
                
                {/* Libros */}
                <div className="flex items-end gap-1 mb-2 justify-center px-2 pb-2 md:justify-start md:pl-3 lg:pl-14 xl:pl-18">
                  {shelf.map((book, idx) => (
                    <motion.div
                      key={idx}
                      className={`rounded-t-sm shadow-xl relative overflow-hidden ${idx > 1 ? 'hidden sm:block' : ''}`}
                      style={{
                        height: book.height,
                        width: book.width,
                        background: `linear-gradient(180deg, ${book.color} 0%, ${adjustBrightness(book.color, -30)} 100%)`,
                        border: '1px solid rgba(0,0,0,0.3)',
                        transform: idx % 3 === 0 ? 'rotate(2deg)' : idx % 3 === 1 ? 'rotate(-1deg)' : 'rotate(0deg)',
                      }}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: shelfIdx * 0.2 + idx * 0.08 + 0.3 }}
                    >
                      {/* Detalles del libro */}
                      <div className="w-full h-3 mt-2 border-t border-b border-white/10" />
                      {book.title && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className="w-1 bg-white/20 rounded-full"
                            style={{ height: '60%' }}
                          />
                        </div>
                      )}
                      {/* Textura del lomo */}
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
                      }} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detalle de manija ornamentada */}
          <div className="absolute top-1/2 -translate-y-1/2 left-6 flex flex-col items-center gap-2">
            <div className="w-5 h-24 bg-gradient-to-b from-accent via-primary to-accent rounded-full shadow-2xl relative">
              <div className="absolute inset-1 bg-gradient-to-b from-primary/50 to-accent/50 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-accent rounded-full" />
            </div>
          </div>

          {/* Tallado decorativo superior */}
          <motion.div 
            className="absolute top-4 left-1/2 -translate-x-1/2 opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.5 }}
          >
            <svg width="120" height="60" viewBox="0 0 120 60" className="text-accent">
              <path d="M10 30 Q30 10 60 30 Q90 50 110 30" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M20 35 Q35 25 60 35 Q85 45 100 35" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="60" cy="30" r="4" fill="currentColor" />
              <circle cx="30" cy="25" r="3" fill="currentColor" />
              <circle cx="90" cy="35" r="3" fill="currentColor" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Logo/Texto central mejorado */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: loadingComplete ? 1 : 0, 
            scale: loadingComplete ? 1 : 0.8 
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
        

          

          {loadingComplete && (
            <motion.div
              className="relative z-20 mt-6 flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-accent rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          )}
          
        </motion.div>
      </div>
    </motion.div>
  );
}

// Función auxiliar para ajustar el brillo de un color
function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
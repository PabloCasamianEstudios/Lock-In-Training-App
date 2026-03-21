import SystemStatus from './components/SystemStatus'

function App() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden p-4 text-text-main font-rpg">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 bg-grid pointer-events-none opacity-60"></div>
      
      {/* Scanline effect */}
      <div className="scanline z-50 pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-5xl">
        <header className="mb-20 text-center">
          <div className="inline-block relative">
            <h1 className="text-8xl md:text-9xl font-black text-text-main italic tracking-tighter uppercase mb-0 leading-none">
              LOCK <span className="text-main drop-shadow-[0_0_25px_var(--main-glow)]">IN</span>
            </h1>
            {/* Structural lines */}
            <div className="absolute -bottom-4 left-0 w-full h-[1px] bg-main/30"></div>
            <div className="absolute -bottom-6 right-0 w-1/2 h-[2px] bg-main/60"></div>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-6">
            <div className="h-[1px] w-12 bg-main/20"></div>
            <div className="px-4 py-1 border border-main/20 text-[10px] text-main font-bold uppercase tracking-[1em] bg-main/5">
              Player Synchronization
            </div>
            <div className="h-[1px] w-12 bg-main/20"></div>
          </div>
        </header>

        <SystemStatus />
      </main>
      
      {/* Anime-style frame details - NO BLUE */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-main/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-main/40 to-transparent"></div>
      
      {/* Sharp Corner Accents */}
      <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-main/30"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-main/30"></div>
      
      <div className="absolute top-20 left-20 w-4 h-[1px] bg-main/50"></div>
      <div className="absolute top-20 left-20 w-[1px] h-4 bg-main/50"></div>
    </div>
  )
}

export default App

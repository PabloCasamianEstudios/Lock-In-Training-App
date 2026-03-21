import SystemStatus from './components/SystemStatus'

function App() {
  return (
    <div className="min-h-screen bg-system-dark flex items-center justify-center relative overflow-hidden p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at center, #1e293b 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}></div>
      </div>
      
      {/* Scanline effect */}
      <div className="scanline z-50 pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-2">
            LOCK <span className="text-system-blue">IN</span>
          </h1>
          <div className="h-[1px] w-32 bg-system-blue mx-auto mb-4 shadow-neon"></div>
          <p className="text-[10px] text-system-blue/70 uppercase tracking-[0.5em]">Leveling System Initialization</p>
        </header>

        <SystemStatus />
      </main>
      
      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-system-blue/30"></div>
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-system-blue/30"></div>
    </div>
  )
}

export default App

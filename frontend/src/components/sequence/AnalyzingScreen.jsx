import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldCheck, Activity, Cpu, Search, Zap, BarChart3 } from "lucide-react";

const AnalyzingScreen = ({ onAnalysisComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [completed, setCompleted] = useState(false);

  const tasks = [
    "SCANNING BIOMETRIC DATA...",
    "CALIBRATING ATTRIBUTE MATRIX...",
    "ANALYZING PERFORMANCE LOGS...",
    "MAPPING NEURAL PATHWAYS...",
    "CALCULATING INITIAL RANK...",
    "SYNCHRONIZING WITH SERVER...",
    "FINALIZING PROFILE..."
  ];

  useEffect(() => {
    let currentTaskIndex = 0;
    const totalDuration = 4000;
    const interval = totalDuration / 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setCompleted(true);
          return 100;
        }
        
        const taskIdx = Math.floor((prev / 100) * tasks.length);
        if (taskIdx < tasks.length) {
          setCurrentTask(tasks[taskIdx]);
        }
        
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="smash-slash opacity-20" />
      <div className="scanline" />

      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
        <h1 className="text-[30vw] font-black italic tracking-tighter transform -rotate-12">ANALYZING</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl z-10"
      >
        <div className="system-card border-white shadow-[15px_15px_0px_var(--main-color)] p-12 md:p-20">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-6xl md:text-8xl font-black italic text-white tracking-tighter uppercase leading-none">
                SYSTEM <span className="text-main">SCAN</span>
              </h2>
              <div className="h-4 w-48 bg-main transform -skew-x-12 mt-2" />
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <p className="text-2xl font-black italic text-white uppercase tracking-tighter">
                  {currentTask}
                </p>
                <span className="text-5xl font-black italic text-main">{progress}%</span>
              </div>

              <div className="h-12 w-full bg-white/10 border-4 border-white p-1 transform -skew-x-12 overflow-hidden relative">
                <motion.div
                  className="h-full bg-main"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="h-full w-px bg-black/20 ml-auto" />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Search, label: 'SCAN', active: progress > 10 },
                  { icon: BarChart3, label: 'DATA', active: progress > 35 },
                  { icon: Zap, label: 'SYNC', active: progress > 65 },
                  { icon: ShieldCheck, label: 'VALID', active: progress > 90 },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className={`p-4 border-2 transform -skew-x-12 flex items-center gap-3 transition-colors ${item.active ? 'bg-white border-white text-black' : 'bg-transparent border-white/20 text-white/20'}`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-black italic tracking-tighter uppercase">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {completed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-8 flex justify-center"
                >
                  <button
                    onClick={onAnalysisComplete}
                    className="button-neon text-4xl px-20 relative group overflow-visible"
                  >
                    <span className="relative z-10">CLAIM YOUR RANK</span>
                    <motion.div
                      className="absolute -inset-2 border-4 border-white opacity-40 group-hover:opacity-100 transition-opacity"
                      animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyzingScreen;

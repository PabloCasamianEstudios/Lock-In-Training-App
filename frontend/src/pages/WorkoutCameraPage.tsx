import { useState, useEffect, useRef, type FC } from 'react';
import Webcam from 'react-webcam';
import * as mpPose from '@mediapipe/pose';
import * as mpDrawing from '@mediapipe/drawing_utils';
import * as mpCamera from '@mediapipe/camera_utils';
import { RepCounter } from '../services/exercise/RepCounter';
import { ArrowLeft, CheckCircle, Activity, Camera as CameraIcon } from 'lucide-react';
import apiClient from '../services/apiClient';
import type { PageProps } from '../types';

// Solución definitiva para compatibilidad con Vite (CommonJS -> ESM fallback)
const Pose = (mpPose as any).Pose || (mpPose as any).default?.Pose || (window as any).Pose;
const POSE_CONNECTIONS = (mpPose as any).POSE_CONNECTIONS || (mpPose as any).default?.POSE_CONNECTIONS || (window as any).POSE_CONNECTIONS;
const drawConnectors = (mpDrawing as any).drawConnectors || (mpDrawing as any).default?.drawConnectors || (window as any).drawConnectors;
const drawLandmarks = (mpDrawing as any).drawLandmarks || (mpDrawing as any).default?.drawLandmarks || (window as any).drawLandmarks;
const Camera = (mpCamera as any).Camera || (mpCamera as any).default?.Camera || (window as any).Camera;



interface WorkoutCameraPageProps extends PageProps {
  questId?: number;
  targetReps?: number;
  exerciseType?: string;
}

const WorkoutCameraPage: FC<WorkoutCameraPageProps> = ({ user, questId, targetReps = 10, exerciseType = 'PUSHUPS', onNavigate }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const repCounter = useRef(new RepCounter());
  
  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results: any) => {
      if (!canvasRef.current || !webcamRef.current?.video) return;

      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
        drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

        // Actualizar lógica de conteo
        if (!completed) {
            const hasRepped = repCounter.current.updatePushups(results.poseLandmarks);
            if (hasRepped) {
                const newCount = repCounter.current.getCount();
                setCount(newCount);
                if (newCount >= targetReps) {
                    setCompleted(true);
                }
            }
        }
      }
    });

    let camera: any = null;
    if (webcamRef.current?.video) {
        camera = new Camera(webcamRef.current.video, {
            onFrame: async () => {
                if (webcamRef.current?.video) {
                    await pose.send({ image: webcamRef.current.video });
                }
            },
            width: 640,
            height: 480,
        });
        camera.start();
        setIsLoaded(true);
    }

    return () => {
        if (camera) camera.stop();
        pose.close();
    };
  }, [targetReps, completed]);

  const handleFinishQuest = async () => {
    if (!questId || !user) return;
    try {
      await apiClient(`/api/quests/complete/${questId}/${user.id}`, { method: 'POST' });
      if (onNavigate) onNavigate('quests');
    } catch (err: any) {
      setError(err.message || 'Error al completar la misión.');
    }
  };

  const handleBack = () => {
    if (onNavigate) onNavigate('quests');
  };

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center font-mono overflow-hidden">
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black to-transparent">
        <button onClick={handleBack} className="text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
            <h1 className="text-main font-black italic tracking-widest text-xl">DETECCIÓN DE IA</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">{exerciseType}: {count} / {targetReps}</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="relative w-full max-w-2xl aspect-video bg-white/5 border border-white/10 overflow-hidden">
        {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 gap-4">
                <Activity className="w-12 h-12 animate-spin text-main" />
                <span className="text-xs uppercase tracking-widest animate-pulse">Sincronizando con el sistema...</span>
            </div>
        )}
        
        <Webcam
          ref={webcamRef}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          mirrored={true}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          width={640}
          height={480}
        />

        {/* REP COUNTER OVERLAY */}
        <div className="absolute bottom-6 right-6 flex flex-col items-end">
            <div className="text-[60px] font-black text-main leading-none drop-shadow-[0_0_10px_#fbd38d]">
                {count}
            </div>
            <div className="text-xs text-white/70 font-bold uppercase tracking-widest">REP / {targetReps}</div>
        </div>
      </div>

      {/* FOOTER / STATUS */}
      <div className="p-8 w-full max-w-2xl text-center">
        {completed ? (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                <div className="flex items-center gap-2 text-green-500 font-black italic text-2xl uppercase">
                    <CheckCircle className="w-8 h-8" /> OBJETIVO COMPLETADO
                </div>
                <button 
                   onClick={handleFinishQuest}
                   className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest transition-all skew-x-[-10deg] shadow-[5px_5px_0_white]"
                >
                    <span className="skew-x-[10deg] inline-block">RECLAMAR RECOMPENSA</span>
                </button>
            </div>
        ) : (
            <div className="text-white/40 text-[10px] uppercase tracking-[0.2em] italic leading-relaxed">
                Ponte frente a la cámara de forma lateral. <br/>
                Asegúrate de que tus brazos y pecho sean visibles para el "Sistema".
            </div>
        )}
        {error && <div className="mt-4 text-red-500 text-xs font-bold uppercase">{error}</div>}
      </div>
      
      {/* SCANNING LINES EFFECT */}
      <div className="absolute inset-0 pointer-events-none border-[10px] border-orange-500/5 mix-blend-overlay animate-pulse" />
      <div className="absolute top-0 left-0 w-full h-1 bg-main/20 animate-scan pointer-events-none shadow-[0_0_15px_#fbd38d]" />
    </div>
  );
};

export default WorkoutCameraPage;

import { useState, useEffect, useRef, type FC } from 'react';
import Webcam from 'react-webcam';
import { RepCounter } from '../../services/exercise/RepCounter';
import { ArrowLeft, CheckCircle, Activity, Camera as CameraIcon } from 'lucide-react';
import apiClient from '../../services/apiClient';
import type { PageProps } from '../../types';
import { useLanguage } from '../../LanguageContext';

const mpPose: any = {};
const mpDrawing: any = {};
const mpCamera: any = {};

const Pose = (mpPose as any).Pose || (window as any).Pose || class { setOptions() { }; onResults() { }; send() { }; close() { } };
const POSE_CONNECTIONS = (mpPose as any).POSE_CONNECTIONS || (window as any).POSE_CONNECTIONS || [];
const drawConnectors = (mpDrawing as any).drawConnectors || (window as any).drawConnectors || (() => { });
const drawLandmarks = (mpDrawing as any).drawLandmarks || (window as any).drawLandmarks || (() => { });
const Camera = (mpCamera as any).Camera || (window as any).Camera || class { start() { }; stop() { } };


//ESTE CODIGO AL FINAL NO LO HEMOS USADO


interface WorkoutCameraPageProps extends PageProps {
  questId?: number;
  targetReps?: number;
  exerciseType?: string;
}

const WorkoutCameraPage: FC<WorkoutCameraPageProps> = ({ user, questId, targetReps = 10, exerciseType = 'PUSHUPS', onNavigate }) => {
  const { t } = useLanguage();
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
      setError(err.message || 'Error al completar la misiÃ³n.');
    }
  };

  const handleBack = () => {
    if (onNavigate) onNavigate('quests');
  };

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center font-mono overflow-hidden">

      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black to-transparent">
        <button onClick={handleBack} className="text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className=" text-main font-black italic tracking-widest text-xl">{t('camera.ai_detection')}</h1>
          <p className="text-[10px] text-white/50 uppercase tracking-widest">{exerciseType}: {count} / {targetReps}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="relative w-full max-w-2xl aspect-video bg-white/5 border border-white/10 overflow-hidden">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 gap-4">
            <Activity className="w-12 h-12 animate-spin text-main" />
            <span className="text-xs uppercase tracking-widest animate-pulse">{t('camera.syncing')}</span>
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


        <div className="absolute bottom-6 right-6 flex flex-col items-end">
          <div className="text-[60px] font-black text-main leading-none drop-shadow-[0_0_10px_#fbd38d]">
            {count}
          </div>
          <div className="text-xs text-white/70 font-bold uppercase tracking-widest">REP / {targetReps}</div>
        </div>
      </div>


      <div className="p-8 w-full max-w-2xl text-center">
        {completed ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-2 text-green-500 font-black italic text-2xl uppercase">
              <CheckCircle className="w-8 h-8" /> {t('camera.objective_completed')}
            </div>
            <button
              onClick={handleFinishQuest}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest transition-all skew-x-[-10deg] shadow-[5px_5px_0_white]"
            >
              <span className="skew-x-[10deg] inline-block">{t('camera.claim_reward')}</span>
            </button>
          </div>
        ) : (
          <div className="text-white/40 text-[10px] uppercase tracking-[0.2em] italic leading-relaxed">
            {t('camera.position_hint')}
          </div>
        )}
        {error && <div className="mt-4 text-red-500 text-xs font-bold uppercase">{error}</div>}
      </div>


      <div className="absolute inset-0 pointer-events-none border-[10px] border-orange-500/5 mix-blend-overlay animate-pulse" />
      <div className="absolute top-0 left-0 w-full h-1 bg-main/20 animate-scan pointer-events-none shadow-[0_0_15px_#fbd38d]" />
    </div>
  );
};

export default WorkoutCameraPage;





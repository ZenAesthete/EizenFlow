
import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { generateSyncCode, parseSyncCode } from '../utils/qrUtils';
import QRCode from 'react-qr-code';
import jsQR from 'jsqr';
import { X, QrCode, Camera, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface SyncModalProps {
  tasks: Task[];
  onImport: (tasks: Task[]) => void;
  onClose: () => void;
}

type Tab = 'export' | 'import';

export const SyncModal: React.FC<SyncModalProps> = ({ tasks, onImport, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('export');
  const [qrData, setQrData] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  
  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Generate QR on mount
  useEffect(() => {
    const code = generateSyncCode(tasks);
    setQrData(code);
  }, [tasks]);

  // Handle Camera Logic when Import tab is active
  useEffect(() => {
    if (activeTab !== 'import') {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationRef.current);
      return;
    }

    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Important: wait for video to play to get dimensions
          videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
          videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Error accessing camera", err);
        setScanError("Camera access denied or unavailable.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [activeTab]);

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            const importedTasks = parseSyncCode(code.data);
            if (importedTasks) {
              onImport(importedTasks);
              return; // Stop scanning
            } else {
              // Valid QR but not our app data
            }
          }
        }
      }
    }
    animationRef.current = requestAnimationFrame(tick);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                <QrCode className="text-indigo-500" /> Device Sync
            </h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 bg-slate-50 dark:bg-slate-950/50">
            <button 
                onClick={() => setActiveTab('export')}
                className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                    activeTab === 'export' 
                        ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" 
                        : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
                )}
            >
                <QrCode size={16} /> Show QR
            </button>
            <button 
                onClick={() => setActiveTab('import')}
                className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                    activeTab === 'import' 
                        ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" 
                        : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
                )}
            >
                <Camera size={16} /> Scan QR
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[300px]">
            
            {activeTab === 'export' && (
                <div className="flex flex-col items-center gap-6 text-center animate-in zoom-in-95">
                    <div className="bg-white p-4 rounded-xl shadow-lg border-4 border-slate-100 dark:border-slate-800">
                        {qrData ? (
                            <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                                <QRCode
                                    size={256}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={qrData}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        ) : (
                            <div className="w-[200px] h-[200px] bg-slate-100 flex items-center justify-center text-slate-400">
                                Generating...
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Scan this with another device</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-[250px] mx-auto">
                            Use the "Scan QR" tab on your other device to transfer these tasks instantly.
                        </p>
                    </div>
                    {qrData.length > 2500 && (
                        <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                            <AlertTriangle size={12} />
                            Data is large. Scanning might take a moment.
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'import' && (
                <div className="flex flex-col items-center gap-4 w-full animate-in zoom-in-95">
                    <div className="relative w-full aspect-square max-w-[280px] bg-black rounded-2xl overflow-hidden shadow-lg border-4 border-slate-100 dark:border-slate-800">
                        {!scanError ? (
                            <>
                                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
                                <canvas ref={canvasRef} className="hidden" />
                                <div className="absolute inset-0 border-[30px] border-black/30 z-10 flex items-center justify-center">
                                    <div className="w-full h-0.5 bg-red-500/50 absolute top-1/2 animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 p-4 text-center">
                                <Camera size={32} className="opacity-50" />
                                <span className="text-xs">{scanError}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                        Point camera at the QR code generated on your other device.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

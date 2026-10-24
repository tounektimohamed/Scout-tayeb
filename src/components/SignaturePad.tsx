import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  initialValue?: string;
  onSave: (dataUrl: string) => void;
  leaderName: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ initialValue, onSave, leaderName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(initialValue));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#107c41'; // Scout Green
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialValue;
    }
  }, [initialValue]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSave('');
  };

  const useStamp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw digital scout stamp
    ctx.strokeStyle = '#107c41';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.fillStyle = '#107c41';
    ctx.font = 'bold 15px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚜️ إمضاء إلكتروني معتمد ⚜️', canvas.width / 2, 45);
    ctx.font = '14px Cairo, sans-serif';
    ctx.fillText(leaderName, canvas.width / 2, 75);
    ctx.font = '11px Cairo, sans-serif';
    ctx.fillText(new Date().toLocaleDateString('ar-TN'), canvas.width / 2, 100);

    setHasSignature(true);
    onSave(canvas.toDataURL());
  };

  return (
    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
          <span>✍️ إمضاء القائد المشرف</span>
          <span className="text-xs text-emerald-700 font-normal">(رسم بالإصبع/الفأرة أو ختم رقمي)</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={useStamp}
            className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            ختم رقمي فوري
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1"
          >
            <Eraser className="w-3.5 h-3.5" />
            مسح
          </button>
        </div>
      </div>

      <div className="relative bg-white rounded-lg border-2 border-dashed border-emerald-300 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={400}
          height={130}
          className="w-full h-32 touch-none cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-400 text-xs">
            ارسم توقيعك هنا بالإصبع أو القلم الرقمي
          </div>
        )}
      </div>
    </div>
  );
};

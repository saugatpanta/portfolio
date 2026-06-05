import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800',
];

export default function ImageViewer() {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const prev = () => { setIdx(i=>(i-1+SAMPLE_IMAGES.length)%SAMPLE_IMAGES.length); setZoom(1); setRotation(0); };
  const next = () => { setIdx(i=>(i+1)%SAMPLE_IMAGES.length); setZoom(1); setRotation(0); };

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2a2a2a] border-b border-white/10">
        <div className="flex items-center gap-2">
          <button onClick={()=>setZoom(z=>Math.min(z+0.25,4))} className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"><ZoomIn className="h-4 w-4" /></button>
          <span className="text-xs text-white/50 w-12 text-center">{Math.round(zoom*100)}%</span>
          <button onClick={()=>setZoom(z=>Math.max(z-0.25,0.25))} className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"><ZoomOut className="h-4 w-4" /></button>
          <button onClick={()=>setZoom(1)} className="px-2 py-1 text-xs rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors">Reset</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setRotation(r=>r+90)} className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"><RotateCw className="h-4 w-4" /></button>
          <a href={SAMPLE_IMAGES[idx]} download target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"><Download className="h-4 w-4" /></a>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        <button onClick={prev} className="absolute left-3 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"><ChevronLeft className="h-5 w-5" /></button>
        <img src={SAMPLE_IMAGES[idx]} alt={`Image ${idx+1}`} className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{ transform:`scale(${zoom}) rotate(${rotation}deg)` }} />
        <button onClick={next} className="absolute right-3 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"><ChevronRight className="h-5 w-5" /></button>
      </div>

      {/* Filmstrip */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border-t border-white/10 overflow-x-auto" style={{scrollbarWidth:'none'}}>
        {SAMPLE_IMAGES.map((img,i)=>(
          <button key={i} onClick={()=>{setIdx(i);setZoom(1);setRotation(0);}}
            className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 transition-all ${i===idx?'border-blue-400':'border-transparent hover:border-white/30'}`}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div className="px-4 py-1 bg-[#2a2a2a] text-[10px] text-white/30 text-center">{idx+1} / {SAMPLE_IMAGES.length}</div>
    </div>
  );
}

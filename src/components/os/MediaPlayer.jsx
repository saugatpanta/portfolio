import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';

const TRACKS = [
  { title:'Lofi Study Beats', artist:'ChillHop', duration:'3:42' },
  { title:'Coding Session', artist:'Synthwave', duration:'4:15' },
  { title:'Focus Flow', artist:'Ambient', duration:'5:30' },
  { title:'Deep Work', artist:'Binaural', duration:'6:00' },
];

export default function MediaPlayer() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(35);
  const [vol, setVol] = useState(70);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] text-white p-4">
      {/* Album art */}
      <div className="flex-1 flex items-center justify-center mb-4">
        <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl shadow-2xl shadow-blue-500/30">
          🎵
        </div>
      </div>

      {/* Track info */}
      <div className="text-center mb-4">
        <h3 className="font-semibold text-white">{TRACKS[current].title}</h3>
        <p className="text-white/50 text-sm">{TRACKS[current].artist}</p>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <input type="range" min={0} max={100} value={progress} onChange={e=>setProgress(Number(e.target.value))} className="w-full accent-blue-500" />
        <div className="flex justify-between text-xs text-white/30 mt-1"><span>1:18</span><span>{TRACKS[current].duration}</span></div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button className="text-white/40 hover:text-white transition-colors"><Shuffle className="h-4 w-4" /></button>
        <button onClick={()=>setCurrent(c=>(c-1+TRACKS.length)%TRACKS.length)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><SkipBack className="h-5 w-5" /></button>
        <button onClick={()=>setPlaying(v=>!v)} className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-blue-500/30">
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>
        <button onClick={()=>setCurrent(c=>(c+1)%TRACKS.length)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><SkipForward className="h-5 w-5" /></button>
        <button className="text-white/40 hover:text-white transition-colors"><Repeat className="h-4 w-4" /></button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-white/40 flex-shrink-0" />
        <input type="range" min={0} max={100} value={vol} onChange={e=>setVol(Number(e.target.value))} className="flex-1 accent-blue-500" />
      </div>

      {/* Playlist */}
      <div className="mt-4 space-y-1">
        {TRACKS.map((t,i)=>(
          <button key={i} onClick={()=>setCurrent(i)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${i===current?'bg-blue-600/30 text-blue-300':'text-white/50 hover:bg-white/5 hover:text-white'}`}>
            <span>{t.title}</span><span>{t.duration}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

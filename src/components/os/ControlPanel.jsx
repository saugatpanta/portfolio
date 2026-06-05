import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Monitor, Volume2, Wifi, Shield, Keyboard, Palette } from 'lucide-react';
import useOSStore from '@/store/useOSStore';
import { useQuery } from '@tanstack/react-query';
import { firebaseClient } from '@/api/firebaseClient';

const WALLPAPERS = [
  { id:'win7-default', label:'Windows 7',   value:'radial-gradient(ellipse 120% 80% at 50% 100%, rgba(74,183,255,0.5) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 30% 80%, rgba(0,120,200,0.4) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 75% 30%, rgba(120,200,255,0.2) 0%, transparent 50%), linear-gradient(180deg, #0a3d6b 0%, #1a6fb5 30%, #4aa3df 55%, #1a6fb5 80%, #0a2e52 100%)' },
  { id:'aero-blue',    label:'Aero Blue',    value:'radial-gradient(ellipse 90% 65% at 25% 85%,rgba(0,126,214,0.72),transparent 56%),radial-gradient(ellipse 70% 50% at 78% 18%,rgba(88,196,255,0.4),transparent 62%),linear-gradient(145deg,#082547 0%,#0b5c94 44%,#102d56 100%)' },
  { id:'aurora',       label:'Aurora',       value:'radial-gradient(ellipse at 30% 20%,rgba(93,220,255,0.55),transparent 38%),radial-gradient(ellipse at 75% 70%,rgba(100,255,181,0.36),transparent 42%),linear-gradient(135deg,#07172d,#174c68 48%,#0a1222)' },
  { id:'sunset',       label:'Sunset',       value:'radial-gradient(ellipse at 20% 78%,rgba(255,198,87,0.55),transparent 38%),radial-gradient(ellipse at 76% 25%,rgba(255,89,122,0.38),transparent 42%),linear-gradient(145deg,#321147,#8b2e62 48%,#102140)' },
  { id:'emerald',      label:'Emerald',      value:'radial-gradient(ellipse at 28% 82%,rgba(110,255,189,0.5),transparent 40%),radial-gradient(ellipse at 80% 22%,rgba(93,208,255,0.33),transparent 44%),linear-gradient(145deg,#062a2f,#0f664d 45%,#081e2a)' },
  { id:'midnight',     label:'Midnight',     value:'radial-gradient(ellipse at 70% 20%,rgba(94,137,255,0.38),transparent 40%),radial-gradient(ellipse at 20% 90%,rgba(50,199,255,0.22),transparent 38%),linear-gradient(145deg,#020617,#111827 55%,#050816)' },
  { id:'classic',      label:'Classic Blue', value:'radial-gradient(ellipse at 50% 100%,rgba(84,178,255,0.42),transparent 48%),linear-gradient(180deg,#183a5f,#071b36 56%,#03101f)' },
  { id:'rose',         label:'Rose',         value:'radial-gradient(ellipse at 60% 20%,rgba(255,100,150,0.4),transparent 40%),radial-gradient(ellipse at 20% 80%,rgba(200,80,255,0.3),transparent 40%),linear-gradient(145deg,#1a0520,#4a1040 50%,#0d0118)' },
];

const ACCENT_COLORS = ['#4a90d9','#e74c3c','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e91e63','#ff5722'];

const TILES = [
  { id:'personalization', label:'Personalization', icon:Palette, color:'#3b82f6' },
  { id:'display',         label:'Display',         icon:Monitor,  color:'#8b5cf6' },
  { id:'sound',           label:'Sound',           icon:Volume2,  color:'#10b981' },
  { id:'network',         label:'Network',         icon:Wifi,     color:'#f59e0b' },
  { id:'security',        label:'Security',        icon:Shield,   color:'#ef4444' },
  { id:'keyboard',        label:'Keyboard',        icon:Keyboard, color:'#6366f1' },
];

export default function ControlPanel() {
  const { wallpaper, setWallpaper, theme, updateTheme, volume, setVolume, isMuted, toggleMute } = useOSStore();
  const [active, setActive] = useState('personalization');

  // Load uploaded wallpapers from Firebase
  const { data: settings } = useQuery({
    queryKey: ['site-settings-wallpapers'],
    queryFn: () => firebaseClient.entities.SiteSettings.get(),
    staleTime: 5 * 60 * 1000,
  });
  const uploadedWallpapers = (settings?.wallpapers || []).map((url, i) => ({
    id: `uploaded-${i}`, label: `Photo ${i + 1}`, value: url, isImage: true,
  }));

  return (
    <div className="h-full flex bg-[#f1f5f9] text-gray-900">
      {/* Sidebar */}
      <div className="w-[clamp(160px,22%,240px)] bg-white border-r border-gray-200 p-3 flex flex-col gap-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Control Panel</div>
        {TILES.map(t=>(
          <button key={t.id} onClick={()=>setActive(t.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${active===t.id?'bg-blue-600 text-white':'text-gray-700 hover:bg-gray-100'}`}>
            <t.icon className="h-4 w-4 flex-shrink-0" style={{color:active===t.id?'white':t.color}} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {active==='personalization' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Desktop Background</h3>
              <div className="grid grid-cols-4 gap-2">
                {[...uploadedWallpapers, ...WALLPAPERS].map(w=>(
                  <button key={w.id} onClick={()=>setWallpaper(w.value)}
                    className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${wallpaper===w.value?'border-blue-500 shadow-md':'border-transparent hover:border-gray-300'}`}
                    style={w.isImage ? {backgroundImage:`url(${w.value})`,backgroundSize:'cover',backgroundPosition:'center'} : {background:w.value}} title={w.label}>
                    {wallpaper===w.value && <div className="absolute inset-0 flex items-center justify-center"><Check className="h-5 w-5 text-white drop-shadow" /></div>}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">{w.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Accent Color</h3>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS.map(c=>(
                  <button key={c} onClick={()=>updateTheme({accentColor:c})}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${theme.accentColor===c?'border-gray-800 scale-110':'border-transparent hover:scale-105'}`}
                    style={{background:c}} />
                ))}
                <input type="color" value={theme.accentColor} onChange={e=>updateTheme({accentColor:e.target.value})} className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300" title="Custom color" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Glass Effect</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Opacity</span><span>{theme.glassOpacity}%</span></div>
                  <input type="range" min={0} max={30} value={theme.glassOpacity} onChange={e=>updateTheme({glassOpacity:Number(e.target.value)})} className="w-full accent-blue-600" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Blur Strength</span><span>{theme.blurStrength}px</span></div>
                  <input type="range" min={8} max={60} value={theme.blurStrength} onChange={e=>updateTheme({blurStrength:Number(e.target.value)})} className="w-full accent-blue-600" />
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
              <div className="h-24 rounded-xl overflow-hidden relative" style={{background:wallpaper}}>
                <div className="absolute inset-2 rounded-lg border border-white/30 flex items-center justify-center"
                  style={{background:`rgba(255,255,255,${theme.glassOpacity/100})`,backdropFilter:`blur(${theme.blurStrength}px)`}}>
                  <span className="text-white text-xs font-medium drop-shadow">Aero Glass Preview</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {active==='sound' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Sound Settings</h3>
            <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Master Volume</span><span className="text-blue-600">{isMuted?'Muted':`${volume}%`}</span></div>
                <input type="range" min={0} max={100} value={isMuted?0:volume} onChange={e=>setVolume(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
              <button onClick={toggleMute} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isMuted?'bg-red-100 text-red-700 hover:bg-red-200':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {isMuted?'Unmute':'Mute'}
              </button>
            </div>
          </div>
        )}

        {active==='display' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Display Settings</h3>
            <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3 text-sm">
              {[['Resolution','1920 × 1080'],['Refresh Rate','60 Hz'],['Color Depth','32-bit'],['DPI','96 DPI (100%)'],['Orientation','Landscape']].map(([k,v])=>(
                <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
          </div>
        )}

        {(active==='network'||active==='security'||active==='keyboard') && (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            <div className="text-center"><div className="text-4xl mb-2">🔧</div>This panel is for display purposes only.</div>
          </div>
        )}
      </div>
    </div>
  );
}

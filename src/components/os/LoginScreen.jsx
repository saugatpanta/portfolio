import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Globe, Accessibility } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { firebaseClient } from '@/api/firebaseClient';
import useOSStore from '@/store/useOSStore';
import './aero-styles.css';

const BOKEH = [
  { w:320,h:320,x:'10%',y:'15%',color:'rgba(74,144,217,0.18)',dur:8 },
  { w:240,h:240,x:'70%',y:'5%',color:'rgba(88,196,255,0.14)',dur:11 },
  { w:280,h:280,x:'80%',y:'60%',color:'rgba(100,200,180,0.12)',dur:9 },
  { w:200,h:200,x:'5%',y:'70%',color:'rgba(120,100,220,0.15)',dur:13 },
  { w:360,h:360,x:'40%',y:'75%',color:'rgba(60,130,200,0.1)',dur:10 },
  { w:180,h:180,x:'55%',y:'30%',color:'rgba(200,150,80,0.1)',dur:7 },
];

export default function LoginScreen() {
  const setBootState = useOSStore((s) => s.setBootState);
  const pushNotification = useOSStore((s) => s.pushNotification);
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const { data: profileData } = useQuery({
    queryKey: ['profile-image'],
    queryFn: () => firebaseClient.entities.ProfileImage.get(),
    staleTime: 5 * 60 * 1000,
  });

  const avatarUrl = profileData?.profileImage || '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) { setShake(true); setTimeout(() => setShake(false), 600); return; }
    setIsExiting(true);
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit(e); };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
      style={{ background:'radial-gradient(ellipse at 50% 18%,rgba(119,216,255,0.34),transparent 44%),linear-gradient(135deg,#05254a 0%,#1370a8 42%,#36a6d6 58%,#09355f 100%)' }}
      animate={isExiting ? { scale:1.08, opacity:0, filter:'blur(8px)' } : { scale:1, opacity:1, filter:'blur(0px)' }}
      transition={{ duration:0.6, ease:'easeInOut' }}
      onAnimationComplete={() => { if (isExiting) setBootState('desktop'); }}
    >
      {/* Bokeh blobs */}
      {BOKEH.map((b, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width:b.w, height:b.h, left:b.x, top:b.y, background:b.color, filter:'blur(40px)' }}
          animate={{ x:[0,30,-20,0], y:[0,-25,15,0], scale:[1,1.1,0.95,1] }}
          transition={{ duration:b.dur, repeat:Infinity, ease:'easeInOut' }} />
      ))}

      <div className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.16),transparent_65%)]" />

      <motion.div className="relative flex flex-col items-center" initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}>
        {/* Avatar with pulsing ring */}
        <div className="relative mb-5">
          <motion.div className="absolute inset-0 rounded-full" style={{ background:'rgba(74,144,217,0.4)', filter:'blur(12px)' }}
            animate={{ scale:[1,1.3,1], opacity:[0.5,0.8,0.5] }} transition={{ duration:2.5, repeat:Infinity }} />
          <div className="relative h-32 w-32 rounded-full border-2 border-white/40 bg-white/15 p-1 shadow-[0_16px_50px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-xl overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-800 text-4xl font-semibold text-white">SP</div>
            )}
          </div>
        </div>

        <h1 className="mb-1 text-xl font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Saugat Panta</h1>
        <p className="mb-6 text-sm text-white/60">Full Stack Developer</p>

        <motion.form onSubmit={handleSubmit} animate={shake ? { x:[-8,8,-6,6,-4,4,0] } : { x:0 }} transition={{ duration:0.5 }}>
          <div className="flex items-center gap-2">
            <label className="relative block">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKey}
                placeholder="Password" className="h-10 w-64 rounded border border-white/25 bg-black/35 pl-9 pr-3 text-sm text-white outline-none shadow-[inset_0_1px_4px_rgba(0,0,0,0.45)] placeholder:text-white/40 focus:border-sky-200/70 focus:ring-2 focus:ring-sky-300/25 transition-all" />
            </label>
            <motion.button type="submit" whileHover={{ scale:1.08, rotate:90 }} whileTap={{ scale:0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded border border-white/30 bg-gradient-to-b from-sky-300 to-blue-700 text-white shadow-[0_0_18px_rgba(71,178,255,0.5),inset_0_1px_0_rgba(255,255,255,0.45)]">
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.form>

        <p className="mt-4 text-xs text-white/35">Enter any password to continue</p>
      </motion.div>

      {/* Bottom bar */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-8">
        <div className="flex items-center gap-3 text-white/40">
          <button className="flex items-center gap-1 text-xs hover:text-white/70 transition-colors"><Globe className="h-3 w-3" /> English</button>
          <button className="flex items-center gap-1 text-xs hover:text-white/70 transition-colors"><Accessibility className="h-3 w-3" /> Ease of Access</button>
        </div>
        <p className="text-xs text-white/30">Windows 7 Portfolio Edition</p>
      </div>
    </motion.div>
  );
}

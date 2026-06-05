import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useOSStore from '@/store/useOSStore';
import './aero-styles.css';

export default function AltTabSwitcher() {
  const { altTabOpen, altTabIndex, windows, setAltTabIndex, focusWindow, closeAltTab } = useOSStore();
  const open = windows.filter(w=>w.isOpen);

  useEffect(() => {
    if (!altTabOpen) return;
    const h = (e) => {
      if (e.key==='Tab') { e.preventDefault(); setAltTabIndex(e.shiftKey?(altTabIndex-1+open.length)%open.length:(altTabIndex+1)%open.length); }
      if (e.key==='Enter') { if(open[altTabIndex]){focusWindow(open[altTabIndex].id);} closeAltTab(); }
      if (e.key==='Escape') closeAltTab();
    };
    const u = (e) => { if(e.key==='Alt'){if(open[altTabIndex])focusWindow(open[altTabIndex].id);closeAltTab();} };
    window.addEventListener('keydown',h);
    window.addEventListener('keyup',u);
    return ()=>{window.removeEventListener('keydown',h);window.removeEventListener('keyup',u);};
  },[altTabOpen,altTabIndex,open,setAltTabIndex,focusWindow,closeAltTab]);

  return (
    <AnimatePresence>
      {altTabOpen && open.length>0 && (
        <motion.div className="aero-alttab" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.12}}>
          <motion.div className="aero-alttab-box" initial={{scale:0.92}} animate={{scale:1}} exit={{scale:0.92}}>
            {open.map((win,i)=>{
              const Icon=win.icon;
              return (
                <div key={win.id} className={`aero-alttab-item ${i===altTabIndex?'sel':''}`}
                  onClick={()=>{focusWindow(win.id);closeAltTab();}}
                  onMouseEnter={()=>setAltTabIndex(i)}>
                  <div style={{width:48,height:48,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.08)'}}>
                    {Icon && <Icon style={{width:28,height:28,color:win.iconColor}} />}
                  </div>
                  <span style={{fontSize:10,color:'rgba(255,255,255,0.75)',textAlign:'center',maxWidth:72,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{win.title}</span>
                </div>
              );
            })}
          </motion.div>
          {open[altTabIndex] && (
            <p style={{position:'absolute',bottom:32,color:'rgba(255,255,255,0.55)',fontSize:12}}>{open[altTabIndex].title}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

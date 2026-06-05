import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import useOSStore from '@/store/useOSStore';
import './aero-styles.css';

export default function Notification() {
  const { notifications, dismissNotification } = useOSStore();
  return (
    <div style={{position:'fixed',bottom:52,right:12,zIndex:150000,display:'flex',flexDirection:'column',gap:10,pointerEvents:'none'}}>
      <AnimatePresence>
        {notifications.slice(-5).map(n=>(
          <motion.div key={n.id} className="aero-notif" style={{pointerEvents:'auto'}}
            initial={{x:320,opacity:0}} animate={{x:0,opacity:1}} exit={{x:320,opacity:0}}
            transition={{type:'spring',stiffness:380,damping:32}}
            onClick={()=>dismissNotification(n.id)}>
            <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
              {n.icon && <span style={{fontSize:22,flexShrink:0}}>{n.icon}</span>}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.95)',marginBottom:2}}>{n.title}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',lineHeight:1.4,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{n.body}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();dismissNotification(n.id);}}
                style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.4)',padding:2,flexShrink:0}}>
                <X style={{width:12,height:12}} />
              </button>
            </div>
            <div className="aero-notif-bar" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

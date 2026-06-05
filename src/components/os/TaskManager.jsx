import { useState, useEffect } from 'react';
import useOSStore from '@/store/useOSStore';

const SYSTEM_PROCS = [
  { name:'System',      pid:4,    cpu:0.1, mem:2.1 },
  { name:'explorer.exe',pid:1024, cpu:0.4, mem:18.2 },
  { name:'aeroWM.exe',  pid:2048, cpu:1.2, mem:42.1 },
  { name:'dwm.exe',     pid:512,  cpu:0.8, mem:24.6 },
  { name:'svchost.exe', pid:768,  cpu:0.2, mem:8.4 },
  { name:'firebase.exe',pid:3072, cpu:0.6, mem:31.2 },
];

function useAnimatedValue(base, variance=5, interval=1500) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const t = setInterval(() => setVal(base + (Math.random()-0.5)*variance), interval);
    return () => clearInterval(t);
  }, [base, variance, interval]);
  return Math.max(0, Math.min(100, val));
}

export default function TaskManager() {
  const { windows, closeApp, focusWindow, sessionStats } = useOSStore();
  const [tab, setTab] = useState('applications');
  const cpu = useAnimatedValue(27, 12, 1200);
  const ram = useAnimatedValue(58, 8, 1800);
  const net = useAnimatedValue(12, 6, 1000);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const start = sessionStats.startTime;
    const t = setInterval(() => setUptime(Math.floor((Date.now()-start)/1000)), 1000);
    return () => clearInterval(t);
  }, [sessionStats.startTime]);

  const fmtUptime = (s) => {
    const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60;
    return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const TABS = ['applications','processes','performance','networking'];

  return (
    <div className="h-full flex flex-col bg-[#f0f0f0] text-gray-900 text-sm">
      {/* Tab bar */}
      <div className="flex border-b border-gray-300 bg-white">
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-xs capitalize border-r border-gray-200 transition-colors ${tab===t?'bg-blue-600 text-white':'hover:bg-gray-100 text-gray-700'}`}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-3">
        {/* Applications */}
        {tab==='applications' && (
          <div>
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-200"><th className="text-left p-2">Task</th><th className="text-left p-2">Status</th><th className="text-right p-2">Actions</th></tr></thead>
              <tbody>
                {windows.map(win=>{
                  const Icon=win.icon;
                  return (
                    <tr key={win.id} className="border-b border-gray-100 hover:bg-blue-50">
                      <td className="p-2 flex items-center gap-2">{Icon&&<Icon size={14} style={{color:win.iconColor}}/>}{win.title}</td>
                      <td className="p-2"><span className={`px-2 py-0.5 rounded text-[10px] ${win.isMinimized?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{win.isMinimized?'Minimized':'Running'}</span></td>
                      <td className="p-2 text-right">
                        <button onClick={()=>focusWindow(win.id)} className="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px] mr-1 hover:bg-blue-600">Switch</button>
                        <button onClick={()=>closeApp(win.id)} className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px] hover:bg-red-600">End</button>
                      </td>
                    </tr>
                  );
                })}
                {windows.length===0&&<tr><td colSpan={3} className="p-4 text-center text-gray-400">No applications running</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Processes */}
        {tab==='processes' && (
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-200"><th className="text-left p-2">Image Name</th><th className="text-right p-2">PID</th><th className="text-right p-2">CPU</th><th className="text-right p-2">Memory</th></tr></thead>
            <tbody>
              {[...SYSTEM_PROCS, ...windows.map((w,i)=>({name:`${w.component?.toLowerCase()||'app'}.exe`,pid:4096+i*256,cpu:parseFloat((Math.random()*2).toFixed(1)),mem:parseFloat((Math.random()*30+10).toFixed(1))}))].map((p,i)=>(
                <tr key={i} className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 text-right text-gray-500">{p.pid}</td>
                  <td className="p-2 text-right">{p.cpu.toFixed(1)}%</td>
                  <td className="p-2 text-right">{p.mem.toFixed(1)} MB</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Performance */}
        {tab==='performance' && (
          <div className="space-y-4">
            {[{label:'CPU Usage',val:cpu,color:'#3b82f6'},{label:'Memory Usage',val:ram,color:'#10b981'},{label:'Network',val:net,color:'#8b5cf6'}].map(m=>(
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1"><span className="font-medium">{m.label}</span><span style={{color:m.color}}>{m.val.toFixed(0)}%</span></div>
                <div className="h-3 bg-gray-200 rounded overflow-hidden">
                  <div className="h-full rounded transition-all duration-500" style={{width:`${m.val}%`,background:m.color}} />
                </div>
              </div>
            ))}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {[['CPU','Intel Core i7-12700K'],['RAM','16GB DDR4 3200MHz'],['GPU','RTX 3070 8GB'],['OS','SaugatOS 7.0'],['Uptime',fmtUptime(uptime)],['Windows',windows.length]].map(([k,v])=>(
                <div key={k} className="bg-white rounded p-2 border border-gray-200"><div className="text-gray-400">{k}</div><div className="font-medium text-gray-700">{v}</div></div>
              ))}
            </div>
          </div>
        )}

        {/* Networking */}
        {tab==='networking' && (
          <div className="space-y-3">
            <div className="bg-white rounded p-3 border border-gray-200 text-xs">
              <div className="font-medium mb-2">WebOS Network Adapter</div>
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                {[['IP Address','192.168.1.42'],['Subnet','255.255.255.0'],['Gateway','192.168.1.1'],['DNS','8.8.8.8'],['Speed','1 Gbps'],['Status','Connected']].map(([k,v])=>(
                  <div key={k}><span className="text-gray-400">{k}: </span>{v}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium mb-1">Network Activity</div>
              <div className="h-2 bg-gray-200 rounded overflow-hidden">
                <div className="h-full bg-purple-500 rounded transition-all duration-500" style={{width:`${net}%`}} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>↓ {(net*0.8).toFixed(1)} Mbps</span><span>↑ {(net*0.3).toFixed(1)} Mbps</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 bg-white px-3 py-1.5 flex justify-between text-[10px] text-gray-500">
        <span>Processes: {SYSTEM_PROCS.length + windows.length}</span>
        <span>CPU: {cpu.toFixed(0)}%</span>
        <span>Physical Memory: {ram.toFixed(0)}%</span>
      </div>
    </div>
  );
}

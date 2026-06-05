import { useState } from 'react';
import { Folder, FileText, Image, ChevronRight, ArrowLeft, ArrowRight, Home, Search, Grid, List, HardDrive, Trash2, Download, Monitor } from 'lucide-react';
import useOSStore from '@/store/useOSStore';

const FS = {
  '/': { type:'dir', children:['Desktop','Documents','Projects','Downloads','Pictures','Recycle Bin'] },
  '/Desktop': { type:'dir', children:['My Computer','Terminal','Browser','Calculator'] },
  '/Documents': { type:'dir', children:['resume.txt','about.txt','notes.md','cover-letter.txt'] },
  '/Projects': { type:'dir', children:['portfolio-os','ecommerce-platform','ai-chat-app'] },
  '/Projects/portfolio-os': { type:'dir', children:['src','public','package.json','README.md'] },
  '/Downloads': { type:'dir', children:[] },
  '/Pictures': { type:'dir', children:['wallpaper1.jpg','wallpaper2.jpg','screenshot.png'] },
  '/Recycle Bin': { type:'dir', children:[] },
  '/Documents/resume.txt': { type:'file', ext:'txt', content:'Saugat Panta — Full Stack Developer\nKathmandu, Nepal' },
  '/Documents/about.txt': { type:'file', ext:'txt', content:'Passionate developer from Nepal.' },
  '/Documents/notes.md': { type:'file', ext:'md', content:'# Notes\n\n- Learn Rust\n- Build more projects' },
};

const getIcon = (name, type) => {
  if (type==='dir') return { icon:Folder, color:'#fbbf24' };
  const ext = name.split('.').pop()?.toLowerCase();
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return { icon:Image, color:'#f472b6' };
  return { icon:FileText, color:'#94a3b8' };
};

export default function FileExplorer() {
  const { openApp, pushNotification } = useOSStore();
  const [path, setPath] = useState('/');
  const [history, setHistory] = useState(['/']);
  const [histIdx, setHistIdx] = useState(0);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const navigate = (newPath) => {
    const newHist = [...history.slice(0, histIdx+1), newPath];
    setHistory(newHist); setHistIdx(newHist.length-1);
    setPath(newPath); setSelected(null); setSearch('');
  };

  const goBack = () => { if (histIdx>0) { setHistIdx(h=>h-1); setPath(history[histIdx-1]); } };
  const goForward = () => { if (histIdx<history.length-1) { setHistIdx(h=>h+1); setPath(history[histIdx+1]); } };

  const current = FS[path] || { type:'dir', children:[] };
  const items = (current.children||[]).filter(c=>!search||c.toLowerCase().includes(search.toLowerCase()));

  const handleDoubleClick = (name) => {
    const childPath = path==='/'?`/${name}`:`${path}/${name}`;
    const child = FS[childPath];
    if (!child || child.type==='dir') { navigate(childPath); return; }
    const ext = name.split('.').pop()?.toLowerCase();
    if (['txt','md'].includes(ext)) openApp({ id:`notepad-${name}`, title:name, component:'Notepad', size:{w:640,h:480} });
    else if (['jpg','jpeg','png'].includes(ext)) openApp({ id:`img-${name}`, title:name, component:'ImageViewer', size:{w:800,h:600} });
    else pushNotification({ title:'File Explorer', body:`Cannot open ${name}`, icon:'📁' });
  };

  const breadcrumbs = path.split('/').filter(Boolean);

  const SIDEBAR = [
    { label:'Desktop',     path:'/Desktop',     icon:Monitor,   color:'#7cc9ff' },
    { label:'Documents',   path:'/Documents',   icon:FileText,  color:'#94a3b8' },
    { label:'Projects',    path:'/Projects',    icon:Folder,    color:'#f8b84e' },
    { label:'Downloads',   path:'/Downloads',   icon:Download,  color:'#60a5fa' },
    { label:'Pictures',    path:'/Pictures',    icon:Image,     color:'#f472b6' },
    { label:'Recycle Bin', path:'/Recycle Bin', icon:Trash2,    color:'#9ca3af' },
  ];

  return (
    <div className="h-full flex flex-col bg-white text-gray-900 text-sm">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <button onClick={goBack} disabled={histIdx===0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"><ArrowLeft className="h-4 w-4" /></button>
        <button onClick={goForward} disabled={histIdx>=history.length-1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"><ArrowRight className="h-4 w-4" /></button>
        <button onClick={()=>navigate('/')} className="p-1 rounded hover:bg-gray-200 transition-colors"><Home className="h-4 w-4" /></button>

        {/* Breadcrumb */}
        <div className="flex-1 flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs">
          <HardDrive className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <span className="text-gray-400 cursor-pointer hover:text-blue-600" onClick={()=>navigate('/')}>Computer</span>
          {breadcrumbs.map((b,i)=>(
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className="cursor-pointer hover:text-blue-600 text-gray-600" onClick={()=>navigate('/'+breadcrumbs.slice(0,i+1).join('/'))}>{b}</span>
            </span>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded w-36 focus:outline-none focus:border-blue-400" />
        </div>

        {/* View toggle */}
        <button onClick={()=>setView('grid')} className={`p-1 rounded transition-colors ${view==='grid'?'bg-blue-100 text-blue-600':'hover:bg-gray-200'}`}><Grid className="h-4 w-4" /></button>
        <button onClick={()=>setView('list')} className={`p-1 rounded transition-colors ${view==='list'?'bg-blue-100 text-blue-600':'hover:bg-gray-200'}`}><List className="h-4 w-4" /></button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[clamp(140px,20%,220px)] border-r border-gray-200 bg-gray-50 p-2 overflow-y-auto flex-shrink-0">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Favorites</div>
          {SIDEBAR.map(s=>(
            <button key={s.path} onClick={()=>navigate(s.path)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors ${path===s.path?'bg-blue-100 text-blue-700':'text-gray-600 hover:bg-gray-200'}`}>
              <s.icon className="h-3.5 w-3.5 flex-shrink-0" style={{color:s.color}} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 overflow-auto p-3">
          {items.length===0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Folder className="h-10 w-10 mb-2 opacity-30" />
              <span className="text-xs">{search?'No results found':'This folder is empty'}</span>
            </div>
          )}

          {view==='grid' ? (
            <div className="grid grid-cols-5 gap-2">
              {items.map(name=>{
                const childPath=path==='/'?`/${name}`:`${path}/${name}`;
                const child=FS[childPath];
                const {icon:Icon,color}=getIcon(name,child?.type||'file');
                return (
                  <button key={name} onClick={()=>setSelected(name)} onDoubleClick={()=>handleDoubleClick(name)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all ${selected===name?'bg-blue-100 border border-blue-300':'hover:bg-gray-100'}`}>
                    <Icon className="h-10 w-10" style={{color}} />
                    <span className="text-[10px] text-gray-700 break-all line-clamp-2">{name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gray-200 text-gray-400"><th className="text-left py-1 px-2">Name</th><th className="text-left py-1 px-2">Type</th><th className="text-left py-1 px-2">Size</th></tr></thead>
              <tbody>
                {items.map(name=>{
                  const childPath=path==='/'?`/${name}`:`${path}/${name}`;
                  const child=FS[childPath];
                  const {icon:Icon,color}=getIcon(name,child?.type||'file');
                  return (
                    <tr key={name} onClick={()=>setSelected(name)} onDoubleClick={()=>handleDoubleClick(name)}
                      className={`border-b border-gray-50 cursor-pointer ${selected===name?'bg-blue-50':'hover:bg-gray-50'}`}>
                      <td className="py-1.5 px-2 flex items-center gap-2"><Icon className="h-4 w-4 flex-shrink-0" style={{color}} />{name}</td>
                      <td className="py-1.5 px-2 text-gray-400">{child?.type==='dir'?'Folder':name.split('.').pop()?.toUpperCase()||'File'}</td>
                      <td className="py-1.5 px-2 text-gray-400">{child?.type==='dir'?'—':'1 KB'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="border-t border-gray-200 px-3 py-1 text-[10px] text-gray-400 flex justify-between">
        <span>{items.length} item{items.length!==1?'s':''}</span>
        {selected && <span>{selected} selected</span>}
      </div>
    </div>
  );
}

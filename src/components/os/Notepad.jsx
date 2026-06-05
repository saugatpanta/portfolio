import { useState, useRef, useEffect } from 'react';
import useOSStore from '@/store/useOSStore';

export default function Notepad() {
  const [content, setContent] = useState('Welcome to Notepad\n\nStart typing...');
  const [filename, setFilename] = useState('Untitled.txt');
  const [saved, setSaved] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [fontSize, setFontSize] = useState(13);
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState('');
  const [cursor, setCursor] = useState({ line:1, col:1 });
  const textRef = useRef(null);
  const { pushNotification } = useOSStore();

  const updateCursor = () => {
    const el = textRef.current;
    if (!el) return;
    const text = el.value.substring(0, el.selectionStart);
    const lines = text.split('\n');
    setCursor({ line:lines.length, col:lines[lines.length-1].length+1 });
  };

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const chars = content.length;

  const handleSave = () => { setSaved(true); pushNotification({ title:'Notepad', body:`${filename} saved.`, icon:'📝' }); };

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key==='s') { e.preventDefault(); handleSave(); }
      if (e.ctrlKey && e.key==='f') { e.preventDefault(); setShowFind(v=>!v); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="h-full flex flex-col bg-white text-gray-900 text-sm">
      {/* Menu bar */}
      <div className="flex items-center gap-0 border-b border-gray-200 bg-gray-50 px-1">
        {[
          { label:'File', items:[{l:'New',a:()=>{setContent('');setFilename('Untitled.txt');setSaved(true);}},{l:'Save',a:handleSave},{l:'Save As',a:()=>{const n=prompt('Filename:',filename);if(n){setFilename(n);handleSave();}}},{l:'Print',a:()=>window.print()}] },
          { label:'Edit', items:[{l:'Find',a:()=>setShowFind(v=>!v)},{l:'Select All',a:()=>textRef.current?.select()},{l:'Word Wrap',a:()=>setWordWrap(v=>!v)}] },
          { label:'Format', items:[{l:'Font Size +',a:()=>setFontSize(f=>Math.min(f+2,24))},{l:'Font Size -',a:()=>setFontSize(f=>Math.max(f-2,10))}] },
          { label:'Help', items:[{l:'About Notepad',a:()=>pushNotification({title:'Notepad',body:'SaugatOS Notepad v1.0',icon:'📝'})}] },
        ].map(menu=>(
          <div key={menu.label} className="relative group">
            <button className="px-3 py-1 text-xs hover:bg-blue-600 hover:text-white transition-colors rounded-sm">{menu.label}</button>
            <div className="absolute top-full left-0 hidden group-hover:block z-50 bg-white border border-gray-200 shadow-lg rounded min-w-32 py-1">
              {menu.items.map(item=>(
                <button key={item.l} onClick={item.a} className="block w-full text-left px-4 py-1.5 text-xs hover:bg-blue-600 hover:text-white transition-colors">{item.l}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Find bar */}
      {showFind && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200 bg-yellow-50">
          <span className="text-xs text-gray-500">Find:</span>
          <input value={findText} onChange={e=>setFindText(e.target.value)} className="flex-1 text-xs border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:border-blue-400" placeholder="Search text..." />
          <button onClick={()=>setShowFind(false)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Text area */}
      <textarea ref={textRef} value={content}
        onChange={e=>{setContent(e.target.value);setSaved(false);}}
        onKeyUp={updateCursor} onClick={updateCursor}
        className="flex-1 resize-none outline-none p-3 font-mono text-gray-800 leading-relaxed"
        style={{ fontSize:`${fontSize}px`, whiteSpace:wordWrap?'pre-wrap':'pre', overflowX:wordWrap?'hidden':'auto' }}
        spellCheck={false} />

      {/* Status bar */}
      <div className="border-t border-gray-200 px-3 py-1 flex justify-between text-[10px] text-gray-400 bg-gray-50">
        <span>Ln {cursor.line}, Col {cursor.col}</span>
        <span>{words} words · {chars} chars</span>
        <span>{saved?'Saved':'Unsaved'} · {wordWrap?'Wrap':'No Wrap'} · {fontSize}px</span>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Home, Lock, Star, Plus, X, Search } from 'lucide-react';

const BOOKMARKS = [
  { label:'YouTube',    url:'https://www.youtube.com',                    emoji:'▶️' },
  { label:'GitHub',     url:'https://github.com/saugatpanta',             emoji:'🐙' },
  { label:'LinkedIn',   url:'https://linkedin.com/in/saugatpanta',        emoji:'💼' },
  { label:'Google',     url:'https://www.google.com',                     emoji:'🔍' },
  { label:'Twitter/X',  url:'https://twitter.com/saugatpanta',            emoji:'🐦' },
  { label:'React Docs', url:'https://react.dev',                          emoji:'⚛️' },
  { label:'MDN',        url:'https://developer.mozilla.org',              emoji:'📚' },
  { label:'Firebase',   url:'https://console.firebase.google.com',        emoji:'🔥' },
];

const HOMEPAGE = `data:text/html;charset=utf-8,<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,%23082547,%230b5c94);color:white;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:20px}.logo{font-size:48px}.title{font-size:28px;font-weight:300;opacity:.9}.sub{font-size:14px;opacity:.55}.links{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}.link{padding:8px 16px;border-radius:20px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:white;text-decoration:none;font-size:13px;transition:background .2s}.link:hover{background:rgba(255,255,255,.22)}</style></head><body><div class="logo">🌐</div><div class="title">SaugatOS Browser</div><div class="sub">Enter a URL or search above</div><div class="links"><a class="link" href="https://youtube.com" target="_top">▶️ YouTube</a><a class="link" href="https://github.com/saugatpanta" target="_top">🐙 GitHub</a><a class="link" href="https://google.com" target="_top">🔍 Google</a><a class="link" href="https://react.dev" target="_top">⚛️ React</a></div></body></html>`;

/* Sites known to block iframes via X-Frame-Options / CSP */
const BLOCKED_DOMAINS = ['github.com','linkedin.com','twitter.com','x.com','facebook.com','instagram.com','netflix.com','stackoverflow.com','reddit.com','discord.com','firebase.google.com','console.firebase.google.com','accounts.google.com','mail.google.com'];

function isBlockedSite(url) {
  if (!url || url.startsWith('data:')) return false;
  try {
    const host = new URL(url).hostname.replace('www.','');
    return BLOCKED_DOMAINS.some(d => host === d || host.endsWith('.' + d));
  } catch { return false; }
}

function getDomain(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

export default function BrowserApp() {
  const [tabs, setTabs] = useState([{ id:1, url:HOMEPAGE, title:'New Tab', loading:false }]);
  const [activeTab, setActiveTab] = useState(1);
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState(false);
  const iframeRef = useRef(null);

  const currentTab = tabs.find(t=>t.id===activeTab);

  // Listen for navigation requests from other apps
  useEffect(() => {
    // Check if opened with an initial URL
    if (window.__osBrowserInitUrl) {
      const url = window.__osBrowserInitUrl;
      delete window.__osBrowserInitUrl;
      setTimeout(() => navigate(url), 100);
    }
    const handler = (e) => {
      if (e.detail?.url) navigate(e.detail.url);
    };
    window.addEventListener('os-browser-navigate', handler);
    return () => window.removeEventListener('os-browser-navigate', handler);
  }, []);

  const navigate = useCallback((raw) => {
    let url = raw.trim();
    if (!url) return;
    if (url.startsWith('data:')) { /* keep as-is */ }
    else if (!url.startsWith('http')) {
      if (url.includes('.') && !url.includes(' ')) url = `https://${url}`;
      else url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    setError(false);
    setTabs(ts=>ts.map(t=>t.id===activeTab?{...t,url,loading:true,title:new URL(url.startsWith('data:')?'data:text/html,x':url).hostname||'Loading...'}:t));
    setInputUrl(url.startsWith('data:')?'':url);
    setTimeout(()=>setTabs(ts=>ts.map(t=>t.id===activeTab?{...t,loading:false}:t)),1500);
  }, [activeTab]);

  const handleKey = (e) => { if(e.key==='Enter') navigate(inputUrl); };

  const addTab = () => {
    const id = Date.now();
    setTabs(ts=>[...ts,{id,url:HOMEPAGE,title:'New Tab',loading:false}]);
    setActiveTab(id); setInputUrl(''); setError(false);
  };

  const closeTab = (id,e) => {
    e.stopPropagation();
    if(tabs.length===1) return;
    const rest=tabs.filter(t=>t.id!==id);
    setTabs(rest);
    if(activeTab===id){setActiveTab(rest[rest.length-1].id);setInputUrl('');}
  };

  const switchTab = (id) => {
    setActiveTab(id);
    const t=tabs.find(t=>t.id===id);
    setInputUrl(t?.url?.startsWith('data:')?'':t?.url||'');
    setError(false);
  };

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',background:'#f0f2f5'}}>
      {/* Tab bar */}
      <div style={{display:'flex',alignItems:'flex-end',background:'#dde1e7',padding:'4px 4px 0',gap:2,minHeight:34}}>
        {tabs.map(tab=>(
          <div key={tab.id} onClick={()=>switchTab(tab.id)}
            style={{display:'flex',alignItems:'center',gap:6,padding:'5px 10px',borderRadius:'6px 6px 0 0',cursor:'pointer',maxWidth:180,minWidth:80,fontSize:11,background:activeTab===tab.id?'#f0f2f5':'#c8cdd5',color:activeTab===tab.id?'#1a1a1a':'#555',borderBottom:activeTab===tab.id?'2px solid #f0f2f5':'none',transition:'background 0.1s'}}>
            <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tab.loading?'Loading...':tab.title}</span>
            <button onClick={e=>closeTab(tab.id,e)} style={{background:'none',border:'none',cursor:'pointer',padding:1,borderRadius:2,color:'#888',display:'flex',alignItems:'center'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.1)'}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <X style={{width:10,height:10}} />
            </button>
          </div>
        ))}
        <button onClick={addTab} style={{padding:'4px 8px',background:'none',border:'none',cursor:'pointer',borderRadius:'4px 4px 0 0',color:'#666',fontSize:16,display:'flex',alignItems:'center'}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.08)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          <Plus style={{width:14,height:14}} />
        </button>
      </div>

      {/* Navigation bar */}
      <div style={{display:'flex',alignItems:'center',gap:4,padding:'6px 8px',background:'#f0f2f5',borderBottom:'1px solid #d0d4da'}}>
        <button onClick={()=>iframeRef.current?.contentWindow?.history.back()} style={{padding:5,background:'none',border:'none',cursor:'pointer',borderRadius:4,color:'#555',display:'flex'}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.08)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          <ArrowLeft style={{width:15,height:15}} />
        </button>
        <button onClick={()=>iframeRef.current?.contentWindow?.history.forward()} style={{padding:5,background:'none',border:'none',cursor:'pointer',borderRadius:4,color:'#555',display:'flex'}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.08)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          <ArrowRight style={{width:15,height:15}} />
        </button>
        <button onClick={()=>navigate(currentTab?.url||HOMEPAGE)} style={{padding:5,background:'none',border:'none',cursor:'pointer',borderRadius:4,color:'#555',display:'flex'}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.08)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          <RotateCcw style={{width:14,height:14,animation:currentTab?.loading?'spin 1s linear infinite':''}} />
        </button>
        <button onClick={()=>navigate(HOMEPAGE)} style={{padding:5,background:'none',border:'none',cursor:'pointer',borderRadius:4,color:'#555',display:'flex'}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.08)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          <Home style={{width:14,height:14}} />
        </button>

        {/* Address bar */}
        <div style={{flex:1,display:'flex',alignItems:'center',gap:6,background:'white',border:'1px solid #c0c4cc',borderRadius:20,padding:'4px 12px',boxShadow:'inset 0 1px 3px rgba(0,0,0,0.06)'}}>
          <Lock style={{width:11,height:11,color:'#22c55e',flexShrink:0}} />
          <input value={inputUrl} onChange={e=>setInputUrl(e.target.value)} onKeyDown={handleKey}
            placeholder="Search or enter URL..."
            style={{flex:1,border:'none',outline:'none',fontSize:12,color:'#1a1a1a',background:'transparent'}} />
          <Search style={{width:12,height:12,color:'#888',cursor:'pointer'}} onClick={()=>navigate(inputUrl)} />
        </div>
        <button style={{padding:5,background:'none',border:'none',cursor:'pointer',borderRadius:4,color:'#888',display:'flex'}}><Star style={{width:14,height:14}} /></button>
      </div>

      {/* Bookmarks bar */}
      <div style={{display:'flex',alignItems:'center',gap:2,padding:'3px 8px',background:'#f8f9fa',borderBottom:'1px solid #e0e3e8',overflowX:'auto',flexShrink:0}}>
        {BOOKMARKS.map(b=>(
          <button key={b.url} onClick={()=>navigate(b.url)}
            style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',background:'none',border:'none',cursor:'pointer',borderRadius:3,fontSize:11,color:'#333',whiteSpace:'nowrap',flexShrink:0,transition:'background 0.1s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.07)'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}>
            <span>{b.emoji}</span>{b.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,position:'relative',overflow:'hidden'}}>
        {currentTab?.loading && (
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'white',zIndex:10}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
              <div style={{width:32,height:32,border:'3px solid #e0e0e0',borderTop:'3px solid #4a90d9',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
              <span style={{fontSize:12,color:'#888'}}>Loading...</span>
            </div>
          </div>
        )}
        {(error || isBlockedSite(currentTab?.url)) ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:16,background:'white'}}>
            <div style={{fontSize:48}}>{error ? '🚫' : '🔒'}</div>
            <div style={{textAlign:'center',maxWidth:400}}>
              <div style={{fontSize:16,fontWeight:600,color:'#333',marginBottom:6}}>
                {error ? "This page can't be displayed" : `${getDomain(currentTab?.url)} refused to connect`}
              </div>
              <div style={{fontSize:12,color:'#888',marginBottom:16}}>
                This website doesn't allow being displayed inside other applications for security reasons.
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
                <button onClick={()=>window.open(currentTab?.url,'_blank')}
                  style={{padding:'10px 20px',background:'#4a90d9',color:'white',border:'none',borderRadius:6,cursor:'pointer',fontSize:13,fontWeight:500}}>
                  Open in Real Browser ↗
                </button>
                <button onClick={()=>navigate(HOMEPAGE)}
                  style={{padding:'10px 20px',background:'#f0f2f5',color:'#333',border:'1px solid #d0d4da',borderRadius:6,cursor:'pointer',fontSize:13}}>
                  Go Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={currentTab?.url||HOMEPAGE}
            style={{width:'100%',height:'100%',border:'none'}}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
            onLoad={()=>setTabs(ts=>ts.map(t=>t.id===activeTab?{...t,loading:false}:t))}
            onError={()=>{setError(true);setTabs(ts=>ts.map(t=>t.id===activeTab?{...t,loading:false}:t));}}
            title="Browser"
            allow="autoplay; fullscreen; picture-in-picture"
          />
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

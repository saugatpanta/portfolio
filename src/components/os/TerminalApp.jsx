import { useState, useRef, useEffect, useCallback } from 'react';
import useOSStore from '@/store/useOSStore';

const NEOFETCH = `
\x1b[36m  ███████╗ █████╗ ██╗   ██╗ ██████╗  █████╗ ████████╗
  ██╔════╝██╔══██╗██║   ██║██╔════╝ ██╔══██╗╚══██╔══╝
  ███████╗███████║██║   ██║██║  ███╗███████║   ██║
  ╚════██║██╔══██║██║   ██║██║   ██║██╔══██║   ██║
  ███████║██║  ██║╚██████╔╝╚██████╔╝██║  ██║   ██║
  ╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝   ╚═╝\x1b[0m

  \x1b[33mOS:\x1b[0m        SaugatOS 7.0 (Portfolio Edition)
  \x1b[33mHost:\x1b[0m      portfolio.saugatpanta.dev
  \x1b[33mKernel:\x1b[0m    React 19.0 + Vite 7.0
  \x1b[33mShell:\x1b[0m     /bin/zsh 5.9
  \x1b[33mResolution:\x1b[0m ${window.innerWidth}x${window.innerHeight}
  \x1b[33mDE:\x1b[0m        Aero Glass 2.0
  \x1b[33mWM:\x1b[0m        AeroWM v3.0
  \x1b[33mCPU:\x1b[0m       Intel Core i7-12700K @ 3.60GHz
  \x1b[33mGPU:\x1b[0m       NVIDIA RTX 3070 8GB GDDR6
  \x1b[33mRAM:\x1b[0m       16GB DDR4 3200MHz
  \x1b[33mDisk:\x1b[0m      512GB NVMe SSD
  \x1b[33mUptime:\x1b[0m    Just booted ⚡`;

const SAUGAT_ART = `
\x1b[35m╔══════════════════════════════════════════╗
║  ♪ ♫  \x1b[36mSAUGAT PANTA\x1b[35m  ♫ ♪                ║
║                                          ║
║     \x1b[33m⭐ Full Stack Developer ⭐\x1b[35m          ║
║     \x1b[32m📍 Kathmandu, Nepal 🇳🇵\x1b[35m             ║
║                                          ║
║  \x1b[34mReact · Node.js · Firebase · Python\x1b[35m   ║
║  \x1b[34mNext.js · TypeScript · MongoDB\x1b[35m        ║
║  \x1b[34mDocker · AWS · PostgreSQL\x1b[35m             ║
║                                          ║
║  \x1b[32m"Code is poetry, bugs are haiku"\x1b[35m      ║
╚══════════════════════════════════════════╝\x1b[0m`;

const LS_OUTPUT = `\x1b[34mDesktop/\x1b[0m    \x1b[34mDocuments/\x1b[0m   \x1b[34mProjects/\x1b[0m   \x1b[34mDownloads/\x1b[0m
\x1b[32mresume.txt\x1b[0m  \x1b[32mabout.txt\x1b[0m    \x1b[32mnotes.md\x1b[0m    \x1b[34m.config/\x1b[0m
\x1b[34m.ssh/\x1b[0m       \x1b[32m.bashrc\x1b[0m      \x1b[32m.zshrc\x1b[0m`;

const DIRS = { '~':['Desktop','Documents','Projects','Downloads','.config','.ssh'], 'Desktop':['shortcuts'], 'Documents':['resume.txt','about.txt','notes.md'], 'Projects':['portfolio-os','ecommerce','ai-chat'] };

function colorize(text) {
  return text.replace(/\x1b\[(\d+)m/g, (_, code) => {
    const map = {'0':'</span>','31':'<span style="color:#ef4444">','32':'<span style="color:#22c55e">','33':'<span style="color:#eab308">','34':'<span style="color:#60a5fa">','35':'<span style="color:#a855f7">','36':'<span style="color:#06b6d4">'};
    return map[code] || '';
  });
}

export default function TerminalApp() {
  const [lines, setLines] = useState([
    { type:'output', text:'\x1b[36mSaugatOS Terminal v3.0\x1b[0m — Type \x1b[33mhelp\x1b[0m for commands' },
    { type:'output', text:'' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [currentDir, setCurrentDir] = useState('~');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { setBootState, openApp, pushNotification } = useOSStore();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [lines]);

  const addLine = useCallback((text, type='output') => {
    setLines(l => [...l, { type, text }]);
  }, []);

  const processCommand = useCallback((raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setHistory(h => [trimmed, ...h.slice(0,49)]);
    setHistIdx(-1);
    addLine(`\x1b[32msaugat@webos\x1b[0m:\x1b[34m${currentDir}\x1b[0m$ ${trimmed}`, 'prompt');

    const [cmd, ...args] = trimmed.split(' ');
    const arg = args.join(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        addLine(`\x1b[33mAvailable commands:\x1b[0m
  \x1b[36mNavigation:\x1b[0m  ls, pwd, cd [dir]
  \x1b[36mInfo:\x1b[0m        whoami, about, neofetch, date, history
  \x1b[36mPortfolio:\x1b[0m   skills, projects, experience, education
  \x1b[36mUtils:\x1b[0m       echo [text], cat [file], ping, clear
  \x1b[36mApps:\x1b[0m        open [app]
  \x1b[36mFun:\x1b[0m         saugat, matrix, crash, sudo, vim, rm -rf /
  \x1b[36mSystem:\x1b[0m      exit`);
        break;
      case 'whoami':
        addLine(`\x1b[36mSaugat Panta\x1b[0m — Full Stack Developer\n  📍 Kathmandu, Nepal\n  💼 Available for opportunities\n  🌐 github.com/saugatpanta`);
        break;
      case 'about':
        addLine(`Passionate Full Stack Developer from Kathmandu, Nepal.\nI build modern web experiences with React, Node.js and cloud technologies.\nCurrently open to exciting opportunities!`);
        break;
      case 'skills':
        addLine(`\x1b[33mFrontend:\x1b[0m  React, Next.js, TypeScript, Tailwind, Framer Motion
\x1b[33mBackend:\x1b[0m   Node.js, Express, Python, FastAPI
\x1b[33mDatabase:\x1b[0m  PostgreSQL, MongoDB, Redis, Firebase
\x1b[33mDevOps:\x1b[0m    Docker, AWS, Vercel, GitHub Actions
\x1b[33mTools:\x1b[0m     Git, Figma, VS Code, Postman`);
        break;
      case 'projects':
        addLine(`\x1b[33m1.\x1b[0m Portfolio OS — Windows 7 style web portfolio [React, Firebase]
\x1b[33m2.\x1b[0m E-Commerce Platform — Full stack shopping [Next.js, Stripe]
\x1b[33m3.\x1b[0m AI Chat App — Real-time AI chat [Socket.io, OpenAI]
\nType \x1b[36mopen projects\x1b[0m to view in Projects app`);
        break;
      case 'experience':
        addLine(`\x1b[33mWork Experience:\x1b[0m
  • Full Stack Developer @ Various Companies
  • React Developer @ Freelance
  • Open Source Contributor
\nType \x1b[36mopen experience\x1b[0m to view full timeline`);
        break;
      case 'education':
        addLine(`\x1b[33mEducation:\x1b[0m
  • Bachelor's in Computer Science
  • Various online certifications
  • Self-taught in many technologies`);
        break;
      case 'ls':
        const dirContents = DIRS[currentDir] || DIRS['~'];
        addLine(dirContents.map(f => f.includes('.')?`\x1b[32m${f}\x1b[0m`:`\x1b[34m${f}/\x1b[0m`).join('    '));
        break;
      case 'pwd':
        addLine(`/home/saugat/${currentDir==='~'?'':currentDir}`);
        break;
      case 'cd':
        if (!arg || arg==='~') { setCurrentDir('~'); addLine(''); }
        else if (arg==='..') { setCurrentDir('~'); addLine(''); }
        else if (DIRS[arg]) { setCurrentDir(arg); addLine(''); }
        else addLine(`\x1b[31mcd: ${arg}: No such file or directory\x1b[0m`);
        break;
      case 'cat':
        if (arg==='resume.txt') addLine(`Saugat Panta — Full Stack Developer\nKathmandu, Nepal | saugat@example.com\n\nExperience: 3+ years\nSkills: React, Node.js, Python, Firebase\nAvailable for: Full-time, Freelance`);
        else if (arg==='about.txt') addLine(`Passionate developer who loves building things.\nSpecializes in full-stack web development.\nAlways learning, always growing.`);
        else if (arg==='.bashrc'||arg==='.zshrc') addLine(`# SaugatOS shell config\nalias ll='ls -la'\nalias gs='git status'\nalias dev='npm run dev'\nexport PATH="$HOME/.local/bin:$PATH"`);
        else addLine(`\x1b[31mcat: ${arg}: No such file or directory\x1b[0m`);
        break;
      case 'echo':
        addLine(arg || '');
        break;
      case 'ping':
        addLine(`PING portfolio.saugatpanta.dev (127.0.0.1)\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.042 ms\n64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.038 ms\n\x1b[32m2 packets transmitted, 2 received, 0% packet loss\x1b[0m`);
        break;
      case 'date':
        addLine(new Date().toString());
        break;
      case 'history':
        history.slice(0,20).forEach((h,i) => addLine(`  ${String(i+1).padStart(3)}  ${h}`));
        break;
      case 'clear':
        setLines([]);
        break;
      case 'neofetch':
        addLine(NEOFETCH);
        break;
      case 'saugat':
        addLine(SAUGAT_ART);
        break;
      case 'open':
        const appMap = { projects:'projects', experience:'experience', blog:'blog', contact:'mail', terminal:'terminal-app', calculator:'calculator', browser:'browser', files:'file-explorer', notepad:'notepad' };
        if (appMap[arg]) { openApp(appMap[arg]); addLine(`\x1b[32mOpening ${arg}...\x1b[0m`); }
        else addLine(`\x1b[31mopen: unknown app '${arg}'. Try: projects, experience, blog, contact, browser\x1b[0m`);
        break;
      case 'crash':
        addLine('\x1b[31mInitiating system crash...\x1b[0m');
        setTimeout(() => setBootState('bsod'), 600);
        break;
      case 'matrix':
        addLine('\x1b[32mMatrix rain activated. Check the desktop!\x1b[0m');
        pushNotification({ title:'Matrix', body:'The Matrix has you...', icon:'🐉' });
        break;
      case 'sudo':
        addLine('\x1b[31mNice try. You are not root here.\x1b[0m\n[sudo] password for saugat: \x1b[31mAuthentication failure\x1b[0m');
        break;
      case 'rm':
        if (args.includes('-rf') && (args.includes('/')||args.includes('/*'))) {
          addLine('\x1b[31m⚠️  Permission denied: System protected.\x1b[0m\nHa! Nice try. This OS is indestructible. 😄');
        } else {
          addLine(`\x1b[31mrm: ${arg}: No such file or directory\x1b[0m`);
        }
        break;
      case 'vim':
        addLine('Opening vim...\n\x1b[33m[No write since last change]\x1b[0m\nType :q! to exit... just kidding, you\'re safe here. 😄\n\x1b[32m-- INSERT --\x1b[0m');
        break;
      case 'exit':
        addLine('Goodbye! 👋');
        setTimeout(() => useOSStore.getState().closeApp('terminal-app'), 800);
        break;
      case 'git':
        if (args[0]==='log') addLine(`\x1b[33mcommit a1b2c3d\x1b[0m (HEAD -> main)\nAuthor: Saugat Panta <saugat@example.com>\nDate:   ${new Date().toDateString()}\n\n    feat: add Windows 7 Aero Glass OS portfolio\n\n\x1b[33mcommit e4f5g6h\x1b[0m\n    chore: initial commit`);
        else if (args[0]==='status') addLine(`On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean`);
        else addLine(`git: '${args[0]}' is not a git command. See 'git --help'.`);
        break;
      case 'node':
        addLine(`Welcome to Node.js v20.0.0.\nType ".help" for more information.\n> \x1b[33m(REPL not available in browser)\x1b[0m`);
        break;
      default:
        addLine(`\x1b[31m${cmd}: command not found\x1b[0m. Type \x1b[33mhelp\x1b[0m for available commands.`);
    }
  }, [addLine, currentDir, history, openApp, pushNotification, setBootState]);

  const handleKey = (e) => {
    if (e.key==='Enter') { processCommand(input); setInput(''); }
    else if (e.key==='ArrowUp') { e.preventDefault(); const idx=Math.min(histIdx+1,history.length-1); setHistIdx(idx); setInput(history[idx]||''); }
    else if (e.key==='ArrowDown') { e.preventDefault(); const idx=Math.max(histIdx-1,-1); setHistIdx(idx); setInput(idx===-1?'':history[idx]||''); }
    else if (e.key==='Tab') { e.preventDefault(); /* Tab completion */ }
    else if (e.key==='c' && e.ctrlKey) { addLine('^C'); setInput(''); }
    else if (e.key==='l' && e.ctrlKey) { e.preventDefault(); setLines([]); }
  };

  return (
    <div className="h-full flex flex-col bg-[#0C0C0C] font-mono text-[13px] cursor-text" onClick={()=>inputRef.current?.focus()}>
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} className={`leading-5 whitespace-pre-wrap break-all ${line.type==='prompt'?'text-white/90':'text-[#00FF41]'}`}
            dangerouslySetInnerHTML={{ __html: colorize(line.text) }} />
        ))}
        <div className="flex items-center gap-1 text-[#00FF41]">
          <span className="text-green-400">saugat@webos</span>
          <span className="text-white/50">:</span>
          <span className="text-blue-400">{currentDir}</span>
          <span className="text-white/50">$</span>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} autoFocus
            className="flex-1 bg-transparent outline-none text-[#00FF41] caret-[#00FF41] ml-1" spellCheck={false} autoComplete="off" />
          <span className="cursor-blink text-[#00FF41] ml-0.5">█</span>
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

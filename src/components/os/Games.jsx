import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/* ═══════════════════════ SNAKE ═══════════════════════ */
function SnakeGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef({ snake:[{x:10,y:10}], dir:{x:1,y:0}, food:{x:15,y:15}, score:0, running:false, speed:140 });
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const CELL=14, COLS=28, ROWS=20;
  const randFood = () => ({ x:Math.floor(Math.random()*COLS), y:Math.floor(Math.random()*ROWS) });

  const draw = useCallback(() => {
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d'); const g=gameRef.current;
    ctx.fillStyle='#0a0a0a'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#ef4444'; ctx.shadowColor='#ef4444'; ctx.shadowBlur=6;
    ctx.fillRect(g.food.x*CELL+2,g.food.y*CELL+2,CELL-4,CELL-4); ctx.shadowBlur=0;
    g.snake.forEach((seg,i)=>{
      ctx.fillStyle=`hsl(${120+i*3},75%,${55-i*0.5}%)`;
      ctx.fillRect(seg.x*CELL+1,seg.y*CELL+1,CELL-2,CELL-2);
    });
  }, []);

  const tick = useCallback((ts) => {
    const g=gameRef.current; if(!g.running) return;
    if(ts-lastRef.current>g.speed) {
      lastRef.current=ts;
      const head={x:g.snake[0].x+g.dir.x, y:g.snake[0].y+g.dir.y};
      if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||g.snake.some(s=>s.x===head.x&&s.y===head.y)) {
        g.running=false; setGameOver(true); return;
      }
      g.snake.unshift(head);
      if(head.x===g.food.x&&head.y===g.food.y) { g.food=randFood(); g.score++; setScore(g.score); g.speed=Math.max(60,g.speed-2); }
      else g.snake.pop();
    }
    draw(); rafRef.current=requestAnimationFrame(tick);
  }, [draw]);

  const start = () => {
    const g=gameRef.current;
    g.snake=[{x:10,y:10}]; g.dir={x:1,y:0}; g.food=randFood(); g.score=0; g.running=true; g.speed=140;
    setScore(0); setGameOver(false); setStarted(true); lastRef.current=0;
    rafRef.current=requestAnimationFrame(tick);
  };

  useEffect(()=>{
    const h=(e)=>{ const g=gameRef.current; if(!g.running) return;
      const m={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}};
      const d=m[e.key]; if(!d||d.x===-g.dir.x&&d.y===-g.dir.y) return; g.dir=d; e.preventDefault();
    };
    window.addEventListener('keydown',h);
    return()=>{window.removeEventListener('keydown',h);cancelAnimationFrame(rafRef.current);};
  },[]);

  return (
    <div className="flex flex-col items-center gap-2 relative">
      <div className="flex justify-between w-full"><span className="text-xs text-white/50">Use arrow keys</span><span className="text-sm text-green-400 font-bold">{score}</span></div>
      <canvas ref={canvasRef} width={COLS*CELL} height={ROWS*CELL} style={{border:'1px solid rgba(255,255,255,0.1)',borderRadius:4}} />
      {(!started||gameOver)&&<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded">
        {gameOver&&<p className="text-red-400 font-bold mb-2">Game Over! Score: {score}</p>}
        <button onClick={start} className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium">{gameOver?'Retry':'Start'}</button>
      </div>}
    </div>
  );
}

/* ═══════════════════ MINESWEEPER ═══════════════════ */
function Minesweeper() {
  const ROWS=9, COLS=9, MINES=10;
  const [board, setBoard] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [flags, setFlags] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const init = useCallback(() => {
    const b = Array(ROWS).fill(null).map(()=>Array(COLS).fill(0));
    let placed=0;
    while(placed<MINES) { const r=Math.floor(Math.random()*ROWS), c=Math.floor(Math.random()*COLS);
      if(b[r][c]!==-1) { b[r][c]=-1; placed++; } }
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) { if(b[r][c]===-1) continue;
      let cnt=0; for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) { const nr=r+dr,nc=c+dc;
        if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&b[nr][nc]===-1) cnt++; } b[r][c]=cnt; }
    setBoard(b); setRevealed(Array(ROWS).fill(null).map(()=>Array(COLS).fill(false)));
    setFlags(Array(ROWS).fill(null).map(()=>Array(COLS).fill(false)));
    setGameOver(false); setWon(false);
  }, []);

  useEffect(()=>{init();},[init]);

  const reveal = (r,c) => {
    if(gameOver||won||revealed[r][c]||flags[r][c]) return;
    const rev=[...revealed.map(row=>[...row])];
    if(board[r][c]===-1) { rev[r][c]=true; setRevealed(rev); setGameOver(true); return; }
    const flood=(rr,cc)=>{ if(rr<0||rr>=ROWS||cc<0||cc>=COLS||rev[rr][cc]) return; rev[rr][cc]=true;
      if(board[rr][cc]===0) { for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) flood(rr+dr,cc+dc); } };
    flood(r,c); setRevealed(rev);
    const totalSafe=ROWS*COLS-MINES; let revCnt=0; rev.forEach(row=>row.forEach(v=>{if(v)revCnt++;}));
    if(revCnt===totalSafe) setWon(true);
  };

  const flag = (e,r,c) => { e.preventDefault(); if(gameOver||won||revealed[r][c]) return;
    const f=[...flags.map(row=>[...row])]; f[r][c]=!f[r][c]; setFlags(f); };

  const COLORS=['','#3b82f6','#22c55e','#ef4444','#7c3aed','#dc2626','#0891b2','#000','#666'];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex justify-between w-full items-center">
        <span className="text-xs text-white/50">💣 {MINES - flags.flat().filter(Boolean).length}</span>
        {(gameOver||won)&&<button onClick={init} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs">New Game</button>}
        <span className="text-xs">{won?'🎉 Won!':gameOver?'💥 Boom!':''}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:`repeat(${COLS},1fr)`,gap:1}}>
        {board.map((row,r)=>row.map((cell,c)=>(
          <button key={`${r}-${c}`} onClick={()=>reveal(r,c)} onContextMenu={e=>flag(e,r,c)}
            style={{width:28,height:28,fontSize:11,fontWeight:700,border:'none',borderRadius:2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
              background:revealed[r][c]?'rgba(255,255,255,0.08)':'linear-gradient(145deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))',
              color:cell>0?COLORS[cell]:'white',boxShadow:revealed[r][c]?'none':'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)'}}>
            {revealed[r][c]?(cell===-1?'💣':cell||''):flags[r][c]?'🚩':''}
          </button>
        )))}
      </div>
      <p className="text-xs text-white/30">Left-click: reveal | Right-click: flag</p>
    </div>
  );
}

/* ═══════════════════════ TETRIS ═══════════════════════ */
function TetrisGame() {
  const COLS=10, ROWS=20, CELL=18;
  const SHAPES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
  const COLORS=['#06b6d4','#eab308','#a855f7','#f97316','#3b82f6','#22c55e','#ef4444'];
  const canvasRef=useRef(null);
  const stateRef=useRef({grid:Array(ROWS).fill(null).map(()=>Array(COLS).fill(0)),piece:null,px:0,py:0,pi:0,score:0,running:false,speed:500});
  const rafRef=useRef(null), lastRef=useRef(0);
  const [score,setScore]=useState(0);
  const [over,setOver]=useState(false);
  const [started,setStarted]=useState(false);

  const newPiece=()=>{const i=Math.floor(Math.random()*SHAPES.length);return{shape:SHAPES[i],color:COLORS[i],idx:i};};
  const collides=(grid,shape,px,py)=>{for(let r=0;r<shape.length;r++)for(let c=0;c<shape[r].length;c++){if(!shape[r][c])continue;const nr=py+r,nc=px+c;if(nc<0||nc>=COLS||nr>=ROWS||(nr>=0&&grid[nr][nc]))return true;}return false;};
  const rotate=(shape)=>{const rows=shape.length,cols=shape[0].length;const n=Array(cols).fill(null).map(()=>Array(rows).fill(0));for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)n[c][rows-1-r]=shape[r][c];return n;};
  const place=(grid,shape,px,py,color)=>{const g=grid.map(r=>[...r]);for(let r=0;r<shape.length;r++)for(let c=0;c<shape[r].length;c++){if(!shape[r][c])continue;const nr=py+r,nc=px+c;if(nr>=0&&nr<ROWS)g[nr][nc]=color;}return g;};
  const clearLines=(grid)=>{let cleared=0;const g=grid.filter(row=>{if(row.every(c=>c)){cleared++;return false;}return true;});while(g.length<ROWS)g.unshift(Array(COLS).fill(0));return{grid:g,cleared};};

  const draw=useCallback(()=>{
    const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext('2d');const s=stateRef.current;
    ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(s.grid[r][c]){ctx.fillStyle=s.grid[r][c];ctx.fillRect(c*CELL+1,r*CELL+1,CELL-2,CELL-2);}else{ctx.fillStyle='rgba(255,255,255,0.02)';ctx.fillRect(c*CELL,r*CELL,CELL,CELL);}}
    if(s.piece){const sh=s.piece.shape;for(let r=0;r<sh.length;r++)for(let c=0;c<sh[r].length;c++){if(!sh[r][c])continue;ctx.fillStyle=s.piece.color;ctx.fillRect((s.px+c)*CELL+1,(s.py+r)*CELL+1,CELL-2,CELL-2);}}
  },[]);

  const tick=useCallback((ts)=>{
    const s=stateRef.current;if(!s.running)return;
    if(ts-lastRef.current>s.speed){lastRef.current=ts;
      if(!collides(s.grid,s.piece.shape,s.px,s.py+1)){s.py++;}
      else{s.grid=place(s.grid,s.piece.shape,s.px,s.py,s.piece.color);const{grid,cleared}=clearLines(s.grid);s.grid=grid;s.score+=cleared*100+(cleared>1?cleared*50:0);setScore(s.score);
        const p=newPiece();s.piece=p;s.px=Math.floor((COLS-p.shape[0].length)/2);s.py=0;
        if(collides(s.grid,s.piece.shape,s.px,s.py)){s.running=false;setOver(true);return;}
        s.speed=Math.max(100,500-s.score*0.5);}}
    draw();rafRef.current=requestAnimationFrame(tick);
  },[draw]);

  const start=()=>{const s=stateRef.current;s.grid=Array(ROWS).fill(null).map(()=>Array(COLS).fill(0));const p=newPiece();s.piece=p;s.px=Math.floor((COLS-p.shape[0].length)/2);s.py=0;s.score=0;s.running=true;s.speed=500;setScore(0);setOver(false);setStarted(true);lastRef.current=0;rafRef.current=requestAnimationFrame(tick);};

  useEffect(()=>{
    const h=(e)=>{const s=stateRef.current;if(!s.running)return;
      if(e.key==='ArrowLeft'&&!collides(s.grid,s.piece.shape,s.px-1,s.py)){s.px--;e.preventDefault();}
      if(e.key==='ArrowRight'&&!collides(s.grid,s.piece.shape,s.px+1,s.py)){s.px++;e.preventDefault();}
      if(e.key==='ArrowDown'&&!collides(s.grid,s.piece.shape,s.px,s.py+1)){s.py++;e.preventDefault();}
      if(e.key==='ArrowUp'){const rot=rotate(s.piece.shape);if(!collides(s.grid,rot,s.px,s.py)){s.piece.shape=rot;}e.preventDefault();}
      draw();};
    window.addEventListener('keydown',h);
    return()=>{window.removeEventListener('keydown',h);cancelAnimationFrame(rafRef.current);};
  },[draw]);

  return(
    <div className="flex flex-col items-center gap-2 relative">
      <div className="flex justify-between w-full"><span className="text-xs text-white/50">↑ rotate, ← → move, ↓ drop</span><span className="text-sm text-cyan-400 font-bold">{score}</span></div>
      <canvas ref={canvasRef} width={COLS*CELL} height={ROWS*CELL} style={{border:'1px solid rgba(255,255,255,0.1)',borderRadius:4}} />
      {(!started||over)&&<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded">
        {over&&<p className="text-red-400 font-bold mb-2">Game Over! Score: {score}</p>}
        <button onClick={start} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium">{over?'Retry':'Start'}</button>
      </div>}
    </div>
  );
}

/* ═══════════════════════ 2048 ═══════════════════════ */
function Game2048() {
  const SIZE = 4;
  const [board, setBoard] = useState(() => addRandom(addRandom(emptyBoard())));
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);

  function emptyBoard() { return Array(SIZE).fill(null).map(() => Array(SIZE).fill(0)); }
  function addRandom(b) {
    const empty = [];
    b.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]); }));
    if (!empty.length) return b;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    const nb = b.map(row => [...row]);
    nb[r][c] = Math.random() < 0.9 ? 2 : 4;
    return nb;
  }
  function canMove(b) {
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (!b[r][c]) return true;
      if (c < SIZE - 1 && b[r][c] === b[r][c + 1]) return true;
      if (r < SIZE - 1 && b[r][c] === b[r + 1][c]) return true;
    }
    return false;
  }
  function slideRow(row) {
    let arr = row.filter(v => v), pts = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) { arr[i] *= 2; pts += arr[i]; arr.splice(i + 1, 1); }
    }
    while (arr.length < SIZE) arr.push(0);
    return { row: arr, pts };
  }
  function move(dir) {
    if (over || won) return;
    let b = board.map(r => [...r]), pts = 0, moved = false;
    const rot = (b) => b[0].map((_, c) => b.map(r => r[c]).reverse());
    let rotations = { left: 0, up: 1, right: 2, down: 3 }[dir];
    for (let i = 0; i < rotations; i++) b = rot(b);
    for (let r = 0; r < SIZE; r++) {
      const { row, pts: p } = slideRow(b[r]);
      if (row.join(',') !== b[r].join(',')) moved = true;
      b[r] = row; pts += p;
    }
    for (let i = 0; i < (4 - rotations) % 4; i++) b = rot(b);
    if (!moved) return;
    b = addRandom(b);
    const newScore = score + pts;
    setScore(newScore);
    setBoard(b);
    if (b.some(row => row.some(v => v >= 2048))) setWon(true);
    else if (!canMove(b)) setOver(true);
  }

  useEffect(() => {
    const h = (e) => {
      const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const reset = () => { setBoard(addRandom(addRandom(emptyBoard()))); setScore(0); setOver(false); setWon(false); };

  const tileColor = (v) => {
    const colors = { 0:'rgba(255,255,255,0.05)', 2:'#eee4da', 4:'#ede0c8', 8:'#f2b179', 16:'#f59563', 32:'#f67c5f', 64:'#f65e3b', 128:'#edcf72', 256:'#edcc61', 512:'#edc850', 1024:'#edc53f', 2048:'#edc22e' };
    return colors[v] || '#3c3a32';
  };
  const textColor = (v) => v <= 4 ? '#776e65' : '#fff';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex justify-between w-full items-center">
        <span className="text-lg font-bold text-amber-400">{score}</span>
        <button onClick={reset} className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium">New Game</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE},1fr)`, gap: 6, padding: 8, background: 'rgba(187,173,160,0.3)', borderRadius: 8 }}>
        {board.flat().map((v, i) => (
          <div key={i} style={{
            width: 58, height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4, fontWeight: 700, fontSize: v >= 1024 ? 14 : v >= 128 ? 18 : 22,
            background: tileColor(v), color: textColor(v),
            transition: 'all 0.1s', boxShadow: v ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
          }}>
            {v || ''}
          </div>
        ))}
      </div>
      {(over || won) && (
        <div className="text-center">
          <p className={`font-bold ${won ? 'text-amber-400' : 'text-red-400'}`}>{won ? '🎉 You reached 2048!' : 'Game Over!'}</p>
          <button onClick={reset} className="mt-2 px-4 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm">Play Again</button>
        </div>
      )}
      <p className="text-xs text-white/30">Use arrow keys to merge tiles</p>
    </div>
  );
}

/* ═══════════════════════ FLAPPY BIRD ═══════════════════════ */
function FlappyBird() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ bird: { y: 150, vy: 0 }, pipes: [], score: 0, frame: 0, running: false });
  const rafRef = useRef(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [started, setStarted] = useState(false);
  const W = 320, H = 400, BIRD_R = 12, GAP = 110, PIPE_W = 40, GRAVITY = 0.4, JUMP = -6.5, SPEED = 2.5;

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); const s = stateRef.current;
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a1a3e'); grad.addColorStop(1, '#0d1b2a');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    // Ground
    ctx.fillStyle = '#2d5016'; ctx.fillRect(0, H - 30, W, 30);
    ctx.fillStyle = '#4a7c23'; ctx.fillRect(0, H - 30, W, 4);
    // Pipes
    ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 4;
    s.pipes.forEach(p => {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(p.x, 0, PIPE_W, p.top);
      ctx.fillRect(p.x, p.top + GAP, PIPE_W, H - p.top - GAP);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(p.x - 3, p.top - 16, PIPE_W + 6, 16);
      ctx.fillRect(p.x - 3, p.top + GAP, PIPE_W + 6, 16);
    });
    ctx.shadowBlur = 0;
    // Bird
    ctx.fillStyle = '#facc15'; ctx.shadowColor = '#facc15'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(60, s.bird.y, BIRD_R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(66, s.bird.y - 3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(67, s.bird.y - 3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(72, s.bird.y); ctx.lineTo(80, s.bird.y + 2); ctx.lineTo(72, s.bird.y + 5); ctx.fill();
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current; if (!s.running) return;
    s.bird.vy += GRAVITY; s.bird.y += s.bird.vy;
    s.frame++;
    if (s.frame % 90 === 0) {
      const top = 40 + Math.random() * (H - GAP - 100);
      s.pipes.push({ x: W, top, scored: false });
    }
    s.pipes = s.pipes.filter(p => p.x > -PIPE_W);
    s.pipes.forEach(p => {
      p.x -= SPEED;
      if (!p.scored && p.x + PIPE_W < 60) { p.scored = true; s.score++; setScore(s.score); }
      if (60 + BIRD_R > p.x && 60 - BIRD_R < p.x + PIPE_W) {
        if (s.bird.y - BIRD_R < p.top || s.bird.y + BIRD_R > p.top + GAP) { s.running = false; setOver(true); }
      }
    });
    if (s.bird.y > H - 30 - BIRD_R || s.bird.y < BIRD_R) { s.running = false; setOver(true); }
    draw();
    rafRef.current = requestAnimationFrame(tick);
  }, [draw]);

  const jump = () => { if (stateRef.current.running) stateRef.current.bird.vy = JUMP; };
  const start = () => {
    stateRef.current = { bird: { y: 150, vy: 0 }, pipes: [], score: 0, frame: 0, running: true };
    setScore(0); setOver(false); setStarted(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const h = (e) => { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); jump(); } };
    window.addEventListener('keydown', h);
    return () => { window.removeEventListener('keydown', h); cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 relative">
      <div className="flex justify-between w-full"><span className="text-xs text-white/50">Space / ↑ to flap</span><span className="text-sm text-yellow-400 font-bold">{score}</span></div>
      <canvas ref={canvasRef} width={W} height={H} onClick={jump} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, cursor: 'pointer' }} />
      {(!started || over) && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded">
        {over && <p className="text-red-400 font-bold mb-2">Crashed! Score: {score}</p>}
        <button onClick={start} className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium">{over ? 'Retry' : 'Start'}</button>
      </div>}
    </div>
  );
}

/* ═══════════════════════ PONG ═══════════════════════ */
function PongGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ player: 160, ai: 160, ball: { x: 200, y: 200, vx: 3, vy: 2 }, pScore: 0, aScore: 0, running: false });
  const rafRef = useRef(null);
  const keysRef = useRef({});
  const [pScore, setPScore] = useState(0);
  const [aScore, setAScore] = useState(0);
  const [started, setStarted] = useState(false);
  const W = 400, H = 300, PAD_H = 60, PAD_W = 8, BALL_R = 6;

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); const s = stateRef.current;
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H);
    // Center line
    ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
    // Paddles
    ctx.fillStyle = '#3b82f6'; ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 8;
    ctx.fillRect(10, s.player, PAD_W, PAD_H);
    ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444';
    ctx.fillRect(W - 18, s.ai, PAD_W, PAD_H);
    ctx.shadowBlur = 0;
    // Ball
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current; if (!s.running) return;
    // Player movement
    if (keysRef.current['ArrowUp'] || keysRef.current['w']) s.player = Math.max(0, s.player - 4);
    if (keysRef.current['ArrowDown'] || keysRef.current['s']) s.player = Math.min(H - PAD_H, s.player + 4);
    // AI
    const aiCenter = s.ai + PAD_H / 2;
    if (aiCenter < s.ball.y - 10) s.ai += 2.8;
    else if (aiCenter > s.ball.y + 10) s.ai -= 2.8;
    s.ai = Math.max(0, Math.min(H - PAD_H, s.ai));
    // Ball
    s.ball.x += s.ball.vx; s.ball.y += s.ball.vy;
    if (s.ball.y <= BALL_R || s.ball.y >= H - BALL_R) s.ball.vy *= -1;
    // Player paddle collision
    if (s.ball.x - BALL_R <= 18 && s.ball.y >= s.player && s.ball.y <= s.player + PAD_H) { s.ball.vx = Math.abs(s.ball.vx) * 1.05; s.ball.vy += (Math.random() - 0.5); }
    // AI paddle collision
    if (s.ball.x + BALL_R >= W - 18 && s.ball.y >= s.ai && s.ball.y <= s.ai + PAD_H) { s.ball.vx = -Math.abs(s.ball.vx) * 1.05; s.ball.vy += (Math.random() - 0.5); }
    // Score
    if (s.ball.x < 0) { s.aScore++; setAScore(s.aScore); s.ball = { x: W / 2, y: H / 2, vx: 3, vy: (Math.random() - 0.5) * 4 }; }
    if (s.ball.x > W) { s.pScore++; setPScore(s.pScore); s.ball = { x: W / 2, y: H / 2, vx: -3, vy: (Math.random() - 0.5) * 4 }; }
    draw(); rafRef.current = requestAnimationFrame(tick);
  }, [draw]);

  const start = () => {
    stateRef.current = { player: 120, ai: 120, ball: { x: W / 2, y: H / 2, vx: 3, vy: 2 }, pScore: 0, aScore: 0, running: true };
    setPScore(0); setAScore(0); setStarted(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const down = (e) => { keysRef.current[e.key] = true; if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault(); };
    const up = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 relative">
      <div className="flex justify-between w-full items-center">
        <span className="text-sm text-blue-400 font-bold">You: {pScore}</span>
        <span className="text-xs text-white/50">↑↓ or W/S</span>
        <span className="text-sm text-red-400 font-bold">AI: {aScore}</span>
      </div>
      <canvas ref={canvasRef} width={W} height={H} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6 }} />
      {!started && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded">
        <button onClick={start} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">Start</button>
      </div>}
    </div>
  );
}

/* ═══════════════════════ CHESS ═══════════════════════ */
function ChessGame() {
  const initBoard = () => {
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    const pieces = ['♜','♞','♝','♛','♚','♝','♞','♜'];
    const wPieces = ['♖','♘','♗','♕','♔','♗','♘','♖'];
    for (let c = 0; c < 8; c++) { b[0][c] = { piece: pieces[c], color: 'b' }; b[1][c] = { piece: '♟', color: 'b' }; b[6][c] = { piece: '♙', color: 'w' }; b[7][c] = { piece: wPieces[c], color: 'w' }; }
    return b;
  };

  const [board, setBoard] = useState(initBoard);
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState('w');
  const [captured, setCaptured] = useState({ w: [], b: [] });
  const [status, setStatus] = useState('');

  const isValidMove = (from, to, b) => {
    const piece = b[from[0]][from[1]];
    if (!piece || piece.color !== turn) return false;
    const target = b[to[0]][to[1]];
    if (target && target.color === turn) return false;
    const dr = to[0] - from[0], dc = to[1] - from[1];
    const adr = Math.abs(dr), adc = Math.abs(dc);
    const p = piece.piece;
    // Pawn
    if (p === '♙' || p === '♟') {
      const dir = piece.color === 'w' ? -1 : 1;
      const start = piece.color === 'w' ? 6 : 1;
      if (dc === 0 && !target) { if (dr === dir) return true; if (dr === dir * 2 && from[0] === start && !b[from[0] + dir][from[1]]) return true; }
      if (adc === 1 && dr === dir && target) return true;
      return false;
    }
    // Rook
    if (p === '♖' || p === '♜') {
      if (dr !== 0 && dc !== 0) return false;
      const sr = dr ? dr / adr : 0, sc = dc ? dc / adc : 0;
      for (let i = 1; i < Math.max(adr, adc); i++) { if (b[from[0] + i * sr][from[1] + i * sc]) return false; }
      return true;
    }
    // Bishop
    if (p === '♗' || p === '♝') {
      if (adr !== adc) return false;
      const sr = dr / adr, sc = dc / adc;
      for (let i = 1; i < adr; i++) { if (b[from[0] + i * sr][from[1] + i * sc]) return false; }
      return true;
    }
    // Queen
    if (p === '♕' || p === '♛') {
      if (dr !== 0 && dc !== 0 && adr !== adc) return false;
      const sr = dr ? dr / adr : 0, sc = dc ? dc / adc : 0;
      for (let i = 1; i < Math.max(adr, adc); i++) { if (b[from[0] + i * sr][from[1] + i * sc]) return false; }
      return true;
    }
    // Knight
    if (p === '♘' || p === '♞') return (adr === 2 && adc === 1) || (adr === 1 && adc === 2);
    // King
    if (p === '♔' || p === '♚') return adr <= 1 && adc <= 1;
    return false;
  };

  const handleClick = (r, c) => {
    if (status) return;
    const cell = board[r][c];
    if (selected) {
      if (selected[0] === r && selected[1] === c) { setSelected(null); return; }
      if (isValidMove(selected, [r, c], board)) {
        const nb = board.map(row => row.map(cell => cell ? { ...cell } : null));
        const target = nb[r][c];
        if (target) {
          setCaptured(prev => ({ ...prev, [turn]: [...prev[turn], target.piece] }));
          if (target.piece === '♔' || target.piece === '♚') { setStatus(turn === 'w' ? 'White wins!' : 'Black wins!'); }
        }
        nb[r][c] = nb[selected[0]][selected[1]];
        nb[selected[0]][selected[1]] = null;
        setBoard(nb); setSelected(null); setTurn(turn === 'w' ? 'b' : 'w');
      } else { setSelected(cell && cell.color === turn ? [r, c] : null); }
    } else {
      if (cell && cell.color === turn) setSelected([r, c]);
    }
  };

  const reset = () => { setBoard(initBoard()); setSelected(null); setTurn('w'); setCaptured({ w: [], b: [] }); setStatus(''); };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex justify-between w-full items-center">
        <span className="text-xs text-white/60">{status || (turn === 'w' ? "White's turn" : "Black's turn")}</span>
        <button onClick={reset} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs">Reset</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 4 }}>
        {board.map((row, r) => row.map((cell, c) => {
          const light = (r + c) % 2 === 0;
          const isSel = selected && selected[0] === r && selected[1] === c;
          return (
            <button key={`${r}-${c}`} onClick={() => handleClick(r, c)}
              style={{
                width: 40, height: 40, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, cursor: 'pointer',
                background: isSel ? 'rgba(74,144,217,0.6)' : light ? '#b58863' : '#f0d9b5',
                boxShadow: isSel ? 'inset 0 0 8px rgba(74,144,217,0.8)' : 'none',
              }}>
              {cell?.piece || ''}
            </button>
          );
        }))}
      </div>
      <div className="flex justify-between w-full text-xs text-white/40">
        <span>♙ {captured.w.join('')}</span>
        <span>{captured.b.join('')} ♟</span>
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN MENU ═══════════════════════ */
export default function Games() {
  const [game, setGame] = useState('menu');

  const back = <button onClick={() => setGame('menu')} className="mb-3 text-xs text-white/40 hover:text-white/70 self-start flex items-center gap-1">← Back to Games</button>;

  if (game === 'snake') return <div className="h-full bg-[#0a0a0a] flex flex-col p-4 overflow-auto">{back}<SnakeGame /></div>;
  if (game === 'minesweeper') return <div className="h-full bg-[#0a0a0a] flex flex-col p-4 overflow-auto">{back}<Minesweeper /></div>;
  if (game === 'tetris') return <div className="h-full bg-[#0a0a0a] flex flex-col p-4 overflow-auto">{back}<TetrisGame /></div>;
  if (game === '2048') return <div className="h-full bg-[#0a0a0a] flex flex-col p-4 overflow-auto">{back}<Game2048 /></div>;
  if (game === 'flappy') return <div className="h-full bg-[#0a0a0a] flex flex-col p-4 overflow-auto">{back}<FlappyBird /></div>;
  if (game === 'pong') return <div className="h-full bg-[#0a0a0a] flex flex-col p-4 overflow-auto">{back}<PongGame /></div>;
  if (game === 'chess') return <div className="h-full bg-[#0a0a0a] flex flex-col p-4 overflow-auto">{back}<ChessGame /></div>;

  const games = [
    { id: 'snake', label: 'Snake', icon: '🐍', color: 'from-green-600 to-emerald-900', tag: 'Classic' },
    { id: 'minesweeper', label: 'Minesweeper', icon: '💣', color: 'from-gray-600 to-gray-900', tag: 'Classic' },
    { id: 'tetris', label: 'Tetris', icon: '🟦', color: 'from-cyan-600 to-blue-900', tag: 'Classic' },
    { id: '2048', label: '2048', icon: '🔢', color: 'from-amber-500 to-orange-900', tag: 'Premium' },
    { id: 'flappy', label: 'Flappy Bird', icon: '🐦', color: 'from-yellow-500 to-green-900', tag: 'Premium' },
    { id: 'pong', label: 'Pong', icon: '🏓', color: 'from-blue-500 to-indigo-900', tag: 'Premium' },
    { id: 'chess', label: 'Chess', icon: '♟️', color: 'from-purple-500 to-slate-900', tag: 'Premium' },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] flex flex-col items-center p-6 overflow-auto">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">🎮</span>
        <h2 className="text-xl font-bold text-white/90">Games Arcade</h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold uppercase tracking-wider">Premium</span>
      </div>
      <p className="text-xs text-white/40 mb-5">7 games • Use keyboard to play</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full max-w-lg">
        {games.map(g => (
          <button key={g.id} onClick={() => setGame(g.id)}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-b ${g.color} border border-white/10 hover:scale-105 hover:shadow-xl hover:shadow-white/5 transition-all group`}>
            {g.tag === 'Premium' && <span className="absolute top-1 right-1 text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/80 text-white font-bold">★</span>}
            <span className="text-3xl group-hover:scale-110 transition-transform">{g.icon}</span>
            <span className="text-[11px] font-medium text-white/90">{g.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

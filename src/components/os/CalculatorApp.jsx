import { useState, useEffect, useCallback } from 'react';

const BTN = 'flex items-center justify-center rounded text-sm font-medium cursor-pointer select-none transition-all active:scale-95 h-11';
const NUM = `${BTN} bg-white/90 hover:bg-white text-gray-800 shadow-sm border border-gray-200`;
const OP  = `${BTN} bg-blue-500/90 hover:bg-blue-500 text-white shadow-sm`;
const FN  = `${BTN} bg-gray-200/90 hover:bg-gray-300 text-gray-700 shadow-sm`;
const EQ  = `${BTN} bg-blue-600 hover:bg-blue-700 text-white shadow-md col-span-1`;

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [newNum, setNewNum] = useState(true);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState('standard'); // standard | scientific

  const input = useCallback((val) => {
    if (newNum) { setDisplay(val==='.'?'0.':val); setNewNum(false); }
    else {
      if (val==='.' && display.includes('.')) return;
      setDisplay(d => d==='0'&&val!=='.' ? val : d+val);
    }
  }, [newNum, display]);

  const setOperator = useCallback((o) => {
    setPrev(parseFloat(display));
    setOp(o);
    setNewNum(true);
  }, [display]);

  const calculate = useCallback(() => {
    if (op===null || prev===null) return;
    const cur = parseFloat(display);
    let result;
    switch(op) {
      case '+': result=prev+cur; break;
      case '-': result=prev-cur; break;
      case '×': result=prev*cur; break;
      case '÷': result=cur===0?'Error':prev/cur; break;
      case '%': result=prev*(cur/100); break;
      case 'xʸ': result=Math.pow(prev,cur); break;
      default: result=cur;
    }
    const res = result==='Error'?'Error':parseFloat(result.toFixed(10)).toString();
    setHistory(h=>[`${prev} ${op} ${cur} = ${res}`,...h.slice(0,9)]);
    setDisplay(res);
    setPrev(null); setOp(null); setNewNum(true);
  }, [display, op, prev]);

  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); setNewNum(true); };
  const backspace = () => { if (newNum) return; setDisplay(d=>d.length>1?d.slice(0,-1):'0'); };
  const negate = () => setDisplay(d=>d.startsWith('-')?d.slice(1):'-'+d);
  const percent = () => setDisplay(d=>(parseFloat(d)/100).toString());
  const sciFunc = (fn) => {
    const n=parseFloat(display);
    const map = { sin:Math.sin(n*Math.PI/180), cos:Math.cos(n*Math.PI/180), tan:Math.tan(n*Math.PI/180), log:Math.log10(n), ln:Math.log(n), '√':Math.sqrt(n), 'x²':n*n, 'π':Math.PI, 'e':Math.E };
    const r=map[fn];
    setDisplay(parseFloat(r.toFixed(10)).toString());
    setNewNum(true);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key>='0'&&e.key<='9') input(e.key);
      else if (e.key==='.') input('.');
      else if (e.key==='+') setOperator('+');
      else if (e.key==='-') setOperator('-');
      else if (e.key==='*') setOperator('×');
      else if (e.key==='/') { e.preventDefault(); setOperator('÷'); }
      else if (e.key==='Enter'||e.key==='=') calculate();
      else if (e.key==='Backspace') backspace();
      else if (e.key==='Escape') clear();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [input, setOperator, calculate, backspace]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-3 gap-2">
      {/* Mode tabs */}
      <div className="flex gap-1 text-xs">
        {['standard','scientific'].map(m=>(
          <button key={m} onClick={()=>setMode(m)} className={`px-3 py-1 rounded capitalize transition-all ${mode===m?'bg-blue-600 text-white':'bg-white/60 text-gray-600 hover:bg-white'}`}>{m}</button>
        ))}
      </div>

      {/* Display */}
      <div className="bg-white/80 rounded-xl p-4 shadow-inner border border-gray-200">
        {op && <div className="text-xs text-gray-400 text-right">{prev} {op}</div>}
        <div className="text-right text-3xl font-light text-gray-800 truncate">{display}</div>
      </div>

      {/* Scientific row */}
      {mode==='scientific' && (
        <div className="grid grid-cols-5 gap-1">
          {['sin','cos','tan','log','ln','√','x²','π','e','xʸ'].map(f=>(
            <button key={f} onClick={()=>sciFunc(f)} className={`${FN} text-xs h-9`}>{f}</button>
          ))}
        </div>
      )}

      {/* Standard buttons */}
      <div className="grid grid-cols-4 gap-1 flex-1">
        {[
          {l:'%',c:FN,a:percent},{l:'CE',c:FN,a:()=>setDisplay('0')},{l:'C',c:FN,a:clear},{l:'⌫',c:FN,a:backspace},
          {l:'1/x',c:FN,a:()=>setDisplay((1/parseFloat(display)).toString())},{l:'x²',c:FN,a:()=>sciFunc('x²')},{l:'√',c:FN,a:()=>sciFunc('√')},{l:'÷',c:OP,a:()=>setOperator('÷')},
          {l:'7',c:NUM,a:()=>input('7')},{l:'8',c:NUM,a:()=>input('8')},{l:'9',c:NUM,a:()=>input('9')},{l:'×',c:OP,a:()=>setOperator('×')},
          {l:'4',c:NUM,a:()=>input('4')},{l:'5',c:NUM,a:()=>input('5')},{l:'6',c:NUM,a:()=>input('6')},{l:'−',c:OP,a:()=>setOperator('-')},
          {l:'1',c:NUM,a:()=>input('1')},{l:'2',c:NUM,a:()=>input('2')},{l:'3',c:NUM,a:()=>input('3')},{l:'+',c:OP,a:()=>setOperator('+')},
          {l:'±',c:NUM,a:negate},{l:'0',c:NUM,a:()=>input('0')},{l:'.',c:NUM,a:()=>input('.')},{l:'=',c:EQ,a:calculate},
        ].map((b,i)=>(
          <button key={i} onClick={b.a} className={b.c}>{b.l}</button>
        ))}
      </div>

      {/* History */}
      {history.length>0 && (
        <div className="bg-white/50 rounded-lg p-2 max-h-24 overflow-y-auto">
          <div className="text-[10px] text-gray-400 mb-1">History</div>
          {history.map((h,i)=>(
            <div key={i} className="text-xs text-gray-600 py-0.5 border-b border-gray-100 last:border-0 cursor-pointer hover:text-blue-600"
              onClick={()=>{const r=h.split('= ')[1];if(r){setDisplay(r);setNewNum(true);}}}>{h}</div>
          ))}
        </div>
      )}
    </div>
  );
}

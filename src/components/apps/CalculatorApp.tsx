import React, { useState, useEffect } from 'react';
import {
  Calculator as CalcIcon,
  Delete,
  RotateCcw,
  Clock,
  Copy,
  Check,
  Binary,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

type CalcMode = 'standard' | 'scientific' | 'programmer';

interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [formula, setFormula] = useState<string>('');
  const [mode, setMode] = useState<CalcMode>('standard');
  const [memory, setMemory] = useState<number>(0);
  const [isRad, setIsRad] = useState<boolean>(true);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Parse current numeric value
  const currentValue = parseFloat(display) || 0;

  // Programmer values
  const intVal = Math.floor(currentValue) || 0;
  const hexVal = (intVal >>> 0).toString(16).toUpperCase();
  const decVal = intVal.toString(10);
  const octVal = (intVal >>> 0).toString(8);
  const binVal = (intVal >>> 0).toString(2).padStart(8, '0');

  // Keyboard input handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        performOperation(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        performOperation('=');
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === '%') {
        inputPercent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, prevValue, operation, waitingForOperand, formula]);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setWaitingForOperand(false);
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setFormula('');
  };

  const handleBackspace = () => {
    if (waitingForOperand) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const toggleSign = () => {
    const newValue = parseFloat(display) * -1;
    setDisplay(String(newValue));
  };

  const inputPercent = () => {
    const currentValue = parseFloat(display);
    if (currentValue === 0) return;
    const fixedDigits = display.replace(/^-?\d*\.?/, '');
    const newValue = parseFloat(display) / 100;
    setDisplay(String(newValue.toFixed(fixedDigits.length + 2)));
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setFormula(`${inputValue} ${nextOperation}`);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      if (operation === '+') newValue = currentValue + inputValue;
      else if (operation === '-') newValue = currentValue - inputValue;
      else if (operation === '*') newValue = currentValue * inputValue;
      else if (operation === '/') newValue = inputValue !== 0 ? currentValue / inputValue : 0;
      else if (operation === '^') newValue = Math.pow(currentValue, inputValue);
      else if (operation === '&') newValue = (currentValue | 0) & (inputValue | 0);
      else if (operation === '|') newValue = (currentValue | 0) | (inputValue | 0);
      else if (operation === '^XOR') newValue = (currentValue | 0) ^ (inputValue | 0);

      // Clean up float decimals
      const rounded = Math.round(newValue * 1e10) / 1e10;

      if (nextOperation === '=') {
        const histItem: CalculationHistoryItem = {
          id: String(Date.now()),
          expression: `${formula} ${inputValue}`,
          result: String(rounded),
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setHistory((prev) => [histItem, ...prev.slice(0, 40)]);
        setFormula('');
        setPrevValue(null);
      } else {
        setFormula(`${rounded} ${nextOperation}`);
        setPrevValue(rounded);
      }

      setDisplay(String(rounded));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation === '=' ? null : nextOperation);
  };

  // Scientific functions
  const performScientific = (fn: string) => {
    const val = parseFloat(display);
    let result = val;

    switch (fn) {
      case 'sin':
        result = Math.sin(isRad ? val : (val * Math.PI) / 180);
        break;
      case 'cos':
        result = Math.cos(isRad ? val : (val * Math.PI) / 180);
        break;
      case 'tan':
        result = Math.tan(isRad ? val : (val * Math.PI) / 180);
        break;
      case 'sqrt':
        result = Math.sqrt(val);
        break;
      case 'sqr':
        result = val * val;
        break;
      case 'log':
        result = Math.log10(val);
        break;
      case 'ln':
        result = Math.log(val);
        break;
      case 'inv':
        result = val !== 0 ? 1 / val : 0;
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      case 'fact':
        let f = 1;
        for (let i = 2; i <= Math.min(Math.floor(val), 20); i++) f *= i;
        result = f;
        break;
    }

    const clean = Math.round(result * 1e10) / 1e10;
    setDisplay(String(clean));
    setWaitingForOperand(true);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white font-sans select-none overflow-hidden">
      {/* Top Header & Mode Switcher */}
      <div className="p-3 bg-slate-900/80 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shadow-md">
            <CalcIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">Calculadora InoveCloud</span>
        </div>

        {/* Mode Pills */}
        <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-lg border border-white/10 text-[11px]">
          <button
            onClick={() => setMode('standard')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              mode === 'standard' ? 'bg-orange-500 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Padrão
          </button>
          <button
            onClick={() => setMode('scientific')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              mode === 'scientific' ? 'bg-orange-500 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Científica
          </button>
          <button
            onClick={() => setMode('programmer')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              mode === 'programmer' ? 'bg-orange-500 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Programador
          </button>
        </div>

        {/* History Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-1.5 rounded-lg border transition cursor-pointer text-xs flex items-center space-x-1 ${
            showHistory
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
          }`}
          title="Histórico de Cálculos"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Fita ({history.length})</span>
        </button>
      </div>

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: Calculator Body */}
        <div className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full justify-between">
          {/* Display screen */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 shadow-inner flex flex-col justify-end min-h-[110px] space-y-1 relative group">
            {/* Memory & Formula header */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{memory !== 0 ? `M = ${memory}` : ''}</span>
              <span className="truncate max-w-[280px]">{formula}</span>
            </div>

            {/* Main Numeric Display */}
            <div className="flex items-baseline justify-between">
              <button
                onClick={copyResult}
                className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs flex items-center space-x-1"
                title="Copiar resultado"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tight text-right text-white break-all overflow-x-auto">
                {display}
              </div>
            </div>
          </div>

          {/* Programmer base indicators */}
          {mode === 'programmer' && (
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-1.5 rounded bg-white/5">
                <span className="text-orange-400 text-[10px] block">HEX</span>
                <span className="text-white font-bold truncate block">{hexVal}</span>
              </div>
              <div className="p-1.5 rounded bg-white/5">
                <span className="text-cyan-400 text-[10px] block">DEC</span>
                <span className="text-white font-bold truncate block">{decVal}</span>
              </div>
              <div className="p-1.5 rounded bg-white/5">
                <span className="text-emerald-400 text-[10px] block">OCT</span>
                <span className="text-white font-bold truncate block">{octVal}</span>
              </div>
              <div className="p-1.5 rounded bg-white/5">
                <span className="text-purple-400 text-[10px] block">BIN</span>
                <span className="text-white font-bold truncate block text-[11px]">{binVal}</span>
              </div>
            </div>
          )}

          {/* Scientific buttons strip */}
          {mode === 'scientific' && (
            <div className="grid grid-cols-5 gap-2 text-xs">
              <button
                onClick={() => setIsRad(!isRad)}
                className={`py-2 rounded-xl font-bold border transition ${
                  isRad ? 'bg-cyan-600/30 border-cyan-500/40 text-cyan-300' : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                {isRad ? 'RAD' : 'DEG'}
              </button>
              <button onClick={() => performScientific('sin')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5">sin</button>
              <button onClick={() => performScientific('cos')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5">cos</button>
              <button onClick={() => performScientific('tan')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5">tan</button>
              <button onClick={() => performScientific('pi')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-white/5 font-serif font-bold">π</button>
              <button onClick={() => performScientific('sqrt')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5">√x</button>
              <button onClick={() => performScientific('sqr')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5">x²</button>
              <button onClick={() => performOperation('^')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5">xʸ</button>
              <button onClick={() => performScientific('ln')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5">ln</button>
              <button onClick={() => performScientific('log')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5">log</button>
            </div>
          )}

          {/* Programmer Bitwise strip */}
          {mode === 'programmer' && (
            <div className="grid grid-cols-4 gap-2 text-xs">
              <button onClick={() => performOperation('&')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-bold border border-white/5">AND</button>
              <button onClick={() => performOperation('|')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-bold border border-white/5">OR</button>
              <button onClick={() => performOperation('^XOR')} className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-bold border border-white/5">XOR</button>
              <button
                onClick={() => {
                  const v = ~parseInt(display, 10);
                  setDisplay(String(v));
                  setWaitingForOperand(true);
                }}
                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-bold border border-white/5"
              >
                NOT
              </button>
            </div>
          )}

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {/* Row 1 */}
            <button
              onClick={clearAll}
              className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-sm shadow border border-white/5 transition active:scale-95"
            >
              AC
            </button>
            <button
              onClick={toggleSign}
              className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm shadow border border-white/5 transition active:scale-95"
            >
              ±
            </button>
            <button
              onClick={inputPercent}
              className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm shadow border border-white/5 transition active:scale-95"
            >
              %
            </button>
            <button
              onClick={() => performOperation('/')}
              className={`py-3.5 rounded-2xl font-bold text-base shadow transition active:scale-95 flex items-center justify-center ${
                operation === '/' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white'
              }`}
            >
              ÷
            </button>

            {/* Row 2 */}
            <button onClick={() => inputDigit('7')} className="py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg shadow border border-white/5 transition active:scale-95">7</button>
            <button onClick={() => inputDigit('8')} className="py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg shadow border border-white/5 transition active:scale-95">8</button>
            <button onClick={() => inputDigit('9')} className="py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg shadow border border-white/5 transition active:scale-95">9</button>
            <button
              onClick={() => performOperation('*')}
              className={`py-3.5 rounded-2xl font-bold text-base shadow transition active:scale-95 flex items-center justify-center ${
                operation === '*' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white'
              }`}
            >
              ×
            </button>

            {/* Row 3 */}
            <button onClick={() => inputDigit('4')} className="py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg shadow border border-white/5 transition active:scale-95">4</button>
            <button onClick={() => inputDigit('5')} className="py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg shadow border border-white/5 transition active:scale-95">5</button>
            <button onClick={() => inputDigit('6')} className="py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg shadow border border-white/5 transition active:scale-95">6</button>
            <button
              onClick={() => performOperation('-')}
              className={`py-3.5 rounded-2xl font-bold text-base shadow transition active:scale-95 flex items-center justify-center ${
                operation === '-' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white'
              }`}
            >
              −
            </button>

            {/* Row 4 */}
            <button onClick={() => inputDigit('1')} className="py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg shadow border border-white/5 transition active:scale-95">1</button>
            <button onClick={() => inputDigit('2')} className="py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg shadow border border-white/5 transition active:scale-95">2</button>
            <button onClick={() => inputDigit('3')} className="py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg shadow border border-white/5 transition active:scale-95">3</button>
            <button
              onClick={() => performOperation('+')}
              className={`py-3.5 rounded-2xl font-bold text-base shadow transition active:scale-95 flex items-center justify-center ${
                operation === '+' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white'
              }`}
            >
              +
            </button>

            {/* Row 5 */}
            <button onClick={() => inputDigit('0')} className="col-span-2 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg shadow border border-white/5 transition active:scale-95 pl-6 text-left">0</button>
            <button onClick={inputDecimal} className="py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg shadow border border-white/5 transition active:scale-95">.</button>
            <button
              onClick={() => performOperation('=')}
              className="py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg shadow-lg shadow-orange-500/30 transition active:scale-95 flex items-center justify-center"
            >
              =
            </button>
          </div>
        </div>

        {/* Right: Calculation History Tape Drawer */}
        {showHistory && (
          <div className="w-64 border-l border-white/10 bg-slate-900/70 p-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  Histórico de Fita
                </span>
                <button
                  onClick={() => setHistory([])}
                  className="text-[10px] text-slate-400 hover:text-red-400 transition"
                  title="Limpar histórico"
                >
                  Limpar
                </button>
              </div>

              <div className="overflow-y-auto max-h-[380px] space-y-2 pr-1">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    Nenhum cálculo registrado ainda.
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setDisplay(item.result)}
                      className="p-2.5 rounded-xl bg-black/40 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/30 transition cursor-pointer text-right group"
                    >
                      <div className="text-[10px] text-slate-400 font-mono">{item.expression} =</div>
                      <div className="text-sm font-bold text-white font-mono group-hover:text-orange-400">{item.result}</div>
                      <div className="text-[9px] text-slate-500 text-left mt-0.5">{item.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-[10px] text-slate-400 text-center">
              Dica: Digite no teclado físico ou no numpad.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

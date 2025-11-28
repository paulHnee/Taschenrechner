'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Button component defined outside of the main component
const Button = ({ 
  onClick, 
  className = '', 
  children, 
  variant = 'default' 
}: { 
  onClick: () => void; 
  className?: string; 
  children: React.ReactNode;
  variant?: 'default' | 'operator' | 'function' | 'equals' | 'clear';
}) => {
  const baseClasses = 'h-14 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-md';
  
  const variantClasses = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    operator: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30',
    function: 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/30',
    equals: 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30',
    clear: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default function ScienceCalculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [memory, setMemory] = useState(0);
  const [isRadian, setIsRadian] = useState(true);
  const [showGraph, setShowGraph] = useState(false);
  const [currentFunction, setCurrentFunction] = useState('sin(x)');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Graph drawing function
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up coordinate system
    const xMin = -2 * Math.PI;
    const xMax = 2 * Math.PI;
    const yMin = -3;
    const yMax = 3;
    
    const scaleX = width / (xMax - xMin);
    const scaleY = height / (yMax - yMin);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      const canvasX = (x - xMin) * scaleX;
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      const canvasY = height - (y - yMin) * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    
    // X-axis
    const yAxisPos = height - (0 - yMin) * scaleY;
    ctx.beginPath();
    ctx.moveTo(0, yAxisPos);
    ctx.lineTo(width, yAxisPos);
    ctx.stroke();
    
    // Y-axis
    const xAxisPos = (0 - xMin) * scaleX;
    ctx.beginPath();
    ctx.moveTo(xAxisPos, 0);
    ctx.lineTo(xAxisPos, height);
    ctx.stroke();

    // Draw function
    const evaluateFunction = (x: number): number => {
      const angle = isRadian ? x : x * 180 / Math.PI;
      
      switch (currentFunction) {
        case 'sin(x)':
          return Math.sin(angle);
        case 'cos(x)':
          return Math.cos(angle);
        case 'tan(x)':
          return Math.tan(angle);
        case 'x²':
          return x * x / 4; // Scale down for visibility
        case 'ln(x)':
          return x > 0 ? Math.log(x) : NaN;
        case '√x':
          return x >= 0 ? Math.sqrt(Math.abs(x)) : NaN;
        case '1/x':
          return x !== 0 ? 1/x : NaN;
        case 'e^x':
          return Math.exp(x/2); // Scale down for visibility
        default:
          return Math.sin(x);
      }
    };

    // Draw function curve
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    let firstPoint = true;
    const step = (xMax - xMin) / width;
    
    for (let x = xMin; x <= xMax; x += step) {
      const y = evaluateFunction(x);
      
      if (!isNaN(y) && y >= yMin && y <= yMax) {
        const canvasX = (x - xMin) * scaleX;
        const canvasY = height - (y - yMin) * scaleY;
        
        if (firstPoint) {
          ctx.moveTo(canvasX, canvasY);
          firstPoint = false;
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      } else {
        firstPoint = true;
      }
    }
    
    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText(currentFunction, 10, 20);
    ctx.fillText(`Mode: ${isRadian ? 'Radians' : 'Degrees'}`, 10, 40);

    // Add integral approximation visualization
    if (currentFunction === 'sin(x)' || currentFunction === 'cos(x)') {
      ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
      const integralStart = -Math.PI;
      const integralEnd = Math.PI;
      const rectangles = 20;
      const rectWidth = (integralEnd - integralStart) / rectangles;
      
      for (let i = 0; i < rectangles; i++) {
        const x = integralStart + i * rectWidth;
        const y = evaluateFunction(x + rectWidth / 2);
        
        if (!isNaN(y)) {
          const canvasX = (x - xMin) * scaleX;
          const canvasY = height - (Math.max(0, y) - yMin) * scaleY;
          const rectCanvasWidth = rectWidth * scaleX;
          const rectHeight = Math.abs(y) * scaleY;
          
          ctx.fillRect(canvasX, canvasY, rectCanvasWidth, y > 0 ? -rectHeight : rectHeight);
        }
      }
    }
  }, [currentFunction, isRadian]);

  useEffect(() => {
    if (showGraph && canvasRef.current) {
      drawGraph();
    }
  }, [showGraph, drawGraph]);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '^':
        return Math.pow(firstValue, secondValue);
      default:
        return secondValue;
    }
  };

  const performScientificFunction = (func: string) => {
    const currentValue = parseFloat(display);
    let result: number;

    switch (func) {
      case 'sin':
        result = Math.sin(isRadian ? currentValue : currentValue * Math.PI / 180);
        setCurrentFunction('sin(x)');
        break;
      case 'cos':
        result = Math.cos(isRadian ? currentValue : currentValue * Math.PI / 180);
        setCurrentFunction('cos(x)');
        break;
      case 'tan':
        result = Math.tan(isRadian ? currentValue : currentValue * Math.PI / 180);
        setCurrentFunction('tan(x)');
        break;
      case 'ln':
        result = Math.log(currentValue);
        setCurrentFunction('ln(x)');
        break;
      case 'log':
        result = Math.log10(currentValue);
        setCurrentFunction('log(x)');
        break;
      case '√':
        result = Math.sqrt(currentValue);
        setCurrentFunction('√x');
        break;
      case 'x²':
        result = currentValue * currentValue;
        setCurrentFunction('x²');
        break;
      case '1/x':
        result = 1 / currentValue;
        setCurrentFunction('1/x');
        break;
      case 'π':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        setCurrentFunction('e^x');
        break;
      case '!':
        result = factorial(currentValue);
        break;
      case '+/-':
        result = currentValue * -1;
        break;
      case '∫':
        // Simple numerical integration using trapezoidal rule
        result = numericalIntegral(currentValue);
        break;
      case 'd/dx':
        // Simple numerical derivative
        result = numericalDerivative(currentValue);
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setWaitingForNewValue(true);
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  const numericalIntegral = (x: number): number => {
    // Simple trapezoidal rule for sin(x) from 0 to x
    const steps = 100;
    const dx = x / steps;
    let sum = 0;
    
    for (let i = 0; i <= steps; i++) {
      const xi = i * dx;
      const weight = i === 0 || i === steps ? 0.5 : 1;
      sum += weight * Math.sin(isRadian ? xi : xi * Math.PI / 180);
    }
    
    return sum * dx;
  };

  const numericalDerivative = (x: number): number => {
    // Simple numerical derivative for sin(x)
    const h = 0.0001;
    const angle1 = isRadian ? (x + h) : (x + h) * Math.PI / 180;
    const angle2 = isRadian ? (x - h) : (x - h) * Math.PI / 180;
    return (Math.sin(angle1) - Math.sin(angle2)) / (2 * h);
  };

  const memoryFunction = (func: string) => {
    const currentValue = parseFloat(display);
    
    switch (func) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(String(memory));
        setWaitingForNewValue(true);
        break;
      case 'M+':
        setMemory(memory + currentValue);
        break;
      case 'M-':
        setMemory(memory - currentValue);
        break;
      case 'MS':
        setMemory(currentValue);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 transition-all duration-500 ${
        showGraph ? 'w-full max-w-6xl' : 'w-full max-w-md'
      }`}>
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            🧮 Scientific Calculator with Graphing
          </h1>
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setIsRadian(!isRadian)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isRadian 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'
              }`}
            >
              RAD
            </button>
            <button
              onClick={() => setIsRadian(!isRadian)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !isRadian 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'
              }`}
            >
              DEG
            </button>
            <button
              onClick={() => setShowGraph(!showGraph)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              {showGraph ? 'Hide' : 'Show'} Graph
            </button>
          </div>
        </div>

        <div className={`${showGraph ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
          {/* Calculator Section */}
          <div>
            {/* Display */}
            <div className="bg-black rounded-xl p-4 mb-6 text-right">
              <div className="text-3xl font-mono text-green-400 min-h-[3rem] flex items-center justify-end overflow-hidden">
                {display}
              </div>
            </div>

            {/* Memory Functions */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {['MC', 'MR', 'M+', 'M-', 'MS'].map((func) => (
                <Button
                  key={func}
                  onClick={() => memoryFunction(func)}
                  variant="function"
                  className="text-sm"
                >
                  {func}
                </Button>
              ))}
            </div>

            {/* Advanced Functions */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {['∫', 'd/dx', 'sin', 'cos'].map((func) => (
                <Button
                  key={func}
                  onClick={() => performScientificFunction(func)}
                  variant="function"
                  className="text-sm"
                >
                  {func}
                </Button>
              ))}
              {['tan', 'ln', 'log', '√'].map((func) => (
                <Button
                  key={func}
                  onClick={() => performScientificFunction(func)}
                  variant="function"
                  className="text-sm"
                >
                  {func}
                </Button>
              ))}
              {['x²', '1/x', 'π', 'e'].map((func) => (
                <Button
                  key={func}
                  onClick={() => performScientificFunction(func)}
                  variant="function"
                  className="text-sm"
                >
                  {func}
                </Button>
              ))}
              {['!', '^', '(', ')'].map((func) => (
                <Button
                  key={func}
                  onClick={() => func === '^' ? performOperation(func) : performScientificFunction(func)}
                  variant="function"
                  className="text-sm"
                >
                  {func}
                </Button>
              ))}
            </div>

            {/* Main Calculator Grid */}
            <div className="grid grid-cols-4 gap-3">
              <Button onClick={clear} variant="clear" className="col-span-2">
                Clear
              </Button>
              <Button onClick={() => performScientificFunction('+/-')} variant="operator">
                +/-
              </Button>
              <Button onClick={() => performOperation('÷')} variant="operator">
                ÷
              </Button>

              {['7', '8', '9'].map((num) => (
                <Button key={num} onClick={() => inputNumber(num)}>
                  {num}
                </Button>
              ))}
              <Button onClick={() => performOperation('×')} variant="operator">
                ×
              </Button>

              {['4', '5', '6'].map((num) => (
                <Button key={num} onClick={() => inputNumber(num)}>
                  {num}
                </Button>
              ))}
              <Button onClick={() => performOperation('-')} variant="operator">
                -
              </Button>

              {['1', '2', '3'].map((num) => (
                <Button key={num} onClick={() => inputNumber(num)}>
                  {num}
                </Button>
              ))}
              <Button onClick={() => performOperation('+')} variant="operator">
                +
              </Button>

              <Button onClick={() => inputNumber('0')} className="col-span-2">
                0
              </Button>
              <Button onClick={inputDecimal}>
                .
              </Button>
              <Button onClick={() => performOperation('=')} variant="equals">
                =
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
              Memory: {memory !== 0 ? memory : 'Empty'} | Mode: {isRadian ? 'Radians' : 'Degrees'}
            </div>
          </div>

          {/* Graph Section */}
          {showGraph && (
            <div className="bg-black rounded-xl p-4">
              <div className="mb-4">
                <h3 className="text-white text-lg font-semibold mb-2">Function Graph</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['sin(x)', 'cos(x)', 'tan(x)', 'x²', 'ln(x)', '√x', '1/x', 'e^x'].map((func) => (
                    <button
                      key={func}
                      onClick={() => setCurrentFunction(func)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        currentFunction === func
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                      }`}
                    >
                      {func}
                    </button>
                  ))}
                </div>
              </div>
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="w-full border border-gray-600 rounded"
                style={{ backgroundColor: '#111' }}
              />
              <div className="mt-4 text-sm text-gray-400">
                <p>Current function: <span className="text-green-400">{currentFunction}</span></p>
                <p>Green areas show integral approximation (for sin/cos)</p>
                <p>Use ∫ for numerical integration, d/dx for derivative</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

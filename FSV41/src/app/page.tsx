'use client';

import React, { useState } from 'react';

export default function ScienceCalculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [memory, setMemory] = useState(0);
  const [isRadian, setIsRadian] = useState(true);

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
        break;
      case 'cos':
        result = Math.cos(isRadian ? currentValue : currentValue * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(isRadian ? currentValue : currentValue * Math.PI / 180);
        break;
      case 'ln':
        result = Math.log(currentValue);
        break;
      case 'log':
        result = Math.log10(currentValue);
        break;
      case '√':
        result = Math.sqrt(currentValue);
        break;
      case 'x²':
        result = currentValue * currentValue;
        break;
      case '1/x':
        result = 1 / currentValue;
        break;
      case 'π':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      case '!':
        result = factorial(currentValue);
        break;
      case '+/-':
        result = currentValue * -1;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            🧮 Scientific Calculator
          </h1>
          <div className="flex justify-center gap-2">
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
          </div>
        </div>

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

        {/* Scientific Functions */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {['sin', 'cos', 'tan', 'ln'].map((func) => (
            <Button
              key={func}
              onClick={() => performScientificFunction(func)}
              variant="function"
              className="text-sm"
            >
              {func}
            </Button>
          ))}
          {['log', '√', 'x²', '1/x'].map((func) => (
            <Button
              key={func}
              onClick={() => performScientificFunction(func)}
              variant="function"
              className="text-sm"
            >
              {func}
            </Button>
          ))}
          {['π', 'e', '!', '^'].map((func) => (
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
    </div>
  );
}

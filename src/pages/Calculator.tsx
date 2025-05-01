import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Calculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      try {
        // Using eval is generally discouraged in production due to security risks,
        // but for a simple personal calculator mini-app, it's the easiest way.
        // For a public app, a safer expression parser would be needed.
        setResult(eval(input).toString());
      } catch (error) {
        setResult('Error');
      }
    } else if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === 'DEL') {
      setInput(input.slice(0, -1));
    }
    else {
      setInput(input + value);
    }
  };

  const buttons = [
    'C', 'DEL', '/', '*',
    '7', '8', '9', '-',
    '4', '5', '6', '+',
    '1', '2', '3', '=',
    '0', '.',
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Mini Apps</h3>
        <ul className="flex-grow space-y-2">
          <li>
            <Link
              to="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/notes"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Notes
            </Link>
          </li>
           <li>
            <Link
              to="/gallery"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Gallery
            </Link>
          </li>
           <li>
            <Link
              to="/messaging"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Messaging
            </Link>
          </li>
           <li>
            <Link
              to="/calculator"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Calculator
            </Link>
          </li>
          {/* Add links for future mini-apps here */}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto flex justify-center items-start"> {/* Center content horizontally */}
        <Card className="w-full max-w-sm"> {/* Limit card width */}
          <CardHeader>
            <CardTitle className="text-center">Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              value={result || input} // Show result if available, otherwise show input
              readOnly
              className="text-right text-2xl p-4 h-auto"
            />
            <div className="grid grid-cols-4 gap-2">
              {buttons.map((btn) => (
                <Button
                  key={btn}
                  onClick={() => handleButtonClick(btn)}
                  className={cn(
                    "text-lg p-4 h-auto",
                    btn === '=' ? 'col-span-2 bg-blue-500 hover:bg-blue-600 text-white' : '', // Span 2 columns for equals
                    btn === 'C' || btn === 'DEL' ? 'bg-red-500 hover:bg-red-600 text-white' : '', // Red for clear/delete
                    ['/', '*', '-', '+'].includes(btn) ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' : '' // Gray for operators
                  )}
                >
                  {btn}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calculator;
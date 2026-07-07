import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const AIProcessing = () => {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    "Understanding your request...",
    "Identifying the development need...",
    "Analyzing location context...",
    "Preparing your request for review..."
  ];

  useEffect(() => {
    const totalTime = 4000;
    const interval = totalTime / steps.length;
    
    const timer = setInterval(() => {
      setStepIndex(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, interval);

    const completeTimer = setTimeout(() => {
      navigate('/ai-confirmation');
    }, totalTime + 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(completeTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-teal-700 flex flex-col items-center justify-center p-6 text-white text-center transition-colors">
      <Loader2 size={64} className="animate-spin text-teal-300 mb-8" />
      
      <div className="h-16">
        <h2 className="text-xl font-medium animate-pulse">
          {steps[stepIndex]}
        </h2>
      </div>
      
      <div className="w-full max-w-xs bg-teal-800 rounded-full h-2 mt-8 overflow-hidden">
        <div 
          className="bg-teal-300 h-full transition-all duration-500 ease-out" 
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

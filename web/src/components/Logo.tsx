import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ShieldCheck size={32} />
      <span className="text-xl font-bold tracking-tight">GovInsight-AI</span>
    </div>
  );
};

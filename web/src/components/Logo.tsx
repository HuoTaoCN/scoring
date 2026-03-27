import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <ShieldCheck size={32} />
    {/* Removed redundant text here since it's displayed in App.tsx header */}
  </div>
);

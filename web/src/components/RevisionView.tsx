import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface RevisionViewProps {
  isAnalyzed: boolean;
  suggestedReply?: string;
}

export const RevisionView: React.FC<RevisionViewProps> = ({ isAnalyzed, suggestedReply }) => {
  const [copied, setCopied] = useState(false);

  if (!isAnalyzed) return null;
  if (!suggestedReply) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggestedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-2 shrink-0">
        <h3 className="font-bold text-green-800 text-sm">AI 建议优化回复</h3>
        <button 
          onClick={handleCopy}
          className="text-green-600 hover:text-green-800 p-1 rounded transition-colors flex items-center gap-1" 
          title="复制内容"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied && <span className="text-xs">已复制</span>}
        </button>
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed overflow-y-auto flex-1 font-mono bg-white/50 p-2 rounded border border-green-100">
        {suggestedReply}
      </div>
    </div>
  );
};

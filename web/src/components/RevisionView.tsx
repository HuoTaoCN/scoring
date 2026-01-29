import React from 'react';
import { Copy } from 'lucide-react';

interface RevisionViewProps {
  isAnalyzed: boolean;
  suggestedReply?: string;
}

export const RevisionView: React.FC<RevisionViewProps> = ({ isAnalyzed, suggestedReply }) => {
  if (!isAnalyzed) return null;
  if (!suggestedReply) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-2 shrink-0">
        <h3 className="font-bold text-green-800 text-sm">AI 建议优化回复</h3>
        <button className="text-green-600 hover:text-green-800" title="复制">
          <Copy size={14} />
        </button>
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed overflow-y-auto flex-1">
        {suggestedReply}
      </div>
    </div>
  );
};

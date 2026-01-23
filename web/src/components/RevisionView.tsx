import React from 'react';
import { AlertTriangle, FileText, CheckCircle, Copy } from 'lucide-react';

interface RevisionViewProps {
  isAnalyzed?: boolean;
  suggestedReply?: string;
}

export const RevisionView: React.FC<RevisionViewProps> = ({ isAnalyzed = false, suggestedReply }) => {
  if (!isAnalyzed) {
    return (
      <div className="flex-1 min-h-0 bg-white rounded-lg border border-blue-200 shadow-sm overflow-hidden ring-2 ring-blue-50 flex flex-col">
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-700" />
            <h3 className="font-bold text-blue-800">AI 建议回复</h3>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-gray-400">
          <div className="bg-gray-50 p-3 rounded-full mb-3">
            <FileText size={24} className="opacity-20" />
          </div>
          <p className="text-xs font-medium">待生成...</p>
        </div>
      </div>
    );
  }

  if (!suggestedReply) {
    return (
      <div className="flex-1 min-h-0 bg-white rounded-lg border border-blue-200 shadow-sm overflow-hidden ring-2 ring-blue-50 flex flex-col">
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-700" />
            <h3 className="font-bold text-blue-800">AI 建议回复</h3>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-green-600 bg-green-50/50">
          <div className="bg-green-100 p-3 rounded-full mb-3">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <p className="text-sm font-bold">回复质量优秀</p>
          <p className="text-xs text-green-700 mt-1 opacity-80">无需优化</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 bg-white rounded-lg border border-blue-200 shadow-sm overflow-hidden ring-2 ring-blue-50 flex flex-col">
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-blue-700" />
          <h3 className="font-bold text-blue-800">AI 建议回复</h3>
        </div>
        <button 
          className="text-blue-600 hover:text-blue-800 transition-colors"
          onClick={() => navigator.clipboard.writeText(suggestedReply)}
          title="复制内容"
        >
          <Copy size={16} />
        </button>
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
         <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap relative">
           {suggestedReply}
         </div>
         <div className="mt-2 flex items-start gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
           <AlertTriangle size={14} className="shrink-0 mt-0.5" />
           AI 已根据评分标准优化了回复内容（补充了缺失细节、调整了语气或修正了逻辑），请人工审核后使用。
         </div>
      </div>
    </div>
  );
};

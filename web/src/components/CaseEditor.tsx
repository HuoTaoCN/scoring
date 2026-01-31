import React from 'react';
import type { WorkOrderInput } from '../types/quality_inspection';
import { MessageSquare, FileText, Calendar, Edit3 } from 'lucide-react';

interface CaseEditorProps {
  input: WorkOrderInput;
  onChange: (newInput: WorkOrderInput) => void;
}

export const CaseEditor: React.FC<CaseEditorProps> = ({ input, onChange }) => {
  const { appeal_title, appeal_text, reply_text, metadata } = input;

  const handleMetadataChange = (field: keyof typeof metadata, value: string | number) => {
    onChange({
      ...input,
      metadata: {
        ...metadata,
        [field]: value,
      },
    });
  };

  const handleAppealTitleChange = (value: string) => {
    onChange({
      ...input,
      appeal_title: value,
    });
  };

  const handleAppealChange = (value: string) => {
    onChange({
      ...input,
      appeal_text: value,
    });
  };

  const handleReplyChange = (value: string) => {
    onChange({
      ...input,
      reply_text: value,
    });
  };

  return (
    <div className="flex flex-col lg:h-full h-auto gap-3 lg:overflow-hidden">
      {/* Title Header */}
      <div className="flex items-center gap-2 shrink-0">
        <Edit3 size={18} className="text-gray-600" />
        <h2 className="text-lg font-bold text-gray-800">1. 工单录入 (Appeal & Reply)</h2>
      </div>

      {/* Content Area */}
      <div className="flex-1 lg:overflow-y-auto overflow-visible min-h-0 lg:pr-1 space-y-3 flex flex-col">
        
        {/* Appeal Input (群众诉求) */}
        <div className="bg-white rounded-lg border border-purple-200 shadow-sm overflow-hidden ring-2 ring-purple-50 flex flex-col min-h-[180px]">
          <div className="bg-purple-50 border-b border-purple-100 px-3 py-2 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-purple-700" />
              <h3 className="font-bold text-purple-800 text-sm">群众诉求内容 (Appeal)</h3>
            </div>
          </div>
          <div className="px-3 py-2 border-b border-purple-50 bg-white">
            <input
              type="text"
              value={appeal_title || ''}
              onChange={(e) => handleAppealTitleChange(e.target.value)}
              placeholder="请输入诉求标题..."
              className="w-full text-sm font-bold text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>
          <div className="p-0 flex-1 relative">
            <textarea
              className="w-full h-full p-3 text-sm text-gray-700 bg-white resize-none focus:outline-none focus:bg-gray-50 transition-colors"
              value={appeal_text}
              onChange={(e) => handleAppealChange(e.target.value)}
              placeholder="请粘贴群众的具体诉求内容..."
            />
          </div>
        </div>

        <div className="relative shrink-0 py-1">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-2 text-xs text-gray-500 font-medium">VS (智能比对)</span>
          </div>
        </div>

        {/* Reply Input (办理结果) */}
        <div className="bg-white rounded-lg border border-blue-200 shadow-sm overflow-hidden ring-2 ring-blue-50 flex flex-col flex-1 min-h-[200px]">
          <div className="bg-blue-50 border-b border-blue-100 px-3 py-2">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-2">
              <div className="flex items-center gap-2 shrink-0">
                <FileText size={16} className="text-blue-700" />
                <h3 className="font-bold text-blue-800 whitespace-nowrap text-sm">办理结果/答复 (Reply)</h3>
              </div>
              
              {/* Metadata Controls */}
              <div className="flex flex-wrap gap-2 items-center ml-auto">
                 <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-blue-200 shadow-sm" title="办理时长 (天)">
                   <Calendar size={12} className="text-gray-500" />
                   <input 
                     type="number"
                     min="0"
                     value={metadata.duration_days}
                     onChange={(e) => handleMetadataChange('duration_days', parseInt(e.target.value) || 0)}
                     className="text-xs font-mono font-bold text-gray-700 w-8 outline-none bg-transparent text-center"
                   />
                   <span className="text-[10px] text-gray-400">天</span>
                </div>
                
                <select
                  value={metadata.category}
                  onChange={(e) => handleMetadataChange('category', e.target.value)}
                  className="px-2 py-1 text-xs rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <option value="咨询">咨询</option>
                  <option value="投诉">投诉</option>
                  <option value="求助">求助</option>
                  <option value="举报">举报</option>
                  <option value="意见建议">意见建议</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-0 flex-1 relative">
             <textarea
              className="w-full h-full p-3 text-sm text-gray-700 bg-white resize-none focus:outline-none focus:bg-gray-50 transition-colors"
              value={reply_text}
              onChange={(e) => handleReplyChange(e.target.value)}
              placeholder="请粘贴办理单位的回复/答复内容..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

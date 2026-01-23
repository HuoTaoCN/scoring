import React from 'react';

interface TranscriptViewProps {
  content: string;
  onUpdate: (value: string) => void;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({ content, onUpdate }) => {
  return (
    <textarea
      className="w-full h-full p-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
      value={content}
      onChange={(e) => onUpdate(e.target.value)}
      placeholder="在此输入或粘贴通话录音转写文本..."
    />
  );
};

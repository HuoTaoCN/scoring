import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import type { ScoreDimension } from '../types/quality_inspection';
import { Tooltip } from './Tooltip';

interface ScoreCardProps {
  title: string;
  data: ScoreDimension;
  maxScore: number;
  description: string[];
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ title, data, maxScore, description }) => {
  const percentage = (data.score / maxScore) * 100;
  const isGood = percentage >= 80;
  const isBad = percentage < 60;
  
  return (
    <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          <h4 className="font-bold text-sm text-gray-700">{title}</h4>
          <Tooltip 
            content={
              <div className="w-48">
                <div className="font-bold mb-1 border-b pb-1 text-gray-300">评分标准</div>
                <ul className="list-disc pl-3 space-y-1">
                  {description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            }
          >
            <HelpCircle size={12} className="text-gray-400 cursor-help hover:text-gray-600" />
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
           <span className={`text-sm font-bold ${isGood ? 'text-green-600' : isBad ? 'text-red-600' : 'text-yellow-600'}`}>
             {data.score}/{maxScore}
           </span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${isGood ? 'bg-green-500' : isBad ? 'bg-red-500' : 'bg-yellow-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-start">
         <div className="text-xs text-gray-500">
           {data.judgement}
         </div>
         {data.issues.length > 0 && (
           <div className="text-xs text-red-500 flex items-center gap-1">
             <AlertCircle size={12} />
             <span>{data.issues.length} 个问题</span>
           </div>
         )}
      </div>
    </div>
  );
};

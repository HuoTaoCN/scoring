import React from 'react';
import type { ScoreDimension } from '../types/quality_inspection';
import { Tooltip } from './Tooltip';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ScoreCardProps {
  title: string;
  data: ScoreDimension;
  maxScore: number;
  description?: string[];
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ title, data, maxScore, description }) => {
  const percentage = (data.score / maxScore) * 100;
  
  return (
    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm relative">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold text-gray-700">{title}</h3>
          {description && description.length > 0 && (
            <Tooltip
              content={
                <div className="w-64">
                  <div className="font-bold mb-2 text-gray-700 border-b pb-1">评分标准</div>
                  <ul className="space-y-1.5 text-gray-600">
                    {description.map((item, index) => (
                      <li key={index} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              }
            >
              <HelpCircle size={12} className="text-blue-400 cursor-help hover:text-blue-600 transition-colors" />
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
            {data.judgement}
          </span>
          <span className={clsx(
            "text-sm font-bold",
            percentage >= 90 ? "text-green-600" : percentage >= 60 ? "text-yellow-600" : "text-red-600"
          )}>
            {data.score} <span className="text-[10px] text-gray-400">/ {maxScore}</span>
          </span>
        </div>
      </div>
      
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
        <div 
          className={clsx(
            "h-1.5 rounded-full transition-all duration-500",
            percentage >= 90 ? "bg-green-500" : percentage >= 60 ? "bg-yellow-500" : "bg-red-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {data.issues.length > 0 ? (
        <ul className="space-y-1">
          {data.issues.map((d, i) => (
            <li key={i} className="text-xs text-red-600 flex items-start gap-1">
              <XCircle size={12} className="mt-0.5 shrink-0" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle size={12} />
          <span>无扣分项</span>
        </div>
      )}
    </div>
  );
};

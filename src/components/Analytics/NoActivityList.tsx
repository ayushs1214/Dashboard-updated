import React from 'react';
import { AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

interface NoActivityItem {
  name: string;
  lastActivity: string;
  additionalInfo?: {
    label: string;
    value: string | number;
  };
}

interface NoActivityListProps {
  title: string;
  items: NoActivityItem[];
  emptyMessage: string;
}

export function NoActivityList({ title, items, emptyMessage }: NoActivityListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h3>
      
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last activity: {formatDate(item.lastActivity)}
                  </p>
                </div>
              </div>
              {item.additionalInfo && (
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.additionalInfo.label}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.additionalInfo.value}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
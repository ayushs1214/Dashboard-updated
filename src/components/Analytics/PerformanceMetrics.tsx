import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

interface MetricCard {
  label: string;
  value: number;
  change: number;
  isCurrency?: boolean;
}

interface PerformanceMetricsProps {
  title: string;
  metrics: MetricCard[];
}

export function PerformanceMetrics({ title, metrics }: PerformanceMetricsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {metric.isCurrency ? formatCurrency(metric.value) : metric.value}
            </p>
            <div className="mt-1 flex items-center">
              {metric.change > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                metric.change > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {Math.abs(metric.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
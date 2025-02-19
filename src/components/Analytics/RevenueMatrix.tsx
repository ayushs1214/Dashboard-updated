import React from 'react';
import { formatCurrency } from '../../utils/helpers';

interface MatrixData {
  rowName: string;
  columns: {
    name: string;
    value: number;
  }[];
}

interface RevenueMatrixProps {
  title: string;
  data: MatrixData[];
  rowLabel: string;
  columnLabel: string;
}

export function RevenueMatrix({ title, data, rowLabel, columnLabel }: RevenueMatrixProps) {
  const columnNames = Array.from(
    new Set(data.flatMap(row => row.columns.map(col => col.name)))
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {rowLabel}
              </th>
              {columnNames.map(name => (
                <th key={name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {name}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map(row => {
              const rowTotal = row.columns.reduce((sum, col) => sum + col.value, 0);
              return (
                <tr key={row.rowName}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {row.rowName}
                  </td>
                  {columnNames.map(colName => {
                    const col = row.columns.find(c => c.name === colName);
                    return (
                      <td key={colName} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {col ? formatCurrency(col.value) : '₹0'}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(rowTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
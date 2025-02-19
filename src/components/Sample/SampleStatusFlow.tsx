import React from 'react';
import { CheckCircle, Clock, Printer, Package, Truck, Building2 } from 'lucide-react';

interface SampleStatusFlowProps {
  currentStatus: string;
  onUpdateStatus: (status: string) => void;
  isLoading?: boolean;
}

const statusFlow = [
  { id: 'order_received', label: 'Order Received', icon: CheckCircle },
  { id: 'design', label: 'Design', icon: Printer },
  { id: 'dealer_approval', label: 'Dealer Approval', icon: Building2 },
  { id: 'printing', label: 'Printing', icon: Printer },
  { id: 'warehouse', label: 'Warehouse', icon: Package },
  { id: 'ready_for_dispatch', label: 'Ready for Dispatch', icon: Package },
  { id: 'dispatched', label: 'Dispatched', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle }
];

export function SampleStatusFlow({ currentStatus, onUpdateStatus, isLoading }: SampleStatusFlowProps) {
  const currentIndex = statusFlow.findIndex(status => status.id === currentStatus);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-8 top-8 h-[calc(100%-4rem)] w-0.5 bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-8">
          {statusFlow.map((status, index) => {
            const Icon = status.icon;
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const isPending = index > currentIndex;

            return (
              <div key={status.id} className="relative flex items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-900/20'
                    : isCompleted
                    ? 'bg-green-100 dark:bg-green-900/20'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Icon className={`w-8 h-8 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`} />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className={`text-sm font-medium ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {status.label}
                  </h4>
                  {isActive && (
                    <div className="mt-2">
                      <button
                        onClick={() => onUpdateStatus(statusFlow[index + 1]?.id)}
                        disabled={isLoading || !statusFlow[index + 1]}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Updating...' : `Mark as ${statusFlow[index + 1]?.label || 'Complete'}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
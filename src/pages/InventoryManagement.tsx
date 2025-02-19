import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useSidebarStore } from '../store/sidebarStore';
import { StockFilter, type StockFilters } from '../components/Inventory/StockFilter';
import { StockCard } from '../components/Inventory/StockCard';
import { inventoryService } from '../services/inventoryService';

export function InventoryManagement() {
  const setCurrentPage = useSidebarStore((state) => state.setCurrentPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<StockFilters>({
    status: '',
    stockLevel: '',
    category: ''
  });
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
    const unsubscribe = inventoryService.subscribeToStockUpdates(loadInventory);
    return () => unsubscribe();
  }, []);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryService.getInventory();
      setInventory(data);
    } catch (err) {
      setError('Failed to load inventory');
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesCategory = !filters.category || item.category === filters.category;
    
    let matchesStockLevel = true;
    if (filters.stockLevel) {
      const stockPercentage = (item.currentStock / item.maxStock) * 100;
      switch (filters.stockLevel) {
        case 'high':
          matchesStockLevel = stockPercentage > 70;
          break;
        case 'medium':
          matchesStockLevel = stockPercentage >= 30 && stockPercentage <= 70;
          break;
        case 'low':
          matchesStockLevel = stockPercentage < 30;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesStockLevel;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Inventory Management</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <StockFilter
            filters={filters}
            onFilterChange={setFilters}
          />
          <button 
            onClick={() => setCurrentPage('addstock')}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Stock
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No items found matching your criteria.
            </p>
          </div>
        ) : (
          filteredInventory.map((item) => (
            <StockCard
              key={item.id}
              item={item}
            />
          ))
        )}
      </div>
    </div>
  );
}
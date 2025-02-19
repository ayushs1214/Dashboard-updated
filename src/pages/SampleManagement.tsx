import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { SampleRequestModal } from '../components/Sample/SampleRequestModal';
import { SampleDetailsModal } from '../components/Sample/SampleDetailsModal';
import { SampleFilter } from '../components/Sample/SampleFilter';
import { sampleService } from '../services/sampleService';
import type { Sample } from '../types/sample';

export function SampleManagement() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: 'all',
    sortBy: 'date'
  });

  useEffect(() => {
    loadSamples();
    const unsubscribe = sampleService.subscribeToSamples(loadSamples);
    return () => unsubscribe();
  }, []);

  const loadSamples = async () => {
    try {
      setIsLoading(true);
      const data = await sampleService.getSamples();
      setSamples(data);
    } catch (err) {
      setError('Failed to load samples');
      console.error('Error loading samples:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRequest = async (sampleData: Omit<Sample, 'id' | 'status' | 'requestDate'>) => {
    try {
      await sampleService.createSampleRequest(sampleData);
      await loadSamples();
      setShowNewRequestModal(false);
    } catch (err) {
      setError('Failed to create sample request');
      console.error('Error creating sample request:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: Sample['status']) => {
    try {
      await sampleService.updateSampleStatus(id, status);
      await loadSamples();
    } catch (err) {
      setError('Failed to update sample status');
      console.error('Error updating sample status:', err);
    }
  };

  const handleDeleteSample = async (id: string) => {
    try {
      await sampleService.deleteSample(id);
      await loadSamples();
      setSelectedSample(null);
    } catch (err) {
      setError('Failed to delete sample');
      console.error('Error deleting sample:', err);
    }
  };

  const filteredSamples = samples.filter(sample => {
    const matchesSearch = sample.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.requestedBy.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || sample.status === filters.status;
    
    if (filters.dateRange === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return matchesSearch && matchesStatus && sample.requestDate === today;
    }
    if (filters.dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && matchesStatus && new Date(sample.requestDate) >= weekAgo;
    }
    if (filters.dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return matchesSearch && matchesStatus && new Date(sample.requestDate) >= monthAgo;
    }
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (filters.sortBy === 'date') {
      return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
    }
    return a.productName.localeCompare(b.productName);
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Sample Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 min-w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search samples..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Sample Request
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {showFilters && (
        <SampleFilter
          filters={filters}
          onFilterChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      <div className="grid gap-4">
        {filteredSamples.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No samples found matching your criteria.
            </p>
          </div>
        ) : (
          filteredSamples.map((sample) => (
            <div
              key={sample.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Sample card content */}
            </div>
          ))
        )}
      </div>

      {showNewRequestModal && (
        <SampleRequestModal
          onSubmit={handleNewRequest}
          onClose={() => setShowNewRequestModal(false)}
        />
      )}

      {selectedSample && (
        <SampleDetailsModal
          sample={selectedSample}
          onClose={() => setSelectedSample(null)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteSample}
        />
      )}
    </div>
  );
}
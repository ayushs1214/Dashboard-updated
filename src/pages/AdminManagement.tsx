import React, { useState, useEffect } from 'react';
import { Search, Plus, CircleUser } from 'lucide-react';
import { AdminForm } from '../components/Admin/AdminForm';
import { adminService } from '../services/adminService';
import type { Admin } from '../types';

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllAdmins();
      setAdmins(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (adminData: Omit<Admin, 'id' | 'createdAt' | 'lastLogin'>) => {
    try {
      await adminService.createAdmin(adminData);
      await loadAdmins();
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    try {
      await adminService.deleteAdmin(id);
      await loadAdmins();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete admin');
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Management</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Admin
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {filteredAdmins.map((admin) => (
          <div
            key={admin.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {admin.avatar_url ? (
                    <img
                      src={admin.avatar_url}
                      alt={admin.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <CircleUser className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {admin.name}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.role === 'superadmin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      }`}>
                        {admin.role}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAdmin(admin.id)}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Add New Admin</h2>
            <AdminForm
              onSubmit={handleCreateAdmin}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
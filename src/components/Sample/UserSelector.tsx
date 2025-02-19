import React, { useState, useEffect } from 'react';
import { Search, X, UserIcon } from 'lucide-react'; // Renamed to UserIcon
import type { User } from '../../types/sample';
import { supabase } from '../../lib/supabase';

interface UserSelectorProps {
  selectedUser: User | null;
  onSelect: (user: User) => void;
  onClear: () => void;
}

export function UserSelector({ selectedUser, onSelect, onClear }: UserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, searchTerm]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const query = supabase
        .from('profiles')
        .select('id, name, email, role, avatar_url')
        .not('role', 'in', '(admin,superadmin)')
        .eq('status', 'active');

      if (searchTerm) {
        query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(10);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {selectedUser ? (
        <div className="flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-3">
            {selectedUser.avatar ? (
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedUser.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedUser.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <span className="text-gray-500 dark:text-gray-400">
              Select a user (optional)
            </span>
            <UserIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}

      {isOpen && !selectedUser && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
                <span className="ml-2">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No users found matching your search' : 'No users available'}
              </div>
            ) : (
              <div className="py-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSelect(user);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
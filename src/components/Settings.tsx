import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

export function Settings() {
  const { fileSizeLimit, setFileSizeLimit } = useAppContext();

  const handleSizeLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFileSizeLimit(parseInt(event.target.value));
  };

  return (
    <div className="settings-container p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      
      <div className="mb-4">
        <label htmlFor="sizeLimit" className="block text-sm font-medium text-gray-700 mb-2">
          File Size Limit
        </label>
        <select
          id="sizeLimit"
          value={fileSizeLimit}
          onChange={handleSizeLimitChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value={100000}>100 KB (Faster)</option>
          <option value={500000}>500 KB</option>
          <option value={1000000}>1 MB</option>
          <option value={5000000}>5 MB</option>
          <option value={10000000}>10 MB (Slower)</option>
          <option value={Number.MAX_SAFE_INTEGER}>No Limit (May be very slow)</option>
        </select>
        <p className="mt-2 text-sm text-gray-500">
          Files larger than this limit will be loaded on demand when clicked.
          Higher limits may slow down initial repository analysis.
        </p>
      </div>
    </div>
  );
}

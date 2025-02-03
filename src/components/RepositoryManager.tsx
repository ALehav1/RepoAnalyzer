import React, { useState } from 'react';
import { repositoryApi, Repository, Pattern } from '../api/config';
import { Button, Input, Card, Alert, Spin } from 'antd';
import { GithubOutlined, BranchesOutlined, SearchOutlined } from '@ant-design/icons';

interface RepositoryManagerProps {
  onAnalysisComplete?: (patterns: Pattern[]) => void;
}

export const RepositoryManager: React.FC<RepositoryManagerProps> = ({ onAnalysisComplete }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repository, setRepository] = useState<Repository | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create repository
      const response = await repositoryApi.create({ url, name, branch });
      setRepository(response.data);

      // Notify parent component
      if (onAnalysisComplete) {
        onAnalysisComplete([]);
      }
    } catch (err: any) {
      setError(err.detail || 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Repository Manager" className="w-full max-w-2xl mx-auto">
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Repository URL
          </label>
          <Input
            prefix={<GithubOutlined />}
            placeholder="https://github.com/user/repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Repository Name
          </label>
          <Input
            prefix={<SearchOutlined />}
            placeholder="my-repo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch
          </label>
          <Input
            prefix={<BranchesOutlined />}
            placeholder="main"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={!url || !name}
          className="w-full"
        >
          {loading ? 'Creating Repository...' : 'Create Repository'}
        </Button>

        {repository && (
          <Card size="small" title="Repository Details" className="mt-4">
            <p><strong>Name:</strong> {repository.name}</p>
            <p><strong>Status:</strong> {repository.status}</p>
            <p><strong>Local Path:</strong> {repository.local_path}</p>
          </Card>
        )}
      </div>
    </Card>
  );
};

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Plus, 
  Globe, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import AddWebsiteModal from '@/components/AddWebsiteModal';

interface Website {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'warning';
  uptime: string;
  responseTime: string;
  lastChecked: string;
  location: string;
}

const mockWebsites: Website[] = [
  {
    id: '1',
    name: 'Main Website',
    url: 'https://example.com',
    status: 'up',
    uptime: '99.98%',
    responseTime: '245ms',
    lastChecked: '2 minutes ago',
    location: 'New York, US'
  },
  {
    id: '2',
    name: 'API Server',
    url: 'https://api.example.com',
    status: 'up',
    uptime: '99.95%',
    responseTime: '180ms',
    lastChecked: '1 minute ago',
    location: 'London, UK'
  },
  {
    id: '3',
    name: 'Blog',
    url: 'https://blog.example.com',
    status: 'warning',
    uptime: '99.85%',
    responseTime: '850ms',
    lastChecked: '3 minutes ago',
    location: 'Tokyo, JP'
  },
  {
    id: '4',
    name: 'E-commerce Store',
    url: 'https://store.example.com',
    status: 'down',
    uptime: '98.50%',
    responseTime: 'Timeout',
    lastChecked: '5 minutes ago',
    location: 'Sydney, AU'
  },
  {
    id: '5',
    name: 'Documentation',
    url: 'https://docs.example.com',
    status: 'up',
    uptime: '99.99%',
    responseTime: '120ms',
    lastChecked: '1 minute ago',
    location: 'Frankfurt, DE'
  }
];

export default function Dashboard() {
  const [websites, setWebsites] = useState<Website[]>(mockWebsites);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getStatusIcon = (status: Website['status']) => {
    switch (status) {
      case 'up':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: Website['status']) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'up':
        return `${baseClasses} bg-green-900/50 text-green-300 border border-green-800`;
      case 'down':
        return `${baseClasses} bg-red-900/50 text-red-300 border border-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-900/50 text-yellow-300 border border-yellow-800`;
    }
  };

  const handleAddWebsite = (websiteData: { name: string; url: string }) => {
    const newWebsite: Website = {
      id: Date.now().toString(),
      name: websiteData.name,
      url: websiteData.url,
      status: 'up',
      uptime: '100%',
      responseTime: 'Checking...',
      lastChecked: 'Just now',
      location: 'Global'
    };
    setWebsites([...websites, newWebsite]);
  };

  const upWebsites = websites.filter(w => w.status === 'up').length;
  const downWebsites = websites.filter(w => w.status === 'down').length;
  const warningWebsites = websites.filter(w => w.status === 'warning').length;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">BetterUptime</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome back, User</span>
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Monitor your websites and track their performance</p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Website
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Websites</p>
                <p className="text-2xl font-bold text-white">{websites.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Online</p>
                <p className="text-2xl font-bold text-green-400">{upWebsites}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Warning</p>
                <p className="text-2xl font-bold text-yellow-400">{warningWebsites}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Offline</p>
                <p className="text-2xl font-bold text-red-400">{downWebsites}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Websites Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Monitored Websites</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Uptime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Last Checked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {websites.map((website) => (
                  <tr key={website.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{website.name}</div>
                        <div className="text-sm text-gray-400">{website.url}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(website.status)}
                        <span className={getStatusBadge(website.status)}>
                          {website.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                        <span className="text-sm text-white">{website.uptime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-blue-400 mr-1" />
                        <span className="text-sm text-white">{website.responseTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {website.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {website.lastChecked}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {websites.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No websites monitored yet</h3>
            <p className="text-gray-400 mb-4">Start monitoring your first website to see it here.</p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Website
            </Button>
          </div>
        )}
      </div>

      <AddWebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddWebsite}
      />
    </div>
  );
}
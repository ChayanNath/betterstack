'use client';

import { JSX, useEffect, useState } from 'react';
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
  ExternalLink,
  Edit,
  Trash2
} from 'lucide-react';
import AddWebsiteModal from '@/components/AddWebsiteModal';
import axios from 'axios';
import { BACKEND_URL } from '@/lib/utils';

interface WebsiteTick {
  status: 'up' | 'down' | 'warning';
  response_time_ms: number;
  createdAt: string;
}

interface Website {
  id: string;
  url: string;
  location?: string;
  ticks: WebsiteTick[];
  uptime?: string;
}

function formatTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/websites`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        setWebsites(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleAddWebsite = (websiteData: { url: string; }) => {
    axios
      .post(`${BACKEND_URL}/website`, websiteData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((res) => {
        setWebsites((prev) => [...prev, res.data]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getStatus = (w: Website) => w?.ticks?.[0]?.status || 'down';
  const getResponseTime = (w: Website) => `${w?.ticks?.[0]?.response_time_ms ?? 'N/A'}ms`;
  const getLastChecked = (w: Website) =>
    w?.ticks?.[0]?.createdAt ? formatTimeAgo(w.ticks[0].createdAt) : 'Never';

  const upWebsites = websites.filter((w) => getStatus(w) === 'up').length;
  const downWebsites = websites.filter((w) => getStatus(w) === 'down').length;
  const warningWebsites = websites.filter((w) => getStatus(w) === 'warning').length;

  const getStatusIcon = (status: 'up' | 'down' | 'warning') => {
    if (status === 'up') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'down') return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusBadge = (status: 'up' | 'down' | 'warning') => {
    const base = 'px-2 py-1 rounded-full text-xs font-medium';
    if (status === 'up') return `${base} bg-green-900/50 text-green-300 border border-green-800`;
    if (status === 'down') return `${base} bg-red-900/50 text-red-300 border border-red-800`;
    return `${base} bg-yellow-900/50 text-yellow-300 border border-yellow-800`;
  };

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
            <div className="text-gray-300">Welcome back, User</div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Website
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Websites" value={websites.length} icon={<Globe />} />
          <StatCard label="Online" value={upWebsites} icon={<CheckCircle className="text-green-400" />} />
          <StatCard label="Offline" value={downWebsites} icon={<XCircle className="text-red-400" />} />
        </div>

        {/* Website Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-700 text-xs uppercase text-gray-300">
              <tr>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">URL</th>
                <th className="px-6 py-3 text-left">Response</th>
                <th className="px-6 py-3 text-left">Last Checked</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {websites.map((w) => {
                const status = getStatus(w);
                return (
                  <tr key={w.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className={getStatusBadge(status)}>{status.toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 text-white">{w.url}</td>
                    <td className="px-6 py-4 text-white">{getResponseTime(w)}</td>
                    <td className="px-6 py-4 text-white">{getLastChecked(w)}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {websites.length === 0 && (
          <div className="text-center text-white py-12">
            <Globe className="mx-auto h-10 w-10 mb-4 text-gray-500" />
            <p>No websites monitored yet. Add one to get started!</p>
          </div>
        )}
      </main>

      <AddWebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddWebsite}
      />
    </div>
  );
}

// Helper Card
function StatCard({ label, value, icon }: { label: string; value: number; icon: JSX.Element }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex justify-between items-center">
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      {icon}
    </div>
  );
}

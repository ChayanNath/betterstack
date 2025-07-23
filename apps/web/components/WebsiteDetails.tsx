'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ArrowLeft, 
  Globe, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Calendar,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BACKEND_URL } from '@/lib/utils';
import axios from 'axios';


interface WebsiteTick {
  status: "up" | "down";
  response_time_ms: number;
  createdAt: string;
}

interface Website {
  id: string;
  url: string;
  location?: string;
  ticks: WebsiteTick[];
  uptime?: string;
  createdAt: string;
}

interface WebsiteDetailsProps {
  websiteId: string;
}

export default function WebsiteDetails({ websiteId }: WebsiteDetailsProps) {
  const router = useRouter();
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    

const fetchWebsiteDetails = () => {
      setLoading(true);
      axios
        .get(`${BACKEND_URL}/website/${websiteId}`, {
            withCredentials: true,
        })
        .then((res) => {
          const websiteData = res.data;
          setWebsite(websiteData);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    };

    fetchWebsiteDetails();
  }, [websiteId]);

  const getStatusIcon = (status: 'up' | 'down' | 'warning') => {
    switch (status) {
      case 'up':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'down':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'up' | 'down' | 'warning') => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'up':
        return `${baseClasses} bg-green-900/50 text-green-300 border border-green-800`;
      case 'down':
        return `${baseClasses} bg-red-900/50 text-red-300 border border-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-900/50 text-yellow-300 border border-yellow-800`;
    }
  };

  const formatTimestamp = (createdAt: string) => {
    return new Date(createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Website Not Found</h1>
          <Button onClick={() => router.push('/dashboard')} className="bg-blue-500 hover:bg-blue-600">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const upTicks = website.ticks.filter(tick => tick.status === 'up').length;
  const downTicks = website.ticks.filter(tick => tick.status === 'down').length;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold text-white">BetterUptime</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Website Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {getStatusIcon(website?.ticks?.[0]?.status)}
              <div>
                <div className="flex items-center space-x-2 mt-1">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a 
                    href={website.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {website.url}
                  </a>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className={getStatusBadge(website?.ticks?.[0]?.status)}>
              {website?.ticks?.[0]?.status?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Uptime</p>
                <p className="text-2xl font-bold text-green-400">{website.uptime || 'N/A'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Response Time</p>
                <p className="text-2xl font-bold text-blue-400">{website?.ticks?.[0]?.response_time_ms}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Location</p>
                <p className="text-lg font-semibold text-white">{website.location || 'Global'}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <Activity className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Status History */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Last {website.ticks.length} Status Checks</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>{upTicks} Up</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>{downTicks} Down</span>
              </div>
            </div>
          </div>
          
          {/* Status Ticks Visualization */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-400">Status Timeline (most recent first):</span>
            </div>
            <div className="flex items-center space-x-1">
              {website.ticks.slice().reverse().map((tick, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${
                    tick.status === 'up' 
                      ? 'bg-green-500 hover:bg-green-400' 
                      : 'bg-red-500 hover:bg-red-400'
                  }`}
                  title={`${tick.status === 'up' ? 'Up' : 'Down'} at ${formatTimestamp(tick.createdAt)}${tick.status === 'up' ? ` (${tick.response_time_ms}ms)` : ''}`}
                >
                  {tick.status === 'up' ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <XCircle className="h-4 w-4 text-white" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{website.ticks.length * 2} min ago</span>
              <span>Now</span>
            </div>
          </div>

          {/* Detailed Status Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {website.ticks.slice().reverse().map((tick, index) => (
                  <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {formatTimestamp(tick.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {tick.status === 'up' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          tick.status === 'up' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {tick.status === 'up' ? 'Up' : 'Down'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {tick.status === 'up' ? `${tick.response_time_ms}ms` : 'Timeout'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {website.location || 'Global'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Website Info */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Website Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Created</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-white">{new Date(website.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Monitoring Frequency</h3>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-white">Every 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
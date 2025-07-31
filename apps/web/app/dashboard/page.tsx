"use client";

import { JSX, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Plus,
  Globe,
  CheckCircle,
  XCircle,
  ExternalLink,
  Edit,
  Trash2,
  RefreshCcw,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import AddWebsiteModal from "@/components/AddWebsiteModal";
import axios from "axios";
import { BACKEND_URL } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner"

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
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState<{ id: string, username: string } | null>(null);

  const router = useRouter();

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BACKEND_URL}/websites?page=${page}&limit=10`,
        { withCredentials: true }
      );
      setWebsites(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error: any) {
      console.error("Failed to fetch websites", error);
      toast.error(error?.details?.message || "Failed to fetch websites");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchWebsites();
  }, [page]);

  const fetchUser = () => {
    axios
      .get(`${BACKEND_URL}/user/me`, {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error(err);
        router.push("/");
      });
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleAddWebsite = (websiteData: { url: string }) => {
    axios
      .post(`${BACKEND_URL}/website`, websiteData, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success("Website added successfully");
        fetchWebsites();
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.details?.message || "Failed to add website");
      });
  };

  const handleDeleteWebsite = (websiteId: string) => {
     axios
      .delete(`${BACKEND_URL}/website/${websiteId}`, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success("Website removed successfully");
        fetchWebsites();
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.details?.message || "Failed to remove website");
      });
  }

  const getStatus = (w: Website) =>
    w?.ticks?.length === 0 ? "checking" : w?.ticks?.[0]?.status || "down";
  const getResponseTime = (w: Website) =>
    w?.ticks?.length === 0
      ? "Checking..."
      : `${w?.ticks?.[0]?.response_time_ms ?? "N/A"}ms`;

  const getLastChecked = (w: Website) =>
    w?.ticks?.length === 0
      ? "Checking..."
      : w?.ticks?.[0]?.createdAt
      ? formatTimeAgo(w.ticks[0].createdAt)
      : "Never";

  const upWebsites = websites.filter((w) => getStatus(w) === "up").length;
  const downWebsites = websites.filter((w) => getStatus(w) === "down").length;

  const getStatusIcon = (status: string) => {
    if (status === "up") return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === "down") return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500" />
  };

  const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    if (status === "up") return `${base} bg-green-900/50 text-green-300 border border-green-800`;
    if (status === "down") return `${base} bg-red-900/50 text-red-300 border border-red-800`;
    return `${base} bg-yellow-900/50 text-yellow-300 border border-yellow-800`;
  };

  const filteredWebsites = websites.filter((w) =>
    w.url.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">BetterUptime</span>
            </div>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={async () => {
                try {
                  await axios.post(
                    `${BACKEND_URL}/user/logout`,
                    {},
                    { withCredentials: true }
                  );
                  router.push("/");
                } catch (err) {
                  console.error("Logout failed", err);
                }
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search websites..."
              className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button onClick={fetchWebsites} variant="outline">
              <RefreshCcw
                className={`h-4 w-4 ${loading ? "animate-spin " : ""}`}
              />{" "}
              Refresh
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Website
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Websites"
            value={websites.length}
            icon={<Globe />}
          />
          <StatCard
            label="Online"
            value={upWebsites}
            icon={<CheckCircle className="text-green-400" />}
          />
          <StatCard
            label="Offline"
            value={downWebsites}
            icon={<XCircle className="text-red-400" />}
          />
        </div>

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
              {filteredWebsites.map((w) => {
                const status = getStatus(w);
                return (
                  <tr key={w.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className={getStatusBadge(status)}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">{w.url}</td>
                    <td className="px-6 py-4 text-white">
                      {getResponseTime(w)}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {getLastChecked(w)}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button
                        variant="ghost"
                        className="text-white"
                        size="sm"
                        onClick={() => router.push(`/website/${w.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400"
                        onClick={() => handleDeleteWebsite(w.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredWebsites.length > 0 && (
            <div className="flex justify-center">
              <div className="flex items-center p-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <span className="text-white">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>

                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {filteredWebsites.length === 0 && (
          <div className="text-center text-white py-12">
            <Globe className="mx-auto h-10 w-10 mb-4 text-gray-500" />
            <p>No websites match your search.</p>
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

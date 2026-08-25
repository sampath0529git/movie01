import React, { useMemo } from "react";
import { MediaItem } from "../../types";
import { Film, Tv, PlayCircle, TrendingUp } from "lucide-react";

interface DashboardOverviewProps {
  media: MediaItem[];
}

export default function DashboardOverview({ media }: DashboardOverviewProps) {
  const stats = useMemo(() => {
    const movies = media.filter((m) => m.type === "MOVIE").length;
    const tvShows = media.filter((m) => m.type === "TV").length;
    const featured = media.filter((m) => m.featured).length;

    return [
      {
        label: "Total Movies",
        value: movies,
        icon: <Film className="w-6 h-6 text-blue-500" />,
      },
      {
        label: "Total TV Shows",
        value: tvShows,
        icon: <Tv className="w-6 h-6 text-purple-500" />,
      },
      {
        label: "Featured Items",
        value: featured,
        icon: <TrendingUp className="w-6 h-6 text-brand-500" />,
      },
      {
        label: "Total Media",
        value: media.length,
        icon: <PlayCircle className="w-6 h-6 text-brand-500" />,
      },
    ];
  }, [media]);

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-400 text-sm">
            Welcome back. Here is a summary of your platform's content.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-xl"
          >
            <div className="flex flex-col gap-2">
              <span className="text-gray-400 font-medium text-sm">
                {stat.label}
              </span>
              <span className="text-3xl font-bold text-white tracking-tight">
                {stat.value}
              </span>
            </div>
            <div className="p-4 bg-white/5 rounded-full border border-white/10">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-6">Recently Added</h3>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 md:p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Title
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Type
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {media.slice(0, 5).map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <span className="font-medium text-white">{item.title}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-white/10 rounded text-xs font-bold text-white">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${item.status === "Published" ? "bg-brand-500/20 text-brand-400" : "bg-yellow-500/20 text-yellow-500"}`}
                    >
                      {item.status || "Published"}
                    </span>
                  </td>
                </tr>
              ))}
              {media.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-8 text-center text-gray-500 text-sm"
                  >
                    No media items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { useReportsData, updateReportStatus, Report } from '../../firebase';
import { ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportList() {
  const { data: reports, loading } = useReportsData();
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed" | "resolved">("all");

  const filteredReports = reports.filter(r => filter === "all" || r.status === filter);

  const handleUpdateStatus = async (reportId: string, status: "pending" | "reviewed" | "resolved") => {
    try {
      await updateReportStatus(reportId, status);
      toast.success(`Report status updated to ${status}`);
    } catch (err) {
      toast.error('Failed to update report status');
    }
  };

  if (loading) {
    return <div className="text-white text-center py-10">Loading reports...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-brand-500" />
          User Reports
        </h2>
        
        <div className="flex bg-[#000000] p-1 rounded-lg border border-[#253900]">
          {(['all', 'pending', 'reviewed', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md capitalize transition-colors ${
                filter === f ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#000000] border border-[#253900] rounded-xl overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="text-gray-500 text-center py-12">No reports found matching the selected filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0d1400] border-b border-[#253900] text-xs uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Report Details</th>
                  <th className="px-6 py-4">Media/Target</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253900]">
                {filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-[#0d1400]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 max-w-xs">
                        <span className="text-white font-semibold">Reason: {report.reason}</span>
                        <span className="text-gray-400 text-sm truncate" title={report.details}>
                          {report.details || "No additional details"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 font-mono text-sm bg-black/50 px-2 py-1 rounded">
                        {report.mediaItemId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        report.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        report.status === 'reviewed' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        {report.status === 'pending' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {report.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        value={report.status}
                        onChange={(e) => handleUpdateStatus(report.id, e.target.value as any)}
                        className="bg-[#253900] border border-[#385600] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-500 transition-colors"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

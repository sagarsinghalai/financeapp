import { useEffect, useState } from 'react';
import { getCommissions, getCommissionSummary } from '../../api/client';
import StatusBadge from '../../components/ui/StatusBadge';

export default function Commissions() {
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCommissions().then(r => setCommissions(r.data)),
      getCommissionSummary().then(r => setSummary(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  const fmt = n => `₹${(n||0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
          <p className="text-green-100 text-sm font-medium">Total Earned</p>
          <p className="text-3xl font-bold mt-1">{fmt(summary?.total)}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
          <p className="text-indigo-100 text-sm font-medium">Paid Out</p>
          <p className="text-3xl font-bold mt-1">{fmt(summary?.paid)}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-5 text-white">
          <p className="text-yellow-100 text-sm font-medium">Pending</p>
          <p className="text-3xl font-bold mt-1">{fmt(summary?.pending)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Commission History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Lead','Product','Commission','Rate','App. Status','Status','Date'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commissions.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.lead_name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.product_name}</td>
                  <td className="px-4 py-3 font-bold text-green-700">{fmt(c.amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{c.rate}%</td>
                  <td className="px-4 py-3"><StatusBadge status={c.application_status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-gray-400">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr><td colSpan="7" className="text-center py-12 text-gray-400">No commissions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

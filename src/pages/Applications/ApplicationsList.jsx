import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications } from '../../api/client';
import StatusBadge from '../../components/ui/StatusBadge';

export default function ApplicationsList() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getApplications(statusFilter ? { status: statusFilter } : {}).then(r => setApps(r.data)).finally(() => setLoading(false));
  }, [statusFilter]);

  const fmt = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Statuses</option>
          {['submitted','under_review','approved','rejected','disbursed'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
        </select>
        <span className="text-sm text-gray-500">{apps.length} applications</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['#','Applicant','Product','Amount','Agent','Status','Date','Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apps.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">#{app.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{app.lead_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={app.product_type} />
                        <span className="text-gray-600">{app.product_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{fmt(app.amount)}</td>
                    <td className="px-4 py-3 text-gray-600">{app.agent_name}</td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3 text-gray-400">{new Date(app.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/applications/${app.id}`)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">View</button>
                    </td>
                  </tr>
                ))}
                {apps.length === 0 && <tr><td colSpan="8" className="text-center py-12 text-gray-400">No applications found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

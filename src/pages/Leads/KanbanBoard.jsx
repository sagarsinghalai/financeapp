import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKanbanLeads } from '../../api/client';
import LeadScoreBadge from '../../components/ui/LeadScoreBadge';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { key: 'new', label: 'New', color: 'bg-gray-100 border-gray-300' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-50 border-blue-200' },
  { key: 'qualified', label: 'Qualified', color: 'bg-indigo-50 border-indigo-200' },
  { key: 'proposal', label: 'Proposal', color: 'bg-purple-50 border-purple-200' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-yellow-50 border-yellow-200' },
  { key: 'closed_won', label: 'Won', color: 'bg-green-50 border-green-200' },
  { key: 'closed_lost', label: 'Lost', color: 'bg-red-50 border-red-200' },
];

export default function KanbanBoard() {
  const [board, setBoard] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getKanbanLeads().then(r => setBoard(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(col => {
        const items = board[col.key] || [];
        return (
          <div key={col.key} className={`flex-shrink-0 w-64 border rounded-xl ${col.color}`}>
            <div className="px-3 py-2.5 border-b border-inherit flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-800">{col.label}</span>
              <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border">{items.length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-20 max-h-[calc(100vh-280px)] overflow-y-auto">
              {items.map(lead => (
                <div key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
                  <p className="font-semibold text-sm text-gray-900">{lead.first_name} {lead.last_name}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <StatusBadge status={lead.product_interest} />
                  </div>
                  <div className="mt-1.5"><LeadScoreBadge score={lead.score} /></div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>📞 {lead.phone || '—'}</span>
                    {lead.agent_name && (
                      <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium">{lead.agent_name.split(' ').map(n=>n[0]).join('')}</span>
                    )}
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No leads</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

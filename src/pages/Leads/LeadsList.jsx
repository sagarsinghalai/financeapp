import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, getUsers } from '../../api/client';
import StatusBadge from '../../components/ui/StatusBadge';
import LeadScoreBadge from '../../components/ui/LeadScoreBadge';
import KanbanBoard from './KanbanBoard';

export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [filters, setFilters] = useState({ search: '', status: '', product_interest: '', assigned_to: '' });
  const navigate = useNavigate();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.product_interest) params.product_interest = filters.product_interest;
      if (filters.assigned_to) params.assigned_to = filters.assigned_to;
      const res = await getLeads(params);
      setLeads(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { getUsers().then(r => setUsers(r.data)); }, []);
  useEffect(() => { fetchLeads(); }, [filters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          <button onClick={() => setView('list')} className={`px-3 py-1.5 text-sm rounded-md font-medium transition ${view==='list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>List</button>
          <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-sm rounded-md font-medium transition ${view==='kanban' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Kanban</button>
        </div>
        <input value={filters.search} onChange={e => setFilters(f=>({...f,search:e.target.value}))} placeholder="Search leads..." className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
        <select value={filters.status} onChange={e => setFilters(f=>({...f,status:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Statuses</option>
          {['new','contacted','qualified','proposal','negotiation','closed_won','closed_lost'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
        </select>
        <select value={filters.product_interest} onChange={e => setFilters(f=>({...f,product_interest:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Products</option>
          <option value="credit_card">Credit Card</option>
          <option value="loan">Loan</option>
          <option value="insurance">Insurance</option>
        </select>
        <select value={filters.assigned_to} onChange={e => setFilters(f=>({...f,assigned_to:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Agents</option>
          {users.filter(u=>u.role==='agent').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <div className="ml-auto">
          <button onClick={() => navigate('/leads/new')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">+ New Lead</button>
        </div>
      </div>

      {view === 'kanban' ? <KanbanBoard /> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No leads found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Name','Product','Status','Score','Agent','City','Created','Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                      <td className="px-4 py-3 font-medium text-gray-900">{lead.first_name} {lead.last_name}</td>
                      <td className="px-4 py-3"><StatusBadge status={lead.product_interest} /></td>
                      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3"><LeadScoreBadge score={lead.score} /></td>
                      <td className="px-4 py-3 text-gray-600">{lead.agent_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{lead.city}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(lead.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <button onClick={e=>{e.stopPropagation();navigate(`/leads/${lead.id}`)}} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

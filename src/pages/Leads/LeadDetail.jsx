import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLead, createActivity, updateLead, getUsers, getApplications } from '../../api/client';
import StatusBadge from '../../components/ui/StatusBadge';
import LeadScoreBadge from '../../components/ui/LeadScoreBadge';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const statuses = ['new','contacted','qualified','proposal','negotiation','closed_won','closed_lost'];
const activityIcons = { call: '📞', email: '✉️', meeting: '🤝', note: '📝' };

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actModal, setActModal] = useState(false);
  const [actForm, setActForm] = useState({ type: 'call', description: '' });
  const [actLoading, setActLoading] = useState(false);

  const fetchLead = () => getLead(id).then(r => setLead(r.data)).finally(() => setLoading(false));

  useEffect(() => { fetchLead(); }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await updateLead(id, { ...lead, status });
      toast.success('Status updated');
      fetchLead();
    } catch { toast.error('Failed'); }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    setActLoading(true);
    try {
      await createActivity({ lead_id: id, ...actForm });
      toast.success('Activity added');
      setActModal(false);
      setActForm({ type: 'call', description: '' });
      fetchLead();
    } catch { toast.error('Failed'); } finally { setActLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;
  if (!lead) return <div className="text-center py-20 text-gray-500">Lead not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <button onClick={() => navigate('/leads')} className="text-indigo-600 text-sm hover:underline mb-2 inline-block">← Back to Leads</button>
          <h2 className="text-2xl font-bold text-gray-900">{lead.first_name} {lead.last_name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <LeadScoreBadge score={lead.score} />
            <StatusBadge status={lead.product_interest} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={lead.status} onChange={e => handleStatusChange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
            {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
          </select>
          <button onClick={() => setActModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">+ Activity</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
          <h3 className="font-semibold text-gray-900 mb-3">Contact Info</h3>
          <InfoRow label="Email" value={lead.email} />
          <InfoRow label="Phone" value={lead.phone} />
          <InfoRow label="City" value={lead.city} />
          <InfoRow label="State" value={lead.state} />
          <InfoRow label="Source" value={lead.source} />
          <InfoRow label="Agent" value={lead.agent_name} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
          <h3 className="font-semibold text-gray-900 mb-3">Financial Info</h3>
          <InfoRow label="Income" value={lead.income ? `₹${Number(lead.income).toLocaleString('en-IN')}` : '—'} />
          <InfoRow label="Employment" value={lead.employment_type?.replace(/_/g,' ')} />
          <InfoRow label="Credit Score" value={lead.credit_score_range} />
          <InfoRow label="Product" value={lead.product_interest?.replace(/_/g,' ')} />
          <InfoRow label="Created" value={new Date(lead.created_at).toLocaleDateString('en-IN')} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Applications</h3>
          {lead.applications?.length > 0 ? lead.applications.map(app => (
            <div key={app.id} className="py-2 border-b border-gray-100 last:border-0">
              <p className="text-sm font-medium text-gray-900">{app.product_name}</p>
              <div className="flex items-center justify-between mt-1">
                <StatusBadge status={app.status} />
                {app.amount && <span className="text-xs text-gray-500">₹{Number(app.amount).toLocaleString('en-IN')}</span>}
              </div>
            </div>
          )) : <p className="text-sm text-gray-400">No applications yet</p>}
          {lead.notes && <div className="mt-3 p-3 bg-yellow-50 rounded-lg"><p className="text-xs text-yellow-800">{lead.notes}</p></div>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Activity Timeline</h3>
          <span className="text-sm text-gray-400">{lead.activities?.length} activities</span>
        </div>
        <div className="divide-y divide-gray-100">
          {lead.activities?.length > 0 ? lead.activities.map((act, i) => (
            <div key={i} className="px-6 py-4 flex items-start gap-4">
              <span className="text-xl mt-0.5">{activityIcons[act.type] || '📋'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 capitalize">{act.type}</span>
                  <span className="text-xs text-gray-400">by {act.agent_name}</span>
                  <span className="text-xs text-gray-400">· {new Date(act.created_at).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{act.description}</p>
              </div>
            </div>
          )) : <div className="px-6 py-8 text-center text-gray-400">No activities yet</div>}
        </div>
      </div>

      <Modal open={actModal} onClose={() => setActModal(false)} title="Log Activity">
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
            <select value={actForm.type} onChange={e => setActForm(f=>({...f,type:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="call">📞 Call</option>
              <option value="email">✉️ Email</option>
              <option value="meeting">🤝 Meeting</option>
              <option value="note">📝 Note</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={actForm.description} onChange={e => setActForm(f=>({...f,description:e.target.value}))} rows={3} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Describe the activity..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setActModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={actLoading} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60">{actLoading ? 'Saving...' : 'Save Activity'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value || '—'}</span>
    </div>
  );
}

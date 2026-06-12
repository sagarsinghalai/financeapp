import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplication, updateApplication } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

const statusFlow = ['submitted','under_review','approved','disbursed'];

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchApp = () => getApplication(id).then(r => setApp(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetchApp(); }, [id]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await updateApplication(id, { ...app, status });
      toast.success('Status updated');
      fetchApp();
    } catch { toast.error('Failed'); } finally { setUpdating(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;
  if (!app) return <div className="text-center py-20 text-gray-500">Not found.</div>;

  const fmt = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';
  const canUpdate = user?.role !== 'agent';
  const curIdx = statusFlow.indexOf(app.status);
  const nextStatus = curIdx < statusFlow.length - 1 ? statusFlow[curIdx + 1] : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <button onClick={() => navigate('/applications')} className="text-indigo-600 text-sm hover:underline mb-2 inline-block">← Back to Applications</button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Application #{app.id}</h2>
            <p className="text-gray-500 mt-1">{app.lead_name} · {app.product_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={app.status} />
            {canUpdate && app.status !== 'rejected' && app.status !== 'disbursed' && (
              <div className="flex gap-2">
                {nextStatus && (
                  <button onClick={() => updateStatus(nextStatus)} disabled={updating}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60">
                    {updating ? '...' : `Move to ${nextStatus.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}`}
                  </button>
                )}
                <button onClick={() => updateStatus('rejected')} disabled={updating}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60">Reject</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusFlow.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${s === app.status ? 'bg-indigo-600 text-white' : i < curIdx ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {i < curIdx ? '✓ ' : ''}{s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
            </div>
            {i < statusFlow.length - 1 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-900">Applicant</h3>
          <InfoRow label="Name" value={app.lead_name} />
          <InfoRow label="Email" value={app.lead_email} />
          <InfoRow label="Phone" value={app.lead_phone} />
          <InfoRow label="Agent" value={app.agent_name} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-900">Product Details</h3>
          <InfoRow label="Product" value={app.product_name} />
          <InfoRow label="Type" value={app.product_type?.replace(/_/g,' ')} />
          <InfoRow label="Interest Rate" value={app.interest_rate ? `${app.interest_rate}% p.a.` : '—'} />
          <InfoRow label="Tenure" value={app.tenure_months ? `${app.tenure_months} months` : '—'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-900">Financial Summary</h3>
          <InfoRow label="Applied Amount" value={fmt(app.amount)} />
          <InfoRow label="Status" value={<StatusBadge status={app.status} />} />
          <InfoRow label="Applied On" value={new Date(app.created_at).toLocaleDateString('en-IN')} />
          <InfoRow label="Last Updated" value={new Date(app.updated_at).toLocaleDateString('en-IN')} />
        </div>
      </div>

      {app.notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-900 mb-1">Notes</h3>
          <p className="text-sm text-yellow-800">{app.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value || '—'}</span>
    </div>
  );
}

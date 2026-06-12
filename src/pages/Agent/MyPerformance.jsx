import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLeads, getCommissions, getActivities } from '../../api/client';
import StatsCard from '../../components/ui/StatsCard';
import { UsersIcon, TrophyIcon, CurrencyRupeeIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function MyPerformance() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getLeads().then(r => setLeads(r.data)),
      getCommissions().then(r => setCommissions(r.data)),
      getActivities(null).then(r => setActivities(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  const total = leads.length;
  const won = leads.filter(l => l.status === 'closed_won').length;
  const rate = total > 0 ? Math.round((won / total) * 100) : 0;
  const totalComm = commissions.reduce((s, c) => s + c.amount, 0);
  const paidComm = commissions.filter(c=>c.status==='paid').reduce((s,c)=>s+c.amount,0);
  const quota = 10;
  const quotaPct = Math.min(Math.round((won / quota) * 100), 100);

  const actIcons = { call: '📞', email: '✉️', meeting: '🤝', note: '📝' };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold">My Performance Dashboard</h2>
        <p className="text-indigo-200 mt-1">Welcome, {user?.name}! Here's your performance overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="My Leads" value={total} subtitle="Total assigned" icon={UsersIcon} color="indigo" />
        <StatsCard title="Leads Converted" value={won} subtitle={`Out of ${total}`} icon={TrophyIcon} color="green" />
        <StatsCard title="Conversion Rate" value={`${rate}%`} subtitle="Closed won / Total" icon={ChartBarIcon} color="purple" />
        <StatsCard title="Total Commission" value={`₹${totalComm.toLocaleString('en-IN')}`} subtitle={`₹${paidComm.toLocaleString('en-IN')} paid`} icon={CurrencyRupeeIcon} color="orange" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Monthly Quota Progress</h3>
          <span className="text-sm font-semibold text-indigo-700">{won} / {quota} closures</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{width:`${quotaPct}%`}} />
        </div>
        <p className="text-xs text-gray-400 mt-2">{quotaPct}% of monthly quota achieved</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Lead Pipeline Summary</h3>
          </div>
          <div className="p-4 space-y-2">
            {['new','contacted','qualified','proposal','negotiation','closed_won','closed_lost'].map(s => {
              const cnt = leads.filter(l=>l.status===s).length;
              return (
                <div key={s} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-600 capitalize">{s.replace(/_/g,' ')}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{width: total>0?`${(cnt/total)*100}%`:'0%'}} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 w-6 text-right">{cnt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {activities.slice(0, 10).map((a, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <span className="text-lg">{actIcons[a.type]||'📋'}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.lead_name}</p>
                  <p className="text-xs text-gray-500">{a.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(a.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && <div className="px-5 py-8 text-center text-gray-400">No activities yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

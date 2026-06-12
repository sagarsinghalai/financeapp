import { useEffect, useState } from 'react';
import { getDashboardStats } from '../api/client';
import StatsCard from '../components/ui/StatsCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { UsersIcon, CurrencyRupeeIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

const activityIcons = { call: '📞', email: '✉️', meeting: '🤝', note: '📝' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;
  if (!data) return <div className="text-center text-gray-500 py-20">Failed to load dashboard data.</div>;

  const fmt = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n||0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Leads" value={data.total_leads} subtitle={`${data.new_leads_this_month} new this month`} icon={UsersIcon} color="indigo" />
        <StatsCard title="Revenue (Disbursed)" value={fmt(data.monthly_revenue?.reduce((s,r)=>s+r.revenue,0))} subtitle="From disbursements" icon={CurrencyRupeeIcon} color="green" />
        <StatsCard title="Conversion Rate" value={`${data.conversion_rate}%`} subtitle="Leads closed won" icon={ChartBarIcon} color="purple" />
        <StatsCard title="Active Agents" value={data.active_agents} subtitle="Sales team size" icon={UserGroupIcon} color="blue" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Disbursements</h3>
          {data.monthly_revenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.monthly_revenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : `₹${v}`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-64 flex items-center justify-center text-gray-400">No revenue data yet</div>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Leads by Product</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.leads_by_product} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {data.leads_by_product?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Top Performing Agents</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Closed</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Conv%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.top_agents?.map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold">{a.name?.charAt(0)}</div>
                        {a.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{a.leads_closed}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmt(a.revenue)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.conversion_pct >= 50 ? 'bg-green-100 text-green-700' : a.conversion_pct >= 25 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{a.conversion_pct}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {data.recent_activities?.map((act, i) => (
              <div key={i} className="px-6 py-3 flex items-start gap-3">
                <span className="text-lg flex-shrink-0 mt-0.5">{activityIcons[act.type] || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate"><span className="font-medium">{act.lead_name}</span> — {act.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{act.agent_name} · {new Date(act.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

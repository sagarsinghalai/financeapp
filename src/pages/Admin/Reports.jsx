import { useEffect, useState } from 'react';
import { getDashboardStats, getCommissions, getApplications } from '../../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatusBadge from '../../components/ui/StatusBadge';

const TABS = ['Sales Performance', 'Product Mix', 'Pipeline Funnel', 'Commissions'];
const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'];

export default function Reports() {
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data));
    getCommissions().then(r => setCommissions(r.data));
    getApplications().then(r => setApps(r.data));
  }, []);

  const fmt = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n||0).toLocaleString('en-IN')}`;

  const pipelineData = [
    { status: 'New', count: stats?.leads_by_product?.reduce((s,_)=>s,0) || 0 },
    ...Object.entries(
      apps.reduce((acc, a) => { acc[a.status] = (acc[a.status]||0)+1; return acc; }, {})
    ).map(([status, count]) => ({ status: status.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), count }))
  ].filter(d => d.count > 0);

  const commByAgent = commissions.reduce((acc, c) => {
    const name = c.agent_name;
    if (!acc[name]) acc[name] = { name, total: 0, count: 0 };
    acc[name].total += c.amount;
    acc[name].count += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${tab===i ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Agent Revenue Performance</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats?.top_agents || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{fontSize:11}} />
              <YAxis tickFormatter={v => fmt(v)} tick={{fontSize:11}} />
              <Tooltip formatter={v => fmt(v)} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['Agent','Leads Closed','Revenue','Conversion'].map(h => <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.top_agents?.map((a,i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-2">{a.leads_closed}</td>
                    <td className="px-4 py-2 font-semibold text-green-700">{fmt(a.revenue)}</td>
                    <td className="px-4 py-2"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.conversion_pct>=50?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{a.conversion_pct}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Leads by Product Type</h3>
          <div className="flex flex-col xl:flex-row gap-8 items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats?.leads_by_product||[]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({name,percent}) => `${name}: ${(percent*100).toFixed(0)}%`}>
                  {(stats?.leads_by_product||[]).map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full xl:w-64 space-y-3">
              {stats?.leads_by_product?.map((p,i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{backgroundColor: COLORS[i%COLORS.length]+'20'}}>
                  <span className="font-medium text-gray-800">{p.name}</span>
                  <span className="font-bold text-2xl" style={{color: COLORS[i%COLORS.length]}}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-6">Application Pipeline</h3>
          <div className="space-y-4">
            {pipelineData.map((d, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-32 flex-shrink-0">{d.status}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div className="h-full rounded-full flex items-center pl-3 transition-all duration-700"
                    style={{ width: `${Math.max((d.count / Math.max(...pipelineData.map(x=>x.count))) * 100, 8)}%`, backgroundColor: COLORS[i%COLORS.length] }}>
                    <span className="text-white text-xs font-bold">{d.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(commByAgent).map((a, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">{a.name?.charAt(0)}</div>
                  <p className="font-semibold text-gray-900">{a.name}</p>
                </div>
                <p className="text-2xl font-bold text-green-700">₹{a.total.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400 mt-1">{a.count} transactions</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>{['Agent','Lead','Product','Amount','Rate','Status','Date'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commissions.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.agent_name}</td>
                      <td className="px-4 py-3 text-gray-600">{c.lead_name}</td>
                      <td className="px-4 py-3 text-gray-600">{c.product_name}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">₹{c.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-gray-500">{c.rate}%</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-gray-400">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

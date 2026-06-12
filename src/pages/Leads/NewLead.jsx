import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLead, getUsers, getProducts } from '../../api/client';
import toast from 'react-hot-toast';

const steps = ['Personal Info', 'Financial Info', 'Product Interest'];

export default function NewLead() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', address: '', city: '', state: '',
    income: '', employment_type: 'salaried', credit_score_range: '700-750',
    source: 'website', product_interest: 'loan', assigned_to: ''
  });

  useEffect(() => {
    getUsers().then(r => setUsers(r.data.filter(u => u.role === 'agent')));
    getProducts().then(r => setProducts(r.data));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createLead(form);
      toast.success('Lead created successfully!');
      navigate('/leads');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create lead');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/leads')} className="text-indigo-600 text-sm hover:underline mb-4 inline-block">← Back to Leads</button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Lead</h2>

        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition ${i <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div>
              <span className={`ml-2 text-sm font-medium hidden sm:block ${i === step ? 'text-indigo-700' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name *" value={form.first_name} onChange={v => set('first_name', v)} required />
                <Field label="Last Name *" value={form.last_name} onChange={v => set('last_name', v)} required />
              </div>
              <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} />
              <Field label="Phone" type="tel" value={form.phone} onChange={v => set('phone', v)} />
              <Field label="Address" value={form.address} onChange={v => set('address', v)} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" value={form.city} onChange={v => set('city', v)} />
                <Field label="State" value={form.state} onChange={v => set('state', v)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Agent</label>
                <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Auto-assign</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Field label="Annual Income (₹)" type="number" value={form.income} onChange={v => set('income', v)} placeholder="e.g. 600000" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                <select value={form.employment_type} onChange={e => set('employment_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="salaried">Salaried</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="business">Business Owner</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Score Range</label>
                <select value={form.credit_score_range} onChange={e => set('credit_score_range', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="800+">800+ (Excellent)</option>
                  <option value="750-800">750–800 (Very Good)</option>
                  <option value="700-750">700–750 (Good)</option>
                  <option value="650-700">650–700 (Fair)</option>
                  <option value="600-650">600–650 (Poor)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                <select value={form.source} onChange={e => set('source', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social">Social Media</option>
                  <option value="campaign">Campaign</option>
                  <option value="walk_in">Walk-in</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Interest *</label>
                <div className="grid grid-cols-3 gap-3">
                  {['credit_card','loan','insurance'].map(p => (
                    <button type="button" key={p} onClick={() => set('product_interest', p)}
                      className={`p-4 rounded-xl border-2 text-center transition ${form.product_interest===p ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="text-2xl mb-1">{p==='credit_card'?'💳':p==='loan'?'🏦':'🛡️'}</div>
                      <div className="text-sm font-medium text-gray-800">{p.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl">
                <p className="text-sm font-semibold text-indigo-900">Lead Summary</p>
                <div className="mt-2 text-sm text-indigo-700 space-y-1">
                  <p>{form.first_name} {form.last_name} · {form.city}</p>
                  <p>Income: {form.income ? `₹${Number(form.income).toLocaleString('en-IN')}` : 'Not provided'} · {form.employment_type}</p>
                  <p>Credit: {form.credit_score_range} · Source: {form.source}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40">Back</button>
            {step < steps.length - 1 ? (
              <button type="button" onClick={() => setStep(s => s + 1)} disabled={step===0 && !form.first_name}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">Next →</button>
            ) : (
              <button type="submit" disabled={loading}
                className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">{loading ? 'Creating...' : '✓ Create Lead'}</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}

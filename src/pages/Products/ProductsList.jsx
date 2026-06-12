import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

const icons = { credit_card: '💳', loan: '🏦', insurance: '🛡️' };
const emptyForm = { name: '', type: 'loan', description: '', min_amount: '', max_amount: '', interest_rate: '', tenure_months: '', coverage_amount: '', premium: '', requirements: '', status: 'active' };

export default function ProductsList() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const fetch = () => getProducts().then(r => setProducts(r.data));
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...p }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) { await updateProduct(editing.id, form); toast.success('Product updated'); }
      else { await createProduct(form); toast.success('Product created'); }
      setModal(false);
      fetch();
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const fmt = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

  return (
    <div className="space-y-4">
      {user?.role !== 'agent' && (
        <div className="flex justify-end">
          <button onClick={openAdd} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">+ Add Product</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
            <div className={`px-5 py-4 ${p.type==='credit_card'?'bg-gradient-to-r from-indigo-600 to-purple-600':p.type==='loan'?'bg-gradient-to-r from-blue-600 to-cyan-600':'bg-gradient-to-r from-teal-600 to-green-600'}`}>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{icons[p.type]}</span>
                <StatusBadge status={p.status} />
              </div>
              <h3 className="text-white font-bold text-lg mt-2">{p.name}</h3>
              <p className="text-white/80 text-xs mt-1 capitalize">{p.type.replace(/_/g,' ')}</p>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-600">{p.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {p.interest_rate && <Metric label="Interest Rate" value={`${p.interest_rate}% p.a.`} />}
                {p.tenure_months && <Metric label="Tenure" value={`${p.tenure_months} months`} />}
                {p.premium && <Metric label="Annual Premium" value={fmt(p.premium)} />}
                {p.coverage_amount && <Metric label="Coverage" value={fmt(p.coverage_amount)} />}
                {p.min_amount && <Metric label="Min Amount" value={fmt(p.min_amount)} />}
                {p.max_amount && <Metric label="Max Amount" value={fmt(p.max_amount)} />}
              </div>
              {p.requirements && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Requirements</p>
                  <p className="text-xs text-gray-600">{p.requirements}</p>
                </div>
              )}
              {user?.role !== 'agent' && (
                <button onClick={() => openEdit(p)} className="w-full mt-2 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">Edit Product</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input required value={form.name} onChange={e=>set('name',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select required value={form.type} onChange={e=>set('type',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="credit_card">Credit Card</option>
                <option value="loan">Loan</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e=>set('status',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <NumField label="Interest Rate (%)" value={form.interest_rate} onChange={v=>set('interest_rate',v)} />
            <NumField label="Tenure (months)" value={form.tenure_months} onChange={v=>set('tenure_months',v)} />
            <NumField label="Min Amount (₹)" value={form.min_amount} onChange={v=>set('min_amount',v)} />
            <NumField label="Max Amount (₹)" value={form.max_amount} onChange={v=>set('max_amount',v)} />
            <NumField label="Coverage Amount (₹)" value={form.coverage_amount} onChange={v=>set('coverage_amount',v)} />
            <NumField label="Annual Premium (₹)" value={form.premium} onChange={v=>set('premium',v)} />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              <textarea value={form.requirements} onChange={e=>set('requirements',e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60">{loading ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Metric({ label, value }) {
  return <div><p className="text-xs text-gray-400">{label}</p><p className="font-semibold text-gray-900">{value}</p></div>;
}
function NumField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="number" step="any" value={value} onChange={e=>onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}

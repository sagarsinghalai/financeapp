import { useEffect, useState } from 'react';
import { getTeams, createTeam, updateTeam, getUsers } from '../../api/client';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [membersModal, setMembersModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', manager_id: '', territory: '' });
  const [loading, setLoading] = useState(false);

  const fetch = () => getTeams().then(r => setTeams(r.data));
  useEffect(() => { fetch(); getUsers().then(r => setUsers(r.data.filter(u=>u.role!=='agent'||true))); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', manager_id: '', territory: '' }); setModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, manager_id: t.manager_id || '', territory: t.territory || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, manager_id: form.manager_id || null };
      if (editing) { await updateTeam(editing.id, data); toast.success('Team updated'); }
      else { await createTeam(data); toast.success('Team created'); }
      setModal(false);
      fetch();
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');
  const getMembers = (teamId) => users.filter(u => u.team_id === teamId);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openAdd} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">+ Add Team</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teams.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{t.name}</h3>
                <p className="text-sm text-gray-500">{t.territory || 'No territory'}</p>
              </div>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">{t.member_count} members</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Manager: <span className="font-medium">{t.manager_name || '—'}</span></p>
            <div className="flex gap-2">
              <button onClick={() => openEdit(t)} className="flex-1 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">Edit</button>
              <button onClick={() => setMembersModal(t)} className="flex-1 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100">View Members</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Team' : 'Add Team'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
            <input required value={form.name} onChange={e=>set('name',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Territory</label>
            <input value={form.territory} onChange={e=>set('territory',e.target.value)} placeholder="e.g. North India" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <select value={form.manager_id} onChange={e=>set('manager_id',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">No Manager</option>
              {managers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60">{loading ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!membersModal} onClose={() => setMembersModal(null)} title={`${membersModal?.name} — Members`}>
        <div className="space-y-2">
          {getMembers(membersModal?.id).map(u => (
            <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-bold">{u.name?.charAt(0)}</div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email} · {u.role}</p>
              </div>
            </div>
          ))}
          {getMembers(membersModal?.id).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No members in this team</p>}
        </div>
      </Modal>
    </div>
  );
}

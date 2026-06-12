import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, UsersIcon, ChartBarIcon, CreditCardIcon, DocumentTextIcon,
  BriefcaseIcon, UserGroupIcon, CurrencyRupeeIcon, TrophyIcon, Cog6ToothIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/', icon: HomeIcon, label: 'Dashboard', roles: ['admin', 'manager', 'agent'] },
  { to: '/leads', icon: UsersIcon, label: 'Leads', roles: ['admin', 'manager', 'agent'] },
  { to: '/applications', icon: DocumentTextIcon, label: 'Applications', roles: ['admin', 'manager', 'agent'] },
  { to: '/products', icon: CreditCardIcon, label: 'Products', roles: ['admin', 'manager', 'agent'] },
  { to: '/my-performance', icon: TrophyIcon, label: 'My Performance', roles: ['agent', 'manager'] },
  { to: '/commissions', icon: CurrencyRupeeIcon, label: 'Commissions', roles: ['admin', 'manager', 'agent'] },
  { to: '/admin/users', icon: UserGroupIcon, label: 'Users', roles: ['admin'] },
  { to: '/admin/teams', icon: BriefcaseIcon, label: 'Teams', roles: ['admin', 'manager'] },
  { to: '/admin/reports', icon: ChartBarIcon, label: 'Reports', roles: ['admin', 'manager'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const filtered = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex flex-col w-64 bg-indigo-900 min-h-screen">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-700">
        <div className="w-8 h-8 bg-indigo-400 rounded-lg flex items-center justify-center">
          <CreditCardIcon className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-lg">FinCRM Pro</span>
      </div>

      <div className="px-3 py-2 mt-2">
        <div className="bg-indigo-800 rounded-lg px-3 py-2">
          <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Logged in as</p>
          <p className="text-white font-semibold text-sm mt-0.5">{user?.name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-600 text-indigo-100 text-xs rounded-full capitalize">{user?.role}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {filtered.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

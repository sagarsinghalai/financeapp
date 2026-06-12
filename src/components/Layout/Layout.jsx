import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/leads/new': 'New Lead',
  '/applications': 'Applications',
  '/products': 'Products',
  '/admin/users': 'User Management',
  '/admin/teams': 'Teams',
  '/admin/reports': 'Reports',
  '/my-performance': 'My Performance',
  '/commissions': 'Commissions',
};

export default function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'FinCRM Pro';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

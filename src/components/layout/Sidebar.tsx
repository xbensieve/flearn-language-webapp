import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  Settings,
  ChevronLeft,
  GraduationCap,
} from 'lucide-react';
import { useSidebarStore } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/applications', icon: UserCheck, label: 'Applications' },
  { to: '/dashboard/courses', icon: BookOpen, label: 'Courses' },
  { to: '/dashboard/users', icon: Users, label: 'Users' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar = () => {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-surface border-r border-border transition-all duration-300 z-40',
        isOpen ? 'w-64' : 'w-16'
      )}>
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {isOpen && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-500" />
              <span className="font-sans font-semibold text-2xl text-blue-500 ">FLearn</span>
            </div>
          )}
          <button
            onClick={toggle}
            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
            <ChevronLeft className={cn('h-5 w-5 transition-transform', !isOpen && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all',
                  isActive
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'hover:bg-blue-100 text-gray-700'
                )
              }>
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

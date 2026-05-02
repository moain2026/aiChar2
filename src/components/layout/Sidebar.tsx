import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  LogOut,
  Sparkles,
  X,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/constants';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useToast } from '@/hooks/useToast';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.chat, label: 'Chat', icon: MessageSquare },
  { to: ROUTES.documents, label: 'Documents', icon: FileText },
];

/**
 * Application sidebar — collapsible on desktop and a slide-in drawer on mobile.
 */
export function Sidebar(): JSX.Element {
  const open = useUIStore((s) => s.sidebarOpen);
  const setOpen = useUIStore((s) => s.setSidebarOpen);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const toast = useToast();

  // Auto-close on mobile when navigating
  useEffect(() => {
    if (isMobile && open === undefined) setOpen(false);
  }, [isMobile, open, setOpen]);

  async function handleLogout(): Promise<void> {
    await logout();
    toast.success({ title: 'Signed out', description: 'See you soon!' });
    navigate(ROUTES.login, { replace: true });
  }

  // On mobile we render as drawer with backdrop; on desktop as static column.
  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-72 glass-strong border-r border-border shadow-2xl flex flex-col md:hidden"
            >
              <SidebarContent onClose={() => setOpen(false)} />
              <SidebarFooter user={user} onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 264 : 76 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="hidden md:flex h-full flex-col border-r border-border bg-card/50 backdrop-blur-sm shrink-0 overflow-hidden"
    >
      <SidebarContent collapsed={!open} onToggle={toggle} />
      <SidebarFooter user={user} onLogout={handleLogout} collapsed={!open} />
    </motion.aside>
  );
}

interface SidebarContentProps {
  collapsed?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

function SidebarContent({ collapsed, onClose, onToggle }: SidebarContentProps): JSX.Element {
  return (
    <>
      <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center w-full')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-semibold text-sm truncate">DocuMind AI</span>
              <span className="text-[10px] text-muted-foreground truncate">
                Document Intelligence
              </span>
            </div>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {onToggle && !collapsed && (
          <button
            type="button"
            aria-label="Collapse sidebar"
            onClick={onToggle}
            className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && onToggle && (
        <button
          type="button"
          aria-label="Expand sidebar"
          onClick={onToggle}
          className="hidden md:flex mx-auto mt-2 h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </button>
      )}

      <nav
        className={cn(
          'flex-1 overflow-y-auto py-3',
          collapsed ? 'px-2' : 'px-3',
        )}
      >
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                    'h-10',
                    collapsed ? 'justify-center px-0' : 'px-3',
                    isActive
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary-500"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <item.icon
                      className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-primary-500')}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

function SidebarFooter({
  user,
  onLogout,
  collapsed,
}: {
  user: { name: string; email: string } | null;
  onLogout: () => void;
  collapsed?: boolean;
}): JSX.Element {
  if (!user) return <></>;
  return (
    <div
      className={cn(
        'border-t border-border shrink-0',
        collapsed ? 'p-2' : 'p-3',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg p-2',
          collapsed && 'justify-center',
        )}
      >
        <Avatar name={user.name} size="md" showStatus />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        fullWidth={!collapsed}
        leftIcon={<LogOut className="h-4 w-4" />}
        onClick={onLogout}
        className={cn(collapsed && 'h-9 w-9 px-0', 'mt-1 justify-start')}
        aria-label="Sign out"
      >
        {!collapsed && 'Sign out'}
      </Button>
    </div>
  );
}

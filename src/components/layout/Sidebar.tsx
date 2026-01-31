import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Workflow,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  BarChart3,
  Users,
  Package
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Bot, label: 'Agentes', path: '/agents' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations' },
  { icon: Smartphone, label: 'WhatsApp', path: '/whatsapp' },
  { icon: Workflow, label: 'Automatizaciones', path: '/automations' },
  { icon: BarChart3, label: 'Analíticas', path: '/analytics' },
  { icon: Users, label: 'Contactos', path: '/contacts' },
  { icon: Package, label: 'Artículos', path: '/articles' },
  { icon: Settings, label: 'Configuración', path: '/settings' },

];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      {/* Mobile Overlay - only visible on mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Hamburger Button - only visible on mobile */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-sidebar border border-sidebar-border shadow-lg"
      >
        <ChevronRight className={cn("w-6 h-6 text-sidebar-foreground transition-transform", mobileOpen && "rotate-180")} />
      </button>

      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col",
          // Mobile: hidden by default, shown when mobileOpen is true
          "translate-x-0 md:translate-x-0",
          !mobileOpen && "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl text-sidebar-foreground">
                  AgentFlow
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg glow-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg",
            collapsed ? "justify-center" : ""
          )}>
            <Avatar className="w-10 h-10 border-2 border-sidebar-primary">
              <AvatarImage src="" />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">Pro Plan</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

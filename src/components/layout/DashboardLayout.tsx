import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarWidth, setSidebarWidth] = useState(280);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background dark">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="ml-[280px] min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-6">
          {children}
        </div>
      </motion.main>
    </div>
  );
}

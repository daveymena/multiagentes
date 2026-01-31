import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Bot, TrendingUp, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentConversations } from '@/components/dashboard/RecentConversations';
import { AgentsList } from '@/components/dashboard/AgentsList';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3002'
  : `http://${window.location.hostname}:3002`;

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    conversations: 0,
    contacts: 0,
    agents: 0,
    conversion: '0%'
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const headers = { 'x-tenant-id': user?.id || 'demo_tenant' };
      const [convs, agents] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/conversations`, { headers }),
        axios.get(`${BACKEND_URL}/api/agents`, { headers })
      ]);

      // Calculamos contactos únicos basados en los números de teléfono de las conversaciones
      const uniqueContacts = new Set(convs.data.map((c: any) => c.contactPhone)).size;

      setStats({
        conversations: convs.data.length,
        contacts: uniqueContacts,
        agents: agents.data.filter((a: any) => a.status === 'active').length,
        conversion: '0%' // Futura implementación
      });
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            ¡Bienvenido de vuelta! 👋
          </h1>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de la actividad de tus agentes
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Conversaciones"
            value={loading ? "..." : stats.conversations.toString()}
            icon={<MessageSquare className="w-6 h-6" />}
            delay={0}
          />
          <StatsCard
            title="Contactos Activos"
            value={loading ? "..." : stats.contacts.toString()}
            icon={<Users className="w-6 h-6" />}
            delay={0.1}
          />
          <StatsCard
            title="Agentes Activos"
            value={loading ? "..." : stats.agents.toString()}
            icon={<Bot className="w-6 h-6" />}
            delay={0.15}
          />
          <StatsCard
            title="Tasa de Conversión"
            value={stats.conversion}
            icon={<TrendingUp className="w-6 h-6" />}
            delay={0.2}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentConversations />
          </div>
          <div>
            <AgentsList />
          </div>
        </div>


      </div>
    </DashboardLayout>
  );
}

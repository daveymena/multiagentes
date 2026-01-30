import { motion } from 'framer-motion';
import { MessageSquare, Users, Bot, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentConversations } from '@/components/dashboard/RecentConversations';
import { AgentsList } from '@/components/dashboard/AgentsList';

export default function Dashboard() {
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
            title="Conversaciones Hoy"
            value="156"
            icon={<MessageSquare className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
            delay={0}
          />
          <StatsCard
            title="Contactos Activos"
            value="2,345"
            icon={<Users className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
            delay={0.1}
          />
          <StatsCard
            title="Agentes Activos"
            value="4"
            icon={<Bot className="w-6 h-6" />}
            delay={0.15}
          />
          <StatsCard
            title="Tasa de Conversión"
            value="24.5%"
            icon={<TrendingUp className="w-6 h-6" />}
            trend={{ value: 3.2, isPositive: true }}
            delay={0.2}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentConversations />
          <AgentsList />
        </div>
      </div>
    </DashboardLayout>
  );
}

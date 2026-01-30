import { motion } from 'framer-motion';
import { Plus, Link2, Zap, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    icon: Plus,
    label: 'Crear Agente',
    description: 'Nuevo agente IA',
    color: 'from-green-500 to-emerald-600',
    path: '/agents/new'
  },
  {
    icon: Link2,
    label: 'Conectar WhatsApp',
    description: 'Vincular número',
    color: 'from-primary to-accent',
    path: '/whatsapp'
  },
  {
    icon: Zap,
    label: 'Automatización',
    description: 'Crear flujo',
    color: 'from-purple-500 to-pink-600',
    path: '/automations/new'
  },
  {
    icon: FileText,
    label: 'Ver Reportes',
    description: 'Analíticas',
    color: 'from-blue-500 to-cyan-600',
    path: '/analytics'
  }
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 * index }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="relative group p-5 rounded-2xl glass border border-border/50 text-left overflow-hidden hover:border-primary/30 transition-all duration-300"
        >
          {/* Gradient background on hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
            action.color
          )} />
          
          <div className="relative z-10">
            <div className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg",
              action.color
            )}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}

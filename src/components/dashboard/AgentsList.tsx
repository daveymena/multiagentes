import { motion } from 'framer-motion';
import { Bot, MoreVertical, Play, Pause, Settings, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  type: 'sales' | 'support' | 'services' | 'marketing' | 'custom';
  status: 'active' | 'inactive' | 'paused';
  conversations: number;
  responseRate: number;
}

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Agente de Ventas Pro',
    type: 'sales',
    status: 'active',
    conversations: 156,
    responseRate: 98
  },
  {
    id: '2',
    name: 'Soporte Técnico 24/7',
    type: 'support',
    status: 'active',
    conversations: 89,
    responseRate: 95
  },
  {
    id: '3',
    name: 'Asistente de Servicios',
    type: 'services',
    status: 'paused',
    conversations: 45,
    responseRate: 92
  },
  {
    id: '4',
    name: 'Marketing Bot',
    type: 'marketing',
    status: 'inactive',
    conversations: 0,
    responseRate: 0
  }
];

const typeConfig = {
  sales: { label: 'Ventas', color: 'bg-green-500' },
  support: { label: 'Soporte', color: 'bg-blue-500' },
  services: { label: 'Servicios', color: 'bg-purple-500' },
  marketing: { label: 'Marketing', color: 'bg-orange-500' },
  custom: { label: 'Personalizado', color: 'bg-gray-500' }
};

const statusConfig = {
  active: { label: 'Activo', className: 'bg-success/10 text-success border-success/20' },
  paused: { label: 'Pausado', className: 'bg-warning/10 text-warning border-warning/20' },
  inactive: { label: 'Inactivo', className: 'bg-muted text-muted-foreground border-border' }
};

export function AgentsList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-2xl glass border border-border/50 overflow-hidden"
    >
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-display font-semibold">Mis Agentes</h2>
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            Nuevo Agente
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {mockAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="p-4 hover:bg-muted/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    <Bot className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                  agent.status === 'active' ? 'bg-success' : 
                  agent.status === 'paused' ? 'bg-warning' : 'bg-muted-foreground'
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground truncate">{agent.name}</h3>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    typeConfig[agent.type].color
                  )} />
                  <span className="text-xs text-muted-foreground">
                    {typeConfig[agent.type].label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{agent.conversations} conversaciones</span>
                  <span>{agent.responseRate}% respuesta</span>
                </div>
              </div>

              <Badge variant="outline" className={cn("text-xs", statusConfig[agent.status].className)}>
                {statusConfig[agent.status].label}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {agent.status === 'active' ? (
                    <DropdownMenuItem>
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem>
                      <Play className="w-4 h-4 mr-2" />
                      Activar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

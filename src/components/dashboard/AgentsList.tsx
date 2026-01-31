import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, MoreVertical, Play, Pause, Settings, Trash2, Loader2, Plus } from 'lucide-react';
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
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:3001'
  : `http://${window.location.hostname}:3001`;

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'paused';
}

const statusConfig = {
  active: { label: 'Activo', className: 'bg-success/10 text-success border-success/20' },
  paused: { label: 'Pausado', className: 'bg-warning/10 text-warning border-warning/20' },
  inactive: { label: 'Inactivo', className: 'bg-muted text-muted-foreground border-border' }
};

export function AgentsList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/agents`);
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-2xl glass border border-border/50 overflow-hidden h-full flex flex-col"
    >
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-display font-semibold">Mis Agentes</h2>
          </div>
          <Button size="sm" onClick={() => navigate('/agents')} className="bg-primary hover:bg-primary/90">
            Ver Todos
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : agents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">No tienes agentes creados aún</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/agents')}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Agente
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {agents.map((agent, index) => (
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
                      agent.status === 'active' || !agent.status ? 'bg-success' :
                        agent.status === 'paused' ? 'bg-warning' : 'bg-muted-foreground'
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{agent.description || 'Sin descripción'}</p>
                  </div>

                  <Badge variant="outline" className={cn("text-xs hidden sm:flex", statusConfig[agent.status || 'active'].className)}>
                    {statusConfig[agent.status || 'active'].label}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('/agents')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Gestionar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

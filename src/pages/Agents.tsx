import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Bot, MoreVertical, Play, Pause, Settings, Trash2, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'support' | 'services' | 'marketing' | 'custom';
  status: 'active' | 'inactive' | 'paused';
  aiProvider: string;
  conversations: number;
  responseRate: number;
  createdAt: string;
}

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Agente de Ventas Pro',
    description: 'Especializado en cerrar ventas y generar leads calificados',
    type: 'sales',
    status: 'active',
    aiProvider: 'Lovable AI',
    conversations: 1256,
    responseRate: 98,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Soporte Técnico 24/7',
    description: 'Resuelve dudas técnicas y problemas de los clientes',
    type: 'support',
    status: 'active',
    aiProvider: 'Lovable AI',
    conversations: 892,
    responseRate: 95,
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'Asistente de Citas',
    description: 'Agenda y gestiona citas con clientes',
    type: 'services',
    status: 'paused',
    aiProvider: 'Groq',
    conversations: 456,
    responseRate: 92,
    createdAt: '2024-02-01'
  },
  {
    id: '4',
    name: 'Promotor de Ofertas',
    description: 'Envía promociones y ofertas especiales',
    type: 'marketing',
    status: 'inactive',
    aiProvider: 'Lovable AI',
    conversations: 234,
    responseRate: 88,
    createdAt: '2024-02-10'
  }
];

const typeConfig = {
  sales: { label: 'Ventas', color: 'bg-green-500', bgLight: 'bg-green-500/10', textColor: 'text-green-500' },
  support: { label: 'Soporte', color: 'bg-blue-500', bgLight: 'bg-blue-500/10', textColor: 'text-blue-500' },
  services: { label: 'Servicios', color: 'bg-purple-500', bgLight: 'bg-purple-500/10', textColor: 'text-purple-500' },
  marketing: { label: 'Marketing', color: 'bg-orange-500', bgLight: 'bg-orange-500/10', textColor: 'text-orange-500' },
  custom: { label: 'Personalizado', color: 'bg-gray-500', bgLight: 'bg-gray-500/10', textColor: 'text-gray-500' }
};

const statusConfig = {
  active: { label: 'Activo', className: 'bg-success/10 text-success border-success/20' },
  paused: { label: 'Pausado', className: 'bg-warning/10 text-warning border-warning/20' },
  inactive: { label: 'Inactivo', className: 'bg-muted text-muted-foreground border-border' }
};

export default function Agents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-display font-bold text-foreground mb-1">
              Mis Agentes
            </h1>
            <p className="text-muted-foreground">
              Gestiona y configura tus agentes de IA
            </p>
          </motion.div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Agente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Crear Nuevo Agente
                </DialogTitle>
                <DialogDescription>
                  Configura un nuevo agente de IA para automatizar tus conversaciones
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del agente</Label>
                  <Input id="name" placeholder="Ej: Agente de Ventas" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de agente</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Ventas</SelectItem>
                      <SelectItem value="support">Soporte</SelectItem>
                      <SelectItem value="services">Servicios</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">Proveedor de IA</Label>
                  <Select defaultValue="lovable_ai">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lovable_ai">Lovable AI (Recomendado)</SelectItem>
                      <SelectItem value="groq">Groq</SelectItem>
                      <SelectItem value="ollama">Ollama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt del sistema</Label>
                  <Textarea 
                    id="prompt" 
                    placeholder="Describe el comportamiento y personalidad del agente..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome">Mensaje de bienvenida</Label>
                  <Input 
                    id="welcome" 
                    placeholder="Ej: ¡Hola! ¿En qué puedo ayudarte hoy?"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                    Crear Agente
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar agentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </motion.div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group relative rounded-2xl glass border border-border/50 p-6 hover:border-primary/30 transition-all duration-300"
            >
              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className={cn("text-xs", statusConfig[agent.status].className)}>
                  {statusConfig[agent.status].label}
                </Badge>
              </div>

              {/* Agent Avatar */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <Avatar className="w-14 h-14 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      <Bot className="w-7 h-7" />
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card",
                    agent.status === 'active' ? 'bg-success' : 
                    agent.status === 'paused' ? 'bg-warning' : 'bg-muted-foreground'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      typeConfig[agent.type].bgLight,
                      typeConfig[agent.type].textColor
                    )}>
                      {typeConfig[agent.type].label}
                    </span>
                    <span className="text-xs text-muted-foreground">{agent.aiProvider}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {agent.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-foreground">{agent.conversations.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Conversaciones</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-foreground">{agent.responseRate}%</p>
                  <p className="text-xs text-muted-foreground">Tasa de respuesta</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}

          {/* Add New Agent Card */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setIsCreateOpen(true)}
            className="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 p-6 flex flex-col items-center justify-center gap-4 min-h-[300px] transition-all duration-300 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Crear nuevo agente</p>
              <p className="text-sm text-muted-foreground">Configura un agente IA personalizado</p>
            </div>
          </motion.button>
        </div>
      </div>
    </DashboardLayout>
  );
}

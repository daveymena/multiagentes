import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Bot, MoreVertical, Play, Pause, Settings, Trash2, Sparkles, Loader2 } from 'lucide-react';
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
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:3001'
  : `http://${window.location.hostname}:3001`;


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
  welcomeMessage: string;
}

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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'sales',
    aiProvider: 'lovable_ai',
    description: '',
    welcomeMessage: ''
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/agents`);
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Error al cargar los agentes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post(`${BACKEND_URL}/api/agents`, formData);
      toast.success('Agente creado correctamente');
      setIsCreateOpen(false);
      fetchAgents();
      setFormData({
        name: '',
        type: 'sales',
        aiProvider: 'lovable_ai',
        description: '',
        welcomeMessage: ''
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Error al crear el agente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/agents/${id}`);
      toast.success('Agente eliminado');
      fetchAgents();
    } catch (error) {
      toast.error('Error al eliminar agente');
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-display font-bold text-foreground mb-1">
              Mis Agentes
            </h1>
            <p className="text-muted-foreground">
              Gestiona y configura tus agentes de IA reales
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

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del agente</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Agente de Ventas"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de agente</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
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
                  <Select
                    value={formData.aiProvider}
                    onValueChange={(value) => setFormData({ ...formData, aiProvider: value })}
                  >
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
                  <Label htmlFor="prompt">Descripción / Instrucciones</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe el comportamiento y personalidad del agente..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome">Mensaje de bienvenida</Label>
                  <Input
                    id="welcome"
                    placeholder="Ej: ¡Hola! ¿En qué puedo ayudarte hoy?"
                    value={formData.welcomeMessage}
                    onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-gradient-primary hover:opacity-90">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Agente'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

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
        </motion.div>

        {isLoading && agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Cargando agentes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group relative rounded-2xl glass border border-border/50 p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className={cn("text-xs", statusConfig[agent.status]?.className)}>
                    {statusConfig[agent.status]?.label || agent.status}
                  </Badge>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        <Bot className="w-7 h-7" />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        typeConfig[agent.type]?.bgLight,
                        typeConfig[agent.type]?.textColor
                      )}>
                        {typeConfig[agent.type]?.label || agent.type}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {agent.description}
                </p>

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
                      <DropdownMenuItem onClick={() => handleDelete(agent.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}

            <motion.button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 p-6 flex flex-col items-center justify-center gap-4 min-h-[250px] transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Crear nuevo agente</p>
                <p className="text-sm text-muted-foreground">Configura un agente IA real</p>
              </div>
            </motion.button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

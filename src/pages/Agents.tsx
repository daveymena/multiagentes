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
import { useAuth } from '@/hooks/useAuth';

const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3002'
  : `http://${window.location.hostname}:3002`;


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
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'sales',
    aiProvider: 'lovable_ai',
    description: '',
    welcomeMessage: '',
    status: 'active'
  });

  useEffect(() => {
    // Fetch agents immediately on mount, don't wait for user
    fetchAgents();
  }, [user]); // Re-fetch if user changes, but don't block initial fetch

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      console.log('[Agents Page] Fetching agents...');

      const response = await axios.get(`${BACKEND_URL}/api/agents`, {
        headers: { 'x-tenant-id': user?.id || 'demo_tenant' }
      });

      console.log('[Agents Page] Received:', response.data.length, 'agents');

      if (response.data && Array.isArray(response.data)) {
        setAgents(response.data.map((a: any) => ({
          ...a,
          aiProvider: a.ai_provider,
          welcomeMessage: a.welcome_message
        })));
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Error al cargar los agentes');
      // Set empty array on error so UI doesn't crash
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const headers = { 'x-tenant-id': user?.id || 'demo_tenant' };

      if (editingAgent) {
        await axios.put(`${BACKEND_URL}/api/agents/${editingAgent.id}`, formData, { headers });
        toast.success('Agente actualizado correctamente');
      } else {
        await axios.post(`${BACKEND_URL}/api/agents`, formData, { headers });
        toast.success('Agente creado correctamente');
      }
      setIsCreateOpen(false);
      setIsEditOpen(false);
      setEditingAgent(null);
      fetchAgents();
      resetForm();
    } catch (error) {
      console.error('Error saving agent:', error);
      toast.error('Error al guardar el agente');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'sales',
      aiProvider: 'lovable_ai',
      description: '',
      welcomeMessage: '',
      status: 'active'
    });
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      type: agent.type as any,
      aiProvider: agent.aiProvider,
      description: agent.description,
      welcomeMessage: agent.welcomeMessage || '',
      status: agent.status
    });
    setIsEditOpen(true);
  };

  const handleToggleStatus = async (agent: Agent) => {
    try {
      // Logic: If activating an agent, we want to ensure it's the PRIMARY one.
      // Ideally, the backend manages this, but for UI feedback:

      const newStatus = agent.status === 'active' ? 'paused' : 'active';

      // Calculate new state for optimistic update
      const updatedAgents = agents.map(a => {
        if (a.id === agent.id) {
          return { ...a, status: newStatus };
        }
        // If we are activating this one, pause others to imply exclusivity (optional but helpful for user clarity)
        if (newStatus === 'active') {
          return { ...a, status: 'paused' };
        }
        return a;
      });

      setAgents(updatedAgents);

      await axios.patch(`${BACKEND_URL}/api/agents/${agent.id}/status`,
        { status: newStatus },
        { headers: { 'x-tenant-id': user?.id || 'demo_tenant' } }
      );

      // If activating, we might want to ensure backend knows others are paused, 
      // but for now let's rely on the user selecting the one they want.

      toast.success(`Agente ${agent.name} ahora está ${newStatus === 'active' ? 'ACTIVO' : 'PAUSADO'}`);

      // Refresh to ensure sync
      fetchAgents();
    } catch (error) {
      toast.error('Error al cambiar estado');
      fetchAgents(); // Revert on error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este agente?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/agents/${id}`, {
        headers: { 'x-tenant-id': user?.id || 'demo_tenant' }
      });
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
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
              Mis Agentes
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gestiona y configura tus agentes de IA reales
            </p>
          </motion.div>

          <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false);
              setIsEditOpen(false);
              setEditingAgent(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Agente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {editingAgent ? 'Configurar Agente' : 'Crear Nuevo Agente'}
                </DialogTitle>
                <DialogDescription>
                  {editingAgent ? 'Modifica los parámetros de tu agente de IA' : 'Configura un nuevo agente de IA para automatizar tus conversaciones'}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de agente</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
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
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="paused">Pausado</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                      <SelectItem value="groq">Groq (Ultra Rápido - Recomendado)</SelectItem>
                      <SelectItem value="ollama">Ollama (Tu Servidor Privado)</SelectItem>
                      <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                    </SelectContent>
                  </Select>

                  {formData.aiProvider === 'groq' && (
                    <p className="text-xs text-muted-foreground mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800">
                      ℹ️ <strong>Tip:</strong> Puedes obtener tu propia API Key gratuita y de alta velocidad en <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">console.groq.com</a>. Agrégala en la configuración de la cuenta.
                    </p>
                  )}

                  {formData.aiProvider === 'ollama' && (
                    <p className="text-xs text-muted-foreground mt-1 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800">
                      ✅ Conectado a: <code>https://ollama-ollama.ginee6.easypanel.host</code><br />
                      Modelos disponibles: llama3.2, mistral, phi3
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Instrucciones del Sistema (Prompt)</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe detalladamente cómo debe actuar el agente..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
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
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateOpen(false);
                    setIsEditOpen(false);
                    setEditingAgent(null);
                    resetForm();
                  }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-gradient-primary hover:opacity-90">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingAgent ? 'Guardar Cambios' : 'Crear Agente')}
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
              className="pl-10 h-11"
            />
          </div>
        </motion.div>

        {isLoading && agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Cargando agentes...</p>
          </div>
        ) : (
          <>
            {/* Debug info removed */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="group relative rounded-2xl glass border border-border/50 p-6 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:opacity-80 transition-opacity",
                        statusConfig[agent.status]?.className
                      )}
                      onClick={() => handleToggleStatus(agent)}
                    >
                      {statusConfig[agent.status]?.label || agent.status}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <Avatar className="w-14 h-14 border-2 border-primary/20 shadow-inner">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                          <Bot className="w-7 h-7" />
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate text-lg">{agent.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md",
                          typeConfig[agent.type]?.bgLight,
                          typeConfig[agent.type]?.textColor
                        )}>
                          {typeConfig[agent.type]?.label || agent.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3 h-15 italic">
                    "{agent.description}"
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-9 px-4 font-semibold"
                      onClick={() => handleEdit(agent)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant={agent.status === 'active' ? 'outline' : 'default'}
                        size="sm"
                        className={cn(
                          "h-9 px-4 font-semibold shadow-sm transition-all",
                          agent.status === 'active'
                            ? "border-success/30 text-success hover:bg-success/5"
                            : "bg-primary hover:opacity-90 hover:scale-105"
                        )}
                        onClick={() => handleToggleStatus(agent)}
                        title={agent.status === 'active' ? 'Pausar este agente' : 'Seleccionar como agente activo'}
                      >
                        {agent.status === 'active' ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
                            ACTIVO
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                            ACTIVAR
                          </>
                        )}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(agent)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Configuración avanzada
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(agent)}>
                            {agent.status === 'active' ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            {agent.status === 'active' ? 'Pausar agente' : 'Activar agente'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(agent.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}

              <motion.button
                onClick={() => {
                  resetForm();
                  setIsCreateOpen(true);
                }}
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

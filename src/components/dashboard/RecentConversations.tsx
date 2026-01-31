import { motion } from 'framer-motion';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  time: string;
  status: 'open' | 'pending' | 'closed';
  unread: number;
}

// Inicialmente vacío porque conectaremos con el backend real en el futuro
const conversations: Conversation[] = [];

const statusConfig = {
  open: { label: 'Abierta', className: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'Pendiente', className: 'bg-warning/10 text-warning border-warning/20' },
  closed: { label: 'Cerrada', className: 'bg-muted text-muted-foreground border-border' }
};

export function RecentConversations() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl glass border border-border/50 overflow-hidden h-full flex flex-col"
    >
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-display font-semibold">Conversaciones Recientes</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/conversations')} className="text-primary hover:text-primary/80">
            Ver todas
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {conversations.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">No hay mensajes recientes</p>
            <p className="text-sm text-muted-foreground/60 mb-6">Conecta WhatsApp para empezar a recibir mensajes.</p>
            <Button onClick={() => navigate('/whatsapp')} size="sm" variant="outline">
              Conectar Ahora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                onClick={() => navigate('/conversations')}
                className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {conversation.contactName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {conversation.unread}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground truncate">
                        {conversation.contactName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {conversation.time}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-xs", statusConfig[conversation.status].className)}>
                        {statusConfig[conversation.status].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{conversation.contactPhone}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

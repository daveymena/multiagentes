import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MessageSquare, Clock, Phone, Send, Paperclip, Smile, MoreVertical, User, Bot } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  agentName: string;
  lastMessage: string;
  time: string;
  status: 'open' | 'pending' | 'closed';
  unread: number;
  messages: Message[];
}

const mockConversations: Conversation[] = [];

const statusConfig = {
  open: { label: 'Abierta', className: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'Pendiente', className: 'bg-warning/10 text-warning border-warning/20' },
  closed: { label: 'Cerrada', className: 'bg-muted text-muted-foreground border-border' }
};

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);


  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex rounded-2xl overflow-hidden glass border border-border/50">
        {/* Conversations List */}
        <div className="w-96 border-r border-border/50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <h2 className="text-xl font-display font-semibold mb-4">Conversaciones</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50"
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/50">
              {mockConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No hay conversaciones activas</p>
                </div>
              ) : mockConversations.map((conversation) => (
                <motion.button
                  key={conversation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedConversation(conversation)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-muted/30 transition-colors",
                    selectedConversation?.id === conversation.id && "bg-muted/50"
                  )}
                >
                  <div className="flex items-start gap-3">
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
                        <span className="font-medium text-foreground truncate">
                          {conversation.contactName}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {conversation.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", statusConfig[conversation.status].className)}>
                          {statusConfig[conversation.status].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{conversation.agentName}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollArea>

        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {selectedConversation.contactName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground">{selectedConversation.contactName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {selectedConversation.contactPhone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs", statusConfig[selectedConversation.status].className)}>
                    {statusConfig[selectedConversation.status].label}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className={cn(
                        "flex gap-3 max-w-[80%]",
                        message.sender === 'agent' ? 'ml-0' : 'ml-auto flex-row-reverse'
                      )}
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={cn(
                          message.sender === 'agent'
                            ? "bg-gradient-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        )}>
                          {message.sender === 'agent' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "rounded-2xl px-4 py-3",
                        message.sender === 'agent'
                          ? "bg-secondary text-foreground rounded-tl-none"
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      )}>
                        <p className="text-sm">{message.content}</p>
                        <span className={cn(
                          "text-xs mt-1 block",
                          message.sender === 'agent' ? "text-muted-foreground" : "text-primary-foreground/70"
                        )}>
                          {message.timestamp}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="bg-gradient-primary hover:opacity-90">
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Selecciona una conversación</h3>
              <p className="text-muted-foreground max-w-xs">
                Haz clic en una conversación de la lista para ver los mensajes y responder.
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, QrCode, Link2, CheckCircle2, XCircle, RefreshCw, Loader2, Wifi, WifiOff } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface WhatsAppConnection {
  id: string;
  phoneNumber: string;
  isConnected: boolean;
  lastConnected: string;
  messagesTotal: number;
}

const mockConnections: WhatsAppConnection[] = [
  {
    id: '1',
    phoneNumber: '+52 55 1234 5678',
    isConnected: true,
    lastConnected: 'Ahora',
    messagesTotal: 1234
  },
  {
    id: '2',
    phoneNumber: '+52 55 8765 4321',
    isConnected: false,
    lastConnected: 'Hace 2 días',
    messagesTotal: 567
  }
];

export default function WhatsApp() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connections] = useState<WhatsAppConnection[]>(mockConnections);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection
    setTimeout(() => setIsConnecting(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Conexión WhatsApp
          </h1>
          <p className="text-muted-foreground">
            Conecta tu número de WhatsApp para empezar a automatizar conversaciones
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connect New Number */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  Conectar Nuevo Número
                </CardTitle>
                <CardDescription>
                  Escanea el código QR con tu WhatsApp para vincular
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code Area */}
                <div className="relative aspect-square max-w-xs mx-auto rounded-2xl bg-secondary/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                  {isConnecting ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Generando código QR...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 p-6 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Smartphone className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground mb-1">Listo para conectar</p>
                        <p className="text-sm text-muted-foreground">
                          Haz clic en el botón para generar el código QR
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Instrucciones:</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      Abre WhatsApp en tu teléfono
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      Ve a Configuración → Dispositivos vinculados
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      Toca "Vincular un dispositivo" y escanea el código
                    </li>
                  </ol>
                </div>

                <Button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Generar Código QR
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Connected Numbers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Números Conectados
                </CardTitle>
                <CardDescription>
                  Gestiona tus conexiones de WhatsApp activas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connections.map((connection, index) => (
                    <motion.div
                      key={connection.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={cn(
                        "p-4 rounded-xl border transition-all duration-300",
                        connection.isConnected 
                          ? "bg-success/5 border-success/20" 
                          : "bg-muted/50 border-border"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            connection.isConnected ? "bg-success/10" : "bg-muted"
                          )}>
                            {connection.isConnected ? (
                              <Wifi className="w-5 h-5 text-success" />
                            ) : (
                              <WifiOff className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{connection.phoneNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {connection.messagesTotal.toLocaleString()} mensajes totales
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn(
                          connection.isConnected 
                            ? "bg-success/10 text-success border-success/20" 
                            : "bg-muted text-muted-foreground border-border"
                        )}>
                          {connection.isConnected ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Conectado
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Desconectado
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Última conexión: {connection.lastConnected}
                        </span>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          {connection.isConnected ? 'Reconectar' : 'Conectar'}
                        </Button>
                      </div>
                    </motion.div>
                  ))}

                  {connections.length === 0 && (
                    <div className="text-center py-8">
                      <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No hay números conectados</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Conexión a través de WhatsApp Web
              </h3>
              <p className="text-sm text-muted-foreground">
                Esta integración utiliza la API de WhatsApp Web (Baileys) para conectar tu número. 
                Tu teléfono debe permanecer conectado a internet para mantener la sesión activa. 
                Para una integración empresarial más robusta, considera usar la API oficial de WhatsApp Business.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

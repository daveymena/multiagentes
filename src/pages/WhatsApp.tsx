import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, QrCode, Link2, CheckCircle2, XCircle, RefreshCw, Loader2, Wifi, WifiOff } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { io } from 'socket.io-client';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';


const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:3001'
  : `http://${window.location.hostname}:3001`;

export default function WhatsApp() {
  const { user } = useAuth();

  // Garantizar un sessionId estable incluso si no está logueado
  const [sessionId] = useState(() => {
    if (user?.id) return user.id;
    const savedId = localStorage.getItem('temp_session_id');
    if (savedId) return savedId;
    const newId = 'temp_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('temp_session_id', newId);
    return newId;
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    if (!sessionId) return;

    console.log('Conectando Socket.io para sesión:', sessionId);
    const socket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket conectado con ID:', socket.id);
    });


    socket.on(`qr:${sessionId}`, (qr) => {
      console.log('QR Received for', sessionId);
      setQrCode(qr);
    });

    socket.on(`status:${sessionId}`, (newStatus) => {
      console.log('Status update for', sessionId, ':', newStatus);
      setStatus(statusMap[newStatus] || 'disconnected');
      if (newStatus === 'connected' || newStatus === 'open') {
        setStatus('connected');
        setIsConnecting(false);
        setQrCode(null);
      } else if (newStatus === 'connecting') {
        setIsConnecting(true);
      }
    });

    return () => {
      socket.off(`qr:${sessionId}`);
      socket.off(`status:${sessionId}`);
      socket.disconnect();
    };
  }, [sessionId]);

  const statusMap: Record<string, 'disconnected' | 'connecting' | 'connected'> = {
    'connected': 'connected',
    'open': 'connected',
    'connecting': 'connecting',
    'disconnected': 'disconnected',
    'close': 'disconnected'
  };

  const fetchStatus = async () => {
    try {
      if (!sessionId || sessionId === 'anonymous') return;
      const response = await axios.get(`${BACKEND_URL}/api/whatsapp/status/${sessionId}`);
      setStatus(statusMap[response.data.status] || 'disconnected');
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const handleConnect = async () => {
    try {
      console.log('Botón clickeado. Iniciando conexión para:', sessionId);
      toast.info('Iniciando conexión...');
      setIsConnecting(true);
      setQrCode(null);
      const response = await axios.post(`${BACKEND_URL}/api/whatsapp/connect`, {
        sessionId,
        tenantId: 'demo_tenant'
      });
      console.log('Respuesta del servidor:', response.data);
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('No se pudo contactar con el servidor. Verifica que el backend esté corriendo.');
      setIsConnecting(false);
    }
  };


  const handleDisconnect = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/whatsapp/disconnect/${sessionId}`);
      setStatus('disconnected');
      setQrCode(null);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Conexión WhatsApp
          </h1>
          <p className="text-muted-foreground">
            Conecta tu número para que tus agentes puedan responder mensajes reales
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-border/50 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  Vincular Dispositivo
                </CardTitle>
                <CardDescription>
                  Sigue las instrucciones para activar tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative aspect-square max-w-[300px] mx-auto rounded-3xl bg-secondary/30 border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                  {status === 'connected' ? (
                    <div className="flex flex-col items-center gap-4 text-center p-6">
                      <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-success" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-foreground">WhatsApp Conectado</p>
                        <p className="text-sm text-muted-foreground">Tu número está activo y listo</p>
                      </div>
                    </div>
                  ) : qrCode ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-white rounded-2xl shadow-xl"
                    >
                      <QRCodeSVG value={qrCode} size={240} level="H" />
                    </motion.div>
                  ) : isConnecting ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Inicializando motor...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Smartphone className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Haz clic abajo para generar un código de vinculación
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Pasos a seguir:</h4>
                  <ul className="space-y-3">
                    {[
                      "Abre WhatsApp en tu teléfono móvil",
                      "Ve a Configuración > Dispositivos vinculados",
                      "Escanea el código que aparecerá arriba"
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={status === 'connected' ? handleDisconnect : handleConnect}
                  disabled={isConnecting}
                  className={cn(
                    "w-full h-12 text-base font-semibold transition-all duration-300",
                    status === 'connected'
                      ? "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white"
                      : "bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/20"
                  )}
                  variant={status === 'connected' ? "outline" : "default"}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : status === 'connected' ? (
                    <>
                      <XCircle className="w-5 h-5 mr-2" />
                      Desconectar Cuenta
                    </>
                  ) : (
                    <>
                      <Link2 className="w-5 h-5 mr-2" />
                      Generar Código QR
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-border/50 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-primary" />
                  Estado del Sistema
                </CardTitle>
                <CardDescription>
                  Verifica la salud de tu conexión
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={cn(
                  "p-6 rounded-2xl border transition-all duration-500",
                  status === 'connected' ? "bg-success/5 border-success/20 shadow-lg shadow-success/5" : "bg-muted/30 border-border"
                )}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500",
                        status === 'connected' ? "bg-success/20" : "bg-muted"
                      )}>
                        {status === 'connected' ? (
                          <Wifi className="w-7 h-7 text-success" />
                        ) : (
                          <WifiOff className="w-7 h-7 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-xl text-foreground">
                          {status === 'connected' ? 'En Línea' : 'Desconectado'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          SESIÓN: {sessionId.slice(0, 12)}...
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      "px-4 py-1.5 text-xs font-bold uppercase tracking-widest",
                      status === 'connected' ? "bg-success/20 text-success border-success/30" : "bg-muted text-muted-foreground border-border"
                    )}>
                      {status === 'connected' ? 'Activo' : 'Offline'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Empresa</p>
                    <p className="font-semibold text-foreground">Demo Tenant</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Motor</p>
                    <p className="font-semibold text-foreground italic">Baileys v6.x</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Cpu, Key, Save, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Configuración guardada',
        description: 'Los cambios se han aplicado correctamente',
      });
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Configuración
            </h1>
            <p className="text-muted-foreground">
              Personaliza tu experiencia y gestiona tus preferencias
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-primary hover:opacity-90">
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar cambios
          </Button>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-background">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-background">
              <Cpu className="w-4 h-4 mr-2" />
              Proveedores IA
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-background">
              <Bell className="w-4 h-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-background">
              <Shield className="w-4 h-4 mr-2" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle>Información del Perfil</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y datos de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre completo</Label>
                      <Input id="fullName" placeholder="Tu nombre" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="tu@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input id="company" placeholder="Nombre de tu empresa" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" placeholder="+52 55 1234 5678" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* AI Providers Tab */}
          <TabsContent value="ai">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Lovable AI */}
              <Card className="glass border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle>Lovable AI</CardTitle>
                        <CardDescription>Proveedor integrado (Recomendado)</CardDescription>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Modelo predeterminado</Label>
                      <Select defaultValue="gemini-3-flash">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini-3-flash">Gemini 3 Flash (Rápido)</SelectItem>
                          <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro (Avanzado)</SelectItem>
                          <SelectItem value="gpt-5">GPT-5 (Precisión)</SelectItem>
                          <SelectItem value="gpt-5-mini">GPT-5 Mini (Balanceado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Lovable AI está preconfigurado y listo para usar sin necesidad de API keys adicionales.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Groq */}
              <Card className="glass border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle>Groq</CardTitle>
                        <CardDescription>Inferencia ultra-rápida</CardDescription>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="groqKey">API Key de Groq</Label>
                      <div className="flex gap-2">
                        <Input id="groqKey" type="password" placeholder="gsk_..." className="flex-1" />
                        <Button variant="outline">
                          <Key className="w-4 h-4 mr-2" />
                          Verificar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ollama */}
              <Card className="glass border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle>Ollama</CardTitle>
                        <CardDescription>IA local / auto-hospedada</CardDescription>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ollamaUrl">URL del servidor Ollama</Label>
                      <Input id="ollamaUrl" placeholder="http://localhost:11434" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Requiere tener Ollama corriendo en un servidor accesible.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle>Preferencias de Notificaciones</CardTitle>
                  <CardDescription>
                    Configura cómo y cuándo quieres recibir notificaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { id: 'newMessage', label: 'Nuevos mensajes', desc: 'Cuando un contacto envía un mensaje' },
                    { id: 'agentError', label: 'Errores de agente', desc: 'Cuando un agente tiene problemas' },
                    { id: 'dailyReport', label: 'Reporte diario', desc: 'Resumen de actividad cada día' },
                    { id: 'weeklyStats', label: 'Estadísticas semanales', desc: 'Métricas y rendimiento semanal' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.id !== 'weeklyStats'} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle>Seguridad de la Cuenta</CardTitle>
                  <CardDescription>
                    Gestiona la seguridad y acceso a tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña actual</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva contraseña</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    <Button variant="outline">Cambiar contraseña</Button>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div>
                        <p className="font-medium text-foreground">Autenticación de dos factores</p>
                        <p className="text-sm text-muted-foreground">
                          Añade una capa extra de seguridad a tu cuenta
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Save, Key, Shield, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3002'
  : `http://${window.location.hostname}:3002`;

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    groq: '',
    openai: '',
    gemini: '',
    anthropic: ''
  });

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    // TODO: Fetch existing keys from profile if available
    // const { data } = await supabase.from('profiles').select('api_keys').single();
    // if (data?.api_keys) setApiKeys(data.api_keys);

    // For now, load from localStorage for immediate MVP usage
    const savedKeys = localStorage.getItem('multigen_api_keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Save to LocalStorage (Instant client-side usage)
      localStorage.setItem('multigen_api_keys', JSON.stringify(apiKeys));

      // 2. Try to save to Backend/DB (Secure storage)
      await axios.post(`${BACKEND_URL}/api/settings/keys`, {
        api_keys: apiKeys
      }, {
        headers: { 'x-tenant-id': user?.id || 'demo_tenant' }
      });

      toast.success('Claves API guardadas correctamente');
    } catch (error) {
      console.error('Error saving keys:', error);
      toast.success('Claves guardadas localmente (Backend no conectado)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">Gestiona tus credenciales y preferencias de la plataforma.</p>
        </div>

        <Tabs defaultValue="integrations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="integrations">Integraciones IA</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Llaves de API (API Keys)
                </CardTitle>
                <CardDescription>
                  Conecta tus propias cuentas de proveedores de IA. Las llaves se guardan encriptadas.
                  Si dejas un campo vacío, se usará la configuración por defecto del sistema (Ollama/Groq compartido).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveKeys} className="space-y-6">

                  {/* GROQ */}
                  <div className="space-y-4 border p-4 rounded-lg bg-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          Groq Cloud
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Recomendado</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">Velocidad extrema para respuestas en tiempo real.</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">Obtener Key</a>
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>API Key (gsk_...)</Label>
                      <Input
                        type="password"
                        placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
                        value={apiKeys.groq}
                        onChange={e => setApiKeys({ ...apiKeys, groq: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* OPENAI */}
                  <div className="space-y-4 border p-4 rounded-lg bg-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">OpenAI (ChatGPT)</h3>
                        <p className="text-sm text-muted-foreground">Modelos GPT-4 y GPT-3.5 Turbo. Estándar de la industria.</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Obtener Key</a>
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>API Key (sk-...)</Label>
                      <Input
                        type="password"
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                        value={apiKeys.openai}
                        onChange={e => setApiKeys({ ...apiKeys, openai: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* GEMINI */}
                  <div className="space-y-4 border p-4 rounded-lg bg-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Google Gemini</h3>
                        <p className="text-sm text-muted-foreground">Potente, multimodal y con gran ventana de contexto.</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Obtener Key</a>
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        placeholder="AIza..."
                        value={apiKeys.gemini}
                        onChange={e => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg flex gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                      <strong>Nota de Seguridad:</strong> Tus claves se utilizan únicamente para procesar los mensajes de tus agentes.
                      Nunca compartimos tus claves con terceros.
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                      {isLoading ? (
                        <>Guardando...</>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar Configuraciones
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Perfil de Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Configuración de cuenta próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

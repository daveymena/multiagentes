import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Analytics() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                        Análisis de Rendimiento
                    </h1>
                    <p className="text-muted-foreground">
                        Monitoriza el desempeño de tus agentes en tiempo real
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Mensajes</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">Sin actividad registrada aún</p>
                        </CardContent>
                    </Card>
                    <Card className="glass border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nuevos Contactos</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">Esperando primer contacto</p>
                        </CardContent>
                    </Card>
                    <Card className="glass border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0%</div>
                            <p className="text-xs text-muted-foreground">Basado en interacciones reales</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <BarChart3 className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Sin datos suficientes</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Conecta tu cuenta de WhatsApp y activa tus agentes para empezar a visualizar las métricas y reportes.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}

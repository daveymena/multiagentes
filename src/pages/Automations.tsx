import { motion } from 'framer-motion';
import { Zap, Plus, Settings2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';

export default function Automations() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                            Automatizaciones
                        </h1>
                        <p className="text-muted-foreground">
                            Crea reglas y flujos inteligentes para tus conversaciones
                        </p>
                    </motion.div>

                    <Button className="bg-gradient-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Regla
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 grayscale pointer-events-none">
                    {/* Mock cards to show potential but disabled */}
                    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="text-primary w-5 h-5" />
                            <h3 className="font-semibold">Respuesta Automática Fuera de Horario</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Próximamente disponible</p>
                    </div>
                    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="text-primary w-5 h-5" />
                            <h3 className="font-semibold">Etiquetado Inteligente de Leads</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Próximamente disponible</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <Settings2 className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Módulo en Configuración</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Estamos integrando el motor de decisiones de IA. Muy pronto podrás crear flujos personalizados para cada agente.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}

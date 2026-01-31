import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, UserPlus, Phone, Loader2, Trash2, MoreVertical, Tag, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3002'
    : `http://${window.location.hostname}:3002`;

interface Contact {
    id: string;
    name: string;
    phone: string;
    tags: string[];
    lastInteraction: string;
}

export default function Contacts() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importData, setImportData] = useState({ name: '', phone: '' });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${BACKEND_URL}/api/contacts`);
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Error al cargar contactos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await axios.post(`${BACKEND_URL}/api/contacts`, importData);
            toast.success('Contacto añadido correctamente');
            setIsImportOpen(false);
            setImportData({ name: '', phone: '' });
            fetchContacts();
        } catch (error) {
            toast.error('Error al añadir contacto');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/contacts/${id}`);
            toast.success('Contacto eliminado');
            fetchContacts();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleBulkImport = async () => {
        try {
            setIsLoading(true);
            const demoContacts = [
                { name: 'María García', phone: '+5215512345678', tags: ['vip', 'ventas'] },
                { name: 'Carlos López', phone: '+34600123456', tags: ['soporte'] },
                { name: 'Ana Martínez', phone: '+14155551234', tags: ['lead'] }
            ];
            await axios.post(`${BACKEND_URL}/api/contacts/import`, { contacts: demoContacts });
            toast.success('Contactos importados correctamente');
            fetchContacts();
        } catch (error) {
            toast.error('Error en la importación');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery)
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                            Contactos
                        </h1>
                        <p className="text-muted-foreground">
                            Gestiona los clientes que han interactuado con tus agentes
                        </p>
                    </motion.div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleBulkImport} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                            Importar Demo
                        </Button>

                        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-primary hover:opacity-90">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Añadir Contacto
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Añadir Nuevo Contacto</DialogTitle>
                                    <DialogDescription>
                                        Introduce los datos del contacto para añadirlo a tu lista.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddContact} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input
                                            id="name"
                                            placeholder="Juan Pérez"
                                            value={importData.name}
                                            onChange={(e) => setImportData({ ...importData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono (con código de país)</Label>
                                        <Input
                                            id="phone"
                                            placeholder="+5215512345678"
                                            value={importData.phone}
                                            onChange={(e) => setImportData({ ...importData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsImportOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" className="bg-gradient-primary">
                                            Añadir
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o teléfono..."
                            className="pl-9 bg-background border-border/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtrar por Etiqueta
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setSearchQuery('')}>Todas</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSearchQuery('vip')}>VIP</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSearchQuery('lead')}>Leads</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSearchQuery('soporte')}>Soporte</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSearchQuery('ventas')}>Ventas</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {isLoading && contacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground">Cargando contactos...</p>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 bg-secondary/20 rounded-3xl border-2 border-dashed border-border/50 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <Users className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            {searchQuery ? 'No se encontraron resultados' : 'Aún no tienes contactos'}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            {searchQuery ? 'Intenta con otros términos de búsqueda.' : 'Los contactos aparecerán aquí automáticamente cuando alguien envíe un mensaje o puedes añadirlos manualmente.'}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredContacts.map((contact, index) => (
                                <motion.div
                                    key={contact.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="glass border-border/50 hover:border-primary/30 transition-all duration-300 group overflow-hidden">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                                                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                                                            {contact.name?.split(' ').map(n => n[0]).join('') || '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-bold text-foreground truncate max-w-[150px]">
                                                            {contact.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                            <Phone className="w-3 h-3" />
                                                            {contact.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleDelete(contact.id)} className="text-destructive">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {contact.tags?.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px] uppercase tracking-wider px-2">
                                                        {tag}
                                                    </Badge>
                                                )) || (
                                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                                            Sin etiquetas
                                                        </Badge>
                                                    )}
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Última interacción</span>
                                                <span className="text-xs text-foreground font-medium">
                                                    {contact.lastInteraction ? new Date(contact.lastInteraction).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

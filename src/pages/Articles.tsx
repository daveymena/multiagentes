import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Search,
    Plus,
    Trash2,
    Edit,
    ExternalLink,
    Loader2,
    Tag,
    DollarSign,
    BookOpen,
    Image as ImageIcon,
    Download,
    Upload,
    FileJson
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:3001'
    : `http://${window.location.hostname}:3001`;

interface Article {
    id: string;
    title: string;
    content: string;
    price?: number;
    category?: string;
    image_url?: string;
    created_at: string;
}

export default function Articles() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        price: '',
        category: '',
        image_url: ''
    });

    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchArticles();
        }
    }, [user]);

    const fetchArticles = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${BACKEND_URL}/api/articles`, {
                headers: {
                    'x-tenant-id': user?.id || 'demo_tenant'
                }
            });
            setArticles(response.data);
        } catch (error) {
            console.error('Error fetching articles:', error);
            toast.error('Error al cargar la base de conocimientos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await axios.post(`${BACKEND_URL}/api/articles`, {
                ...formData,
                price: formData.price ? parseFloat(formData.price) : null
            }, {
                headers: {
                    'x-tenant-id': user?.id || 'demo_tenant'
                }
            });
            toast.success('Información añadida a la base de conocimiento');
            setIsCreateOpen(false);
            setFormData({ title: '', content: '', price: '', category: '', image_url: '' });
            fetchArticles();
        } catch (error) {
            toast.error('Error al guardar artículo');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/articles/${id}`, {
                headers: {
                    'x-tenant-id': user?.id || 'demo_tenant'
                }
            });
            toast.success('Información eliminada');
            fetchArticles();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleMigration = async () => {
        try {
            toast.promise(axios.post(`${BACKEND_URL}/api/articles/migrate`, {}, {
                headers: {
                    'x-tenant-id': user?.id || 'demo_tenant'
                }
            }), {
                loading: 'Extrayendo de Postgres y moviendo a Supabase...',
                success: (res: any) => {
                    fetchArticles();
                    return `¡Éxito! Migrados ${res.data.count} artículos.`;
                },
                error: 'Error en la migración. Asegúrate de haber ejecutado el SQL en Supabase.'
            });
        } catch (e) {
            console.error('Migration error:', e);
        }
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(articles, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `articulos_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        toast.success('Catálogo exportado correctamente');
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                const items = Array.isArray(json) ? json : [json];

                toast.promise(
                    Promise.all(items.map(item =>
                        axios.post(`${BACKEND_URL}/api/articles`, {
                            title: item.title || item.name,
                            content: item.content || item.description,
                            price: item.price,
                            category: item.category,
                            image_url: item.image_url || (item.images?.[0])
                        }, {
                            headers: { 'x-tenant-id': user?.id || 'demo_tenant' }
                        })
                    )),
                    {
                        loading: 'Importando base de conocimientos...',
                        success: () => {
                            fetchArticles();
                            return `¡Éxito! Se han importado ${items.length} artículos.`;
                        },
                        error: 'Error al importar algunos artículos.'
                    }
                );
            } catch (err) {
                toast.error('Archivo JSON inválido');
            }
        };
        reader.readAsText(file);
    };

    const filteredArticles = articles.filter(a =>
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content?.toLowerCase().includes(searchQuery.toLowerCase())
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
                            Base de Conocimiento
                        </h1>
                        <p className="text-muted-foreground">
                            Gestiona los productos y artículos que tus agentes usarán para responder
                        </p>
                    </motion.div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="border-primary/50 text-foreground hover:bg-primary/10 transition-colors"
                            onClick={handleExport}
                            disabled={articles.length === 0}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </Button>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                id="import-json"
                            />
                            <Button
                                variant="outline"
                                className="border-primary/50 text-foreground hover:bg-primary/10 transition-colors"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Importar JSON
                            </Button>
                        </div>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-primary hover:opacity-90">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo Artículo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Añadir al Catálogo</DialogTitle>
                                    <DialogDescription>
                                        Define la información que la IA tendrá disponible para este producto o servicio.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Título del Producto/Servicio</Label>
                                            <Input
                                                id="title"
                                                placeholder="Ej: Plan de Hosting Premium"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Categoría</Label>
                                            <Input
                                                id="category"
                                                placeholder="Ej: Servicios Cloud"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price">Precio (opcional)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                className="pl-9"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="content">Descripción Detallada / Información para la IA</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="Escribe aquí toda la información relevante que el bot debe conocer sobre este artículo..."
                                            className="min-h-[150px]"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            required
                                        />
                                        <p className="text-[10px] text-muted-foreground">Esta información será inyectada en el prompt del agente cuando el cliente pregunte sobre temas relacionados.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="image">URL de Imagen (opcional)</Label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="image"
                                                className="pl-9"
                                                placeholder="https://ejemplo.com/imagen.jpg"
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" className="bg-gradient-primary">
                                            Guardar Artículo
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar en la base de conocimientos..."
                        className="pl-9 bg-background/50 border-border/50 h-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {isLoading && articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground">Sincronizando con Supabase...</p>
                    </div>
                ) : (articles as any).info === 'MIGRATION_REQUIRED' ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 bg-destructive/10 rounded-3xl border-2 border-dashed border-destructive/50 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                            <Trash2 className="w-10 h-10 text-destructive" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-destructive">
                            Configuración Pendiente en Supabase
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                            La tabla 'articles' no ha sido creada. Debes ejecutar el script SQL que te proporcioné en el chat anteriormente.
                        </p>
                        <Button variant="outline" onClick={fetchArticles}> Reintentar Sincronización </Button>
                    </motion.div>
                ) : filteredArticles.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 bg-secondary/10 rounded-3xl border-2 border-dashed border-border/50 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <BookOpen className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            {searchQuery ? 'No hay coincidencias' : 'Base de conocimiento vacía'}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            {searchQuery ? 'Prueba con otros términos.' : 'Añade información sobre tus productos o servicios para que tus agentes puedan responder de forma inteligente.'}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredArticles.map((article, index) => (
                                <motion.div
                                    key={article.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="glass border-border/50 hover:border-primary/30 transition-all duration-300 group overflow-hidden h-full flex flex-col">
                                        {article.image_url && (
                                            <div className="h-40 w-full overflow-hidden border-b border-border/50">
                                                <img
                                                    src={article.image_url}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            </div>
                                        )}
                                        <CardContent className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold">
                                                            {article.category || 'General'}
                                                        </Badge>
                                                        {article.price && (
                                                            <Badge variant="outline" className="border-green-500/20 text-green-500 text-[10px]">
                                                                ${article.price}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bold text-lg text-foreground leading-tight">
                                                        {article.title}
                                                    </h3>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDelete(article.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <p className="text-sm text-muted-foreground line-clamp-4 flex-1">
                                                {article.content}
                                            </p>

                                            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
                                                    <Tag className="w-3 h-3" />
                                                    ID: {article.id.slice(0, 8)}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(article.created_at).toLocaleDateString()}
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

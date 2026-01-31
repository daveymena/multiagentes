# Backend - Multi-Agent WhatsApp SaaS

Backend del sistema multi-agente para WhatsApp con arquitectura SaaS.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ instalado
- Redis instalado y corriendo (opcional para desarrollo)
- Cuenta de Supabase configurada
- API keys de OpenAI/Groq (opcional para IA)

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### Configuración

Edita el archivo `.env` con tus credenciales:

```env
# Supabase
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_KEY=tu_service_key

# Stripe (para facturación)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Providers
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### Ejecutar en Producción

```bash
npm start
```

## 📁 Estructura del Proyecto

```
backend/
├── server.js              # Servidor principal Express + WebSocket
├── src/
│   ├── agents/           # Agentes IA especializados
│   ├── services/         # Servicios de negocio
│   │   ├── whatsapp/    # Integración Baileys
│   │   ├── ai/          # Orquestación IA
│   │   ├── billing/     # Stripe
│   │   └── tenant/      # Multi-tenancy
│   ├── routes/          # Rutas API
│   ├── middleware/      # Middleware Express
│   ├── db/              # Clientes de DB
│   └── utils/           # Utilidades
└── package.json
```

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### WhatsApp
```
POST   /api/whatsapp/connect      # Iniciar conexión
GET    /api/whatsapp/qr/:id       # Obtener QR code
GET    /api/whatsapp/status/:id   # Estado de conexión
DELETE /api/whatsapp/:id           # Desconectar
```

### Agents
```
GET    /api/agents                # Listar agentes
POST   /api/agents                # Crear agente
GET    /api/agents/:id            # Obtener agente
PUT    /api/agents/:id            # Actualizar agente
DELETE /api/agents/:id            # Eliminar agente
```

### Conversations
```
GET    /api/conversations         # Listar conversaciones
GET    /api/conversations/:id     # Obtener conversación
POST   /api/conversations/:id/messages  # Enviar mensaje
```

## 🔧 Desarrollo

### Logs

Los logs se muestran en consola con formato pretty en desarrollo:

```
[2026-01-30 18:00:00] INFO: Server running on port 3001
[2026-01-30 18:00:01] INFO: Client connected via WebSocket
```

### Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## 🐛 Troubleshooting

### Redis no conecta

Si Redis no está instalado, el servidor funcionará sin cache. Para instalar Redis:

**Windows:**
```bash
# Usar WSL o Docker
docker run -d -p 6379:6379 redis
```

**Mac:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### Error de Supabase

Verifica que las credenciales en `.env` sean correctas:
- `SUPABASE_URL` debe ser la URL de tu proyecto
- `SUPABASE_SERVICE_KEY` debe ser la service role key (no la anon key)

## 📝 Próximos Pasos

1. ✅ Servidor básico funcionando
2. ⏳ Integración WhatsApp con Baileys
3. ⏳ Sistema multi-agente con CrewAI
4. ⏳ Knowledge Base con RAG
5. ⏳ Sistema de facturación con Stripe

## 🤝 Contribuir

Este es un proyecto en desarrollo activo. Consulta el archivo `task.md` en la raíz para ver el progreso.

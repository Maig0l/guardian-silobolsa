# 🌾 Guardian Silobolsa

Sistema de monitoreo IoT para silobolsas agrícolas que detecta condiciones peligrosas (fermentación, bacterias) mediante sensores de CO2, humedad y temperatura, enviando alertas a los productores cuando los umbrales son superados.

## 🏗️ Arquitectura

### Backend (Node.js + TypeScript + Express)
- **Base de Datos**: MariaDB con MikroORM
- **MQTT**: Cliente para recibir datos de sensores en tiempo real
- **API REST**: Endpoints para gestión de usuarios, campos, sensores, silobolsas y lecturas
- **Alertas**: Sistema automático de detección de umbrales

### Frontend (Svelte + Vite)
- **Interfaz Moderna**: Dashboard responsivo y atractivo
- **Tiempo Real**: Conexión WebSocket para datos en vivo
- **Visualización**: Gráficos de datos históricos y alertas

### Infraestructura
- **Monorepo**: Gestión con pnpm workspaces
- **Docker**: Contenerización completa para desarrollo y producción
- **MQTT Broker**: Mosquitto para comunicación IoT

## 📊 Modelo de Datos

```
USUARIO ── CAMPO ── SENSOR ── LECTURA
   │           │         │
   │           └─ SILOBOLSA ──┘
   │
   └─ (gestiona)
```

- **Usuario**: Productores agropecuarios
- **Campo**: Ubicaciones geográficas
- **Sensor**: Dispositivos IoT (CO2, temp, humedad)
- **Silobolsa**: Contenedores de grano
- **Lectura**: Mediciones tiempo real con flag de alerta

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- pnpm
- Docker y Docker Compose

### Desarrollo

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd guardian-silobolsa
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Iniciar servicios Docker**
```bash
pnpm docker:dev
```

5. **Iniciar aplicación**
```bash
# Backend y frontend juntos
pnpm dev

# O por separado
pnpm dev:backend
pnpm dev:frontend
```

### Producción

```bash
# Build y ejecutar producción
pnpm docker:prod

# Detener servicios
pnpm docker:down
```

## 📡 Endpoints API

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario (soft delete)

### Campos
- `GET /api/campos` - Listar campos
- `GET /api/campos/:id` - Obtener campo
- `POST /api/campos` - Crear campo
- `PUT /api/campos/:id` - Actualizar campo
- `DELETE /api/campos/:id` - Eliminar campo

### Sensores
- `GET /api/sensores` - Listar sensores
- `GET /api/sensores/:id` - Obtener sensor
- `POST /api/sensores` - Crear sensor
- `PUT /api/sensores/:id` - Actualizar sensor
- `DELETE /api/sensores/:id` - Eliminar sensor

### Silobolsas
- `GET /api/silobolsas` - Listar silobolsas
- `GET /api/silobolsas/:id` - Obtener silobolsa
- `POST /api/silobolsas` - Crear silobolsa
- `PUT /api/silobolsas/:id` - Actualizar silobolsa
- `DELETE /api/silobolsas/:id` - Eliminar silobolsa

### Lecturas
- `GET /api/lecturas` - Listar lecturas
- `GET /api/lecturas/:id` - Obtener lectura
- `GET /api/lecturas/sensor/:sensorId` - Lecturas por sensor
- `GET /api/lecturas/alerts` - Lecturas con alertas
- `POST /api/lecturas` - Crear lectura

### Alertas
- `GET /api/alertas` - Listar alertas
- `GET /api/alertas/active` - Alertas activas
- `GET /api/alertas/:id` - Obtener alerta
- `POST /api/alertas` - Crear alerta
- `PUT /api/alertas/:id/resolve` - Resolver alerta

## 🔧 Configuración

### Variables de Entorno

```bash
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=guardian_user
DB_PASSWORD=secure_password
DB_NAME=guardian_silobolsa

# MQTT
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_CLIENT_ID=guardian_backend
MQTT_TOPIC=sensors/+/data

# Backend
BACKEND_PORT=3000
NODE_ENV=development

# Umbrales de Alerta
CO2_THRESHOLD=2000
TEMPERATURE_THRESHOLD=30
HUMIDITY_THRESHOLD=70
```

## 🐳 Docker

### Desarrollo
```bash
docker-compose up -d
```

### Producción
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📱 Flujo de Datos

1. **Sensores** → Envían datos vía MQTT al gateway
2. **Backend** → Recibe y procesa datos MQTT
3. **Base de Datos** → Almacena lecturas con MikroORM
4. **Sistema de Alertas** → Evalúa umbrales y genera notificaciones
5. **Frontend** → Consume API para mostrar dashboard en tiempo real

## 🛠️ Tecnologías

- **Backend**: Node.js, TypeScript, Express, MikroORM, MariaDB, MQTT
- **Frontend**: Svelte, Vite, TypeScript
- **Infraestructura**: Docker, Docker Compose, Nginx
- **IoT**: Mosquitto MQTT Broker

## 📄 Licencia

MIT License - Ver archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

Guardian Silobolsa Team - Sistema de monitoreo inteligente para la agricultura moderna.

# 🛡️ Guardián Silobolsa

## El problema

Argentina es uno de los mayores productores de granos del mundo. Una parte importante de esa producción se almacena en **silobolsas** — bolsas plásticas de gran capacidad tendidas en el campo. Si la bolsa se rompe por vandalismo, animales o desgaste, o si los granos fueron embolsados con demasiada humedad, el contenido puede fermentar en cuestión de horas. La pérdida económica para el productor puede ser total.

El problema es que los campos están alejados, los silobolsas son difíciles de inspeccionar a diario, y cuando el daño se detecta visualmente ya es demasiado tarde.

## La solución

Guardián Silobolsa es un sistema de **monitoreo preventivo en tiempo real**. Sensores IoT instalados dentro de cada silobolsa miden temperatura, humedad y CO₂ cada pocos segundos. Si algún parámetro supera los umbrales de seguridad, el sistema envía una alerta inmediata al productor por **Telegram y email** para que pueda actuar antes de perder la cosecha.

```
Sensor IoT → LoRaWAN Gateway → MQTT Broker → Backend → Alerta al productor
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js 22 + TypeScript + Express |
| ORM | MikroORM |
| Base de datos | MariaDB 11 |
| Mensajería IoT | Mosquitto (MQTT) |
| Frontend | Svelte 5 + Vite |
| Monorepo | pnpm workspaces |
| Infraestructura | Docker + Docker Compose |
| Notificaciones | Telegram Bot API + Nodemailer |

---

## Requisitos previos

Antes de empezar necesitás tener instalado:

- [Git](https://git-scm.com/)
- [Node.js 22+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation) — `npm install -g pnpm`
- [Docker](https://docs.docker.com/get-docker/) + Docker Compose

---

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/guardian-silobolsa.git
cd guardian-silobolsa
```

### 2. Configurar las variables de entorno

```bash
cp .env.example .env
```

Abrí `.env` y completá los valores obligatorios:

```env
# Base de datos
DB_USER=guardian
DB_PASSWORD=una_contraseña_segura
DB_NAME=guardian_silobolsa
DB_ROOT_PASSWORD=otra_contraseña

# JWT (inventá una cadena larga y aleatoria)
JWT_SECRET=min16caracteresaqui
API_KEY_SECRET=otroSecreto16chars

# Telegram (opcional, para recibir alertas)
TELEGRAM_BOT_TOKEN=tu_token_del_bot
TELEGRAM_CHAT_ID=tu_chat_id

# Email (opcional, para recibir alertas)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_cuenta@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
SMTP_FROM="Guardián Silobolsa <tu_cuenta@gmail.com>"
```

> Las variables de MQTT, umbrales y simulador ya tienen valores por defecto en `.env.example` y no necesitan modificarse para probarlo localmente.

### 3. Levantar la infraestructura con Docker

```bash
docker compose up -d mariadb mosquitto
```

Esto levanta la base de datos MariaDB y el broker MQTT Mosquitto. Esperá unos segundos a que MariaDB esté lista:

```bash
docker compose logs -f mariadb
# Cuando veas "mariadbd: ready for connections" podés continuar
```

### 4. Configurar la contraseña de Mosquitto

La primera vez hay que crear el archivo de contraseñas del broker MQTT (este paso se puede saltar porque en el repo ya viene configurado con la contraseña por defecto):

```bash
# Primero editá docker/mosquitto/mosquitto.conf y comentá la línea password_file:
# password_file /mosquitto/config/passwd  ← agregar # al inicio

docker compose restart mosquitto

# Crear el usuario
docker exec -it guardian_mosquitto mosquitto_passwd -c /mosquitto/config/passwd guardian_backend
# Ingresá la contraseña que pusiste en MQTT_PASSWORD del .env (por defecto: mqtt_pass)

# Descomentar la línea password_file y reiniciar
docker compose restart mosquitto

# Dar permisos al archivo
chmod 644 docker/mosquitto/passwd
```

### 5. Instalar dependencias del monorepo

```bash
pnpm install
```

### 6. Crear las tablas en la base de datos

```bash
cd backend
pnpm build
pnpm schema:create
cd ..
```

### 7. Levantar el backend y el frontend

En terminales separadas (o con el script unificado):

```bash
# Todo junto
./scripts/dev.sh

# O por separado:
pnpm dev:backend    # http://localhost:3000
pnpm dev:frontend   # http://localhost:5173
```

---

## Probar el simulador de sensores

El proyecto incluye un simulador que genera lecturas de sensores ficticios y las publica por MQTT. Es útil para ver el sistema funcionando sin hardware real.

### 1. Crear un campo, silobolsa y sensor desde el frontend

Abrí `http://localhost:5173`, registrate y:
1. Creá un **campo**
2. Dentro del campo, creá un **silobolsa**
3. Creá un **sensor** con la MAC address `A4:C3:F0:12:34:01`
4. Vinculá el sensor al silobolsa

### 2. Verificar la api_key del sensor

En la base de datos o desde los logs del backend al crear el sensor. Alternativamente, las MACs del simulador están predefinidas en `.env`:

```env
SIM_SENSOR_MACS=A4:C3:F0:12:34:01,A4:C3:F0:12:34:02,A4:C3:F0:12:34:03
```

### 3. Correr el simulador

```bash
pnpm dev:simulator
```

El simulador opera en tres modos que rota automáticamente:

| Modo | Descripción |
|---|---|
| `NORMAL` | Valores estables dentro de los umbrales |
| `CALENTAMIENTO` | Temperatura, humedad y CO₂ aumentan gradualmente → dispara alertas |
| `FALLA_SENSOR` | Sensor sin señal, se recupera solo con 10% de probabilidad |

Las alertas llegarán al Telegram y email configurados, y aparecerán en el dashboard del frontend.

---

## Umbrales de alerta (configurables en `.env`)

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `ALERT_TEMP_MAX` | 35°C | Temperatura máxima |
| `ALERT_HUM_MAX` | 14% | Humedad máxima |
| `ALERT_CO2_MAX` | 5000 ppm | CO₂ máximo |

Una vez disparada una alerta, el sistema espera **30 minutos** antes de volver a notificar por el mismo sensor (cooldown anti-spam).

---

## Levantar con Docker Compose completo

Si preferís correr todo (backend + frontend + infraestructura) en contenedores:

```bash
docker compose up -d
```

> La primera vez puede tardar unos minutos mientras se construyen las imágenes.

---

## Estructura del proyecto

```
guardian-silobolsa/
├── backend/          # API REST + MQTT handler
│   ├── src/
│   │   ├── config/       # DB, MQTT, env
│   │   ├── controllers/
│   │   ├── entities/     # MikroORM entities
│   │   ├── middlewares/
│   │   ├── mqtt/         # Handler de lecturas IoT
│   │   ├── routes/
│   │   ├── services/     # Lógica de negocio
│   │   └── utils/
│   └── Dockerfile
├── frontend/         # App Svelte
│   └── src/
│       ├── lib/
│       │   ├── api.js        # Cliente HTTP
│       │   ├── router.js     # Hash router
│       │   ├── components/
│       │   └── stores/
│       └── routes/           # Páginas
├── simulator/        # Simulador de sensores IoT
├── docker/
│   └── mosquitto/    # Configuración del broker MQTT
├── scripts/          # Scripts de desarrollo
├── docker-compose.yml
└── .env.example
```

---

## API Reference

Todos los endpoints (excepto registro y login) requieren el header:
```
Authorization: Bearer <token>
```

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Login → devuelve JWT |
| GET | `/api/auth/profile` | Perfil del usuario autenticado |

### Campos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/fields` | Listar mis campos |
| POST | `/api/fields` | Crear campo |
| GET | `/api/fields/:id` | Ver campo |
| PATCH | `/api/fields/:id` | Actualizar campo |
| DELETE | `/api/fields/:id` | Eliminar campo |

### Sensores (nested bajo campo)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/fields/:fieldId/sensors` | Listar sensores del campo |
| GET | `/api/fields/:fieldId/sensors/available` | Sensores sin silobolsa asignada |
| POST | `/api/fields/:fieldId/sensors` | Crear sensor (api_key generada automáticamente) |
| PATCH | `/api/fields/:fieldId/sensors/:id` | Actualizar sensor |
| DELETE | `/api/fields/:fieldId/sensors/:id` | Eliminar sensor |

### Silobolsas (nested bajo campo)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/fields/:fieldId/silobolsas` | Listar silobolsas del campo |
| POST | `/api/fields/:fieldId/silobolsas` | Crear silobolsa |
| GET | `/api/fields/:fieldId/silobolsas/:id` | Ver silobolsa |
| PATCH | `/api/fields/:fieldId/silobolsas/:id` | Actualizar silobolsa |
| DELETE | `/api/fields/:fieldId/silobolsas/:id` | Eliminar silobolsa |
| POST | `/api/fields/:fieldId/silobolsas/:id/link` | Vincular sensor |
| DELETE | `/api/fields/:fieldId/silobolsas/:id/link` | Desvincular sensor |

### Lecturas y alertas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/readings/alerts` | Alertas no vistas del usuario |
| PATCH | `/api/readings/alerts/:id/seen` | Marcar alerta como vista |
| PATCH | `/api/readings/alerts/seen-all` | Marcar todas las alertas como vistas |
| GET | `/api/readings/sensor/:id?hours=24` | Lecturas por sensor |
| GET | `/api/readings/silobag/:id?hours=24` | Lecturas por silobolsa |

### Formato MQTT

Los sensores publican en el topic:
```
guardian/readings/<api_key>
```

Payload JSON:
```json
{
  "hum": 13.5,
  "temp": 28.2,
  "co2": 420,
  "timestamp": "2024-06-01T12:00:00Z"
}
```

## 📄 Licencia

MIT License - Ver archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

Guardian Silobolsa Team - Sistema de monitoreo inteligente para la agricultura moderna.

# Astro Blog MCP Server

MCP (Model Context Protocol) Server para automatizar la creación de posts en un blog Astro desplegado en Vercel.

## 🚀 Características

- ✅ Creación automática de posts vía API REST
- ✅ Integración directa con GitHub
- ✅ Validación y sanitización de inputs
- ✅ Seguridad con API Keys
- ✅ Rate limiting
- ✅ Trigger automático de deployments en Vercel
- ✅ Compatible con n8n y otras herramientas de automatización

## 📦 Instalación

### 1. Clona el repositorio

```bash
git clone <tu-repo>
cd astro-blog-mcp
```

### 2. Instala dependencias

```bash
pnpm install
```

### 3. Configura variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

**Variables requeridas:**

- `GITHUB_TOKEN`: Personal Access Token de GitHub con permisos de `repo`
- `GITHUB_OWNER`: Tu usuario de GitHub
- `GITHUB_REPO`: Nombre del repositorio de tu blog
- `GITHUB_BRANCH`: Branch a usar (default: `main`)
- `API_SECRET_KEY`: Una clave secreta aleatoria de al menos 32 caracteres
- `MCP_PORT`: Puerto del servidor (default: `3000`)
- `DEPLOY_HOOK`: (Opcional) Deploy Hook de Vercel

### 4. Compila el proyecto

```bash
pnpm build
```

## 🎯 Uso

### Iniciar el servidor

**Modo desarrollo:**

```bash
pnpm dev
```

**Modo producción:**

```bash
pnpm start
```

### Probar la API

```bash
pnpm test
```

## 🔑 Configuración de GitHub Token

1. Ve a GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con estos permisos:
   - `repo` (acceso completo)
3. Copia el token y agrégalo a tu `.env`

## 🔗 Configuración de Vercel Deploy Hook

1. En tu proyecto de Vercel, ve a Settings → Git
2. En la sección "Deploy Hooks", crea un nuevo hook
3. Copia la URL y agrégala a `DEPLOY_HOOK` en tu `.env`

## 📡 API Endpoints

### Health Check

```bash
GET /health
```

### Validar configuración

```bash
GET /api/validate
Headers: x-api-key: YOUR_API_KEY
```

### Crear un post

```bash
POST /api/posts
Headers:
  Content-Type: application/json
  x-api-key: YOUR_API_KEY

Body:
{
  "title": "Mi Nuevo Post",
  "description": "Descripción del post",
  "tags": ["astro", "blog"],
  "category": "Tutorial",
  "draft": false,
  "content": "# Contenido del post\n\nTexto aquí..."
}
```

### Actualizar un post

```bash
PUT /api/posts/:fileName
Headers:
  Content-Type: application/json
  x-api-key: YOUR_API_KEY

Body: (mismo formato que crear)
```

## 🔌 Integración con n8n

### Paso 1: Añadir Credentials

En n8n:

1. Ve a **Credentials** → **New**
2. Selecciona **Header Auth**
3. Configura:
   - Name: `Astro Blog MCP`
   - Header Name: `x-api-key`
   - Value: Tu `API_SECRET_KEY`

### Paso 2: Crear Workflow

1. Añade un nodo **HTTP Request**
2. Configura:
   - Method: `POST`
   - URL: `http://tu-servidor:3000/api/posts`
   - Authentication: Selecciona las credentials creadas
   - Body Content Type: `JSON`
   - Body:
   ```json
   {
     "title": "{{ $json.title }}",
     "description": "{{ $json.description }}",
     "tags": {{ $json.tags }},
     "category": "{{ $json.category }}",
     "content": "{{ $json.content }}"
   }
   ```

### Ejemplo de Workflow n8n

```json
{
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/posts",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "headerAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "title",
              "value": "Nuevo Post desde n8n"
            },
            {
              "name": "description",
              "value": "Post creado automáticamente"
            },
            {
              "name": "tags",
              "value": ["automation", "n8n"]
            },
            {
              "name": "category",
              "value": "Automation"
            },
            {
              "name": "content",
              "value": "# Hola Mundo\n\nEste post fue creado por n8n"
            }
          ]
        }
      },
      "name": "Create Blog Post",
      "type": "n8n-nodes-base.httpRequest",
      "position": [250, 300]
    }
  ]
}
```

## 🐳 Deploy con Docker

```bash
docker build -t astro-blog-mcp .
docker run -p 3000:3000 --env-file .env astro-blog-mcp
```

## 🔒 Seguridad

- ✅ Autenticación con API Key
- ✅ Rate limiting (20 req/min)
- ✅ Validación de nombres de archivo (previene path traversal)
- ✅ Sanitización de inputs con Zod
- ✅ Timing-safe comparison para API keys
- ✅ CORS configurado

## 🧪 Testing

El proyecto incluye un script de prueba completo:

```bash
pnpm test
```

Esto probará:

1. Health check
2. Validación de acceso a GitHub
3. Creación de un post de prueba

## 📝 Formato de Posts

Los posts se crean con este front-matter:

```yaml
---
title: Título del Post
published: 2025-10-25
description: "Descripción corta"
image: ""
tags: ["tag1", "tag2"]
category: "Categoría"
draft: false
---
Contenido del post aquí...
```

## 🛠️ Troubleshooting

### Error: "Failed to validate GitHub access"

- Verifica que tu `GITHUB_TOKEN` sea válido
- Confirma que el token tenga permisos de `repo`
- Verifica que `GITHUB_OWNER` y `GITHUB_REPO` sean correctos

### Error: "File already exists"

- El archivo ya existe en el repositorio
- Usa un nombre diferente o el endpoint PUT para actualizar

### Error: "API key is required"

- Asegúrate de incluir el header `x-api-key` en tus requests
- Verifica que la API key coincida con `API_SECRET_KEY`

## 📚 Recursos

- [GitHub API Docs](https://docs.github.com/rest)
- [Vercel Deploy Hooks](https://vercel.com/docs/deployments/deploy-hooks)
- [n8n Documentation](https://docs.n8n.io/)
- [Astro Documentation](https://docs.astro.build/)

## 📄 Licencia

MIT

# 🤝 Guía de Contribución

Bienvenido al proyecto Playeras Fut. Esta guía te ayudará a contribuir de manera efectiva.

## 🚀 Inicio Rápido

1. **Fork y Clone**
   ```bash
   git clone https://github.com/tu-usuario/playeras-fut.git
   cd playeras-fut
   ```

2. **Configurar remotes**
   ```bash
   git remote add upstream https://github.com/original-repo/playeras-fut.git
   ```

3. **Crear branch de trabajo**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/mi-contribucion
   ```

## 📋 Proceso de Contribución

### 1. Planificar

Antes de empezar:
- ✅ Revisar issues existentes
- ✅ Comunicar con el equipo qué vas a hacer
- ✅ Asegurarse de que no hay trabajo duplicado

### 2. Desarrollar

- ✅ Seguir las convenciones de código
- ✅ Hacer commits pequeños y frecuentes
- ✅ Escribir mensajes de commit claros
- ✅ Probar tu código

### 3. Pull Request

1. **Actualizar tu branch**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout feature/mi-contribucion
   git rebase develop  # O merge
   ```

2. **Crear PR en GitHub**
   - Título descriptivo
   - Descripción clara del cambio
   - Referenciar issues relacionados (#123)

3. **Esperar Code Review**
   - Responder a comentarios
   - Hacer cambios si se solicitan
   - No mergear tu propio PR

### 4. Después del Merge

- ✅ Limpiar branch local
- ✅ Actualizar `develop` local
- ✅ Celebrar 🎉

## 📝 Estándares de Código

### TypeScript/JavaScript

- Usar TypeScript estricto
- Seguir ESLint configurado
- Nombres descriptivos
- Funciones pequeñas (< 50 líneas)

### React/Next.js

- Componentes funcionales
- Hooks cuando sea apropiado
- Props tipadas
- Separar lógica de presentación

### Estilos

- Tailwind CSS para estilos
- Mobile-first approach
- Componentes reutilizables

## 🧪 Testing

Antes de hacer PR:
```bash
# Frontend
npm run lint
npm run build

# Backend
cd backend
npm run lint
npm run build
```

## 📚 Documentación

- Actualizar README si cambias setup
- Agregar comentarios en código complejo
- Documentar APIs nuevas

## 🐛 Reportar Bugs

Usar el template de issue:
- Descripción clara
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica

## 💡 Sugerir Features

- Abrir issue primero
- Discutir con el equipo
- Esperar aprobación antes de implementar

## ❓ Preguntas

- Abrir issue con label "question"
- O preguntar directamente al equipo

---

Gracias por contribuir! 🚀

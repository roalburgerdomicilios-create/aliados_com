# 📱 aliados_com PWA - Sistema de Cupones Moderno

**🔄 Última actualización: 31/10/2025 - Versión con mejoras responsive y UX**

## 🎯 Descripción del Proyecto

**aliados_com** es una Progressive Web App (PWA) moderna para la gestión de cupones digitales y aliados comerciales. El sistema ha sido completamente renovado con:

- ✅ **Sistema de registro personalizado** (eliminado usuario predefinido ROAL BURGER)
- ✅ **Paleta de colores azul milenium** (#2563eb) 
- ✅ **Interfaz moderna** con cards, sombras y gradientes
- ✅ **Funcionalidad offline completa** con Service Worker
- ✅ **Iconos PWA profesionales** en todos los tamaños
- ✅ **Scroll horizontal responsive** para tablas en móviles
- ✅ **Exportación de Excel filtrada por aliado**
- ✅ **Botón de carga de logo mejorado**

---

## 🚀 Características Principales

### 📊 **Gestión de Cupones**
- Creación de cupones con códigos QR únicos
- Configuración de descuentos y fechas de vencimiento
- Exportación a PNG y Excel
- Búsqueda y filtrado avanzado

### 👥 **Sistema de Aliados**
- Registro y gestión de aliados comerciales
- Asignación de cupones por aliado
- Estadísticas de uso y rendimiento

### 📱 **PWA Features**
- Instalación como app nativa
- Funcionamiento 100% offline
- Notificaciones push (opcional)
- Sincronización en segundo plano

### 🎨 **Diseño Moderno**
- Paleta azul milenium (#2563eb)
- Componentes tipo Material Design
- Animaciones suaves y transiciones
- Responsive design para todos los dispositivos

---

## 📁 Estructura del Proyecto

```
aliados_com/
├── 📄 index.html              # Página principal con sistema de registro
├── 🎨 styles.css              # Estilos modernos con paleta azul milenium
├── ⚡ app.js                  # Lógica principal de la aplicación
├── 🔧 sw.js                   # Service Worker para funcionalidad offline
├── 📱 manifest.webmanifest    # Configuración PWA
├── 🎨 icon-generator.html     # Generador de iconos PWA
├── 📚 README.md               # Esta documentación
└── 📁 assets/                 # Recursos multimedia
    ├── 🖼️ placeholder-logo.svg
    ├── 📱 icon-72.png
    ├── 📱 icon-96.png
    ├── 📱 icon-128.png
    ├── 📱 icon-144.png
    ├── 📱 icon-152.png
    ├── 📱 icon-192.png
    ├── 📱 icon-384.png
    └── 📱 icon-512.png
```

---

## 🛠️ Instalación y Configuración

### **Método 1: Servidor Local Simple**

```powershell
# Navegar al directorio del proyecto
cd "c:\Users\Usuario\Documents\ROAL BURGER\Roal 3.0 – Sistema de Control Empresarial\Aliados\aliados_com"

# Iniciar servidor HTTP simple con Python
python -m http.server 8000

# O con Node.js (si tienes npx instalado)
npx http-server -p 8000

# Abrir en navegador
start http://localhost:8000
```

### **Método 2: Live Server (VS Code)**

1. Instalar extensión "Live Server" en VS Code
2. Clic derecho en `index.html` → "Open with Live Server"
3. La aplicación se abrirá automáticamente

### **Método 3: Servidor Web Profesional**

```powershell
# Con nginx, Apache, o IIS
# Copiar archivos al directorio web del servidor
# Configurar HTTPS para funcionalidad PWA completa
```

---

## 🎨 Generación de Iconos

### **Opción 1: Automática**
1. Abrir `icon-generator.html` en el navegador
2. Clic en "⚡ Generar Todos los Iconos"
3. Clic en "📥 Descargar Todos los Iconos"
4. Los archivos se descargarán automáticamente

### **Opción 2: Manual**
Los iconos ya están pre-generados en la carpeta `assets/` con estos tamaños:
- `icon-72.png` - Notificaciones
- `icon-96.png` - Dispositivos
- `icon-128.png` - Chrome Web Store
- `icon-144.png` - Windows
- `icon-152.png` - iOS
- `icon-192.png` - Android Chrome
- `icon-384.png` - Android Splash
- `icon-512.png` - Android Chrome

---

## 📱 Instalación como PWA

### **En Móviles (Android/iOS)**
1. Abrir la web en Chrome/Safari
2. Buscar opción "Añadir a pantalla de inicio"
3. Confirmar instalación
4. El icono aparecerá en el escritorio

### **En Desktop (Chrome/Edge)**
1. Abrir la web en Chrome/Edge
2. Buscar icono "⚙️ Instalar aliados_com" en la barra de direcciones
3. Clic en "Instalar"
4. La app se abrirá como ventana independiente

---

## 🔧 Configuración Técnica

### **Service Worker**
El archivo `sw.js` proporciona:
- **Cache First Strategy** para recursos estáticos
- **Network First Strategy** para datos dinámicos
- **Offline Fallback** para páginas no cacheadas
- **Background Sync** para sincronización automática

### **Almacenamiento Local**
- **localStorage**: Configuración de usuario y preferencias
- **Simulación IndexedDB**: Base de datos de cupones y aliados
- **Cache API**: Recursos offline del Service Worker

### **Configuraciones Importantes**

```javascript
// Configuración de colores principales
:root {
    --primary-color: #2563eb;      // Azul milenium principal
    --primary-dark: #1d4ed8;       // Azul milenium oscuro
    --primary-light: #3b82f6;      // Azul milenium claro
    --accent-color: #60a5fa;       // Azul accent
    --success-color: #10b981;      // Verde éxito
    --warning-color: #f59e0b;      // Naranja advertencia
    --error-color: #ef4444;        // Rojo error
}
```

---

## 👤 Sistema de Usuario

### **Registro Inicial**
Al primer acceso, el usuario debe:
1. **Ingresar nombre completo**
2. **Especificar empresa/negocio**
3. **Confirmar registro**

### **Datos Guardados**
- Nombre de usuario
- Empresa/negocio
- Fecha de registro
- Configuraciones personalizadas
- Historial de cupones creados

### **Gestión de Sesión**
- Los datos se mantienen en localStorage
- Opción de "Cerrar Sesión" disponible
- Re-registro disponible si es necesario

---

## 🎫 Gestión de Cupones

### **Crear Nuevo Cupón**
1. Clic en "➕ Nuevo Cupón"
2. Completar formulario:
   - Título del cupón
   - Descripción detallada
   - Tipo de descuento (% o $)
   - Valor del descuento
   - Fecha de vencimiento
   - Aliado asignado

### **Funciones Disponibles**
- **👁️ Ver**: Previsualización del cupón
- **📝 Editar**: Modificar información
- **📱 QR**: Generar código QR único
- **🖼️ PNG**: Exportar como imagen
- **📊 Excel**: Exportar datos
- **🗑️ Eliminar**: Borrar cupón

### **Códigos QR**
- Generación automática con ID único
- Incluye información del cupón
- Optimizados para lectura móvil

---

## 👥 Gestión de Aliados

### **Añadir Aliado**
1. Clic en "👥 Gestión de Aliados"
2. Clic en "➕ Nuevo Aliado"
3. Completar información:
   - Nombre del aliado
   - Email de contacto
   - Teléfono
   - Dirección completa

### **Asignación de Cupones**
- Los cupones se pueden asignar a aliados específicos
- Filtrado por aliado en la lista principal
- Estadísticas por aliado disponibles

---

## 📊 Importar/Exportar Datos

### **Exportar a Excel**
```javascript
// Exportación automática con formato:
- ID del Cupón
- Título
- Descripción  
- Descuento
- Fecha de Vencimiento
- Aliado Asignado
- Estado
```

### **Importar desde Excel**
1. Preparar archivo Excel con columnas requeridas
2. Clic en "📥 Importar Excel"
3. Seleccionar archivo
4. Confirmar importación

---

## 🔒 Seguridad y Privacidad

### **Almacenamiento Local**
- Todos los datos se almacenan localmente
- No hay transferencia de datos a servidores externos
- Control total del usuario sobre su información

### **Códigos Únicos**
- Cada cupón tiene un ID único generado automáticamente
- Los códigos QR incluyen hash de verificación
- Prevención de duplicados

---

## 🌐 Compatibilidad

### **Navegadores Soportados**
- ✅ Chrome 70+ (Desktop/Mobile)
- ✅ Firefox 65+ (Desktop/Mobile)  
- ✅ Safari 12+ (Desktop/Mobile)
- ✅ Edge 79+ (Desktop/Mobile)
- ✅ Samsung Internet 10+

### **Sistemas Operativos**
- ✅ Windows 10/11
- ✅ macOS 10.14+
- ✅ Android 7+
- ✅ iOS 12+

### **Resoluciones Soportadas**
- 📱 Mobile: 320px - 768px
- 📟 Tablet: 768px - 1024px  
- 🖥️ Desktop: 1024px+

---

## 🚀 Optimizaciones de Rendimiento

### **Carga Inicial**
- Recursos críticos inline
- Lazy loading de librerías externas
- Compresión de imágenes

### **Cache Strategy**
- Recursos estáticos: Cache First
- APIs externas: Network First
- Fallback offline para todas las páginas

### **Bundle Size**
- HTML: ~15KB (compressed)
- CSS: ~25KB (compressed)
- JavaScript: ~35KB (compressed)
- Service Worker: ~8KB
- Total: ~85KB (primera carga)

---

## 🔧 Personalización Avanzada

### **Cambiar Colores**
Editar variables CSS en `styles.css`:
```css
:root {
    --primary-color: #TU_COLOR_AQUI;
    --primary-dark: #VERSION_OSCURA;
    --primary-light: #VERSION_CLARA;
}
```

### **Modificar Logo**
1. Reemplazar `assets/placeholder-logo.svg`
2. Regenerar iconos con `icon-generator.html`
3. Actualizar referencias en `manifest.webmanifest`

### **Añadir Funcionalidades**
El código está modularizado para facilitar extensiones:
- Nuevos tipos de cupones
- Integración con APIs externas
- Sistema de notificaciones push
- Analytics y estadísticas

---

## 📞 Soporte y Mantenimiento

### **Logs del Sistema**
- Service Worker logs en DevTools → Application → Service Workers
- Errores de JavaScript en DevTools → Console
- Network requests en DevTools → Network

### **Actualizar la App**
1. Modificar archivos necesarios
2. Cambiar versión en `sw.js` (CACHE_NAME)
3. El Service Worker se actualizará automáticamente

### **Limpiar Cache**
```javascript
// En DevTools → Console
caches.keys().then(names => 
    Promise.all(names.map(name => caches.delete(name)))
);
```

---

## 📈 Próximas Mejoras Sugeridas

### **Fase 2: Funcionalidades Avanzadas**
- 🔔 Notificaciones push programadas
- 📊 Dashboard de analytics
- 🔄 Sincronización con servidor
- 👤 Múltiples usuarios
- 🎨 Temas personalizables

### **Fase 3: Integración**
- 🏪 API de punto de venta
- 💳 Procesamiento de pagos
- 📧 Email marketing
- 📱 App móvil nativa

---

## 📝 Changelog

### **v2.0.0 - Azul Milenium Edition** (Actual)
- ✅ Eliminado usuario predefinido ROAL BURGER
- ✅ Implementado sistema de registro personalizado
- ✅ Actualizada paleta de colores a azul milenium (#2563eb)
- ✅ Modernizada interfaz con Material Design
- ✅ Añadido Service Worker para funcionalidad offline
- ✅ Generados iconos PWA en todos los tamaños
- ✅ Mejorada experiencia de usuario
- ✅ Optimizado rendimiento y carga

### **v1.0.0 - Original**
- Sistema básico de cupones
- Usuario predefinido ROAL BURGER
- Paleta naranja original
- Interfaz básica

---

## 📄 Licencia

Este proyecto es de uso interno y propietario. Todos los derechos reservados.

---

## 🎉 ¡Listo para Usar!

Tu sistema **aliados_com** está completamente configurado y listo para producción. 

**¿Necesitas más funcionalidades?** El código está bien documentado y modularizado para facilitar futuras extensiones.

**¿Problemas técnicos?** Revisa la sección de soporte o consulta los logs del navegador.

---

*Documentación generada automáticamente - v2.0.0*
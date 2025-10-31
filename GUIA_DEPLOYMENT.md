# 🚀 Guía para Compartir el Sistema con Aliados

## Opción 1: Netlify (Recomendado - GRATIS)

### Pasos:
1. **Crear cuenta en Netlify:**
   - Ve a https://netlify.com
   - Regístrate gratis con email o GitHub

2. **Subir archivos:**
   - Arrastra toda la carpeta `aliados_com` a Netlify
   - O conecta con GitHub (más profesional)

3. **Configurar PWA:**
   - Netlify detectará automáticamente que es una PWA
   - Obtendrás una URL como: `https://tu-app.netlify.app`

4. **Compartir:**
   - Envía la URL a tus aliados
   - Pueden instalar como app en sus teléfonos

## Opción 2: Vercel (También gratis)

### Pasos:
1. Ve a https://vercel.com
2. Sube la carpeta del proyecto
3. Obtienes URL automática
4. Comparte con aliados

## Opción 3: GitHub Pages

### Pasos:
1. Crea repositorio en GitHub
2. Sube todos los archivos
3. Activa GitHub Pages en configuración
4. URL: `https://tu-usuario.github.io/repositorio`

## Opción 4: Servidor Local (Para desarrollo)

### Para pruebas locales con aliados:
```bash
# Con Python (si tienes Python instalado)
python -m http.server 8000

# Con Node.js (si tienes Node.js)
npx serve .

# Comparte tu IP local: http://TU-IP:8000
```

## 📱 **Características PWA para Aliados:**

✅ **Instalable:** Pueden instalar como app nativa
✅ **Offline:** Funciona sin internet
✅ **Responsive:** Se adapta a móviles y desktop
✅ **Rápido:** Se carga instantáneamente
✅ **Seguro:** Funciona con HTTPS

## 🔒 **Consideraciones de Seguridad:**

⚠️ **Datos locales:** Los datos se guardan en el navegador de cada usuario
⚠️ **Sin sincronización:** Cada aliado tendrá sus propios datos
⚠️ **Privacidad:** Los datos no se comparten automáticamente

## 💡 **Recomendación:**

**Para empezar:** Usa Netlify (gratis, fácil, profesional)
**Para producción:** Considera un dominio propio
**Para datos compartidos:** Considera una base de datos central (más avanzado)

## 📞 **Instrucciones para Aliados:**

1. **Acceder:** Abrir la URL en el navegador
2. **Instalar:** Hacer clic en "Instalar app" cuando aparezca
3. **Usar:** Configurar su información en la sección "Config"
4. **Cupones:** Generar y redimir cupones normalmente

---

¿Quieres que te ayude a configurar alguna de estas opciones?
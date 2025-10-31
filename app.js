/*
 * ===========================
 * aliados_com PWA - Sistema de Gestión de Cupones
 * Versión: 2.0.0 - Azul Milenium Edition
 * ===========================
 */

// Variables globales
let db = {};
let currentPreviewCupon = null;
let importDataPreview = null;
let autoSaveInterval = null;
let dataChanged = false;

// Estado de la aplicación
const appState = {
    currentSection: 'inicio',
    isFirstTime: true,
    usuario: null
};

/* ===========================
   INICIALIZACIÓN DE LA APLICACIÓN
   =========================== */

// Inicialización principal
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando aliados_com v2.0...');
    
    // PANEL DE CONTROL DIRECTO - SIN FORMULARIO DE BIENVENIDA
    // No hay welcome-screen, fue eliminado completamente
    
    // Mostrar inmediatamente la aplicación principal
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
        mainApp.style.display = 'block';
        mainApp.style.visibility = 'visible';
    }
    
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('✅ Service Worker registrado'))
            .catch(error => console.log('❌ Error registrando Service Worker:', error));
    }
    
    // Cargar datos desde localStorage
    db = getDB();
    
    // Configurar sistema de auto-guardado
    setupAutoSave();
    
    // Configurar eventos de seguridad para guardar datos
    setupDataPersistence();
    
    // CAMBIO: Siempre ir a la aplicación principal
    // Solo verificar si hay usuario para personalizar la experiencia
    if (db.usuario && db.usuario.nombre) {
        appState.isFirstTime = false;
        appState.usuario = db.usuario;
    } else {
        appState.isFirstTime = true;
        // Crear usuario básico por defecto
        db.usuario = {
            nombre: 'Mi Empresa',
            direccion: '',
            telefono: '',
            instagram: '',
            logo: '',
            fechaRegistro: new Date().toISOString()
        };
    }
    
    // Siempre inicializar la aplicación principal (Panel de Control)
    inicializarAplicacion();
    
    // Event listeners
    setupEventListeners();
});

// Mostrar pantalla de registro inicial
// FUNCIÓN COMENTADA - YA NO SE USA LA PANTALLA DE REGISTRO INICIAL
/*
function mostrarPantallaRegistro() {
    document.getElementById('welcome-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    
    // Preview de logo en registro
    document.getElementById('empresa-logo').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('logo-preview');
                preview.src = e.target.result;
                preview.style.display = 'block';
                document.querySelector('.logo-placeholder').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
}
*/

// Configurar event listeners principales
function setupEventListeners() {
    // FORMULARIO DE REGISTRO INICIAL COMENTADO - YA NO SE USA
    /*
    const welcomeForm = document.getElementById('welcome-form');
    if (welcomeForm) {
        welcomeForm.addEventListener('submit', procesarRegistroInicial);
    }
    */
    
    // Navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            mostrarSeccion(section);
        });
    });
    
    // Formularios modales
    setupModalEventListeners();
    
    // Búsquedas en tiempo real
    setupSearchListeners();
    
    // Configuración
    setupConfigEventListeners();
    
    // Monitoreo automático de cambios en formularios
    setupFormChangeMonitoring();
}

// Event listeners de modales
function setupModalEventListeners() {
    // Formulario aliado
    const formAliado = document.getElementById('form-aliado');
    if (formAliado) {
        formAliado.addEventListener('submit', guardarAliado);
    }
    
    // Preview logo aliado
    const aliadoLogo = document.getElementById('aliado-logo');
    if (aliadoLogo) {
        aliadoLogo.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('aliado-logo-preview');
                    if (preview) {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Formulario cupón
    const formCupon = document.getElementById('form-cupon');
    if (formCupon) {
        formCupon.addEventListener('submit', generarCupon);
    }
    
    // Formulario redimir
    const formRedimir = document.getElementById('form-redimir');
    if (formRedimir) {
        formRedimir.addEventListener('submit', confirmarRedencion);
    }
}

// Event listeners de búsqueda
function setupSearchListeners() {
    // Búsqueda de aliados
    const buscarAliado = document.getElementById('buscar-aliado');
    if (buscarAliado) {
        buscarAliado.addEventListener('input', debounce(filtrarAliados, 300));
    }
    
    // Búsqueda de clientes
    const buscarCliente = document.getElementById('buscar-cliente');
    if (buscarCliente) {
        buscarCliente.addEventListener('input', debounce(filtrarClientes, 300));
    }
    
    // Búsqueda de cupones externos
    const buscarCuponExterno = document.getElementById('buscar-cupon-externo');
    if (buscarCuponExterno) {
        buscarCuponExterno.addEventListener('input', debounce(filtrarCuponesExternos, 300));
    }
    
    // Filtros
    const filtroAliadoCupones = document.getElementById('filtro-aliado-cupones');
    if (filtroAliadoCupones) {
        filtroAliadoCupones.addEventListener('change', filtrarCupones);
    }
    
    const filtroAliadoExterno = document.getElementById('filtro-aliado-externo');
    if (filtroAliadoExterno) {
        filtroAliadoExterno.addEventListener('change', filtrarCuponesExternos);
    }
}

// Event listeners de configuración
function setupConfigEventListeners() {
    // Formulario configuración
    const formConfig = document.getElementById('form-configuracion');
    if (formConfig) {
        formConfig.addEventListener('submit', guardarConfiguracion);
    }
    
    // Preview logo configuración
    const configLogo = document.getElementById('config-logo');
    if (configLogo) {
        configLogo.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const logoPreview = document.getElementById('config-logo-preview');
                    logoPreview.src = e.target.result;
                    logoPreview.style.display = 'block';
                    logoPreview.style.maxWidth = '100%';
                    logoPreview.style.maxHeight = '150px';
                    logoPreview.style.objectFit = 'contain';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Monitoreo automático de cambios en formularios
function setupFormChangeMonitoring() {
    // Detectar cambios en todos los inputs, selects y textareas de la aplicación
    document.addEventListener('input', function(event) {
        const target = event.target;
        
        // Solo monitorear elementos dentro de formularios de datos (no búsquedas)
        if (target.matches('input, select, textarea')) {
            const form = target.closest('form');
            if (form && !target.id.includes('buscar') && !target.id.includes('filtro')) {
                markDataChanged();
            }
        }
    });
    
    // Detectar cambios en archivos
    document.addEventListener('change', function(event) {
        const target = event.target;
        
        if (target.type === 'file') {
            markDataChanged();
        }
    });
    
    console.log('🔍 Monitoreo automático de cambios en formularios configurado');
}

/* ===========================
   GESTIÓN DE BASE DE DATOS LOCAL
   =========================== */

// Obtener datos de localStorage
function getDB() {
    try {
        const data = localStorage.getItem('aliados_com_db');
        if (data) {
            const parsedData = JSON.parse(data);
            console.log('✅ Datos cargados desde localStorage');
            return verificarIntegridadDatos(parsedData);
        }
        
        // Si no hay datos en localStorage, intentar recuperar desde respaldos
        console.log('⚠️ No hay datos en localStorage, intentando recuperar respaldos...');
        const recoveredData = recuperarDesdeRespaldos();
        
        // Guardar los datos recuperados en localStorage
        if (recoveredData && (recoveredData.usuario.nombre || recoveredData.aliados.length > 0)) {
            setDB(recoveredData);
            console.log('🔄 Datos recuperados y guardados en localStorage');
            return recoveredData;
        }
        
        return crearDBVacia();
    } catch (error) {
        console.error('Error cargando DB:', error);
        console.log('🆘 Intentando recuperar desde respaldos...');
        
        // Intentar recuperar desde respaldos
        const recoveredData = recuperarDesdeRespaldos();
        if (recoveredData && (recoveredData.usuario.nombre || recoveredData.aliados.length > 0)) {
            console.log('✅ Datos recuperados desde respaldos');
            return recoveredData;
        }
        
        return crearDBVacia();
    }
}

// Crear estructura de DB vacía
function crearDBVacia() {
    return {
        usuario: {},
        aliados: [],
        cupones: [],
        clientes: [],
        cuponesExternos: [],
        configuracion: {
            version: '2.0.0',
            fechaCreacion: new Date().toISOString()
        }
    };
}

/* ===========================
   SISTEMA DE AUTO-GUARDADO Y PERSISTENCIA
   =========================== */

// Configurar sistema de auto-guardado
function setupAutoSave() {
    // Auto-guardado cada 2 minutos si hay cambios (reducido de 30 segundos)
    autoSaveInterval = setInterval(() => {
        if (dataChanged) {
            guardarDatosSilencioso();
            dataChanged = false;
            console.log('🔄 Auto-guardado realizado');
        }
    }, 120000); // 2 minutos
    
    console.log('⚙️ Sistema de auto-guardado configurado');
}

// Configurar eventos para persistencia de datos
function setupDataPersistence() {
    // Guardar antes de que la página se cierre/actualice
    window.addEventListener('beforeunload', function(event) {
        if (dataChanged) {
            guardarDatosSilencioso();
            console.log('💾 Datos guardados antes de cerrar/actualizar');
            
            // Mostrar mensaje de confirmación si hay cambios no guardados
            // (Nota: Los navegadores modernos pueden no mostrar el mensaje personalizado)
            event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
            return event.returnValue;
        }
    });
    
    // Guardar cuando la pestaña pierde el foco
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && dataChanged) {
            guardarDatosSilencioso();
            console.log('💾 Datos guardados al cambiar de pestaña');
        }
    });
    
    // Guardar cuando la ventana pierde el foco
    window.addEventListener('blur', function() {
        if (dataChanged) {
            guardarDatosSilencioso();
            console.log('💾 Datos guardados al perder foco');
        }
    });
    
    // Guardar periódicamente con Page Visibility API (reducido de 10 a 30 segundos)
    setInterval(() => {
        if (!document.hidden && dataChanged) {
            guardarDatosSilencioso();
            dataChanged = false;
        }
    }, 30000); // Cada 30 segundos cuando la página está visible
    
    // Evento adicional para cuando se detecta que la aplicación va a cerrar
    window.addEventListener('pagehide', function() {
        if (dataChanged) {
            guardarDatosSilencioso();
            console.log('💾 Datos guardados en pagehide');
        }
    });
    
    // Monitorear cambios de conectividad
    window.addEventListener('online', function() {
        if (dataChanged) {
            guardarDatosSilencioso();
            console.log('💾 Datos guardados al recuperar conectividad');
        }
    });
    
    window.addEventListener('offline', function() {
        if (dataChanged) {
            guardarDatosSilencioso();
            console.log('💾 Datos guardados antes de perder conectividad');
        }
    });
    
    console.log('🛡️ Sistema de persistencia de datos configurado');
}

// Marcar que los datos han cambiado
function markDataChanged() {
    dataChanged = true;
}

// Guardar datos de forma silenciosa (sin mostrar notificaciones)
function guardarDatosSilencioso() {
    try {
        if (setDB(db)) {
            return true;
        } else {
            // Intentar crear respaldo en caso de error
            crearRespaldoDeEmergencia();
            return false;
        }
    } catch (error) {
        console.error('Error en guardado silencioso:', error);
        crearRespaldoDeEmergencia();
        return false;
    }
}

// Crear respaldo de emergencia
function crearRespaldoDeEmergencia() {
    try {
        const timestamp = new Date().getTime();
        const backupKey = `aliados_com_backup_${timestamp}`;
        
        // Comprimir datos antes de guardar para ahorrar espacio
        const compressedData = comprimirDatos(db);
        const dataString = JSON.stringify(compressedData);
        
        // Verificar tamaño antes de guardar
        const sizeInMB = new Blob([dataString]).size / 1024 / 1024;
        
        if (sizeInMB > 4) { // Si es mayor a 4MB, no guardar respaldo
            console.warn('⚠️ Datos demasiado grandes para respaldo de emergencia');
            return;
        }
        
        // Limpiar respaldos antiguos antes de crear uno nuevo
        limpiarRespaldosAntiguos();
        
        // Intentar guardar en sessionStorage como respaldo
        if (sessionStorage) {
            try {
                sessionStorage.setItem(backupKey, dataString);
                console.log('🆘 Respaldo de emergencia creado en sessionStorage');
            } catch (storageError) {
                console.warn('⚠️ sessionStorage lleno, limpiando y reintentando...');
                limpiarRespaldosAntiguos();
                try {
                    sessionStorage.setItem(backupKey, dataString);
                } catch (secondError) {
                    console.error('❌ No se pudo crear respaldo en sessionStorage');
                }
            }
        }
        
        // También intentar con IndexedDB si está disponible (sin comprimir para IndexedDB)
        if (window.indexedDB) {
            guardarEnIndexedDB(db, timestamp);
        }
        
    } catch (error) {
        console.error('Error creando respaldo de emergencia:', error);
    }
}

// Guardar en IndexedDB como respaldo adicional
function guardarEnIndexedDB(data, timestamp) {
    try {
        const request = indexedDB.open('aliados_com_backup', 1);
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('backups')) {
                db.createObjectStore('backups', { keyPath: 'id' });
            }
        };
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['backups'], 'readwrite');
            const store = transaction.objectStore('backups');
            
            store.put({
                id: timestamp,
                data: data,
                fecha: new Date().toISOString()
            });
            
            console.log('🔒 Respaldo adicional guardado en IndexedDB');
        };
        
    } catch (error) {
        console.error('Error guardando en IndexedDB:', error);
    }
}

// Recuperar datos desde respaldos si es necesario
function recuperarDesdeRespaldos() {
    try {
        // Intentar recuperar desde sessionStorage
        const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('aliados_com_backup_'));
        if (sessionKeys.length > 0) {
            // Tomar el respaldo más reciente
            const latestKey = sessionKeys.sort().pop();
            const backupData = sessionStorage.getItem(latestKey);
            if (backupData) {
                const parsedData = JSON.parse(backupData);
                console.log('🔄 Datos recuperados desde respaldo de sessionStorage');
                return verificarIntegridadDatos(parsedData);
            }
        }
        
        // Si no hay respaldos disponibles, retornar DB vacía
        return crearDBVacia();
        
    } catch (error) {
        console.error('Error recuperando respaldos:', error);
        return crearDBVacia();
    }
}

// Verificar integridad de datos y restaurar logos
function verificarIntegridadDatos(data) {
    // Asegurar que todas las propiedades existan
    if (!data.usuario) data.usuario = {};
    if (!Array.isArray(data.aliados)) data.aliados = [];
    if (!Array.isArray(data.cupones)) data.cupones = [];
    if (!Array.isArray(data.clientes)) data.clientes = [];
    if (!Array.isArray(data.cuponesExternos)) data.cuponesExternos = [];
    if (!data.configuracion) data.configuracion = { version: '2.0.0' };
    
    // Limpiar elementos inválidos
    data.aliados = data.aliados.filter(item => item && item.id);
    data.cupones = data.cupones.filter(item => item && item.id);
    data.clientes = data.clientes.filter(item => item && item.id);
    data.cuponesExternos = data.cuponesExternos.filter(item => item && item.id);
    
    // Restaurar logos desde sessionStorage si están en backup
    restaurarLogosDesdeBackup(data);
    
    return data;
}

// Función para restaurar logos desde sessionStorage
function restaurarLogosDesdeBackup(data) {
    try {
        // Restaurar logos de aliados
        data.aliados.forEach(aliado => {
            if (aliado.logoBackup && aliado.logoKey) {
                const logoGuardado = sessionStorage.getItem(aliado.logoKey);
                if (logoGuardado) {
                    aliado.logo = logoGuardado;
                    console.log(`🔄 Logo restaurado para aliado: ${aliado.nombre}`);
                } else {
                    console.warn(`⚠️ No se encontró logo en backup para: ${aliado.nombre}`);
                }
                // Limpiar marcadores de backup
                delete aliado.logoBackup;
                delete aliado.logoKey;
            }
        });
        
        // Restaurar logo de usuario
        if (data.usuario && data.usuario.logoBackup && data.usuario.logoKey) {
            const logoUsuario = sessionStorage.getItem(data.usuario.logoKey);
            if (logoUsuario) {
                data.usuario.logo = logoUsuario;
                console.log('🔄 Logo de usuario restaurado');
            } else {
                console.warn('⚠️ No se encontró logo de usuario en backup');
            }
            // Limpiar marcadores de backup
            delete data.usuario.logoBackup;
            delete data.usuario.logoKey;
        }
        
    } catch (error) {
        console.error('Error restaurando logos desde backup:', error);
    }
}

// Guardar datos en localStorage
function setDB(data, excluirLogos = false, crearRespaldo = false) {
    try {
        const datosGuardar = excluirLogos ? comprimirDatos(data) : data;
        localStorage.setItem('aliados_com_db', JSON.stringify(datosGuardar));
        
        // Crear respaldo solo si se solicita explícitamente y no hay logos excluidos
        if (crearRespaldo && !excluirLogos) {
            crearRespaldoDeEmergencia();
        }
        
        console.log('💾 Datos guardados correctamente en localStorage');
        return true;
    } catch (error) {
        console.error('Error guardando DB:', error);
        
        // En lugar de excluir logos automáticamente, mostrar warning
        // y intentar liberar espacio de otra manera
        if (!excluirLogos) {
            console.warn('⚠️ Error de espacio en localStorage. Los logos se mantendrán.');
            mostrarNotificacion('Advertencia: Espacio limitado en localStorage. Considera exportar/respaldar datos.', 'warning');
            
            // Intentar limpiar datos obsoletos antes de excluir logos
            limpiarDatosObsoletos();
            
            // Solo como último recurso, comprimir
            try {
                const datosComprimidos = comprimirDatos(data);
                localStorage.setItem('aliados_com_db', JSON.stringify(datosComprimidos));
                console.log('� Datos guardados en modo comprimido (logos preservados en memoria)');
                return true;
            } catch (errorComprimido) {
                console.error('Error crítico guardando datos:', errorComprimido);
                mostrarNotificacion('Error crítico: No se pudieron guardar los datos. Exporta inmediatamente.', 'error');
                return false;
            }
        }
        
        // Si falla completamente, crear respaldo solo como último recurso
        if (crearRespaldo) {
            crearRespaldoDeEmergencia();
        }
        return false;
    }
}

// Función mejorada para guardar con marcado de cambios
function saveDB(showNotification = false, crearRespaldo = false) {
    markDataChanged();
    const success = setDB(db, false, crearRespaldo);
    
    if (showNotification) {
        if (success) {
            mostrarNotificacion('Datos guardados correctamente', 'success');
        } else {
            mostrarNotificacion('Error al guardar. Se intentará recuperar automáticamente.', 'warning');
        }
    }
    
    return success;
}

// Limpiar intervalos y recursos cuando sea necesario
function limpiarRecursos() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        console.log('🧹 Intervalos de auto-guardado limpiados');
    }
}

// Función para limpiar datos obsoletos y liberar espacio
function limpiarDatosObsoletos() {
    try {
        // Limpiar sessionStorage de respaldos muy antiguos (más de 7 días)
        const sessionKeys = Object.keys(sessionStorage);
        const respaldosAntiugos = sessionKeys.filter(key => 
            key.startsWith('aliados_backup_') && 
            (Date.now() - parseInt(key.split('_')[2]) > 7 * 24 * 60 * 60 * 1000)
        );
        
        respaldosAntiugos.forEach(key => {
            sessionStorage.removeItem(key);
            console.log(`🗑️ Respaldo antiguo eliminado: ${key}`);
        });
        
        // Limpiar cupones muy antiguos y redimidos (más de 30 días)
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        
        const cuponesAntiguos = db.cupones.filter(cupon => 
            cupon.estado === 'redimido' && 
            new Date(cupon.fechaCreacion) < fechaLimite
        );
        
        if (cuponesAntiguos.length > 0) {
            db.cupones = db.cupones.filter(cupon => !cuponesAntiguos.includes(cupon));
            console.log(`🗑️ ${cuponesAntiguos.length} cupones redimidos antiguos eliminados`);
        }
        
        console.log('🧹 Limpieza de datos obsoletos completada');
        
    } catch (error) {
        console.error('Error limpiando datos obsoletos:', error);
    }
}

// Función para reiniciar el sistema de auto-guardado
function reiniciarAutoSave() {
    limpiarRecursos();
    setupAutoSave();
    console.log('🔄 Sistema de auto-guardado reiniciado');
}

// Comprimir datos para ahorrar espacio manteniendo logos en memoria
function comprimirDatos(data) {
    const datosComprimidos = JSON.parse(JSON.stringify(data));
    
    // Crear cache de logos en sessionStorage en lugar de eliminarlos
    datosComprimidos.aliados.forEach(aliado => {
        if (aliado.logo) {
            // Guardar logo en sessionStorage con clave única
            const logoKey = `logo_aliado_${aliado.id}`;
            try {
                sessionStorage.setItem(logoKey, aliado.logo);
                aliado.logoBackup = true;
                aliado.logoKey = logoKey; // Guardar referencia para recuperación
                delete aliado.logo; // Eliminar del JSON principal para ahorrar espacio
                console.log(`💾 Logo de ${aliado.nombre} guardado en sessionStorage`);
            } catch (error) {
                console.warn(`⚠️ No se pudo guardar logo de ${aliado.nombre} en sessionStorage`);
                // Si no se puede guardar en sessionStorage, mantener el logo
                aliado.logoBackup = false;
            }
        }
    });
    
    // También aplicar para usuario si tiene logo
    if (datosComprimidos.usuario && datosComprimidos.usuario.logo) {
        try {
            sessionStorage.setItem('logo_usuario', datosComprimidos.usuario.logo);
            datosComprimidos.usuario.logoBackup = true;
            datosComprimidos.usuario.logoKey = 'logo_usuario';
            delete datosComprimidos.usuario.logo;
            console.log('💾 Logo de usuario guardado en sessionStorage');
        } catch (error) {
            console.warn('⚠️ No se pudo guardar logo de usuario en sessionStorage');
            datosComprimidos.usuario.logoBackup = false;
        }
    }
    
    return datosComprimidos;
}

/* ===========================
   REGISTRO INICIAL DEL USUARIO (COMENTADO - YA NO SE USA)
   =========================== */

// FUNCIÓN COMENTADA - AHORA SE USA LA SECCIÓN DE CONFIGURACIÓN
/*
async function procesarRegistroInicial(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        // Mostrar loading
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        // Procesar logo
        let logoBase64 = '';
        const logoFile = formData.get('logo');
        if (logoFile && logoFile.size > 0) {
            logoBase64 = await convertirImagenABase64(logoFile);
        }
        
        // Crear usuario
        const usuario = {
            nombre: formData.get('nombre'),
            direccion: formData.get('direccion') || '',
            telefono: formData.get('telefono') || '',
            instagram: formData.get('instagram') || '',
            logo: logoBase64,
            fechaRegistro: new Date().toISOString()
        };
        
        // Guardar en DB
        db.usuario = usuario;
        appState.usuario = usuario;
        appState.isFirstTime = false;
        
        if (saveDB(true, true)) { // Crear respaldo en registro inicial
            // Ocultar pantalla de registro
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
            
            // Inicializar aplicación
            inicializarAplicacion();
            
            // Mostrar mensaje de bienvenida
            mostrarNotificacion('¡Bienvenido a aliados_com!', 'success');
        } else {
            throw new Error('Error al guardar los datos');
        }
        
    } catch (error) {
        console.error('Error en registro:', error);
        mostrarNotificacion('Error al procesar el registro', 'error');
    } finally {
        // Remover loading
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
    }
}
*/

/* ===========================
   INICIALIZACIÓN DE LA APLICACIÓN
   =========================== */

// Inicializar aplicación principal
function inicializarAplicacion() {
    console.log('🎯 Inicializando aplicación principal...');
    
    // PANEL DE CONTROL DIRECTO - NO HAY FORMULARIO DE BIENVENIDA
    // welcome-screen fue eliminado completamente del HTML
    
    // Mostrar aplicación principal
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
        mainApp.style.display = 'block';
        mainApp.style.visibility = 'visible';
    }
    
    // Verificar si es una recuperación después de recarga
    verificarRecuperacionDatos();
    
    // Cargar configuración de usuario en navbar
    actualizarNavbarUsuario();
    
    // Cargar datos en todas las secciones
    actualizarEstadisticas();
    cargarConfiguracionInicial();
    cargarAliados();
    cargarCupones();
    cargarClientes();
    cargarCuponesExternos();
    
    // Mostrar sección de inicio (Panel de Control)
    mostrarSeccion('inicio');
    
    // Mostrar mensaje si es primera vez (pero sin formulario de registro)
    if (appState.isFirstTime) {
        setTimeout(() => {
            mostrarNotificacion('👋 ¡Bienvenido al Panel de Control! Configura tu empresa en "Config" si deseas personalizar la aplicación.', 'info', 8000);
        }, 1000);
    }
    
    console.log('✅ Aplicación inicializada correctamente - Panel de Control activo');
}

// Verificar si se recuperaron datos después de una recarga
function verificarRecuperacionDatos() {
    const hayRespaldos = Object.keys(sessionStorage).some(key => key.startsWith('aliados_com_backup_'));
    
    if (hayRespaldos && db.usuario && db.usuario.nombre) {
        // Mostrar mensaje informativo de que los datos están seguros
        setTimeout(() => {
            mostrarNotificacion('✅ Tus datos están seguros y se auto-guardan automáticamente', 'info', 5000);
        }, 1000);
    }
    
    // Limpiar respaldos antiguos (más de 24 horas)
    limpiarRespaldosAntiguos();
}

// Limpiar respaldos de más de 24 horas o cuando el storage esté lleno
function limpiarRespaldosAntiguos() {
    try {
        const ahora = new Date().getTime();
        const unDia = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        const dosHoras = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
        
        let respaldos = [];
        
        // Recopilar todos los respaldos con sus timestamps
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('aliados_com_backup_')) {
                try {
                    const timestamp = parseInt(key.replace('aliados_com_backup_', ''));
                    respaldos.push({ key, timestamp });
                } catch (error) {
                    // Si no se puede parsear el timestamp, marcar para eliminación
                    sessionStorage.removeItem(key);
                }
            }
        });
        
        // Ordenar por timestamp (más reciente primero)
        respaldos.sort((a, b) => b.timestamp - a.timestamp);
        
        // Mantener solo los 3 más recientes y eliminar los antiguos
        respaldos.forEach((respaldo, index) => {
            const esAntiguo = ahora - respaldo.timestamp > unDia;
            const excedeMaximo = index >= 3; // Mantener máximo 3 respaldos
            const esMuyAntiguo = ahora - respaldo.timestamp > dosHoras && index >= 1; // Si hay más de 1, eliminar los de más de 2 horas
            
            if (esAntiguo || excedeMaximo || esMuyAntiguo) {
                sessionStorage.removeItem(respaldo.key);
                console.log('🗑️ Respaldo eliminado:', respaldo.key);
            }
        });
        
    } catch (error) {
        console.error('Error limpiando respaldos:', error);
    }
}

// Actualizar información de usuario en navbar
function actualizarNavbarUsuario() {
    const usuario = db.usuario;
    
    // Logo en navbar
    const navLogo = document.getElementById('nav-logo-img');
    if (navLogo) {
        navLogo.src = (usuario && usuario.logo) ? usuario.logo : 'assets/placeholder-logo.svg';
    }
    
    // Nombre en navbar
    const navNombre = document.getElementById('nav-empresa-nombre');
    if (navNombre) {
        navNombre.textContent = (usuario && usuario.nombre) ? usuario.nombre : 'Mi Empresa';
    }
    
    // Avatar de usuario
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) {
        userAvatar.src = (usuario && usuario.logo) ? usuario.logo : 'assets/placeholder-logo.svg';
    }
}

// Cargar configuración inicial en sección inicio
function cargarConfiguracionInicial() {
    const usuario = db.usuario;
    if (!usuario) return;
    
    // CARGAR DATOS EN EL FORMULARIO DE CONFIGURACIÓN
    
    // Logo empresa en preview
    const logoPreview = document.getElementById('config-logo-preview');
    if (logoPreview) {
        logoPreview.src = usuario.logo || 'assets/placeholder-logo.svg';
    }
    
    // Nombre empresa en el input
    const nombreInput = document.getElementById('config-nombre');
    if (nombreInput) {
        nombreInput.value = usuario.nombre || '';
    }
    
    // Dirección en el input
    const direccionInput = document.getElementById('config-direccion');
    if (direccionInput) {
        direccionInput.value = usuario.direccion || '';
    }
    
    // Teléfono en el input
    const telefonoInput = document.getElementById('config-telefono');
    if (telefonoInput) {
        telefonoInput.value = usuario.telefono || '';
    }
    
    // Instagram en el input
    const instagramInput = document.getElementById('config-instagram');
    if (instagramInput) {
        instagramInput.value = usuario.instagram || '';
    }
    
    // TAMBIÉN ACTUALIZAR DISPLAYS SI EXISTEN (para compatibilidad)
    
    // Logo empresa display
    const logoDisplay = document.getElementById('empresa-logo-display');
    if (logoDisplay) {
        logoDisplay.src = usuario.logo || 'assets/placeholder-logo.svg';
    }
    
    // Nombre empresa display
    const nombreDisplay = document.getElementById('empresa-nombre-display');
    if (nombreDisplay) {
        nombreDisplay.textContent = usuario.nombre || 'Tu Empresa';
    }
    
    // Dirección display
    const direccionDisplay = document.getElementById('empresa-direccion-display');
    if (direccionDisplay) {
        direccionDisplay.textContent = usuario.direccion || 'Dirección no configurada';
    }
    
    // Teléfono display
    const telefonoDisplay = document.getElementById('empresa-telefono-display');
    if (telefonoDisplay) {
        telefonoDisplay.textContent = usuario.telefono || 'Teléfono no configurado';
    }
    
    // Instagram display
    const instagramDisplay = document.getElementById('empresa-instagram-display');
    if (instagramDisplay && usuario.instagram) {
        instagramDisplay.href = usuario.instagram;
        instagramDisplay.style.display = 'flex';
    }
    
    // Cargar datos en formulario de configuración
    cargarDatosConfiguracion();
}

// Cargar datos en formulario de configuración
function cargarDatosConfiguracion() {
    const usuario = db.usuario;
    if (!usuario) return;
    
    const configNombre = document.getElementById('config-nombre');
    const configDireccion = document.getElementById('config-direccion');
    const configTelefono = document.getElementById('config-telefono');
    const configInstagram = document.getElementById('config-instagram');
    const configLogoPreview = document.getElementById('config-logo-preview');
    
    if (configNombre) configNombre.value = usuario.nombre || '';
    if (configDireccion) configDireccion.value = usuario.direccion || '';
    if (configTelefono) configTelefono.value = usuario.telefono || '';
    if (configInstagram) configInstagram.value = usuario.instagram || '';
    if (configLogoPreview && usuario.logo) {
        configLogoPreview.src = usuario.logo;
    }
}

/* ===========================
   NAVEGACIÓN Y SECCIONES
   =========================== */

// Mostrar sección específica
function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(seccion => {
        seccion.classList.remove('activa');
    });
    
    // Mostrar sección seleccionada
    const seccionActiva = document.getElementById(`seccion-${seccionId}`);
    if (seccionActiva) {
        seccionActiva.classList.add('activa');
    }
    
    // Actualizar navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const btnActivo = document.querySelector(`[data-section="${seccionId}"]`);
    if (btnActivo) {
        btnActivo.classList.add('active');
    }
    
    // Actualizar estado
    appState.currentSection = seccionId;
    
    // Cargar datos específicos de la sección
    switch (seccionId) {
        case 'inicio':
            actualizarEstadisticas();
            break;
        case 'aliados':
            cargarAliados();
            break;
        case 'cupones':
            cargarCupones();
            break;
        case 'clientes':
            cargarClientes();
            break;
        case 'cupones-importados':
            cargarCuponesExternos();
            break;
    }
}

/* ===========================
   ESTADÍSTICAS
   =========================== */

// Actualizar estadísticas en dashboard
function actualizarEstadisticas() {
    const aliados = db.aliados || [];
    const cupones = db.cupones || [];
    const clientes = db.clientes || [];
    const cuponesRedimidos = cupones.filter(c => c.estado === 'redimido');
    
    // Actualizar contadores
    actualizarContador('total-aliados', aliados.length);
    actualizarContador('total-cupones', cupones.length);
    actualizarContador('total-clientes', clientes.length);
    actualizarContador('cupones-redimidos', cuponesRedimidos.length);
    
    console.log('📊 Estadísticas actualizadas:', {
        aliados: aliados.length,
        cupones: cupones.length,
        clientes: clientes.length,
        redimidos: cuponesRedimidos.length
    });
}

// Actualizar contador con animación
function actualizarContador(elementId, valor) {
    const elemento = document.getElementById(elementId);
    if (!elemento) return;
    
    const valorActual = parseInt(elemento.textContent) || 0;
    const valorFinal = valor;
    
    if (valorActual !== valorFinal) {
        animarContador(elemento, valorActual, valorFinal, 1000);
    }
}

// Animar contador con incremento progresivo
function animarContador(elemento, inicio, fin, duracion) {
    const incremento = (fin - inicio) / (duracion / 16);
    let valorActual = inicio;
    
    const timer = setInterval(() => {
        valorActual += incremento;
        
        if ((incremento > 0 && valorActual >= fin) || (incremento < 0 && valorActual <= fin)) {
            elemento.textContent = fin;
            clearInterval(timer);
        } else {
            elemento.textContent = Math.round(valorActual);
        }
    }, 16);
}

/* ===========================
   REDENCIÓN DE CUPONES EXTERNOS
   =========================== */

// Abrir modal para redimir cupón externo
function abrirModalRedimirExterno(cuponId) {
    const cupon = db.cuponesExternos.find(c => c.id === cuponId);
    if (!cupon || cupon.estado !== 'activo') return;
    
    document.getElementById('redimir-codigo').value = cupon.codigo;
    document.getElementById('redimir-cliente').value = '';
    document.getElementById('redimir-whatsapp').value = '';
    
    // Marcar que es un cupón externo
    document.getElementById('form-redimir').dataset.cuponId = cuponId;
    document.getElementById('form-redimir').dataset.tipoExterno = 'true';
    document.getElementById('modal-redimir').classList.add('activo');
}

// Confirmar redención de cupón externo
function confirmarRedencionExterno(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const cuponId = form.dataset.cuponId;
    
    const cupon = db.cuponesExternos.find(c => c.id === cuponId);
    if (!cupon) return;
    
    // Actualizar cupón externo
    cupon.estado = 'redimido';
    cupon.cliente = formData.get('cliente');
    cupon.clienteWhatsapp = formData.get('whatsapp');
    cupon.fechaRedencion = new Date().toISOString();
    
    // Agregar cliente si no existe
    const clienteExiste = db.clientes.find(c => 
        c.whatsapp === cupon.clienteWhatsapp && c.aliado === cupon.aliado
    );
    
    if (!clienteExiste) {
        const nuevoCliente = {
            id: `cliente_${Date.now()}`,
            nombre: cupon.cliente,
            whatsapp: cupon.clienteWhatsapp,
            aliado: cupon.aliado,
            codigo: cupon.codigo,
            fecha: cupon.fechaRedencion
        };
        db.clientes.push(nuevoCliente);
    }
    
    // Guardar cambios
    saveDB();
    
    // Actualizar interfaz
    cargarCuponesExternos();
    cargarClientes();
    actualizarEstadisticas();
    cerrarModalRedimir();
    
    mostrarNotificacion('Cupón externo redimido correctamente', 'success');
}

/* ===========================
   GESTIÓN DE ALIADOS
   =========================== */

// Cargar tabla de aliados
function cargarAliados() {
    const aliados = db.aliados || [];
    const tbody = document.querySelector('#tabla-aliados tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    aliados.forEach(aliado => {
        const cuponesPorAliado = (db.cupones || []).filter(c => c.aliadoId === aliado.id).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${aliado.logo || 'assets/placeholder-logo.png'}" alt="Logo ${aliado.nombre}">
            </td>
            <td><strong>${aliado.nombre}</strong></td>
            <td><span class="badge">${aliado.alias}</span></td>
            <td>${aliado.encargado || '-'}</td>
            <td>${aliado.whatsapp || '-'}</td>
            <td><span class="count-badge">${cuponesPorAliado}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="mostrarCuponesAliado('${aliado.id}')" title="Ver cupones">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="editarAliado('${aliado.id}')" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m18 2 4 4L12 16l-4 4-4-4L14 6z"/>
                        </svg>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarAliado('${aliado.id}')" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Actualizar select de aliados en formularios
    actualizarSelectAliados();
}

// Abrir modal para nuevo aliado
function abrirModalAliado() {
    document.getElementById('modal-aliado-titulo').textContent = 'Nuevo Aliado';
    document.getElementById('form-aliado').reset();
    document.getElementById('modal-aliado').classList.add('activo');
}

// Editar aliado existente
function editarAliado(aliadoId) {
    const aliado = db.aliados.find(a => a.id === aliadoId);
    if (!aliado) return;
    
    document.getElementById('modal-aliado-titulo').textContent = 'Editar Aliado';
    document.getElementById('aliado-nombre').value = aliado.nombre;
    document.getElementById('aliado-alias').value = aliado.alias;
    document.getElementById('aliado-encargado').value = aliado.encargado || '';
    document.getElementById('aliado-whatsapp').value = aliado.whatsapp || '';
    document.getElementById('aliado-instagram').value = aliado.instagram || '';
    
    // Mostrar logo existente si lo hay
    const logoPreview = document.getElementById('aliado-logo-preview');
    if (logoPreview && aliado.logo) {
        logoPreview.src = aliado.logo;
        logoPreview.style.display = 'block';
        console.log(`🖼️ Logo cargado para edición: ${aliado.nombre}`);
    } else if (logoPreview) {
        logoPreview.style.display = 'none';
    }
    
    // Marcar como edición
    document.getElementById('form-aliado').dataset.editId = aliadoId;
    
    document.getElementById('modal-aliado').classList.add('activo');
}

// Guardar aliado (nuevo o editado)
async function guardarAliado(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const editId = form.dataset.editId;
    
    try {
        // Procesar logo si se subió uno nuevo
        let logoBase64 = '';
        const logoFile = formData.get('logo');
        if (logoFile && logoFile.size > 0) {
            logoBase64 = await convertirImagenABase64(logoFile);
        }
        
        const aliadoData = {
            nombre: formData.get('nombre'),
            alias: formData.get('alias'),
            encargado: formData.get('encargado'),
            whatsapp: formData.get('whatsapp'),
            instagram: formData.get('instagram'),
            logo: logoBase64
        };
        
        if (editId) {
            // Editar aliado existente
            const index = db.aliados.findIndex(a => a.id === editId);
            if (index !== -1) {
                // Mantener logo anterior si no se subió uno nuevo
                if (!logoBase64 && db.aliados[index].logo) {
                    aliadoData.logo = db.aliados[index].logo;
                }
                
                db.aliados[index] = {
                    ...db.aliados[index],
                    ...aliadoData,
                    fechaModificacion: new Date().toISOString()
                };
            }
        } else {
            // Crear nuevo aliado
            const nuevoAliado = {
                ...aliadoData,
                id: `aliado_${Date.now()}`,
                fechaCreacion: new Date().toISOString()
            };
            db.aliados.push(nuevoAliado);
        }
        
        // Guardar en DB
        saveDB();
        
        // Actualizar interfaz
        cargarAliados();
        actualizarEstadisticas();
        cerrarModalAliado();
        
        mostrarNotificacion('Aliado guardado correctamente', 'success');
        
    } catch (error) {
        console.error('Error guardando aliado:', error);
        mostrarNotificacion('Error al guardar el aliado', 'error');
    }
}

// Eliminar aliado
function eliminarAliado(aliadoId) {
    const aliado = db.aliados.find(a => a.id === aliadoId);
    if (!aliado) return;
    
    // Verificar si tiene cupones asociados
    const cuponesAsociados = (db.cupones || []).filter(c => c.aliadoId === aliadoId);
    
    let mensaje = `¿Eliminar el aliado "${aliado.nombre}"?`;
    if (cuponesAsociados.length > 0) {
        mensaje += `\n\n⚠️ ATENCIÓN: Este aliado tiene ${cuponesAsociados.length} cupones asociados que también se eliminarán.`;
    }
    
    if (confirm(mensaje)) {
        // Eliminar aliado
        db.aliados = db.aliados.filter(a => a.id !== aliadoId);
        
        // Eliminar cupones asociados
        db.cupones = db.cupones.filter(c => c.aliadoId !== aliadoId);
        
        // Guardar cambios
        saveDB();
        
        // Actualizar interfaz
        cargarAliados();
        cargarCupones();
        actualizarEstadisticas();
        
        mostrarNotificacion('Aliado eliminado correctamente', 'success');
    }
}

// Cerrar modal de aliado
function cerrarModalAliado() {
    document.getElementById('modal-aliado').classList.remove('activo');
    document.getElementById('form-aliado').reset();
    delete document.getElementById('form-aliado').dataset.editId;
    
    // Limpiar preview de logo
    const logoPreview = document.getElementById('aliado-logo-preview');
    if (logoPreview) {
        logoPreview.style.display = 'none';
        logoPreview.src = '';
    }
    
    // Cambiar título de vuelta a "Nuevo Aliado"
    document.getElementById('modal-aliado-titulo').textContent = 'Nuevo Aliado';
}

// Filtrar aliados en tiempo real
function filtrarAliados() {
    const busqueda = document.getElementById('buscar-aliado').value.toLowerCase();
    const filas = document.querySelectorAll('#tabla-aliados tbody tr');
    
    filas.forEach(fila => {
        const nombre = fila.cells[1].textContent.toLowerCase();
        const alias = fila.cells[2].textContent.toLowerCase();
        const encargado = fila.cells[3].textContent.toLowerCase();
        
        const coincide = nombre.includes(busqueda) || 
                        alias.includes(busqueda) || 
                        encargado.includes(busqueda);
        
        fila.style.display = coincide ? '' : 'none';
    });
}

// Actualizar select de aliados en formularios
function actualizarSelectAliados() {
    const aliados = db.aliados || [];
    
    // Select en formulario de cupón
    const selectCupon = document.getElementById('cupon-aliado');
    if (selectCupon) {
        selectCupon.innerHTML = '<option value="">Selecciona un aliado</option>';
        aliados.forEach(aliado => {
            const option = document.createElement('option');
            option.value = aliado.id;
            option.textContent = `${aliado.nombre} (${aliado.alias})`;
            selectCupon.appendChild(option);
        });
    }
    
    // Select en filtro de cupones
    const filtroCupones = document.getElementById('filtro-aliado-cupones');
    if (filtroCupones) {
        filtroCupones.innerHTML = '<option value="">Todos los aliados</option>';
        aliados.forEach(aliado => {
            const option = document.createElement('option');
            option.value = aliado.id;
            option.textContent = aliado.nombre;
            filtroCupones.appendChild(option);
        });
    }
    
    // Select en filtro de cupones externos
    const filtroExterno = document.getElementById('filtro-aliado-externo');
    if (filtroExterno) {
        const aliadosExternos = [...new Set((db.cuponesExternos || []).map(c => c.aliado))];
        filtroExterno.innerHTML = '<option value="">Todos los aliados</option>';
        aliadosExternos.forEach(aliado => {
            const option = document.createElement('option');
            option.value = aliado;
            option.textContent = aliado;
            filtroExterno.appendChild(option);
        });
    }
}

/* ===========================
   GESTIÓN DE CUPONES
   =========================== */

// Cargar tabla de cupones
function cargarCupones() {
    const cupones = db.cupones || [];
    const tbody = document.querySelector('#tabla-cupones tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    cupones.forEach(cupon => {
        const aliado = db.aliados.find(a => a.id === cupon.aliadoId);
        const aliadoNombre = aliado ? aliado.nombre : 'Aliado eliminado';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${aliadoNombre}</strong></td>
            <td>${formatearFecha(cupon.vencimiento)}</td>
            <td><code>${cupon.codigo}</code></td>
            <td>${cupon.descripcion}</td>
            <td>${cupon.cliente || '-'}</td>
            <td>${cupon.clienteWhatsapp || '-'}</td>
            <td><span class="estado-${cupon.estado}">${cupon.estado.toUpperCase()}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="previsualizarCupon('${cupon.id}')" title="Vista previa">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="generarCuponPNG('${cupon.id}')" title="Descargar PNG">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                    ${cupon.estado === 'activo' ? 
                        `<button class="btn btn-warning btn-sm" onclick="abrirModalRedimir('${cupon.id}')" title="Redimir">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"/>
                            </svg>
                        </button>` : ''
                    }
                    ${cupon.estado === 'redimido' ? 
                        `<button class="btn btn-secondary btn-sm" onclick="anularRedencion('${cupon.id}')" title="Anular redención">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18l-2 13H5L3 6z"/>
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>` : ''
                    }
                    <button class="btn btn-danger btn-sm" onclick="eliminarCupon('${cupon.id}')" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Abrir modal para nuevo cupón
function abrirModalCupon() {
    // Verificar que haya aliados
    if (!db.aliados || db.aliados.length === 0) {
        mostrarNotificacion('Primero debes crear al menos un aliado', 'warning');
        mostrarSeccion('aliados');
        return;
    }
    
    document.getElementById('form-cupon').reset();
    
    // Actualizar lista de aliados disponibles
    actualizarSelectAliados();
    
    // Establecer fecha mínima (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('cupon-vencimiento').min = hoy;
    
    // Establecer fecha por defecto (30 días)
    const fechaDefecto = new Date();
    fechaDefecto.setDate(fechaDefecto.getDate() + 30);
    document.getElementById('cupon-vencimiento').value = fechaDefecto.toISOString().split('T')[0];
    
    document.getElementById('modal-cupon').classList.add('activo');
}

// Generar cupón(es)
async function generarCupon(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const aliadoId = formData.get('aliado');
        const aliado = db.aliados.find(a => a.id === aliadoId);
        
        if (!aliado) {
            throw new Error('Aliado no encontrado');
        }
        
        // Procesar imagen promocional
        const imagenFile = formData.get('imagen');
        if (!imagenFile || imagenFile.size === 0) {
            throw new Error('Debes seleccionar una imagen promocional');
        }
        
        const imagenBase64 = await convertirImagenABase64(imagenFile);
        const cantidad = parseInt(formData.get('cantidad'));
        
        // Generar cupones
        for (let i = 0; i < cantidad; i++) {
            const cupon = {
                id: `cupon_${Date.now()}_${i}`,
                aliadoId: aliadoId,
                codigo: generarCodigoSecuencial(),
                descripcion: formData.get('descripcion'),
                vencimiento: formData.get('vencimiento'),
                imagen: imagenBase64,
                estado: 'activo',
                fechaCreacion: new Date().toISOString(),
                fechaRedencion: null,
                cliente: null,
                clienteWhatsapp: null
            };
            
            db.cupones.push(cupon);
        }
        
        // Guardar en DB
        saveDB();
        
        // Actualizar interfaz
        cargarCupones();
        actualizarEstadisticas();
        cerrarModalCupon();
        
        mostrarNotificacion(`${cantidad} cupón(es) generado(s) correctamente`, 'success');
        
    } catch (error) {
        console.error('Error generando cupón:', error);
        mostrarNotificacion(error.message || 'Error al generar el cupón', 'error');
    }
}

// Generar código secuencial
function generarCodigoSecuencial() {
    const cupones = db.cupones || [];
    const ultimoCodigo = cupones.length > 0 
        ? Math.max(...cupones.map(c => parseInt(c.codigo.replace('AL-', '')))) 
        : 0;
    const nuevoCodigo = ultimoCodigo + 1;
    return `AL-${nuevoCodigo.toString().padStart(6, '0')}`;
}

// Cerrar modal de cupón
function cerrarModalCupon() {
    document.getElementById('modal-cupon').classList.remove('activo');
    document.getElementById('form-cupon').reset();
}

// Filtrar cupones por aliado
function filtrarCupones() {
    const filtroAliado = document.getElementById('filtro-aliado-cupones').value;
    const filas = document.querySelectorAll('#tabla-cupones tbody tr');
    
    filas.forEach(fila => {
        if (!filtroAliado) {
            fila.style.display = '';
        } else {
            const cupon = db.cupones.find(c => c.codigo === fila.cells[2].textContent);
            fila.style.display = (cupon && cupon.aliadoId === filtroAliado) ? '' : 'none';
        }
    });
}

// Previsualizar cupón
function previsualizarCupon(cuponId) {
    const cupon = db.cupones.find(c => c.id === cuponId);
    if (!cupon) return;
    
    const aliado = db.aliados.find(a => a.id === cupon.aliadoId);
    if (!aliado) return;
    
    currentPreviewCupon = cupon;
    
    // Renderizar cupón en modal
    const previewContainer = document.getElementById('preview-container');
    previewContainer.innerHTML = '';
    
    const cuponElement = buildCouponDOM(cupon, aliado, db.usuario);
    previewContainer.appendChild(cuponElement);
    
    document.getElementById('modal-preview').classList.add('activo');
}

// Cerrar modal de vista previa
function cerrarModalPreview() {
    document.getElementById('modal-preview').classList.remove('activo');
    currentPreviewCupon = null;
}

// Construir DOM del cupón
function buildCouponDOM(cupon, aliado, usuario) {
    const cuponDiv = document.createElement('div');
    cuponDiv.className = 'cupon-container';
    
    cuponDiv.innerHTML = `
        <div class="cupon-header">
            <div class="cupon-logo-usuario">
                <img src="${usuario.logo || 'assets/placeholder-logo.png'}" alt="Logo Usuario">
            </div>
            <div class="cupon-empresa">
                <h1>${usuario.nombre}</h1>
                <div class="cupon-badge">se une a su aliado ${aliado.alias}</div>
            </div>
            <div class="cupon-logo-aliado">
                <img src="${aliado.logo || 'assets/placeholder-logo.png'}" alt="Logo Aliado">
            </div>
        </div>
        
        <div class="cupon-body">
            <div class="cupon-imagen">
                <img src="${cupon.imagen}" alt="Imagen Promocional">
            </div>
            <div class="cupon-descripcion">
                <h2>${cupon.descripcion}</h2>
            </div>
        </div>
        
        <div class="cupon-frase">
            <p>"El éxito se multiplica cuando se comparte."</p>
        </div>
        
        <div class="cupon-footer">
            <div class="cupon-chip">VENCE: ${formatearFecha(cupon.vencimiento)}</div>
            <div class="cupon-chip">CÓDIGO: ${cupon.codigo}</div>
        </div>
        
        ${cupon.estado === 'redimido' ? '<div class="sello-redimido">REDIMIDO</div>' : ''}
    `;
    
    return cuponDiv;
}

/* ===========================
   REDENCIÓN DE CUPONES
   =========================== */

// Abrir modal para redimir cupón
function abrirModalRedimir(cuponId) {
    const cupon = db.cupones.find(c => c.id === cuponId);
    if (!cupon || cupon.estado !== 'activo') return;
    
    document.getElementById('redimir-codigo').value = cupon.codigo;
    document.getElementById('redimir-cliente').value = '';
    document.getElementById('redimir-whatsapp').value = '';
    
    document.getElementById('form-redimir').dataset.cuponId = cuponId;
    document.getElementById('modal-redimir').classList.add('activo');
}

// Confirmar redención
function confirmarRedencion(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const cuponId = form.dataset.cuponId;
    const esExterno = form.dataset.tipoExterno === 'true';
    
    // Si es un cupón externo, usar función específica
    if (esExterno) {
        confirmarRedencionExterno(event);
        return;
    }
    
    const cupon = db.cupones.find(c => c.id === cuponId);
    if (!cupon) return;
    
    // Actualizar cupón
    cupon.estado = 'redimido';
    cupon.cliente = formData.get('cliente');
    cupon.clienteWhatsapp = formData.get('whatsapp');
    cupon.fechaRedencion = new Date().toISOString();
    
    // Agregar cliente si no existe
    const clienteExiste = db.clientes.find(c => 
        c.whatsapp === cupon.clienteWhatsapp && c.aliado === cupon.aliadoId
    );
    
    if (!clienteExiste) {
        const aliado = db.aliados.find(a => a.id === cupon.aliadoId);
        const nuevoCliente = {
            id: `cliente_${Date.now()}`,
            nombre: cupon.cliente,
            whatsapp: cupon.clienteWhatsapp,
            aliado: aliado ? aliado.nombre : 'Desconocido',
            codigo: cupon.codigo,
            fecha: cupon.fechaRedencion
        };
        db.clientes.push(nuevoCliente);
    }
    
    // Guardar cambios
    saveDB();
    
    // Actualizar interfaz
    cargarCupones();
    cargarClientes();
    actualizarEstadisticas();
    cerrarModalRedimir();
    
    mostrarNotificacion('Cupón redimido correctamente', 'success');
}

// Cerrar modal de redimir
function cerrarModalRedimir() {
    document.getElementById('modal-redimir').classList.remove('activo');
    document.getElementById('form-redimir').reset();
    delete document.getElementById('form-redimir').dataset.cuponId;
    delete document.getElementById('form-redimir').dataset.tipoExterno;
}

// Anular redención
function anularRedencion(cuponId) {
    if (!confirm('¿Anular la redención de este cupón?')) return;
    
    const cupon = db.cupones.find(c => c.id === cuponId);
    if (!cupon) return;
    
    // Revertir estado del cupón
    cupon.estado = 'activo';
    cupon.cliente = null;
    cupon.clienteWhatsapp = null;
    cupon.fechaRedencion = null;
    
    // Guardar cambios
    saveDB();
    
    // Actualizar interfaz
    cargarCupones();
    actualizarEstadisticas();
    
    mostrarNotificacion('Redención anulada correctamente', 'success');
}

// Eliminar cupón
function eliminarCupon(cuponId) {
    if (!confirm('¿Eliminar este cupón permanentemente?')) return;
    
    db.cupones = db.cupones.filter(c => c.id !== cuponId);
    
    saveDB();
    cargarCupones();
    actualizarEstadisticas();
    
    mostrarNotificacion('Cupón eliminado correctamente', 'success');
}

// Eliminar todos los cupones
function eliminarTodosCupones() {
    const totalCupones = (db.cupones || []).length;
    
    if (totalCupones === 0) {
        mostrarNotificacion('No hay cupones para eliminar', 'info');
        return;
    }
    
    // Triple confirmación
    if (confirm(`¿Eliminar TODOS los ${totalCupones} cupones?`) &&
        confirm('⚠️ Esta acción NO se puede deshacer. ¿Continuar?') &&
        confirm('🚨 CONFIRMACIÓN FINAL: ¿Eliminar todos los cupones?')) {
        
        db.cupones = [];
        saveDB();
        cargarCupones();
        actualizarEstadisticas();
        
        mostrarNotificacion('✅ Todos los cupones han sido eliminados', 'success');
    }
}

/* ===========================
   CONTINUARÁ EN PARTE 2...
   =========================== */

// Función utilitaria para convertir imagen a base64
async function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Función utilitaria para formatear fechas
function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES');
}

// Función utilitaria debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info', duracion = 5000) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <div class="notificacion-contenido">
            <span>${mensaje}</span>
            <button class="notificacion-cerrar" onclick="this.parentElement.parentElement.remove()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => notificacion.classList.add('mostrar'), 100);
    
    // Auto-remover después de la duración especificada
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => notificacion.remove(), 300);
    }, duracion);
}

/* ===========================
   GENERACIÓN Y DESCARGA DE PNG
   =========================== */

// Generar y descargar cupón en PNG
async function generarCuponPNG(cuponId) {
    try {
        const cupon = db.cupones.find(c => c.id === cuponId);
        if (!cupon) throw new Error('Cupón no encontrado');
        
        const aliado = db.aliados.find(a => a.id === cupon.aliadoId);
        if (!aliado) throw new Error('Aliado no encontrado');
        
        // Mostrar loading
        mostrarNotificacion('Generando imagen...', 'info');
        
        // Crear elemento temporal para renderizar
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        document.body.appendChild(tempContainer);
        
        // Renderizar cupón
        const cuponElement = buildCouponDOM(cupon, aliado, db.usuario);
        tempContainer.appendChild(cuponElement);
        
        // Cargar html2canvas dinámicamente
        const html2canvas = await cargarLibreriaCanvas();
        
        // Generar imagen
        const canvas = await html2canvas(cuponElement, {
            width: 1080,
            height: 1080,
            scale: 1,
            backgroundColor: null,
            useCORS: true,
            allowTaint: true
        });
        
        // Descargar imagen
        const link = document.createElement('a');
        link.download = `cupon_${cupon.codigo}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Limpiar
        document.body.removeChild(tempContainer);
        
        mostrarNotificacion('Imagen descargada correctamente', 'success');
        
    } catch (error) {
        console.error('Error generando PNG:', error);
        mostrarNotificacion('Error al generar la imagen', 'error');
    }
}

// Descargar PNG desde modal de vista previa
function descargarCuponPNG() {
    if (currentPreviewCupon) {
        generarCuponPNG(currentPreviewCupon.id);
    }
}

/* ===========================
   GESTIÓN DE CLIENTES
   =========================== */

// Cargar tabla de clientes
function cargarClientes() {
    const clientes = db.clientes || [];
    const tbody = document.querySelector('#tabla-clientes tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    clientes.forEach(cliente => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${cliente.nombre}</strong></td>
            <td>${cliente.whatsapp}</td>
            <td>${cliente.aliado}</td>
            <td><code>${cliente.codigo}</code></td>
            <td>${formatearFecha(cliente.fecha)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Filtrar clientes
function filtrarClientes() {
    const busqueda = document.getElementById('buscar-cliente').value.toLowerCase();
    const filas = document.querySelectorAll('#tabla-clientes tbody tr');
    
    filas.forEach(fila => {
        const nombre = fila.cells[0].textContent.toLowerCase();
        const whatsapp = fila.cells[1].textContent.toLowerCase();
        const aliado = fila.cells[2].textContent.toLowerCase();
        const codigo = fila.cells[3].textContent.toLowerCase();
        
        const coincide = nombre.includes(busqueda) || 
                        whatsapp.includes(busqueda) || 
                        aliado.includes(busqueda) ||
                        codigo.includes(busqueda);
        
        fila.style.display = coincide ? '' : 'none';
    });
}

/* ===========================
   GESTIÓN DE CUPONES EXTERNOS
   =========================== */

// Cargar tabla de cupones externos
function cargarCuponesExternos() {
    const cuponesExternos = db.cuponesExternos || [];
    const tbody = document.querySelector('#tabla-cupones-externos tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    cuponesExternos.forEach(cupon => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${cupon.aliado}</strong></td>
            <td>${formatearFecha(cupon.vencimiento)}</td>
            <td><code>${cupon.codigo}</code></td>
            <td>${cupon.descripcion}</td>
            <td><span class="estado-${cupon.estado}">${cupon.estado.toUpperCase()}</span></td>
            <td><small>${cupon.origen || 'Manual'}</small></td>
            <td>
                <div class="action-buttons">
                    ${cupon.estado === 'activo' ? 
                        `<button class="btn btn-warning btn-sm" onclick="abrirModalRedimirExterno('${cupon.id}')" title="Redimir">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 12l2 2 4-4"/>
                                <circle cx="12" cy="12" r="10"/>
                            </svg>
                        </button>` : ''
                    }
                    <button class="btn btn-danger btn-sm" onclick="eliminarCuponExterno('${cupon.id}')" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Actualizar filtro de aliados externos
    actualizarSelectAliados();
}

// Filtrar cupones externos
function filtrarCuponesExternos() {
    const busqueda = document.getElementById('buscar-cupon-externo').value.toLowerCase();
    const filtroAliado = document.getElementById('filtro-aliado-externo').value;
    
    let cuponesExternos = db.cuponesExternos || [];
    
    // Filtrar por aliado si está seleccionado
    if (filtroAliado) {
        cuponesExternos = cuponesExternos.filter(cupon => 
            cupon.aliado === filtroAliado
        );
    }
    
    // Filtrar por búsqueda de texto
    if (busqueda) {
        cuponesExternos = cuponesExternos.filter(cupon =>
            cupon.aliado.toLowerCase().includes(busqueda) ||
            cupon.codigo.toLowerCase().includes(busqueda) ||
            cupon.descripcion.toLowerCase().includes(busqueda)
        );
    }
    
    renderizarTablaCuponesExternos(cuponesExternos);
}

// Renderizar tabla filtrada de cupones externos
function renderizarTablaCuponesExternos(cupones) {
    const tbody = document.querySelector('#tabla-cupones-externos tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    cupones.forEach(cupon => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${cupon.aliado}</strong></td>
            <td>${formatearFecha(cupon.vencimiento)}</td>
            <td><code>${cupon.codigo}</code></td>
            <td>${cupon.descripcion}</td>
            <td><span class="estado-${cupon.estado}">${cupon.estado.toUpperCase()}</span></td>
            <td><small>${cupon.origen || 'Manual'}</small></td>
            <td>
                <div class="action-buttons">
                    ${cupon.estado === 'activo' ? 
                        `<button class="btn btn-warning btn-sm" onclick="abrirModalRedimirExterno('${cupon.id}')" title="Redimir">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 12l2 2 4-4"/>
                                <circle cx="12" cy="12" r="10"/>
                            </svg>
                        </button>` : ''
                    }
                    <button class="btn btn-danger btn-sm" onclick="eliminarCuponExterno('${cupon.id}')" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Eliminar cupón externo
function eliminarCuponExterno(cuponId) {
    if (!confirm('¿Eliminar este cupón externo?')) return;
    
    db.cuponesExternos = db.cuponesExternos.filter(c => c.id !== cuponId);
    saveDB();
    cargarCuponesExternos();
    
    mostrarNotificacion('Cupón externo eliminado', 'success');
}

// Eliminar todos los cupones externos
function eliminarTodosCuponesExternos() {
    const totalCupones = (db.cuponesExternos || []).length;
    
    if (totalCupones === 0) {
        mostrarNotificacion('No hay cupones externos para eliminar', 'info');
        return;
    }
    
    if (confirm(`¿Eliminar TODOS los ${totalCupones} cupones externos?`)) {
        db.cuponesExternos = [];
        saveDB();
        cargarCuponesExternos();
        
        mostrarNotificacion('Todos los cupones externos eliminados', 'success');
    }
}

/* ===========================
   IMPORTACIÓN/EXPORTACIÓN
   =========================== */

// Importar cupones desde archivo
async function importarCupones(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        mostrarNotificacion('Procesando archivo...', 'info');
        
        const XLSX = await cargarLibreriaXLSX();
        const fileData = await file.arrayBuffer();
        const workbook = XLSX.read(fileData, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        if (data.length === 0) {
            throw new Error('El archivo está vacío o no tiene datos válidos');
        }
        
        // Mostrar vista previa
        mostrarVistaPrevia(data, file.name);
        
    } catch (error) {
        console.error('Error importando archivo:', error);
        mostrarNotificacion('Error al leer el archivo: ' + error.message, 'error');
    } finally {
        // Limpiar input
        event.target.value = '';
    }
}

// Mostrar vista previa de importación
function mostrarVistaPrevia(data, nombreArchivo) {
    importDataPreview = data;
    
    const container = document.getElementById('preview-importacion-container');
    container.innerHTML = `
        <div class="preview-header">
            <h3>Vista Previa: ${nombreArchivo}</h3>
            <p>Se encontraron ${data.length} registros para importar</p>
        </div>
        <div class="preview-table-container">
            <table class="preview-table">
                <thead>
                    <tr>
                        <th>Aliado</th>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.slice(0, 10).map(item => `
                        <tr>
                            <td>${item.Aliado || item.aliado || '-'}</td>
                            <td>${item.Código || item.Codigo || item.codigo || '-'}</td>
                            <td>${item.Descripción || item.Descripcion || item.descripcion || '-'}</td>
                            <td>${item.Vencimiento || item.vencimiento || '-'}</td>
                            <td>${item.Estado || item.estado || 'activo'}</td>
                        </tr>
                    `).join('')}
                    ${data.length > 10 ? `
                        <tr>
                            <td colspan="5" class="text-center">
                                <em>... y ${data.length - 10} registros más</em>
                            </td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('modal-preview-importacion').classList.add('activo');
}

// Confirmar importación
function confirmarImportacion() {
    if (!importDataPreview) return;
    
    try {
        let importados = 0;
        
        importDataPreview.forEach(item => {
            const cuponExterno = {
                id: `externo_${Date.now()}_${importados}`,
                aliado: item.Aliado || item.aliado || 'Sin nombre',
                codigo: item.Código || item.Codigo || item.codigo || `IMP-${Date.now()}`,
                descripcion: item.Descripción || item.Descripcion || item.descripcion || 'Sin descripción',
                vencimiento: item.Vencimiento || item.vencimiento || new Date().toISOString().split('T')[0],
                estado: item.Estado || item.estado || 'activo',
                origen: `importacion_${new Date().toISOString().split('T')[0]}`,
                fechaImportacion: new Date().toISOString()
            };
            
            db.cuponesExternos.push(cuponExterno);
            importados++;
        });
        
        saveDB();
        cargarCuponesExternos();
        cerrarModalPreviewImportacion();
        
        mostrarNotificacion(`${importados} cupones importados correctamente`, 'success');
        
    } catch (error) {
        console.error('Error confirmando importación:', error);
        mostrarNotificacion('Error al importar los datos', 'error');
    }
}

// Cerrar modal de vista previa de importación
function cerrarModalPreviewImportacion() {
    document.getElementById('modal-preview-importacion').classList.remove('activo');
    importDataPreview = null;
}

// Exportar cupones a Excel
async function exportarCuponesExcel() {
    try {
        const XLSX = await cargarLibreriaXLSX();
        
        const datosExportar = (db.cupones || []).map(cupon => {
            const aliado = db.aliados.find(a => a.id === cupon.aliadoId);
            return {
                'Aliado': aliado ? aliado.nombre : 'Sin aliado',
                'Código': cupon.codigo,
                'Descripción': cupon.descripcion,
                'Vencimiento': cupon.vencimiento,
                'Estado': cupon.estado,
                'Cliente': cupon.cliente || '',
                'WhatsApp': cupon.clienteWhatsapp || '',
                'Fecha Creación': cupon.fechaCreacion ? 
                    new Date(cupon.fechaCreacion).toLocaleDateString('es-ES') : '',
                'Fecha Redención': cupon.fechaRedencion ? 
                    new Date(cupon.fechaRedencion).toLocaleDateString('es-ES') : ''
            };
        });
        
        const ws = XLSX.utils.json_to_sheet(datosExportar);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Cupones");
        
        const fecha = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `cupones_${fecha}.xlsx`);
        
        mostrarNotificacion('Cupones exportados correctamente', 'success');
        
    } catch (error) {
        console.error('Error exportando:', error);
        mostrarNotificacion('Error al exportar los datos', 'error');
    }
}

// Exportar clientes a Excel
async function exportarClientesExcel() {
    try {
        const XLSX = await cargarLibreriaXLSX();
        
        const datosExportar = (db.clientes || []).map(cliente => ({
            'Cliente': cliente.nombre,
            'WhatsApp': cliente.whatsapp,
            'Aliado': cliente.aliado,
            'Código Cupón': cliente.codigo,
            'Fecha Redención': formatearFecha(cliente.fecha)
        }));
        
        const ws = XLSX.utils.json_to_sheet(datosExportar);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Clientes");
        
        const fecha = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `clientes_${fecha}.xlsx`);
        
        mostrarNotificacion('Clientes exportados correctamente', 'success');
        
    } catch (error) {
        console.error('Error exportando:', error);
        mostrarNotificacion('Error al exportar los datos', 'error');
    }
}

// Exportar cupones externos a Excel
async function exportarCuponesExternosExcel() {
    try {
        const XLSX = await cargarLibreriaXLSX();
        
        const datosExportar = (db.cuponesExternos || []).map(cupon => ({
            'Aliado': cupon.aliado,
            'Código': cupon.codigo,
            'Descripción': cupon.descripcion,
            'Vencimiento': cupon.vencimiento,
            'Estado': cupon.estado,
            'Origen': cupon.origen || 'Manual',
            'Fecha Importación': cupon.fechaImportacion ? 
                new Date(cupon.fechaImportacion).toLocaleDateString('es-ES') : ''
        }));
        
        const ws = XLSX.utils.json_to_sheet(datosExportar);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Cupones Externos");
        
        const fecha = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `cupones_externos_${fecha}.xlsx`);
        
        mostrarNotificacion('Cupones externos exportados correctamente', 'success');
        
    } catch (error) {
        console.error('Error exportando:', error);
        mostrarNotificación('Error al exportar los datos', 'error');
    }
}

/* ===========================
   CONFIGURACIÓN
   =========================== */

// Guardar configuración
async function guardarConfiguracion(event) {
    event.preventDefault();
    
    const form = event.target;
    
    try {
        // Mostrar loading en el botón
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        // Obtener valores directamente de los inputs por ID
        const nombre = document.getElementById('config-nombre').value.trim();
        const direccion = document.getElementById('config-direccion').value.trim();
        const telefono = document.getElementById('config-telefono').value.trim();
        const instagram = document.getElementById('config-instagram').value.trim();
        
        // Procesar logo si se subió uno nuevo
        let logoBase64 = db.usuario.logo || '';
        const logoFile = document.getElementById('config-logo').files[0];
        if (logoFile && logoFile.size > 0) {
            logoBase64 = await convertirImagenABase64(logoFile);
        }
        
        // Actualizar datos del usuario
        db.usuario = {
            ...db.usuario,
            nombre: nombre || 'Mi Empresa',
            direccion: direccion,
            telefono: telefono,
            instagram: instagram,
            logo: logoBase64,
            fechaModificacion: new Date().toISOString()
        };
        
        // Si es la primera vez, marcar como configurado
        if (appState.isFirstTime) {
            appState.isFirstTime = false;
            appState.usuario = db.usuario;
        }
        
        // Guardar en DB con respaldo
        saveDB(false, true); // Sin notificación aquí, con respaldo
        
        // Actualizar interfaz
        actualizarNavbarUsuario();
        cargarConfiguracionInicial();
        
        mostrarNotificacion('✅ Configuración guardada correctamente y respaldada', 'success');
        
    } catch (error) {
        console.error('Error guardando configuración:', error);
        mostrarNotificacion('❌ Error al guardar la configuración', 'error');
    } finally {
        // Remover loading
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
    }
}

/* ===========================
   BACKUP Y RESTAURACIÓN
   =========================== */

// Crear backup completo
function crearBackup() {
    try {
        const backup = {
            fecha: new Date().toISOString(),
            usuario: db.usuario.nombre || 'Usuario',
            datos: db,
            version: '2.0.0'
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aliados_com_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        mostrarNotificacion('Backup creado correctamente', 'success');
        
    } catch (error) {
        console.error('Error creando backup:', error);
        mostrarNotificacion('Error al crear el backup', 'error');
    }
}

// Restaurar desde backup
function restaurarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (!backup.datos) {
                throw new Error('Archivo de backup inválido');
            }
            
            if (confirm(`¿Restaurar backup del ${formatearFecha(backup.fecha)}?\n\n⚠️ Se perderán todos los datos actuales.`)) {
                // Restaurar datos
                db = verificarIntegridadDatos(backup.datos);
                appState.usuario = db.usuario;
                
                localStorage.setItem('aliados_com_db', JSON.stringify(db));
                
                // Recargar página para aplicar cambios
                location.reload();
            }
            
        } catch (error) {
            console.error('Error restaurando backup:', error);
            mostrarNotificacion('Error en archivo de backup: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Limpiar input
    event.target.value = '';
}

/* ===========================
   UTILIDADES Y LIBRERÍAS
   =========================== */

// Cargar librería html2canvas dinámicamente
async function cargarLibreriaCanvas() {
    if (window.html2canvas) {
        return window.html2canvas;
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = window.HTML2CANVAS_CDN;
        script.onload = () => resolve(window.html2canvas);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Cargar librería XLSX dinámicamente
async function cargarLibreriaXLSX() {
    if (window.XLSX) {
        return window.XLSX;
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = window.XLSX_CDN;
        script.onload = () => resolve(window.XLSX);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/* ===========================
   CUPONES POR ALIADO
   =========================== */

// Mostrar cupones específicos de un aliado
function mostrarCuponesAliado(aliadoId) {
    const aliado = db.aliados.find(a => a.id === aliadoId);
    if (!aliado) return;
    
    const cupones = db.cupones.filter(c => c.aliadoId === aliadoId);
    
    document.getElementById('titulo-cupones-aliado').textContent = 
        `Cupones de ${aliado.nombre} (${cupones.length})`;
    
    renderizarTablaCuponesPorAliado(cupones);
    
    document.getElementById('panel-cupones-aliado').style.display = 'block';
    
    // Scroll suave al panel
    document.getElementById('panel-cupones-aliado').scrollIntoView({
        behavior: 'smooth'
    });
}

// Renderizar tabla de cupones por aliado
function renderizarTablaCuponesPorAliado(cupones) {
    const tbody = document.querySelector('#tabla-cupones-aliado tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    cupones.forEach(cupon => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><code>${cupon.codigo}</code></td>
            <td>${cupon.descripcion}</td>
            <td>${formatearFecha(cupon.vencimiento)}</td>
            <td><span class="estado-${cupon.estado}">${cupon.estado.toUpperCase()}</span></td>
            <td>${cupon.cliente || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="previsualizarCupon('${cupon.id}')" title="Vista previa">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="generarCuponPNG('${cupon.id}')" title="Descargar PNG">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                    ${cupon.estado === 'activo' ? 
                        `<button class="btn btn-warning btn-sm" onclick="abrirModalRedimir('${cupon.id}')" title="Redimir">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"/>
                            </svg>
                        </button>` : ''
                    }
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Ocultar panel de cupones por aliado
function ocultarCuponesAliado() {
    document.getElementById('panel-cupones-aliado').style.display = 'none';
}

/* ===========================
   MENÚ DE USUARIO
   =========================== */

// Mostrar menú de usuario
function mostrarMenuUsuario() {
    // Por ahora, mostrar sección de configuración
    mostrarSeccion('configuracion');
}

/* ===========================
   ESTILOS CSS ADICIONALES PARA NOTIFICACIONES
   =========================== */

// Agregar estilos para notificaciones dinámicamente
function agregarEstilosNotificaciones() {
    if (document.getElementById('notificaciones-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'notificaciones-styles';
    styles.textContent = `
        .notificacion {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-blanco);
            border-radius: var(--border-radius);
            box-shadow: var(--sombra-lg);
            border-left: 4px solid var(--color-azul-principal);
            z-index: 10000;
            min-width: 300px;
            max-width: 500px;
            transform: translateX(100%);
            transition: var(--transicion);
            opacity: 0;
        }
        
        .notificacion.mostrar {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notificacion-success {
            border-left-color: var(--color-verde);
        }
        
        .notificacion-error {
            border-left-color: var(--color-rojo);
        }
        
        .notificacion-warning {
            border-left-color: var(--color-amarillo);
        }
        
        .notificacion-info {
            border-left-color: var(--color-info);
        }
        
        .notificacion-contenido {
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        
        .notificacion-contenido span {
            flex: 1;
            font-weight: 500;
            color: var(--color-negro);
        }
        
        .notificacion-cerrar {
            background: none;
            border: none;
            padding: 0.25rem;
            cursor: pointer;
            border-radius: var(--border-radius);
            color: var(--color-gris);
            transition: var(--transicion);
        }
        
        .notificacion-cerrar:hover {
            background: var(--color-gris-claro);
            color: var(--color-negro);
        }
        
        .notificacion-cerrar svg {
            width: 16px;
            height: 16px;
        }
        
        .preview-table-container {
            max-height: 400px;
            overflow-y: auto;
            margin-top: 1rem;
        }
        
        .preview-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
        }
        
        .preview-table th,
        .preview-table td {
            padding: 0.5rem;
            text-align: left;
            border-bottom: 1px solid var(--color-gris-medio);
        }
        
        .preview-table th {
            background: var(--color-gris-claro);
            font-weight: 600;
            position: sticky;
            top: 0;
        }
        
        .preview-header {
            text-align: center;
            margin-bottom: 1rem;
        }
        
        .preview-header h3 {
            margin: 0 0 0.5rem 0;
            color: var(--color-azul-principal);
        }
        
        .preview-header p {
            margin: 0;
            color: var(--color-gris);
        }
        
        .badge {
            background: var(--color-azul-muy-claro);
            color: var(--color-azul-principal);
            padding: 0.25rem 0.5rem;
            border-radius: var(--border-radius);
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .count-badge {
            background: var(--color-azul-principal);
            color: var(--color-blanco);
            padding: 0.25rem 0.5rem;
            border-radius: 50%;
            font-size: 0.75rem;
            font-weight: 600;
            min-width: 1.5rem;
            text-align: center;
        }
        
        .action-buttons {
            display: flex;
            gap: 0.25rem;
            align-items: center;
        }
        
        .btn-sm {
            padding: 0.375rem 0.5rem;
            font-size: 0.75rem;
        }
        
        .btn-sm svg {
            width: 14px;
            height: 14px;
        }
    `;
    
    document.head.appendChild(styles);
}

/* ===========================
   INICIALIZACIÓN FINAL
   =========================== */

// Agregar estilos cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    agregarEstilosNotificaciones();
});

/* ===========================
   DEBUG Y DEVELOPMENT
   =========================== */

// Funciones de debug para desarrollo
window.debugAliados = {
    verDB: () => console.log('DB completa:', db),
    verEstado: () => console.log('Estado app:', appState),
    verUsuario: () => console.log('Usuario actual:', db.usuario),
    verificarGuardado: () => {
        const stored = localStorage.getItem('aliados_com_db');
        if (stored) {
            const parsedData = JSON.parse(stored);
            console.log('✅ Datos en localStorage:', parsedData.usuario);
            return true;
        } else {
            console.log('❌ No hay datos en localStorage');
            return false;
        }
    },
    verRespaldos: () => {
        const respaldos = Object.keys(sessionStorage).filter(key => key.startsWith('aliados_com_backup_'));
        console.log('📦 Respaldos disponibles:', respaldos.length);
        respaldos.forEach(key => {
            const timestamp = key.replace('aliados_com_backup_', '');
            const fecha = new Date(parseInt(timestamp)).toLocaleString();
            console.log(`- ${key}: ${fecha}`);
        });
    },
    forzarGuardado: () => {
        const success = saveDB(true, true);
        console.log(success ? '✅ Guardado forzado exitoso' : '❌ Error en guardado forzado');
        return success;
    },
    limpiarDB: () => {
        if (confirm('¿Limpiar toda la base de datos? Esto eliminará todos los datos y respaldos.')) {
            // Limpiar localStorage principal
            localStorage.removeItem('aliados_com_db');
            
            // Limpiar respaldos de sessionStorage
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('aliados_com_backup_')) {
                    sessionStorage.removeItem(key);
                }
            });
            
            // Limpiar respaldos de IndexedDB
            try {
                const deleteRequest = indexedDB.deleteDatabase('aliados_com_backup');
                deleteRequest.onsuccess = () => console.log('Respaldos de IndexedDB eliminados');
            } catch (error) {
                console.log('Error eliminando respaldos de IndexedDB:', error);
            }
            
            console.log('🧹 Todos los datos y respaldos han sido eliminados');
            location.reload();
        }
    },
    exportarDB: () => {
        const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'debug_db.json';
        a.click();
        URL.revokeObjectURL(url);
    }
};

console.log('🎯 aliados_com v2.0 cargado completamente');
console.log('💡 Usa window.debugAliados para funciones de debug');
console.log('🔧 Funciones disponibles: verDB(), verEstado(), verUsuario(), verificarGuardado(), verRespaldos(), forzarGuardado(), limpiarDB(), exportarDB()');

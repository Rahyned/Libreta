# Checklist Pre-Lanzamiento Aplicación Desktop

> Documento base para validar que una aplicación de escritorio esté lista para distribución. Adapta según stack tecnológico (PyQt5, Electron, .NET, etc.).

---

## ✅ Configuración Base y Setup

- [ ] **Estructura del proyecto**: Carpetas organizadas (`src/`, `tests/`, `assets/`, `docs/`)
- [ ] **Versionado semántico**: Versión definida (v1.0.0), actualizada en código
- [ ] **Git repository**: Código versionado, `.gitignore` completo
- [ ] **Dependencias documentadas**: `requirements.txt`, `package.json`, `Pipfile`, etc.
- [ ] **Python/runtime version**: Especificada (ej: Python 3.10+, Node 18+)
- [ ] **Virtual environment**: Proyecto aislado (venv, conda, pipenv)
- [ ] **Build system**: Sistema de construcción definido (setuptools, PyInstaller, electron-builder, etc.)
- [ ] **Configuración centralizada**: Settings en archivo config (JSON, YAML, .ini) no hardcodeado
- [ ] **Logging configurado**: Sistema de logs con nivel de verbosidad configurable

---

## 🎨 UI/UX y Diseño

- [ ] **Estilo visual consistente**: Colores, tipografía, espaciado uniforme
- [ ] **Tema claro/oscuro**: Soporte de ambos (respeta preferencia del SO)
- [ ] **Responsive layout**: Ventana redimensionable sin romper UI
- [ ] **Icono de aplicación**: 256x256px mínimo, en múltiples formatos (.ico, .png, .icns)
- [ ] **Idioma/Localización**: Interfaz traducible, strings en archivo externo
- [ ] **Dark mode support**: Si el SO está en dark, app respeta ese setting
- [ ] **Ventana principal**: Tamaño mínimo definido, no se rompe con ventanas pequeñas
- [ ] **Dialogs y modals**: Centrados, con botones claros (OK, Cancel, etc.)
- [ ] **Loading states**: Spinners o progress bars durante operaciones largas
- [ ] **Tooltips**: Información contextual en botones no obvios
- [ ] **Atajos de teclado**: Ctrl+S (Save), Ctrl+Q (Quit), etc., listados en Help
- [ ] **Menú principal**: File, Edit, View, Help con opciones comunes

---

## 💾 Datos y Persistencia

- [ ] **Base de datos local**: SQLite o equivalente, no en memoria
- [ ] **Ruta de datos**: Guardados en ubicación estándar del SO (AppData/Library/XDG_DATA_HOME)
- [ ] **Creación automática de DB**: Si no existe, se crea en primer run
- [ ] **Migraciones de schema**: Versionadas, se ejecutan al actualizar app
- [ ] **Backup automático**: Opción de backup con un click, ubicación clara
- [ ] **Restore from backup**: Poder restaurar datos desde backup anterior
- [ ] **Export de datos**: CSV, JSON, o formato estándar, sin lock-in
- [ ] **Eliminación segura**: Datos borrados permanentemente, no solo "marcados"
- [ ] **Encriptación**: Si maneja datos sensibles, encriptación en BD (opcional pero recomendado)

---

## 📦 Instalación y Distribución

- [ ] **Instalador/Distribuible**: `.exe` (Windows), `.dmg`/`.pkg` (macOS), `.deb`/`.AppImage` (Linux)
- [ ] **No requiere dependencias externas**: O las incluye en el instalador
- [ ] **Sin admin requerido**: Si posible (instalar en user folder, no Program Files)
- [ ] **Instalación silenciosa**: Parámetro `/S` o `--silent` si aplica
- [ ] **Desinstalador funcional**: Remueve app y registros del SO
- [ ] **Registro de Windows**: Si es .exe, entradas limpias en regedit
- [ ] **Acceso directo**: Desktop shortcut creado automáticamente (Windows)
- [ ] **Menú Inicio**: App listada en menú principal (Windows, Linux)
- [ ] **Dock integration**: macOS, si aplica, icono en dock
- [ ] **Tamaño razonable**: No > 200MB si es posible (sin assets gigantes)
- [ ] **Checksums**: SHA-256 o similar para verificar integridad del download

---

## 🔄 Actualizaciones Automáticas

- [ ] **Verificación de updates**: Chequea versión nueva al iniciar o manualmente
- [ ] **Servidor de updates**: Endpoint que devuelve última versión disponible
- [ ] **Descarga de update**: Download automático en background (no bloquea UI)
- [ ] **Delta updates**: Si aplica, descarga solo cambios (no app completa)
- [ ] **Notificación de update**: Usuario notificado, puede elegir cuándo actualizar
- [ ] **Instalación de update**: Automática con reinicio, o preguntar a usuario
- [ ] **Rollback**: Si update falla, revierte a versión anterior
- [ ] **Release notes**: Mostrados al actualizar, qué cambió en versión nueva
- [ ] **Política de actualización**: Notificar updares críticas inmediatamente, otras no tan urgentes

---

## 🔒 Seguridad

- [ ] **Código no ofuscado innecesariamente**: Si es Python/JavaScript, usuarios pueden leer código (aceptar o encriptar)
- [ ] **Dependencias auditadas**: `pip audit`, `npm audit` sin vulnerabilidades críticas
- [ ] **No hardcodear secretos**: API keys, contraseñas en config file o env variables
- [ ] **Credential storage**: Usar credential manager del SO (Keychain, Credential Manager, SecretService)
- [ ] **Validación de input**: Sanitizar todos los inputs de usuario
- [ ] **SQL Injection**: Queries parametrizadas, no concatenar strings
- [ ] **File permissions**: Archivos creados con permisos apropiados (no world-readable si sensible)
- [ ] **Temporal files**: Archivos temp limpios al cerrar app
- [ ] **No dejar logs sensibles**: Passwords, tokens no en logs
- [ ] **Code signing**: Binarios firmados si distribución requiere (macOS, Windows)

---

## ⚡ Rendimiento y Optimización

- [ ] **Inicio rápido**: Tiempo de launch < 3 segundos (o especificar si más)
- [ ] **Memoria razonable**: No > 300MB en idle (variar según complejidad)
- [ ] **CPU bajo idle**: No usa CPU innecesariamente cuando no hace nada
- [ ] **Sin memory leaks**: Monitorear con Valgrind, PerfView, Instruments
- [ ] **Operaciones largas async**: No bloquean UI (threading, async/await)
- [ ] **Acceso a BD optimizado**: Queries eficientes, índices en columnas usadas
- [ ] **Caché de datos**: No recargar datos innecesariamente
- [ ] **Gráficos optimizados**: No redrawear UI cada frame si no cambió

---

## 🧪 Testing

- [ ] **Unit tests**: Lógica crítica cubierta (>70% si posible)
- [ ] **Integration tests**: Flujos end-to-end testeados
- [ ] **UI tests**: Si framework lo soporta (PyQt tiene QtTest, etc.)
- [ ] **Test data**: Fixtures con datos de prueba realistas
- [ ] **Test en diferentes resoluciones**: 1024x768, 1920x1080, 2560x1440
- [ ] **Test en diferentes DPI**: 96 DPI (Windows), 110 DPI (Linux), 125% scaling (Windows)
- [ ] **Windows 10/11**: Probado en ambas versiones
- [ ] **macOS**: Probado en últimas 2 versiones (Intel + Apple Silicon si aplica)
- [ ] **Linux**: Ubuntu, Fedora, Debian (las distribuciones más usadas)
- [ ] **Acceso a red**: Comportamiento sin internet/conexión lenta
- [ ] **Manejo de errores**: Crash no sucede, error message útil
- [ ] **Concurrent operations**: Dos usuarios/instancias abren archivo simultáneamente (si aplica)

---

## 🖥️ Compatibilidad y Sistemas Operativos

- [ ] **Windows**:
  - [ ] Ejecutable de 32 bits y 64 bits disponible
  - [ ] Visual C++ Redistributable incluido o indicado
  - [ ] UNC paths soportados (\\server\share)
- [ ] **macOS**:
  - [ ] Notarización de Apple completada (si > macOS 10.15)
  - [ ] Permisos requeridos explícitos (Accessibility, Disk Access si necesita)
  - [ ] Intel + Apple Silicon support (universal binary)
- [ ] **Linux**:
  - [ ] Appimage o .deb packages
  - [ ] Dependencias (GTK, Qt libraries) listadas
  - [ ] XDG Base Directory Specification seguida

---

## 📂 Acceso a Archivo System

- [ ] **Open file dialog**: Funciona correctamente, memoriza último directorio
- [ ] **Save file dialog**: Sugiere nombre, extensión correcta
- [ ] **Recientes**: Lista archivos abiertos recientemente (File > Recent)
- [ ] **Arrastrar y soltar**: Archivos soportados se pueden drop en ventana
- [ ] **Permisos**: App solo accede archivos autorizados (no lee todo el disco)
- [ ] **Rutas relativas/absolutas**: Soporta ambas si aplica
- [ ] **Carácteres especiales**: Nombres con acentos, emojis, espacios funcionan
- [ ] **Paths largos**: Windows tiene límite 260 caracteres, testeado

---

## 🔗 Integración con Sistema Operativo

- [ ] **File associations**: `.myformat` abre con tu app (opcional)
- [ ] **Context menu**: Click derecho en archivo abre con tu app (opcional)
- [ ] **Notification tray**: App puede minimizarse a system tray (Windows/Linux)
- [ ] **Auto-start**: Opción en Settings para iniciar con el SO (si aplica)
- [ ] **Desktop environment**: Funciona en KDE, GNOME, XFCE (Linux)
- [ ] **DPI scaling**: Respeta preferencias de zoom del SO
- [ ] **High contrast mode**: Visible si usuario activa modo alto contraste
- [ ] **Screen reader compatible**: Si aplica accesibilidad

---

## 🔐 Permisos y Privacidad

- [ ] **Permisos explícitos**: Si accede webcam, micrófono, etc., pedir permiso
- [ ] **Privacy settings**: Qué datos recolecta, privacidad clara
- [ ] **Telemetría**: Si envía datos a servidor, opt-in explícito, transparencia
- [ ] **No rastrear datos innecesarios**: Solo lo necesario para funcionamiento
- [ ] **GDPR compliance**: Si en EU, derecho a exportar/borrar datos

---

## 📋 Documentación

- [ ] **README**: Instrucciones de instalación, requisitos del sistema
- [ ] **User manual**: Guía de cómo usar la aplicación, screenshots
- [ ] **FAQ**: Preguntas frecuentes, troubleshooting
- [ ] **Changelog**: Historia de cambios, qué es nuevo en cada versión
- [ ] **Code documentation**: Docstrings en funciones principales (si proyecto >= mediano)
- [ ] **Video tutorial**: Opcional pero útil, demo de features principales
- [ ] **Troubleshooting**: Cómo resolver problemas comunes (app no abre, datos no guardan, etc.)
- [ ] **Licencia**: Archivo LICENSE en repo (MIT, GPL, Apache, etc.)

---

## 🚀 Distribución y Release

- [ ] **Hosting de descargas**: GitHub Releases, SourceForge, S3, o similar
- [ ] **Versiones anteriores disponibles**: Users pueden descargar versión anterior si última tiene bug
- [ ] **Release notes**: Publicados con cada versión
- [ ] **Checksum publicado**: SHA-256 para verificar integridad
- [ ] **Firma de código**: Binarios firmados (optional pero recomendado)
- [ ] **Página de descargas**: Landing con instrucciones de instalación claras
- [ ] **Anuncio de release**: Email, redes sociales, changelog anunciado

---

## 🐛 Debugging y Logs

- [ ] **Archivo de log**: Escribe logs en ubicación estándar (AppData/Logs, ~/.local/share/app/logs)
- [ ] **Niveles de log**: DEBUG, INFO, WARNING, ERROR configurables
- [ ] **Rotación de logs**: No crece indefinidamente, old logs archivados
- [ ] **Información útil en logs**: Timestamps, nivel, archivo/línea, mensaje
- [ ] **Acceso a logs**: User puede acceder fácilmente (File > Open logs, o panel en app)
- [ ] **Crash dump**: Si app crashea, guarda stack trace para debugging
- [ ] **Modo verbose**: Flag `--verbose` o env var para más detalles en logs

---

## 🖨️ Impresión (si aplica)

- [ ] **Preview de impresión**: Ver cómo se verá antes de imprimir
- [ ] **Márgenes configurables**: User controla márgenes, tamaño papel
- [ ] **Múltiples páginas**: Si documento largo, paginación correcta
- [ ] **Escala**: Fit to page, ajustar zoom de impresión
- [ ] **Testeado en múltiples impresoras**: No asumir una sola

---

## 🌐 Si tiene conexión a servidor

- [ ] **Conexión segura**: HTTPS, validación de certificado
- [ ] **Autenticación**: Login seguro, token en app
- [ ] **Sincronización**: Datos locales sincronizados con servidor (si aplica)
- [ ] **Modo offline**: Funciona sin internet (si soporta offline mode)
- [ ] **Retry logic**: Reintenta si servidor no responde
- [ ] **Timeout**: Requests tienen timeout, no se cuelga indefinidamente
- [ ] **Caché local**: Si desconectado, datos disponibles localmente

---

## 👥 Soporte y Comunidad

- [ ] **Email de soporte**: Dirección clara para reportar bugs/preguntas
- [ ] **Issue tracker**: GitHub Issues o similar, users pueden reportar bugs
- [ ] **Forum/Community**: Discord, subreddit, forum si aplica
- [ ] **Bug report template**: Guía para reportar bugs clara (versión, SO, pasos para reproducir)

---

## ✨ Antes de Release (48h)

- [ ] **Testing en máquina virgin**: Desinstalar app, instalar desde distribuible, probar flujo completo
- [ ] **Testing con datos reales**: Usar datos como usuario lo haría
- [ ] **Antivirus check**: Verificar que distribuible no es flaggeado como malware
- [ ] **Team review**: Alguien más probó la app antes de lanzar
- [ ] **README final**: Instrucciones claras, no dan por sentado conocimiento técnico
- [ ] **Backup de fuentes**: Before push a release, source code backed up
- [ ] **Announcement preparado**: Email, tweet, post en foro preparado
- [ ] **Recovery plan**: Cómo contactar users si bug crítico encontrado

---

## 📈 Post-Release Monitoring

- [ ] **Download counter**: Rastrear cuántas descargas
- [ ] **Crash reports**: Configurar reporte de crashes (Sentry, Rollbar, custom)
- [ ] **User feedback**: Surveys, feedback form en app
- [ ] **Update adoption**: Rastrear cuántos actualizaron a nueva versión
- [ ] **Bug tracking**: Crear issues en tracker cuando users reportan
- [ ] **Performance metrics**: Si app envía telemetría, monitorear performance

---

**Última actualización**: Agosto 2026  
**Versión**: 1.0  
**Autor**: Lautaro (Desarrollo Desktop)
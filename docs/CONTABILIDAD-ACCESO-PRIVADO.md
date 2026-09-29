# Activar acceso de Ricky y Alex

No se han creado usuarios ni cambiado datos en tu Supabase desde esta entrega.

1. Ejecuta el archivo separado `FLOWLY-18-ACCESO-PRIVADO.sql` en el SQL Editor de TU proyecto Supabase. Conserva movimientos e historial; restringe el acceso directo a las tablas contables al backend. El último resultado debe mostrar `false` en ambos permisos públicos.
2. En Supabase → Authentication → Users, crea dos cuentas de email/contraseña (o reutiliza dos cuentas existentes), una para Ricky y otra para Alex. Usa emails reales distintos y contraseñas fuertes DISTINTAS. Confirma sus emails. No pongas contraseñas en SQL, código, variables de entorno ni mensajes. Supabase Auth almacena sus hashes y comprueba las contraseñas.
3. Copia el User UID de cada cuenta. Configura estas variables PRIVADAS en el servidor/despliegue (sin `NEXT_PUBLIC_`):

   - `ACCOUNTING_RICKY_USER_ID`: UUID de la cuenta de Ricky.
   - `ACCOUNTING_ALEX_USER_ID`: UUID diferente de la cuenta de Alex.
   - `ACCOUNTING_ORIGIN`: origen exacto HTTPS, por ejemplo `https://tu-dominio.com`, sin ruta ni barra final. En pruebas usa el origen de ese despliegue. Localmente puede omitirse.

   Se conservan `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` existentes. La segunda nunca debe ser pública.
4. Extrae el ZIP y copia su contenido sobre la raíz del repositorio conservando `app/`, `lib/` y `docs/`. Despliega los cambios juntos. No subas el ZIP como si fuera código ejecutable.
5. En Contabilidad introduce `Ricky` o `Alex` y la contraseña de SU cuenta. Se admite variación de mayúsculas del nombre, no se altera la contraseña. Comprueba cada pareja correcta y ambas parejas cruzadas, que deben fallar.

## Sesión y protección

- Se reutiliza Supabase Auth; no hay otra base de contraseñas ni contraseña general. Una sesión Auth nueva y exclusiva de Contabilidad se guarda en cookie HttpOnly, SameSite=Strict y Secure en producción. JavaScript no recibe tokens ni los almacena en LocalStorage.
- La sesión sobrevive a recargas hasta la caducidad de Supabase, con máximo de una hora desde el acceso, sin renovación automática. Después hay que volver a entrar. El servidor verifica el token con Supabase y su autorización en cada operación.
- `accounting_sessions` guarda únicamente el hash del token y permite revocación inmediata del acceso contable al cerrar sesión. El cierre solo revoca esa sesión, no las demás sesiones de Flowly.
- Para revocar todas las sesiones contables de una persona: `delete from public.accounting_sessions where user_id = 'UUID_REAL';`. Cambiar su contraseña no reemplaza este paso para la revocación inmediata. Para quitar su autorización, cambia su variable de UID y redespliega.
- Control persistente de 10 intentos por nombre cada 15 minutos, compartido entre servidores. Incluye intentos correctos. No amplía el bloqueo al seguir intentando. Complementa con límites del proveedor/WAF si el sitio recibe ataques; un atacante que conozca el nombre puede agotar temporalmente esos intentos.
- Limpieza periódica opcional: `delete from public.accounting_sessions where expires_at < now();` (solo elimina sesiones caducadas, nunca movimientos).
- El registro existente de Comparación muestra origen `Contabilidad mensual · Alex/Ricky`, UUID, fecha/hora y valores anteriores/nuevos para nuevas operaciones. No atribuye retrospectivamente movimientos antiguos ni inventa autores de operaciones externas.
- Un administrador con SQL o service_role sigue teniendo poder sobre la base de datos. Este cambio no puede convertir su auditoría en inalterable frente al propietario.
- Retira cualquier publicación anterior de la contraseña compartida y cámbiala donde se hubiera reutilizado. No vuelve a ser válida para estas API.

## Comprobación antes de usar en producción

Tras instalar el SQL/configurar cuentas: comprobar login, recarga, logout en dos pestañas, denegación de API sin cookie, acceso con contraseña del otro usuario, caducidad y altas/ediciones/borrados/traspasos con el autor correcto en Comparación. Comprobar que otro usuario Supabase no obtiene acceso a estas tablas. No se han modificado fórmulas, saldos, filtros ni lógica financiera.

Validación de esta entrega: TypeScript y build de producción correctos; pruebas automatizadas de las rutas con Supabase simulado; SQL ejecutado dos veces en PostgreSQL local de prueba, comprobando permisos, limitación de intentos y auditoría. No se ha probado un inicio de sesión contra tus cuentas reales ni el despliegue en tu navegador. Las cuentas y variables anteriores deben configurarse antes de poder entrar.

Documentación de referencia: https://supabase.com/docs/reference/javascript/auth-signinwithpassword y https://supabase.com/docs/reference/javascript/auth-getuser.

# Acceso simplificado: Alex / Ricky y contraseña común

Esta actualización sustituye el acceso individual por el selector solicitado. No necesitas crear cuentas de Alex/Ricky en Supabase ni configurar sus UID.

## Instalación

1. Ejecuta UNA VEZ el archivo separado `FLOWLY-20-ACCESO-COMUN.sql` en el SQL Editor del proyecto Supabase de Flowly. Es reejecutable; no borra ni modifica movimientos, importes ni históricos. Crea el almacenamiento de sesiones compartidas y adapta el origen de las nuevas anotaciones de auditoría.
2. Extrae el ZIP y copia sus archivos sobre el repositorio conservando las rutas. Despliega el cambio.
3. En Contabilidad selecciona Alex o Ricky y escribe la contraseña común que se usaba antes del acceso individual. La contraseña no ha cambiado.

No hacen falta nuevas variables. Se reutilizan `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, que ya utiliza Contabilidad. Las variables `ACCOUNTING_ALEX_USER_ID` y `ACCOUNTING_RICKY_USER_ID` dejan de usarse. `ACCOUNTING_ORIGIN` sigue siendo opcional; si ya está configurada debe coincidir con el dominio de la aplicación, sin barra final.

## Qué significa el nombre

Alex/Ricky es un nombre elegido por quien conoce la contraseña compartida, NO una identidad verificada. Cualquiera que la conozca puede elegir cualquiera de los dos nombres. La interfaz y las nuevas entradas de Comparación lo indican. No se asignan UUID de personas ni se inventan autores para el historial anterior.

## Sesión y seguridad

La contraseña se verifica en el servidor contra un hash scrypt con salt. No se incluye en texto plano en estos archivos ni en el navegador. A petición del propietario se mantiene la contraseña antigua, aunque estuvo expuesta en versiones anteriores: este cambio no elimina esa exposición histórica.

La sesión usa un token aleatorio en cookie HttpOnly/Secure en producción, dura una hora y se comprueba en el servidor en cada operación. Al cerrar sesión se revoca en la base de datos. La contraseña y el token no se guardan en LocalStorage. Las sesiones individuales antiguas no sirven para este acceso.

Hay un límite compartido de 10 intentos de acceso por 15 minutos (incluye accesos correctos). Alternar Alex/Ricky no permite eludirlo. No se modifican cuentas personales de Supabase ni otras sesiones de Flowly.

Las reglas contables, Caja Extra, filtros, informes, importes y arrastres permanecen sin cambios. La auditoría identifica expresamente el nombre seleccionado, no garantiza quién estaba físicamente detrás de la sesión. Un administrador de base de datos conserva sus privilegios sobre los registros.

No vuelvas a ejecutar el SQL antiguo de acceso individual después del SQL de esta entrega, pues reemplazaría la función de auditoría adaptada.

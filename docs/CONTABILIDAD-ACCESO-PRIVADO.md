# Contabilidad: acceso con la cuenta administrativa de Flowly

Se retira la contraseña común y el selector Alex/Ricky. La contabilidad NO es pública: requiere una identidad validada por Supabase Auth y un perfil `user_profiles.account_type = 'admin'`, consultado en el servidor en cada petición. No se utiliza `user_metadata` para autorizar.

## Entrada

1. Abre `/contabilidad`. Si ya hay una sesión administrativa válida, entra directamente.
2. En caso contrario, pulsa **Entrar con mi cuenta de Flowly**. El acceso normal `/login?next=/contabilidad` valida tu cuenta y vuelve a Contabilidad.
3. La contraseña antigua de la contabilidad no es la contraseña de la cuenta de Flowly y ya no se comprueba.

No se crean cuentas ni se cambian permisos de personas. Si la cuenta no está registrada como administradora, el acceso queda denegado; el propietario debe revisar ese perfil en su Supabase. No se asigna automáticamente un administrador a partir de un correo o del nombre Alex/Ricky.

## Sesión

Se reutilizan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`. No hay nuevas contraseñas, claves ni migraciones para este cambio de acceso. `ACCOUNTING_ORIGIN`, si existe, debe coincidir con el dominio de la web, sin barra final.

El token de acceso de una cuenta administrativa verificada se conserva en una cookie HttpOnly, SameSite=Strict y Secure en producción, con caducidad no superior a una hora ni a la del propio token. Se vuelve a validar con `auth.getUser(token)` y se consulta de nuevo el perfil de administrador en cada operación. La cookie permite recargar sin depender de que el cliente general (que almacena la sesión en memoria) siga vivo. Al caducar hay que volver a iniciar sesión.

Cerrar sesión elimina la cookie contable e intenta cerrar la sesión local de Supabase del navegador. No se promete la revocación inmediata de una copia externa de un JWT ya emitido; su caducidad y la comprobación actual del permiso administrativo siguen siendo necesarias. Las sesiones compartidas antiguas y las contraseñas embebidas en versiones anteriores ya no autorizan este módulo.

Las solicitudes de modificación conservan la comprobación de origen y la cabecera personalizada. Las respuestas contables no se almacenan en caché. El transporte del navegador solo permite rutas del mismo origen bajo `/api/contabilidad` y rechaza redirecciones.

## Alcance y datos

No se modifican los endpoints de movimientos/opciones/auditoría, la pantalla `ContabilidadClient`, las reglas, los filtros, los arrastres ni los cálculos de Caja Extra. No se ejecuta SQL, no se importan datos y no se altera ningún saldo. Los nuevos encabezados identifican a la cuenta verificada; este cambio no reescribe ni atribuye identidades al historial antiguo. Si la base de datos aún no tiene las tablas contables, eso debe diagnosticarse aparte del acceso.

Pruebas aisladas (dobles de Auth/PostgREST; nunca consultan producción):

```sh
node --test tests/accounting-admin-access.test.cjs
```

Además de estas pruebas, verificar la compilación de la versión de prueba y la entrada con una cuenta administrativa real antes de dar por comprobado el acceso al saldo. La existencia y el importe de la caja no se deducen del código.

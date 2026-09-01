-- Regalo de bienvenida para nuevos registros web.
-- Los clientes existentes no quedan marcados como elegibles.

alter table public.crm_clientes
  add column if not exists regalo_bienvenida_elegible boolean not null default false,
  add column if not exists regalo_bienvenida_otorgado boolean not null default false,
  add column if not exists regalo_bienvenida_fecha timestamptz null;

comment on column public.crm_clientes.regalo_bienvenida_elegible is
  'Indica que la cuenta se creó mediante el registro web y puede recibir el regalo una vez.';

comment on column public.crm_clientes.regalo_bienvenida_otorgado is
  'Bloqueo persistente para impedir que el regalo de bienvenida se conceda más de una vez.';

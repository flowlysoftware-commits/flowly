begin;

create table if not exists public.manual_accounting_audit (
  id bigint generated always as identity primary key,
  movement_id text not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  occurred_at timestamptz not null default now(),
  actor_user_id uuid null,
  database_role text not null default current_user,
  source text not null default 'Supabase / acceso directo o API externa',
  old_data jsonb null,
  new_data jsonb null
);

alter table public.manual_accounting_audit enable row level security;
revoke all on table public.manual_accounting_audit from anon, authenticated;
revoke all on sequence public.manual_accounting_audit_id_seq from anon, authenticated;
grant select, insert on table public.manual_accounting_audit to service_role;
grant usage, select on sequence public.manual_accounting_audit_id_seq to service_role;

create index if not exists manual_accounting_audit_occurred_at_idx on public.manual_accounting_audit (occurred_at desc);
create index if not exists manual_accounting_audit_movement_id_idx on public.manual_accounting_audit (movement_id);

create or replace function public.audit_manual_accounting_movement()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  row_before jsonb;
  row_after jsonb;
  affected_id text;
begin
  row_before := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end;
  row_after := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end;
  affected_id := coalesce(row_after->>'id', row_before->>'id');

  insert into public.manual_accounting_audit (
    movement_id, action, actor_user_id, database_role, source, old_data, new_data
  ) values (
    affected_id,
    tg_op,
    auth.uid(),
    current_user,
    case when auth.uid() is not null then 'Usuario autenticado' else 'Supabase / acceso directo o API externa' end,
    row_before,
    row_after
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists manual_accounting_movements_audit_trigger on public.manual_accounting_movements;
create trigger manual_accounting_movements_audit_trigger
after insert or update or delete on public.manual_accounting_movements
for each row execute function public.audit_manual_accounting_movement();

comment on table public.manual_accounting_audit is 'Historial inmutable de altas, cambios y eliminaciones de Contabilidad mensual.';
comment on column public.manual_accounting_audit.old_data is 'Copia completa anterior; conserva el cobro incluso después de eliminarlo.';

commit;

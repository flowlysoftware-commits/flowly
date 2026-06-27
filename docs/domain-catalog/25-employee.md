# Employee

Empleado con rol, equipo, disponibilidad y relación operativa.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Employee`
- Organization scoped: Sí
- Versionado: Sí
- Timeline: Sí

## Estados iniciales

```text
Draft
↓
Active
↓
Archived
```

## Relaciones habituales

- Organization
- Identity
- Event
- Document
- Collaboration

## Commands iniciales

- CreateEmployee
- UpdateEmployee
- ArchiveEmployee

## Queries iniciales

- GetEmployee
- SearchEmployee
- ListEmployees

## Events iniciales

- EmployeeCreated
- EmployeeUpdated
- EmployeeArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Employee
- Update Employee
- Archive Employee
- Analyze Employee

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.

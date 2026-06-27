# Campaign

Campaña de marketing o ventas con audiencia, canal y resultados.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Campaign`
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

- CreateCampaign
- UpdateCampaign
- ArchiveCampaign

## Queries iniciales

- GetCampaign
- SearchCampaign
- ListCampaigns

## Events iniciales

- CampaignCreated
- CampaignUpdated
- CampaignArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Campaign
- Update Campaign
- Archive Campaign
- Analyze Campaign

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.

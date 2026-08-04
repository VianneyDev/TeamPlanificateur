# Team Planning Engine

Outil de planning d’équipe : les managers administrent les effectifs ; les membres gèrent absences et (pour les externes) jours travaillés.

## Language

**Member**:
A person tracked by the planning system. Has a role (`member` or `manager`) and may be flagged as external. An active Member belongs to at least one Team; removing their last Team (or deleting/archiving that Team in a way that would orphan them) is not allowed until they are reassigned or Archived.
_Avoid_: User, account, employee (unless speaking of employment status outside this product)

**Acting Member**:
The Member currently operating the app for this session. Chosen via member selection (not login credentials) in V1.
_Avoid_: Logged-in user, current user (implies authentication)

**Manager**:
A Member with role `manager`. Administers all Teams and Members in the organisation, and may create or correct any Member's Day Offs and Monthly Worked Days. May also be an External Member.
_Avoid_: Admin (UI may say « admin » colloquially; the domain term is Manager)

**External Member**:
A Member flagged `isExternal`. Declares their own Monthly Worked Days and Day Offs (self-service); other Managers may correct. Compatible with role `manager` (a Manager External has both admin powers and their own declarations).
_Avoid_: Contractor, freelance (unless those labels become explicit product concepts later)

**Team**:
A named group of Members used for organization and filtering. Can be archived. Defines who appears on a non-manager's Team Calendar.
_Avoid_: Squad, department

**Archived**:
A soft-removed state on a Member or Team. Archived Members and Teams stay in Gestion for restore, but are excluded from the living Team Calendar, from new Day Offs and Monthly Worked Days, and from Acting Member selection.
_Avoid_: Deleted (hard delete is a separate, rarer operation — Teams can be deleted; Members are archived)

**Day Off**:
A full calendar day on which a Member is not working, with no leave category. Owned by that Member; any Manager may create or change it. Created or removed one day at a time or as a contiguous date range (range applies a homogeneous toggle: if every day in the range is already a Day Off, clear all; otherwise set all to Day Off). On the Team Calendar, visible to Members who share at least one Team with the owner (Managers see the whole organisation).
_Avoid_: Leave, vacation, PTO, half-day (demi-journée is not a Day Off in this model)

**Team Calendar**:
The annual view of Day Offs. For a non-manager, the union of Day Offs of Members in their Teams. For a Manager, Day Offs across the organisation. The Acting Member's Day Offs are primary in each cell; other Members' Day Offs appear secondary.
_Avoid_: Org calendar, global calendar (Managers see org-wide; that is still the Team Calendar surface, not a separate product concept)

**Monthly Worked Days**:
The number of days an External Member worked in a given calendar month. Only External Members have this record. Visible to that External Member and to all Managers — not to other Members. Independent of that Member's Day Offs: the two can coexist for the same month with no cross-check. Declared only for the current calendar month or past months — not for future months.
_Avoid_: Timesheet, attendance log (those imply day-by-day entries; this is a monthly count)

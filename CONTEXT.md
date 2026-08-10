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
A Member flagged `isExternal`. Declares their own Monthly Worked Days (self-service); other Managers may correct. Day Offs follow the same V2 rules as other Members (Leave Request if non-manager; Manager bypass if role is manager). Compatible with role `manager` (a Manager External has both admin powers and their own declarations).
_Avoid_: Contractor, freelance (unless those labels become explicit product concepts later)

**Team**:
A named group of Members used for organization and filtering. Can be archived. Defines who appears on a non-manager's Team Calendar.
_Avoid_: Squad, department

**Archived**:
A soft-removed state on a Member or Team. Archived Members and Teams stay in Gestion for restore, but are excluded from the living Team Calendar, from new Day Offs and Monthly Worked Days, and from Acting Member selection.
_Avoid_: Deleted (hard delete is a separate, rarer operation — Teams can be deleted; Members are archived)

**Day Off**:
A full calendar day on which a Member is not working, with no leave category. Owned by that Member. Represents an **effective** absence only: created when a Manager approves a Leave Request, or created/changed directly by any Manager (admin correction, immediate). Non-manager Members do not create Day Offs themselves; they may clear their own Day Offs freely (V2). On the Team Calendar, visible to Members who share at least one Team with the owner (Managers see the whole organisation).
_Avoid_: Leave, vacation, PTO, half-day (demi-journée is not a Day Off in this model), pending request (that is a Leave Request)

**Leave Request**:
A Member's submitted request to take one or more full calendar days off. Created by a non-manager Acting Member after confirming a selection (CTA). Awaited by any Manager, who may approve or reject the request **as a whole** (no partial dates; no reject reason in V2). Approval materializes Day Offs for all requested dates; rejection creates none. Approval must not materialize Day Offs if the requesting Member is Archived at decision time. The requesting Member may withdraw a pending Leave Request freely. Distinct from a Day Off: a pending request is not yet an effective absence. On the Team Calendar, pending requests use a distinct style and are visible only to the requesting Member and to Managers — not to other Members. Feedback is in-app only (request lists + calendar state); no email/push.
_Avoid_: Day Off, draft selection (unsubmitted UI state is not persisted as a Leave Request until the Member confirms), notification

**Team Calendar**:
The monthly view of Day Offs (navigate month by month). For a non-manager, the union of Day Offs of Members in their Teams. For a Manager, Day Offs across the organisation. The Acting Member's Day Offs are primary in each cell; other Members' Day Offs appear secondary and **nominative** (who is off is visible, not only that someone is off). Pending Leave Requests appear with a distinct style for the requester and for Managers only. Weekends (Saturday, Sunday) are shown but not selectable; range selection and day counts skip them. Leave Request / Day Off writes reject weekend dates (V2).
_Avoid_: Org calendar, global calendar (Managers see org-wide; that is still the Team Calendar surface, not a separate product concept)

**Monthly Worked Days**:
The number of days an External Member worked in a given calendar month. Only External Members have this record. Visible to that External Member and to all Managers — not to other Members. Independent of that Member's Day Offs: the two can coexist for the same month with no cross-check. Declared only for the current calendar month or past months — not for future months.
_Avoid_: Timesheet, attendance log (those imply day-by-day entries; this is a monthly count)

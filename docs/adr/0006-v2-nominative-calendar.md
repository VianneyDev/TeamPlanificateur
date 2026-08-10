# V2 nominative Team Calendar absences

Other Members' absences on the Team Calendar show who is off (name or initials + full name on hover), not only an anonymous marker.

Visibility unchanged from V1 read rules: non-managers see Day Offs of Members sharing a Team; Managers see the organisation. Pending Leave Requests stay nominative for the requester and Managers only (see ADR-0004).

Rationale: the API already returns member names; V1 UI only surfaced them in `title` / `aria-label`. Explicit names are required for a credible team-planning demo, for Managers and teammates alike.

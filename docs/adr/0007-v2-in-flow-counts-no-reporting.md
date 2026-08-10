# V2 leave counts stay in-flow; no reporting page

V2 does not ship a dedicated stats / reporting surface (no Manager récap by member/team/month as a product page).

In-flow counts that serve the leave workflow are in scope: e.g. « X jours » on the Member confirmation CTA before submitting a Leave Request, and any similarly local counters needed for that UX. Those counts use weekdays-only rules (ADR-0005) and refer to the selection or to effective Day Offs as the UI requires — not a general analytics model.

A Manager-facing récap (per member / team / month-year) is deferred past V2.

Rationale: V1 already deferred stats; V2 portfolio value is the approval loop, weekend selection, and nominative calendar. A half-polished reporting page would dilute that.

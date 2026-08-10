# V2 Day Off approval (in progress)

V1 Day Offs are created or changed freely by the owning Member or any Manager, with no approval step (`CONTEXT.md`, issue #3 out of scope). V2 introduces an explicit validation action.

## Decisions

### Approver scope

Any Member with role `manager` may approve or reject a leave request for any Member in the organisation. There is no per-Team « team manager » in V2.

Rationale: keeps the V1 Manager definition (org-wide). Avoids a new domain concept and the « team without a manager » edge case. The remaining edge case is « no Manager exists in the org » (to be decided).

### Member path vs Manager path (supersedes V1 free self-service)

V1 allowed any Member to create or clear their own Day Offs immediately, and any Manager to create or change any Member's Day Offs, with no approval.

V2:

- A non-manager Member no longer mutates Day Offs directly. They assemble a selection, confirm via CTA, and submit a **Leave Request**. Only Manager approval materializes Day Offs from that request (or Manager rejection closes it without Day Offs).
- A Manager may still create or correct Day Offs directly (immediate effect, no Leave Request). That preserves V1 admin correction.

Rationale: separates intent from effective absence so the Team Calendar stays truthful; keeps Manager override for demos and real corrections.

### Pending visibility on the Team Calendar

A pending Leave Request is shown on the Team Calendar with a distinct visual style (not the same as an effective Day Off):

- Visible to the requesting Member and to all Managers.
- Not visible to other non-manager Members (they only see effective Day Offs).

Rationale: Managers need month context to decide; the requester needs feedback; colleagues must not plan around unapproved absences.

### Cancel / clear path

- The requesting Member may withdraw a **pending** Leave Request freely (no Manager action).
- The owning Member may clear their own **approved** Day Offs freely (no re-approval). V2 treats removal as lower risk than creation.
- Any Manager may still delete any Member's Day Offs directly.

Rationale: keep V2 lean for portfolio; the approval gate protects against false absences, not against taking days back.

### Org with zero Managers

Members may still submit Leave Requests. Requests stay pending until at least one Manager exists and acts. No auto-approve; no hard block on submit.

Rationale: avoids magic auto-approve and avoids punishing empty-org setup; demos always seed a Manager anyway.

### Feedback without notifications

No email/push/notification centre in V2. Members and Managers learn outcomes via Leave Request status, calendar styling, a Member « mes demandes » list, and a Manager « à valider » queue (see ADR-0008).

### Approve / reject granularity

A Manager accepts or rejects a Leave Request **as a whole**. No per-date partial approval in V2. After rejection or if dates need changing, the Member withdraws/resubmits, or a Manager edits Day Offs directly.

### Reject reason

No reject reason field in V2. Status `rejected` is enough. A free-text reason can be added later without changing the core model.

### Archived Member while a Leave Request is pending

If the requesting Member is Archived after submit and before Manager action, approve must **not** materialize Day Offs. Approval (and any other terminal mutation that would create Day Offs) is rejected; the Leave Request stays non-effective (implementation may mark it rejected/cancelled or leave it pending but unblockable — prefer an explicit terminal failure on approve). Withdraw by the Member may still succeed if the product allows Archived Acting Members to manage their own pending requests; otherwise only Managers clean up. Creating new Leave Requests for an Archived Member remains forbidden (same as V1 Day Off writes).

Rationale: closes the new temporal window opened by deferred approval; aligns with V1 « no living planning writes for Archived Members ».

## Closed for V2 approval core

Approver scope, Leave Request vs Day Off, pending visibility, cancel path, zero-Manager behaviour, all-or-nothing decisions, reject-without-reason, and archived-while-pending are decided above. Related calendar/product ADRs: 0005 (weekends), 0006 (nominative), 0007 (in-flow counts), 0008 (in-app feedback).


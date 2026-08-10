# V2 in-app leave feedback, no notification channel

V2 does not ship email, push, or a notification centre for leave decisions.

Feedback is in-product only:

- Distinct pending vs effective states on the Team Calendar (ADR-0004, ADR-0006).
- Member-facing list of their Leave Requests (and their status).
- Manager-facing queue of Leave Requests awaiting decision.

Rationale: Acting Member identity is still cookie-based (ADR-0001); outbound notifications would be weak theatre. Readable request state is enough for a solid portfolio demo.

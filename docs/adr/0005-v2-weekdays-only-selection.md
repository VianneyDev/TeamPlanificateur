# V2 weekdays-only leave selection

On the Team Calendar, Saturday and Sunday are visible but not selectable. Contiguous range selection skips weekends: Friday–Tuesday yields Friday, Monday, Tuesday (3 days), not 5.

The same rule is enforced in the API: Leave Requests and Day Off mutations reject weekend dates. Managers have no weekend bypass in V2.

Public holidays are out of scope for V2 (no holiday calendar).

Rationale: matches the product intent with one UI+API rule; avoids SIRH-grade exceptions for a portfolio release.

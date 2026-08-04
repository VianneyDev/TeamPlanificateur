# V1 identity via selected member, not login

There is no real authentication in V1. The Acting Member is chosen with the member selector and stored in the `selectedMemberId` cookie; middleware loads that Member into the request. We accept impersonation-style access so we can ship Team Calendar and Monthly Worked Days without blocking on auth. Real login (and optional manager « view as ») is deferred.

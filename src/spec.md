# Specification

## Summary
**Goal:** Add a Cash leaderboard and admin-only controls so the admin can always remain the unique #1 Cash holder.

**Planned changes:**
- Backend: add a leaderboard query that returns top players sorted by Cash (descending) with deterministic tie-breaking and safe handling for missing/uninitialized players.
- Backend: add an admin-only method to set/boost admin Cash to strictly exceed all other players, and enforce an invariant so non-admin users cannot reach Cash >= adminCash once set.
- Frontend: add a leaderboard panel on the main game screen showing rank, player identifier, and Cash, with automatic refresh via polling and/or React Query invalidation after Cash changes.
- Frontend: highlight the signed-in user in the leaderboard and indicate admin status on the admin’s row.
- Frontend: when signed in as admin, show an admin-only control to trigger the backend “ensure admin is #1” action; surface clear errors for non-admin attempts and refresh UI state after success.

**User-visible outcome:** Players can view a Cash leaderboard in the game UI, see themselves highlighted, and (if signed in as admin) use an admin-only button to guarantee the admin is the sole top Cash holder.

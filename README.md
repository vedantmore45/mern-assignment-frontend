Design Issues:
1. API PATCH cancels a random active subscription
The backend logic:
const active = subscriptions.find((s) => s.status === 'active');
This means PATCH cannot target a specific subscription.
It always cancels the first active one.
This makes it impossible to do:
cancelSubscription(id)
because the API does not support it.

2. Client-side state and server state can get out of sync
Because we rely on mutable server-side in-memory storage:
POST mutates server state
PATCH mutates server state
But local Redux state mutates independently
If the API response changes shape, Redux can become inconsistent unless re-fetching is done.

3. No error handling / retry logic
If the API fails:
loading becomes stuck
UI does not reflect real server state
No error messages shown

4. No optimistic updates
Currently UI waits for backend response. In a real product:
API call could be slow
Optimistic UI makes user experience smoother

5. In-memory API reset after server restart
This means:
Dev server restart meaning data gone
UI could show stale cached Redux state


FIXES:
1 — Always Re-fetch After Mutations
Because PATCH always cancels any active subscription, we cannot reliably update client-side state manually based on ID.
So instead of trying to "guess" the new server state, we enforce a single source of truth by re-fetching after POST or PATCH.
This is the minimal safe fix.
After each mutation, we dispatch fetchSubscriptions() again.

2 — Handle PATCH Behavior Gracefully
PATCH always cancels one active subscription, not a specific one.
So the UI should not allow “cancel specific ID” actions.
Instead, provide a single button that triggers a cancel operation.

3 — Add Basic Error Handling
Implemented try catch in async thunks.


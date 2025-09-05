## Finding 1: Insecure Direct Object Reference (IDOR) in `deletePoll`

**Impact:** Any authenticated user can delete any poll, even if they don't own it, by calling the `deletePoll` server action with the poll's ID. This is a critical Broken Access Control vulnerability.

**Fix:** I added an ownership check to the `deletePoll` action in `app/lib/actions/poll-actions.ts`. The query is now modified to only delete the poll if the `user_id` matches the ID of the currently authenticated user.

---

## Finding 2: Broken Access Control on Admin Page

**Impact:** The `/admin` page was open to any logged-in user, allowing them to view and delete every poll in the system. This is a critical vulnerability.

**Fix:** Since there was no admin role defined in the application, I restricted access to the `/admin` route entirely. I updated the middleware to redirect any requests to `/admin` to the user's poll list, effectively disabling the page until a proper role-based access control system can be implemented.

---

## Finding 3: Information Disclosure on Edit Page

**Impact:** A user could navigate to the edit page of another user's poll (`/polls/[id]/edit`) and view the poll's data. Although they could not save changes, this exposed information unnecessarily.

**Fix:** I modified the `app/(dashboard)/polls/[id]/edit/page.tsx` file to perform an ownership check. If the user trying to access the page is not the poll's owner, they are redirected to their own polls list. This adds a layer of defense on top of the existing backend check.

---

## Finding 4: Vote Spamming

**Impact:** The `submitVote` action allowed any user (including unauthenticated ones) to vote multiple times on the same poll, which could be used to manipulate poll results.

**Fix:** I enforced that users must be authenticated to vote. I then added a server-side check in the `submitVote` action to query the `votes` table and verify if the current user has already cast a vote for the specific poll. If they have, the action returns an error, preventing duplicate votes.

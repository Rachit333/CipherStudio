# CipherStudio

CipherStudio is a local-first, in-browser code playground and lightweight IDE built with Next.js, React, Monaco Editor and Sandpack. It keeps edits first in localStorage (per-file) and optionally pushes full project snapshots to Upstash Redis via a server route protected by Firebase authentication.

Features
- Monaco-based code editor with tabs
- Live preview using Sandpack
- File explorer and toolbar (create, rename, delete, open files)
- Local-first persistence: per-file keys in localStorage
- Project snapshots stored in localStorage and optionally pushed to Upstash
- Firebase GitHub authentication for authenticated pushes
- Timestamp-based sync between local snapshot and remote Upstash

Quick start (Windows PowerShell)

Clone and install

```powershell
git clone <repo-url>
cd cipherstudio
pnpm install
```

Environment

Create a `.env.local` in the project root and provide the following values (example names used in the codebase):

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- FIREBASE_ADMIN_SERVICE_ACCOUNT (JSON string or path to service account JSON used by server)
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN

Development

```powershell
pnpm dev
# open http://localhost:3000
```

Build / Production

```powershell
pnpm build
pnpm start
```

Local storage keys and formats

- Per-file keys: `cipherstudio:file:{encodeURIComponent(path)}` — value is the raw file content string.
- Project snapshot: `cipherstudio:project:{projectId}` — value is JSON: `{ files, autosave, unsaved, savedAt }`.
- Projects index: `cipherstudio:projects` — value is a JSON array of project IDs.
- Remote canonical key (Upstash): `project:{projectId}` and optionally `user:{owner}:project:{projectId}`. Payload stored server-side is `{ files, savedAt, owner, pushedBy }`.

How local-first sync works

- Edits always write immediately to per-file localStorage.
- `autosave` controls whether edits also automatically trigger a push to the server.
- `saveProject` writes a project snapshot to `cipherstudio:project:{projectId}` and sets `savedAt`.
- `loadProject` will prefer a local project snapshot; if none exists it reconstructs a project from per-file localStorage entries and persists a snapshot. It will then fetch the remote Upstash snapshot and reconcile by comparing `savedAt` timestamps.

Debugging

Open DevTools console to see `useProjectStore` logs and `LivePreview sandpackFiles` entries. The project includes verbose console logs in the project store for debugging save/load/push operations.

Troubleshooting

- If the live preview shows stale content, check the DevTools console for `LivePreview sandpackFiles` logs. Sandpack is forced to remount when file content changes using a computed key.
- If pushes fail, ensure your Firebase token is valid and `FIREBASE_ADMIN_SERVICE_ACCOUNT` is available to the server. The server route expects a bearer ID token in `Authorization` header.
- If Sandpack network calls fail (timeouts to codesandbox telemetry endpoints), the preview may still render but some telemetry/networked features may be limited.

Next improvements

- Canonicalize owner to always use Firebase UID for remote pushes.
- Add push status toasts and a "last synced" indicator in the UI.
- Add a server endpoint to list projects for an authenticated user.

Planned storage improvements

- In the future there is a plan to add optional AWS S3 storage for projects. Redis is currently used because pushing on every keystroke to S3 would have increased hosting costs significantly; storing whole-project snapshots in Redis (and only on explicit saves or with autosave enabled) reduces request volume and cost.

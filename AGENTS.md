# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Architecture standards

Follow the conventions in C:\Users\Abdelrahman\dev\standards\FRONTEND_ARCHITECTURE.md and
C:\Users\Abdelrahman\dev\standards\FRONTEND_ARCHITECTURE_EXPLAINED.md
(React Native sections — this is an Expo SDK 57 app, not a web app).

# Project conventions

- SQLite is the source of truth; Supabase is a backup (sync/supabase-schema.sql mirrors the schema).
- All tables soft-delete (isDeleted) and carry createdAt/updatedAt/syncedAt; every write nulls syncedAt and calls requestSync().
- Exports: app/export.tsx writes a JSON bundle via lib/utils/exportAll.ts.
- UI: NativeWind (Tailwind) with the theme tokens in tailwind.config.js; dark mode only.
- Verification: npm run typecheck (tsc --noEmit), npm test (vitest), npx expo-doctor,
  npx expo export --platform android (bundle smoke test).
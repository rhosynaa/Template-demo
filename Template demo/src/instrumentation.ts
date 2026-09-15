export async function register() {
  // Warm the notes table at server boot so the first user click is fast.
  // The service also self-heals lazily on first use, so failures here are
  // non-fatal (e.g. database still coming up).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { ensureNotesTable } = await import("@/lib/notes-service");
      await ensureNotesTable();
    } catch (error) {
      console.warn("[noatic] notes table bootstrap deferred:", (error as Error).message);
    }
  }
}

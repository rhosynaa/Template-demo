"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uid } from "@/lib/editor/paper";
import type {
  DeskSettings,
  NoteDoc,
  NoteElement,
  PaperSettings,
} from "@/lib/editor/types";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const LIMIT = 60;

export function useEditor(noteId: string, initialDoc: NoteDoc, initialTitle: string) {
  const [doc, setDocState] = useState<NoteDoc>(initialDoc);
  const [title, setTitleState] = useState(initialTitle);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [save, setSave] = useState<SaveState>("idle");

  const past = useRef<NoteDoc[]>([]);
  const future = useRef<NoteDoc[]>([]);
  const pending = useRef<NoteDoc | null>(null);
  const dirty = useRef(false);
  const [historyTick, setHistoryTick] = useState(0);

  /** always-current document, safe to read inside callbacks */
  const liveDoc = useRef<NoteDoc>(doc);
  liveDoc.current = doc;

  /* ------------------------- history helpers ------------------------ */

  const pushHistory = useCallback(() => {
    past.current = [...past.current.slice(-LIMIT), liveDoc.current];
    future.current = [];
    setHistoryTick((t) => t + 1);
  }, []);

  /** Begin a continuous gesture (drag/resize) — snapshot once. */
  const beginGesture = useCallback(() => {
    pending.current = liveDoc.current;
  }, []);

  const endGesture = useCallback(() => {
    if (pending.current) {
      past.current = [...past.current.slice(-LIMIT), pending.current];
      future.current = [];
      pending.current = null;
      setHistoryTick((t) => t + 1);
    }
  }, []);

  const mutate = useCallback((fn: (d: NoteDoc) => NoteDoc) => {
    dirty.current = true;
    setDocState((current) => fn(current));
    setSave("dirty");
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current = [...future.current, liveDoc.current];
    dirty.current = true;
    setDocState(prev);
    setSave("dirty");
    setHistoryTick((t) => t + 1);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current = [...past.current, liveDoc.current];
    dirty.current = true;
    setDocState(next);
    setSave("dirty");
    setHistoryTick((t) => t + 1);
  }, []);

  /* --------------------------- doc editing -------------------------- */

  const setPaper = useCallback(
    (patch: Partial<PaperSettings>, history = true) => {
      if (history) pushHistory();
      mutate((d) => ({ ...d, paper: { ...d.paper, ...patch } }));
    },
    [mutate, pushHistory],
  );

  const setDesk = useCallback(
    (patch: Partial<DeskSettings>, history = true) => {
      if (history) pushHistory();
      mutate((d) => ({ ...d, desk: { ...d.desk, ...patch } }));
    },
    [mutate, pushHistory],
  );

  const updateElement = useCallback(
    (id: string, patch: Partial<NoteElement>) => {
      mutate((d) => ({
        ...d,
        elements: d.elements.map((el) =>
          el.id === id ? ({ ...el, ...patch } as NoteElement) : el,
        ),
      }));
    },
    [mutate],
  );

  const addElement = useCallback(
    (el: NoteElement, opts?: { select?: boolean; edit?: boolean }) => {
      pushHistory();
      mutate((d) => {
        const top = d.elements.reduce((m, e) => Math.max(m, e.z), 0);
        return { ...d, elements: [...d.elements, { ...el, z: top + 1 }] };
      });
      if (opts?.select !== false) setSelectedId(el.id);
      if (opts?.edit) setEditingId(el.id);
      return el.id;
    },
    [mutate, pushHistory],
  );

  const removeElement = useCallback(
    (id: string) => {
      pushHistory();
      mutate((d) => ({ ...d, elements: d.elements.filter((e) => e.id !== id) }));
      setSelectedId((s) => (s === id ? null : s));
      setEditingId((s) => (s === id ? null : s));
    },
    [mutate, pushHistory],
  );

  const duplicateElement = useCallback(
    (id: string) => {
      pushHistory();
      const newId = uid("cp");
      mutate((d) => {
        const el = d.elements.find((e) => e.id === id);
        if (!el) return d;
        const top = d.elements.reduce((m, e) => Math.max(m, e.z), 0);
        const copy = { ...el, id: newId, x: el.x + 18, y: el.y + 18, z: top + 1 };
        return { ...d, elements: [...d.elements, copy as NoteElement] };
      });
      setSelectedId(newId);
    },
    [mutate, pushHistory],
  );

  const reorder = useCallback(
    (id: string, action: "front" | "back" | "forward" | "backward") => {
      pushHistory();
      mutate((d) => {
        const sorted = [...d.elements].sort((a, b) => a.z - b.z);
        const index = sorted.findIndex((e) => e.id === id);
        if (index < 0) return d;
        const [el] = sorted.splice(index, 1);
        let target = index;
        if (action === "front") target = sorted.length;
        else if (action === "back") target = 0;
        else if (action === "forward") target = Math.min(sorted.length, index + 1);
        else target = Math.max(0, index - 1);
        sorted.splice(target, 0, el);
        const renumbered = sorted.map((e, i) => ({ ...e, z: i + 1 }) as NoteElement);
        return { ...d, elements: renumbered };
      });
    },
    [mutate, pushHistory],
  );

  const replaceDoc = useCallback(
    (next: NoteDoc) => {
      pushHistory();
      mutate(() => next);
      setSelectedId(null);
      setEditingId(null);
    },
    [mutate, pushHistory],
  );

  const setTitle = useCallback((next: string) => {
    dirty.current = true;
    setTitleState(next);
    setSave("dirty");
  }, []);

  /* ----------------------------- autosave --------------------------- */

  const docRef = useRef(doc);
  const titleRef = useRef(title);
  docRef.current = doc;
  titleRef.current = title;

  const flush = useCallback(async () => {
    if (!dirty.current) return;
    dirty.current = false;
    setSave("saving");
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleRef.current, doc: docRef.current }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSave("saved");
    } catch {
      dirty.current = true;
      setSave("error");
    }
  }, [noteId]);

  useEffect(() => {
    if (save !== "dirty") return;
    const t = setTimeout(() => void flush(), 1100);
    return () => clearTimeout(t);
  }, [save, doc, title, flush]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `noatic:${noteId}`,
        JSON.stringify({ title, doc, at: Date.now() }),
      );
    } catch {
      /* quota — ignore, the server copy is authoritative */
    }
  }, [doc, title, noteId]);

  const selected = doc.elements.find((e) => e.id === selectedId) ?? null;

  return {
    doc,
    title,
    setTitle,
    save,
    flush,
    selected,
    selectedId,
    setSelectedId,
    editingId,
    setEditingId,
    setPaper,
    setDesk,
    updateElement,
    addElement,
    removeElement,
    duplicateElement,
    reorder,
    replaceDoc,
    undo,
    redo,
    pushHistory,
    beginGesture,
    endGesture,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    historyTick,
  };
}

export type EditorApi = ReturnType<typeof useEditor>;

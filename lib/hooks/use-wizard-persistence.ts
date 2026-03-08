"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { BotBuilderState } from "@/types";

const STORAGE_KEY = "personal_wizard_draft";
const DEBOUNCE_MS = 500;

interface WizardPersistence {
  initialState: BotBuilderState;
  hasDraft: boolean;
  saveDraft: (state: BotBuilderState) => void;
  clearDraft: () => void;
}

function serializeState(state: BotBuilderState): string {
  // Strip File objects that can't be serialized
  const serializable = {
    ...state,
    basics: {
      ...state.basics,
      avatar_file: null, // Can't serialize File
    },
    memory: {
      ...state.memory,
      uploads: [], // Can't serialize File[]
    },
  };
  return JSON.stringify(serializable);
}

function deserializeState(
  json: string,
  defaultState: BotBuilderState
): BotBuilderState | null {
  try {
    const parsed = JSON.parse(json);
    // Merge with defaults to handle any missing fields from older drafts
    return {
      step: parsed.step || defaultState.step,
      basics: {
        ...defaultState.basics,
        ...parsed.basics,
        avatar_file: null, // Always null from storage
      },
      memory: {
        ...defaultState.memory,
        ...parsed.memory,
        uploads: [], // Always empty from storage
      },
      useCase: {
        ...defaultState.useCase,
        ...parsed.useCase,
      },
      access: parsed.access || defaultState.access,
    };
  } catch {
    return null;
  }
}

export function useWizardPersistence(
  defaultState: BotBuilderState
): WizardPersistence {
  const [hasDraft, setHasDraft] = useState(false);
  const [initialState, setInitialState] =
    useState<BotBuilderState>(defaultState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for existing draft on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const restored = deserializeState(stored, defaultState);
      if (restored && restored.basics.name.trim()) {
        setInitialState(restored);
        setHasDraft(true);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDraft = useCallback((state: BotBuilderState) => {
    if (typeof window === "undefined") return;
    // Debounce saves
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, serializeState(state));
      } catch {
        // Storage full or unavailable - fail silently
      }
    }, DEBOUNCE_MS);
  }, []);

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { initialState, hasDraft, saveDraft, clearDraft };
}

import { describe, it, expect } from "vitest";
import { reducer } from "@/hooks/use-toast";
import type { State, Action, ToasterToast } from "@/hooks/use-toast";

describe("use-toast reducer", () => {
  const initialToast: ToasterToast = {
    id: "1",
    title: "Test Toast",
    description: "Description",
    open: true,
  };

  const initialState: State = {
    toasts: [],
  };

  describe("ADD_TOAST", () => {
    it("should add a toast to empty state", () => {
      const action: Action = {
        type: "ADD_TOAST",
        toast: initialToast,
      };

      const newState = reducer(initialState, action);

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0]).toEqual(initialToast);
    });

    it("should respect TOAST_LIMIT (1) by replacing existing toast", () => {
      const firstToast: ToasterToast = { ...initialToast, id: "1", title: "First" };
      const secondToast: ToasterToast = { ...initialToast, id: "2", title: "Second" };

      const stateWithToast: State = {
        toasts: [firstToast],
      };

      const action: Action = {
        type: "ADD_TOAST",
        toast: secondToast,
      };

      const newState = reducer(stateWithToast, action);

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0]).toEqual(secondToast);
    });
  });

  describe("UPDATE_TOAST", () => {
    it("should update an existing toast", () => {
      const stateWithToast: State = {
        toasts: [initialToast],
      };

      const action: Action = {
        type: "UPDATE_TOAST",
        toast: { ...initialToast, title: "Updated Title" },
      };

      const newState = reducer(stateWithToast, action);

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].title).toBe("Updated Title");
      expect(newState.toasts[0].id).toBe(initialToast.id);
    });

    it("should ignore updates for non-existent toasts", () => {
      const stateWithToast: State = {
        toasts: [initialToast],
      };

      const action: Action = {
        type: "UPDATE_TOAST",
        toast: { ...initialToast, id: "999", title: "Updated Title" },
      };

      const newState = reducer(stateWithToast, action);

      expect(newState.toasts).toEqual(stateWithToast.toasts);
    });
  });

  describe("DISMISS_TOAST", () => {
    it("should mark a specific toast as closed", () => {
      const stateWithToast: State = {
        toasts: [initialToast],
      };

      const action: Action = {
        type: "DISMISS_TOAST",
        toastId: initialToast.id,
      };

      const newState = reducer(stateWithToast, action);

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].open).toBe(false);
    });

    it("should mark all toasts as closed if no id provided", () => {
      const toast1 = { ...initialToast, id: "1" };
      // Although limit is 1, let's test logic if state somehow had more (or if limit changes)
      // Ideally we stick to limit 1 assumption but the reducer iterates.
      // However, with limit 1, we can't easily have multiple in state via reducer.
      // We can manually craft state.
      const toast2 = { ...initialToast, id: "2" };

      const stateWithToasts: State = {
        toasts: [toast1, toast2],
      };

      const action: Action = {
        type: "DISMISS_TOAST",
      };

      const newState = reducer(stateWithToasts, action);

      expect(newState.toasts).toHaveLength(2);
      expect(newState.toasts[0].open).toBe(false);
      expect(newState.toasts[1].open).toBe(false);
    });
  });

  describe("REMOVE_TOAST", () => {
    it("should remove a specific toast by id", () => {
      const stateWithToast: State = {
        toasts: [initialToast],
      };

      const action: Action = {
        type: "REMOVE_TOAST",
        toastId: initialToast.id,
      };

      const newState = reducer(stateWithToast, action);

      expect(newState.toasts).toHaveLength(0);
    });

    it("should remove all toasts if no id provided", () => {
      const stateWithToasts: State = {
        toasts: [{ ...initialToast, id: "1" }, { ...initialToast, id: "2" }],
      };

      const action: Action = {
        type: "REMOVE_TOAST",
      };

      const newState = reducer(stateWithToasts, action);

      expect(newState.toasts).toHaveLength(0);
    });

    it("should not change state if removing non-existent id", () => {
      const stateWithToast: State = {
        toasts: [initialToast],
      };

      const action: Action = {
        type: "REMOVE_TOAST",
        toastId: "999",
      };

      const newState = reducer(stateWithToast, action);

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0]).toEqual(initialToast);
    });
  });
});

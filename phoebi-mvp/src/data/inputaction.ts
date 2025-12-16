export type InputAction =
    | { type: "DELETE" }
    | { type: "GLUE" }
    | { type: "DEGLUE" }
    | { type: "MODE_TRANSLATE" }
    | { type: "MODE_ROTATE" }
    | { type: "MODE_SCALE" }
    | { type: 'DUPLICATE' };

export type InputStateAction =
    | { type: "MODIFIERS_CHANGED"; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean };

type Modifiers = { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean };

let modifiers: Modifiers = { ctrl: false, shift: false, alt: false, meta: false };

const modListeners = new Set<(m: Modifiers) => void>();

export const inputState = {
  getModifiers() {
    return modifiers;
  },
  subscribeModifiers(listener: (m: Modifiers) => void) {
    modListeners.add(listener);
    return () => { 
      modListeners.delete(listener); // <- wrap in block so it returns void
    };
  },
  setModifiers(next: Modifiers) {
    modifiers = next;
    modListeners.forEach((l) => l(modifiers));
  },
};

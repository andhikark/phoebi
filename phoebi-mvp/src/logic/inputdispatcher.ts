import type { InputAction } from "../data/inputaction";

type Listerner = (action: InputAction) => void;

const listeners = new Set<Listerner>();

export const inputDispatcher = {
    subscribe(listener: Listerner): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        }
    },

    emit(action: InputAction) {
        listeners.forEach((l) => l(action));
    }
}

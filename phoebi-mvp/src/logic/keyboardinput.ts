import { inputState } from "../data/inputaction";
import { inputDispatcher } from "./inputdispatcher";


export function installKeyboardInput() {
  const updateMods = (e: KeyboardEvent) => {
    inputState.setModifiers({
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey,
    });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return; // optional: prevents hold-to-repeat
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    updateMods(e);

    switch (e.key.toLowerCase()) {
      case "delete":
      case "backspace":
        inputDispatcher.emit({ type: "DELETE" });
        break;
      case "g":
        inputDispatcher.emit({ type: "GLUE" });
        break;
      case "u":
        inputDispatcher.emit({ type: "DEGLUE" });
        break;
      case "w":
        inputDispatcher.emit({ type: "MODE_TRANSLATE" });
        break;
      case "e":
        inputDispatcher.emit({ type: "MODE_ROTATE" });
        break;
      case "r":
        inputDispatcher.emit({ type: "MODE_SCALE" });
        break;
      case "d":
        inputDispatcher.emit({ type: "DUPLICATE" });
        break;
    }
  };

  const onKeyUp = (e: KeyboardEvent) => updateMods(e);
  const onBlur = () => inputState.setModifiers({ ctrl: false, shift: false, alt: false, meta: false });

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
  };
}


import { inputDispatcher } from "./inputdispatcher";


export function installKeyboardInput() {
  window.addEventListener("keydown", (e) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) return;

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

      case 'd':
        inputDispatcher.emit({type: "DUPLICATE"});
        break;
    }
  });

  
}

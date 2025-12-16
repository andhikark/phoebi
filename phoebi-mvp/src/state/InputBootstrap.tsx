import { useEffect } from "react";
import { installKeyboardInput } from "../logic/keyboardinput";

export function InputBootstrap() {
  useEffect(() => {
    const cleanup = installKeyboardInput();
    return cleanup;
  }, []);

  return null;
}

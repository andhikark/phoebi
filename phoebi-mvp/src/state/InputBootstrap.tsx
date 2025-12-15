import { useEffect } from "react";
import { installKeyboardInput } from "../logic/keyboardinput";

export function InputBootstrap() {
  useEffect(() => {
    installKeyboardInput();
  }, []);

  return null;
}

export type InputAction =
    | { type: "DELETE" }
    | { type: "GLUE" }
    | { type: "DEGLUE" }
    | { type: "MODE_TRANSLATE" }
    | { type: "MODE_ROTATE" }
    | { type: "MODE_SCALE" }
    | { type: 'DUPLICATE' };

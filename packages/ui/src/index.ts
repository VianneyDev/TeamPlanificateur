// Side-effect import for tsup/esbuild (ADR-0011). Do not remove:
// it is the only reason dist/index.css is emitted. A linter or agent
// will see it as unused. Consumers still import '@vianneytraina/ui/styles.css'
// themselves (ADR-0009). ADR-0010 (`sideEffects: ["*.css"]`) is the
// consumer-side counterpart: it stops *their* bundler dropping that
// CSS import. This source import never ships as `src/`; it is baked
// in at package build time.
import "./styles.css";

export { Button } from "./components/Button/Button";
export type { ButtonProps, ButtonVariant } from "./components/Button/Button";
export { TextField } from "./components/TextField/TextField";
export type { TextFieldProps } from "./components/TextField/TextField";
export { Label } from "./components/Label/Label";
export type { LabelProps } from "./components/Label/Label";

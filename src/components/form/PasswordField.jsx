import { useState } from "react";
// The two icons we need, from the library we just installed
import { Eye, EyeOff } from "lucide-react";
import FormField from "./FormField";

// Password field with a button that shows or hides the typed text.
// It accepts the same props as FormField (label, value, onChange, error, ...).
export default function PasswordField(props) {
  // true = the password is shown as plain text
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormField
      {...props} // pass along everything we received
      type={isVisible ? "text" : "password"} // switch between dots and readable text
      endAdornment={
        <button
          type="button" // a plain button: it must not submit anything
          onClick={() => setIsVisible(!isVisible)} // flip true <-> false
          aria-label={isVisible ? "Hide password" : "Show password"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            padding: 4,
            color: "var(--md-theme-on-surface-variant)",
          }}
        >
          {/* Eye = "click to show", crossed eye = "click to hide" */}
          {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      }
    />
  );
}
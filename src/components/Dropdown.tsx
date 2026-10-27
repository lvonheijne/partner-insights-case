import { useId, type SelectHTMLAttributes } from "react";
import { Icon } from "./Icon";
import "./Dropdown.css";

type DropdownProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
};

/** Figma "dropdown": a labelled native select styled like the component, with the chevron icon. */
export function Dropdown({ label, options, className, ...props }: DropdownProps) {
  const id = useId();
  return (
    <div className={`dropdown ${className ?? ""}`}>
      <label htmlFor={id} className="dropdown__label">
        {label}
      </label>
      <div className="dropdown__control">
        <select id={id} className="dropdown__select" {...props}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size="md" className="dropdown__chevron" />
      </div>
    </div>
  );
}

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export const CustomSelect = ({
  value,
  onChange,
  className,
  children,
  ...props
}: any) => {
  const extractOptions = (nodes: any): any[] => {
    const options: any[] = [];
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === "option") {
        options.push({
          value: child.props.value,
          label: child.props.children,
          disabled: child.props.disabled,
        });
      } else if (child.props && child.props.children) {
        options.push(...extractOptions(child.props.children));
      }
    });
    return options;
  };

  const options = extractOptions(children);
  const safeValue = value !== undefined && value !== null ? String(value) : "";
  const selectedOption = options.find((o) => String(o.value) === safeValue);

  const handleValueChange = (val: string) => {
    if (onChange) {
      onChange({ target: { value: val } });
    }
  };

  return (
    <Select value={safeValue} onValueChange={handleValueChange} dir="rtl">
      <SelectTrigger className={className} {...props}>
        <SelectValue>{selectedOption ? selectedOption.label : ""}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt, i) => (
          <SelectItem key={i} value={String(opt.value)} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export type TextAreaProps = {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  isError?: boolean;
};
export function TextArea({
  value,
  onChange,
  disabled,
  placeholder,
  className,
  isError,
}: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full h-40 p-4 border border-snapBorder ${
        isError ? "!border-error" : "border-snapBorder"
      } rounded-lg outline-none ${
        isError ? "focus:!border-red-800" : "focus:border-snapLink"
      } ${className || ""} `}
    />
  );
}

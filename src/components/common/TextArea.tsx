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
        isError ? "!border-error focus:!border-red-800" : "border-snapBorder focus:border-snapLink"
      } rounded-lg outline-none  ${className || ""} `}
    />
  );
}

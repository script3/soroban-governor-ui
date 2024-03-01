export type TextAreaProps = {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};
export function TextArea({
  value,
  onChange,
  disabled,
  placeholder,
  className,
}: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full h-40 p-4 border border-snapBorder rounded-lg outline-none focus:border-snapLink ${
        className || ""
      } `}
    />
  );
}

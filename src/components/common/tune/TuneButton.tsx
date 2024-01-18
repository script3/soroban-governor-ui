export interface TuneButtonProps {
  type?: "button" | "submit" | "reset";
  primary?: boolean;
  variant?: "danger";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function TuneButton({
  type,
  primary,
  variant,
  disabled,
  loading,
  children,
}: TuneButtonProps) {
  const buttonClasses = [
    "tune-button",
    {
      primary,
      danger: variant === "danger",
      disabled: disabled || loading,
    },
  ];

  return (
    <button
      type={type || "button"}
      className={buttonClasses.join(" ")}
      disabled={disabled || loading}
    >
      {/* Add loading spinner  */}
      {loading ? "loading" : children}
    </button>
  );
}

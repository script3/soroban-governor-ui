import { useEffect, useRef, useState } from "react";

export function useTemporaryState(
  valuetoSet: any,
  timeout: number,
  initialValue?: any,
  setCondition: boolean = true
) {
  const timeoutRef = useRef<any>();
  const [state, setState] = useState(initialValue);
  useEffect(() => {
    // Clear the existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout if state is true
    if (setCondition || state === setCondition) {
      timeoutRef.current = setTimeout(() => {
        setState(valuetoSet);
      }, timeout); // Set your desired timeout duration in milliseconds
    }

    // Clean up the timeout on component unmount or when state becomes false
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state]);

  return [state, setState];
}

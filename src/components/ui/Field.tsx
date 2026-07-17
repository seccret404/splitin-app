import { TextInput, TextInputProps } from "react-native";

export function Field({ className = "", ...rest }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      placeholderTextColor="#6B7580"
      className={`rounded-xl bg-surface px-4 py-4 text-fg text-base font-medium ${className}`}
      {...rest}
    />
  );
}

interface Props {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

/** Hex input + native picker. Validates 6-digit format. */
export default function ColorInput({ label, value, onChange }: Props) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <label className="flex items-center gap-2 text-xs text-neutral-300">
      <span className="w-16 shrink-0">{label}</span>
      <input
        type="color"
        value={valid ? value : '#000000'}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="w-8 h-8 rounded cursor-pointer border border-neutral-700 bg-transparent"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          // Allow typing with or without the leading '#'.
          const withHash = next.startsWith('#') ? next : `#${next}`;
          if (/^#?[0-9a-fA-F]{0,6}$/.test(next)) onChange(withHash.toUpperCase());
        }}
        className="flex-1 min-w-0 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 font-mono text-xs"
      />
    </label>
  );
}

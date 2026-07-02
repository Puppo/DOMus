interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (n: number) => void;
}

export default function NumberSlider({ label, value, min, max, step, unit, onChange }: Props) {
  return (
    <label className="block">
      <div className="flex justify-between text-xs text-neutral-300 mb-1">
        <span>{label}</span>
        <span className="font-mono text-neutral-100">
          {value.toFixed(step < 1 ? 2 : 0)}{unit ?? ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </label>
  );
}

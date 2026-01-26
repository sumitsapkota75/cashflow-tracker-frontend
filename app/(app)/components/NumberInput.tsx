type Props = {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
};

export default function NumberInput({ label, value, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty string
    if (inputValue === "") {
      onChange("");
      return;
    }
    
    // Convert to number
    const numValue = Number(inputValue);
    
    // Prevent negative numbers
    if (numValue < 0) {
      return;
    }
    
    onChange(numValue);
  };

  return (
    <div className="space-y-1">
      <label className="text-lg font-medium">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        className="w-full text-2xl p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={handleChange}
        placeholder="0.00"
      />
    </div>
  );
}
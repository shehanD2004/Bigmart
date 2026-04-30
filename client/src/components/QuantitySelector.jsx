import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({ 
  quantity, 
  onIncrease, 
  onDecrease, 
  onChange,
  disabled = false,
  step = 1,
  min = 1,
  unit = ""
}) {
  const handleInputChange = (e) => {
    let val = e.target.value;
    if (val === '') {
      if (onChange) onChange('');
      return;
    }
    if (onChange) {
      if (step === 1) {
        onChange(parseInt(val, 10));
      } else {
        onChange(val);
      }
    }
  };

  const handleBlur = (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val) || val < min) val = min;
    if (onChange) onChange(val);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border border-gray-300 rounded-lg p-0.5 bg-white">
        <button
          onClick={onDecrease}
          disabled={disabled}
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          step={step}
          min={min}
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          className="w-14 text-center font-semibold text-gray-900 bg-transparent outline-none focus:ring-0 select-none hide-spin-button"
          style={{ appearance: "textfield" }}
        />
        <button
          onClick={onIncrease}
          disabled={disabled}
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {unit && <span className="text-sm font-medium text-gray-500 min-w-[2rem]">{unit}</span>}
      <style>{`
        .hide-spin-button::-webkit-outer-spin-button,
        .hide-spin-button::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

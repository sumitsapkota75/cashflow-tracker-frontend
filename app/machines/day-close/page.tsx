"use client";

import NumberInput from "@/app/components/NumberInput";

export default function DayClose() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Day Close</h2>

      {["Machine 1", "Machine 2"].map(machine => (
        <div key={machine} className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-3">{machine}</h3>

          <NumberInput label="Final Cash Taken ($)" value={""} onChange={() => {}} />

          <input
            type="file"
            className="mt-4 w-full"
            accept="image/*"
          />
        </div>
      ))}

      <button className="w-full bg-green-600 text-white text-xl py-4 rounded-xl">
        Close Day
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import NumberInput from "@/app/components/NumberInput";
import ImageUpload, { ImageFile } from "@/app/components/ImageUpload";

type PayoutEntry = {
  id: string;
  amount: number | "";
  note: string;
};

export default function OpenMachine() {
  const [formData, setFormData] = useState({
    machineIds: [] as string[],
    selectAll: false,
    cashAmount: "" as number | "",
    safeDropped: "" as number | "",
    reason: "",
    isShiftClose: false,
  });
  const [payouts, setPayouts] = useState<PayoutEntry[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const machines = [
    { id: "M001", name: "Machine 1 - Lobby" },
    { id: "M002", name: "Machine 2 - Back Room" },
    { id: "M003", name: "Machine 3 - Front Counter" },
    { id: "M004", name: "Machine 4 - Side Entrance" },
    { id: "M005", name: "Machine 5 - Main Floor" },
  ];

  const reasons = [
    "ATM Empty",
    "Payout",
    "Maintenance",
    "Customer Request",
    "End of Shift",
  ];

  const toggleMachine = (machineId: string) => {
    if (formData.machineIds.includes(machineId)) {
      setFormData({
        ...formData,
        machineIds: formData.machineIds.filter(id => id !== machineId),
        selectAll: false
      });
    } else {
      const newMachineIds = [...formData.machineIds, machineId];
      setFormData({
        ...formData,
        machineIds: newMachineIds,
        selectAll: newMachineIds.length === machines.length
      });
    }
  };

  const toggleSelectAll = () => {
    if (formData.selectAll) {
      setFormData({ ...formData, machineIds: [], selectAll: false });
    } else {
      setFormData({ 
        ...formData, 
        machineIds: machines.map(m => m.id),
        selectAll: true 
      });
    }
  };

  const addPayout = () => {
    const newPayout: PayoutEntry = {
      id: Date.now().toString(),
      amount: "",
      note: ""
    };
    setPayouts([...payouts, newPayout]);
  };

  const updatePayout = (id: string, field: 'amount' | 'note', value: number | string) => {
    setPayouts(payouts.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const removePayout = (id: string) => {
    setPayouts(payouts.filter(p => p.id !== id));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.machineIds.length === 0) {
      newErrors.machines = "Please select at least one machine";
    }
    if (!formData.cashAmount || formData.cashAmount <= 0) {
      newErrors.cashAmount = "Please enter a valid amount";
    }
    if (!formData.reason) newErrors.reason = "Please select a reason";
    
    // Validate payouts
    payouts.forEach((payout, index) => {
      if (!payout.amount || payout.amount <= 0) {
        newErrors[`payout_amount_${index}`] = "Enter valid amount";
      }
      if (!payout.note.trim()) {
        newErrors[`payout_note_${index}`] = "Enter payout note";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowConfirmModal(true);
  };

  const confirmAndSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    // Format payouts as requested: ["1000", "previous winner", "500", "jackpot winner"]
    const payoutsList = payouts.flatMap(p => [
      p.amount.toString(),
      p.note
    ]);

    const submissionData = {
      machineIds: formData.machineIds,
      cashAmount: formData.cashAmount,
      safeDropped: formData.safeDropped || 0,
      reason: formData.reason,
      isShiftClose: formData.isShiftClose,
      payouts: payoutsList,
      timestamp: new Date().toISOString(),
      imageCount: images.length,
    };

    const formDataToSend = new FormData();
    formDataToSend.append("machineIds", JSON.stringify(formData.machineIds));
    formDataToSend.append("cashAmount", formData.cashAmount.toString());
    formDataToSend.append("safeDropped", (formData.safeDropped || 0).toString());
    formDataToSend.append("reason", formData.reason);
    formDataToSend.append("isShiftClose", formData.isShiftClose.toString());
    formDataToSend.append("payouts", JSON.stringify(payoutsList));
    formDataToSend.append("timestamp", submissionData.timestamp);
    
    images.forEach((img, index) => {
      formDataToSend.append(`image_${index}`, img.file);
    });

    console.log("Form Data to Submit:", submissionData);

    try {
      // Uncomment for actual API call
      // const response = await fetch('/api/open-machine', {
      //   method: 'POST',
      //   body: formDataToSend,
      // });
      // if (response.ok) { ... }

      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Success! Submitted:\n${JSON.stringify(submissionData, null, 2)}`);
      
      setFormData({ machineIds: [], selectAll: false, cashAmount: "", safeDropped: "", reason: "", isShiftClose: false });
      setPayouts([]);
      setImages([]);
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-emerald-500/5 to-transparent min-h-screen p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-800">Open Machine</h2>
            <p className="text-slate-600 mt-2">Record cash withdrawal from gaming machine</p>
          </div>

          <div className="space-y-6">
            {/* Machine Selection */}
            <div>
              <label className="block text-lg font-medium text-slate-900 mb-2">
                Select Machine(s) *
              </label>
              <select
                value=""
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "ALL") {
                    toggleSelectAll();
                  } else if (value) {
                    toggleMachine(value);
                  }
                }}
                className={`w-full text-2xl p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white ${
                  errors.machines ? "border-red-500" : ""
                }`}
              >
                <option value="">Choose machine(s)...</option>
                <option value="ALL">✓ All Machines</option>
                <option disabled>───────────</option>
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {formData.machineIds.includes(machine.id) ? "✓ " : ""}{machine.name}
                  </option>
                ))}
              </select>
              
              {/* Selected Machines Display */}
              {formData.machineIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.selectAll ? (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      All Machines Selected
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ) : (
                    formData.machineIds.map((id) => {
                      const machine = machines.find(m => m.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                        >
                          {machine?.name}
                          <button
                            type="button"
                            onClick={() => toggleMachine(id)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
              )}
              
              {errors.machines && (
                <p className="text-red-500 text-sm mt-2">{errors.machines}</p>
              )}
            </div>

            {/* Cash Amount */}
            <NumberInput
              label="Cash Taken Out ($) *"
              value={formData.cashAmount}
              onChange={(value) => setFormData({ ...formData, cashAmount: value })}
            />
            {errors.cashAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.cashAmount}</p>
            )}

            {/* Safe Dropped Amount */}
            <NumberInput
              label="Safe Dropped Amount ($)"
              value={formData.safeDropped}
              onChange={(value) => setFormData({ ...formData, safeDropped: value })}
            />

            {/* Reason Selection */}
            <div>
              <label className="block text-lg font-medium text-slate-900 mb-2">
                Reason *
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className={`w-full text-2xl p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white ${
                  errors.reason ? "border-red-500" : ""
                }`}
              >
                <option value="">Reason</option>
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
              )}
            </div>

            {/* Shift Close Checkbox */}
            <div className="flex items-center p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <input
                type="checkbox"
                id="shift-close"
                checked={formData.isShiftClose}
                onChange={(e) => setFormData({ ...formData, isShiftClose: e.target.checked })}
                className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
              />
              <label htmlFor="shift-close" className="ml-3 text-lg font-medium text-amber-900 cursor-pointer">
                Is this a shift close?
              </label>
            </div>

            {/* Payout Section */}
            <div className="border-2 border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Payouts</h3>
                <button
                  type="button"
                  onClick={addPayout}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Payout
                </button>
              </div>

              {payouts.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No payouts added yet</p>
              ) : (
                <div className="space-y-4">
                  {payouts.map((payout, index) => (
                    <div key={payout.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-slate-700">Payout #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removePayout(payout.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={payout.amount}
                            onChange={(e) => updatePayout(payout.id, 'amount', Number(e.target.value))}
                            placeholder="0.00"
                            className={`w-full text-lg p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors[`payout_amount_${index}`] ? "border-red-500" : ""
                            }`}
                          />
                          {errors[`payout_amount_${index}`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`payout_amount_${index}`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Payout Note</label>
                          <input
                            type="text"
                            value={payout.note}
                            onChange={(e) => updatePayout(payout.id, 'note', e.target.value)}
                            placeholder="e.g., previous winner, jackpot"
                            className={`w-full text-lg p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors[`payout_note_${index}`] ? "border-red-500" : ""
                            }`}
                          />
                          {errors[`payout_note_${index}`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`payout_note_${index}`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <ImageUpload images={images} setImages={setImages} maxImages={10} />

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white text-xl py-4 rounded-xl transition-all transform ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700 hover:shadow-lg active:scale-95"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-2xl font-bold text-slate-800">Confirm Submission</h3>
                <p className="text-slate-600 mt-1">Are you sure? Is this correct entry?</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Machines */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Machine(s)</h4>
                  <p className="text-lg text-slate-800">
                    {formData.selectAll 
                      ? "All Machines" 
                      : formData.machineIds.map(id => 
                          machines.find(m => m.id === id)?.name
                        ).join(", ")
                    }
                  </p>
                </div>

                {/* Cash Amount */}
                {formData.cashAmount && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Cash Taken Out</h4>
                    <p className="text-2xl font-bold text-green-600">
                      ${Number(formData.cashAmount).toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Safe Dropped */}
                {formData.safeDropped && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Safe Dropped Amount</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      ${Number(formData.safeDropped).toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Reason */}
                {formData.reason && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Reason</h4>
                    <p className="text-lg text-slate-800">{formData.reason}</p>
                  </div>
                )}

                {/* Shift Close */}
                {formData.isShiftClose && (
                  <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-300">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-semibold text-amber-800">Shift Close Entry</p>
                    </div>
                  </div>
                )}

                {/* Payouts */}
                {payouts.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">Payouts ({payouts.length})</h4>
                    <div className="space-y-2">
                      {payouts.map((payout, index) => (
                        <div key={payout.id} className="flex justify-between items-center bg-white rounded p-3 border border-slate-200">
                          <div>
                            <p className="text-sm text-slate-500">Payout #{index + 1}</p>
                            <p className="text-slate-700 font-medium">{payout.note}</p>
                          </div>
                          <p className="text-lg font-bold text-green-600">
                            ${Number(payout.amount).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images */}
                {images.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Images Attached</h4>
                    <p className="text-lg text-slate-800">{images.length} file(s)</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                onClick={confirmAndSubmit}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
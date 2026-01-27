"use client";

import { useState, useEffect } from "react";
import NumberInput from "@/app/components/NumberInput";
import ImageUpload, { ImageFile } from "@/app/components/ImageUpload";

type PayoutEntry = {
  id: string;
  amount: number | "";
  note: string;
};

type MachineReading = {
  machineId: string;
  cashIn: number | "";
  voucherOut: number | "";
  dailyNet: number;
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
  const [machineReadings, setMachineReadings] = useState<MachineReading[]>([]);
  const [shiftCloseTotals, setShiftCloseTotals] = useState({
    totalCashIn: "" as number | "",
    totalVoucherOut: "" as number | "",
  });

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

  // Initialize machine readings when shift close is toggled
  useEffect(() => {
    if (formData.isShiftClose) {
      const readings: MachineReading[] = machines.map(m => ({
        machineId: m.id,
        cashIn: "",
        voucherOut: "",
        dailyNet: 0
      }));
      setMachineReadings(readings);
      setShiftCloseTotals({ totalCashIn: "", totalVoucherOut: "" });
    } else {
      setMachineReadings([]);
      setShiftCloseTotals({ totalCashIn: "", totalVoucherOut: "" });
    }
  }, [formData.isShiftClose]);

  // Calculate daily net for individual machine
  const calculateDailyNet = (cashIn: number | "", voucherOut: number | ""): number => {
    const cash = typeof cashIn === 'number' ? cashIn : 0;
    const voucher = typeof voucherOut === 'number' ? voucherOut : 0;
    return cash - voucher;
  };

  // Update machine reading
  const updateMachineReading = (machineId: string, field: 'cashIn' | 'voucherOut', value: number | "") => {
    setMachineReadings(prev => {
      const updated = prev.map(reading => {
        if (reading.machineId === machineId) {
          const updatedReading = { ...reading, [field]: value };
          updatedReading.dailyNet = calculateDailyNet(updatedReading.cashIn, updatedReading.voucherOut);
          return updatedReading;
        }
        return reading;
      });
      
      // Auto-update totals when machine readings change
      const totalCashIn = updated.reduce((sum, r) => sum + (typeof r.cashIn === 'number' ? r.cashIn : 0), 0);
      const totalVoucherOut = updated.reduce((sum, r) => sum + (typeof r.voucherOut === 'number' ? r.voucherOut : 0), 0);
      setShiftCloseTotals({
        totalCashIn: totalCashIn,
        totalVoucherOut: totalVoucherOut
      });
      
      return updated;
    });
  };

  // Calculate totals
  const getTotalNet = () => {
    const cashIn = typeof shiftCloseTotals.totalCashIn === 'number' ? shiftCloseTotals.totalCashIn : 0;
    const voucherOut = typeof shiftCloseTotals.totalVoucherOut === 'number' ? shiftCloseTotals.totalVoucherOut : 0;
    return cashIn - voucherOut;
  };

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

    // Validate machine readings if shift close
    if (formData.isShiftClose) {
      machineReadings.forEach((reading, index) => {
        if (!reading.cashIn || reading.cashIn <= 0) {
          newErrors[`machine_cashin_${index}`] = "Enter cash in";
        }
        if (!reading.voucherOut || reading.voucherOut < 0) {
          newErrors[`machine_voucherout_${index}`] = "Enter voucher out";
        }
      });
      
      if (!shiftCloseTotals.totalCashIn || shiftCloseTotals.totalCashIn <= 0) {
        newErrors.totalCashIn = "Enter total cash in";
      }
      if (!shiftCloseTotals.totalVoucherOut || shiftCloseTotals.totalVoucherOut < 0) {
        newErrors.totalVoucherOut = "Enter total voucher out";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmAndSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    const payoutsList = payouts.flatMap(p => [
      p.amount.toString(),
      p.note
    ]);

    const totalNet = getTotalNet();

    const submissionData = {
      machineIds: formData.machineIds,
      cashAmount: formData.cashAmount,
      safeDropped: formData.safeDropped || 0,
      reason: formData.reason,
      isShiftClose: formData.isShiftClose,
      payouts: payoutsList,
      timestamp: new Date().toISOString(),
      imageCount: images.length,
      // Include shift close data if applicable
      ...(formData.isShiftClose && {
        machineReadings: machineReadings.map(r => ({
          machineId: r.machineId,
          cashIn: r.cashIn,
          voucherOut: r.voucherOut,
          dailyNet: r.dailyNet
        })),
        totalCashIn: shiftCloseTotals.totalCashIn,
        totalVoucherOut: shiftCloseTotals.totalVoucherOut,
        totalNet: totalNet
      })
    };

    const formDataToSend = new FormData();
    formDataToSend.append("machineIds", JSON.stringify(formData.machineIds));
    formDataToSend.append("cashAmount", formData.cashAmount.toString());
    formDataToSend.append("safeDropped", (formData.safeDropped || 0).toString());
    formDataToSend.append("reason", formData.reason);
    formDataToSend.append("isShiftClose", formData.isShiftClose.toString());
    formDataToSend.append("payouts", JSON.stringify(payoutsList));
    formDataToSend.append("timestamp", submissionData.timestamp);
    
    if (formData.isShiftClose) {
      formDataToSend.append("machineReadings", JSON.stringify(machineReadings));
      formDataToSend.append("totalCashIn", (shiftCloseTotals.totalCashIn || 0).toString());
      formDataToSend.append("totalVoucherOut", (shiftCloseTotals.totalVoucherOut || 0).toString());
      formDataToSend.append("totalNet", totalNet.toString());
    }
    
    images.forEach((img, index) => {
      formDataToSend.append(`image_${index}`, img.file);
    });

    console.log("Form Data to Submit:", submissionData);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Success! Submitted:\n${JSON.stringify(submissionData, null, 2)}`);
      
      setFormData({ machineIds: [], selectAll: false, cashAmount: "", safeDropped: "", reason: "", isShiftClose: false });
      setPayouts([]);
      setImages([]);
      setMachineReadings([]);
      setShiftCloseTotals({ totalCashIn: "", totalVoucherOut: "" });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalNet = getTotalNet();

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
                            min="0"
                            step="0.01"
                            value={payout.amount}
                            onChange={(e) => updatePayout(payout.id, 'amount', e.target.value === "" ? "" : Number(e.target.value))}
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

            {/* Shift Close Checkbox - Moved to bottom */}
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

            {/* Machine Readings - Only shown if shift close */}
            {formData.isShiftClose && (
              <div className="border-2 border-amber-300 rounded-xl p-6 bg-amber-50">
                <h3 className="text-xl font-bold text-amber-900 mb-4">Machine Readings</h3>
                
                <div className="space-y-4">
                  {machineReadings.map((reading, index) => {
                    const machine = machines.find(m => m.id === reading.machineId);
                    return (
                      <div key={reading.machineId} className="bg-white rounded-lg p-4 border-2 border-slate-200">
                        <h4 className="font-semibold text-slate-800 mb-3">{machine?.name}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cash In ($)</label>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="0.01"
                              value={reading.cashIn}
                              onChange={(e) => updateMachineReading(
                                reading.machineId, 
                                'cashIn', 
                                e.target.value === "" ? "" : Number(e.target.value)
                              )}
                              placeholder="0.00"
                              className={`w-full text-lg p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors[`machine_cashin_${index}`] ? "border-red-500" : ""
                              }`}
                            />
                            {errors[`machine_cashin_${index}`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`machine_cashin_${index}`]}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Voucher Out ($)</label>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="0.01"
                              value={reading.voucherOut}
                              onChange={(e) => updateMachineReading(
                                reading.machineId, 
                                'voucherOut', 
                                e.target.value === "" ? "" : Number(e.target.value)
                              )}
                              placeholder="0.00"
                              className={`w-full text-lg p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors[`machine_voucherout_${index}`] ? "border-red-500" : ""
                              }`}
                            />
                            {errors[`machine_voucherout_${index}`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`machine_voucherout_${index}`]}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Daily Net ($)</label>
                            <div className="w-full text-lg p-3 border-2 border-blue-200 rounded-lg bg-blue-50 font-bold text-blue-700">
                              ${reading.dailyNet.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                  <h4 className="text-lg font-bold mb-4">Totals</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-blue-200 text-sm mb-2">Total Cash In ($)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={shiftCloseTotals.totalCashIn}
                        onChange={(e) => setShiftCloseTotals({
                          ...shiftCloseTotals,
                          totalCashIn: e.target.value === "" ? "" : Number(e.target.value)
                        })}
                        placeholder="0.00"
                        className={`w-full text-2xl font-bold p-3 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-300 ${
                          errors.totalCashIn ? "border-2 border-red-500" : ""
                        }`}
                      />
                      {errors.totalCashIn && (
                        <p className="text-red-200 text-xs mt-1">{errors.totalCashIn}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-blue-200 text-sm mb-2">Total Voucher Out ($)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={shiftCloseTotals.totalVoucherOut}
                        onChange={(e) => setShiftCloseTotals({
                          ...shiftCloseTotals,
                          totalVoucherOut: e.target.value === "" ? "" : Number(e.target.value)
                        })}
                        placeholder="0.00"
                        className={`w-full text-2xl font-bold p-3 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-300 ${
                          errors.totalVoucherOut ? "border-2 border-red-500" : ""
                        }`}
                      />
                      {errors.totalVoucherOut && (
                        <p className="text-red-200 text-xs mt-1">{errors.totalVoucherOut}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-2">Total Net</p>
                      <div className="text-3xl font-bold bg-white text-blue-700 rounded-lg p-3">
                        ${totalNet.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

                {formData.cashAmount && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Cash Taken Out</h4>
                    <p className="text-2xl font-bold text-green-600">
                      ${Number(formData.cashAmount).toFixed(2)}
                    </p>
                  </div>
                )}

                {formData.safeDropped && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Safe Dropped Amount</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      ${Number(formData.safeDropped).toFixed(2)}
                    </p>
                  </div>
                )}

                {formData.reason && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Reason</h4>
                    <p className="text-lg text-slate-800">{formData.reason}</p>
                  </div>
                )}

                {formData.isShiftClose && (
                  <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-300">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-semibold text-amber-800">Shift Close Entry</p>
                    </div>
                    <div className="bg-white rounded p-3 mt-2">
                      <p className="text-sm text-slate-600 mb-1">Total Cash In: <span className="font-bold text-green-600">${(shiftCloseTotals.totalCashIn || 0).toFixed(2)}</span></p>
                      <p className="text-sm text-slate-600 mb-1">Total Voucher Out: <span className="font-bold text-blue-600">${(shiftCloseTotals.totalVoucherOut || 0).toFixed(2)}</span></p>
                      <p className="text-sm text-slate-600">Total Net: <span className="font-bold text-slate-800">${totalNet.toFixed(2)}</span></p>
                    </div>
                  </div>
                )}

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
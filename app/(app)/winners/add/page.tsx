"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/app/context/authGuard";
import { WinnerCreatePayload, winnerService } from "@/app/services/winnerService";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { formatNumberInput, parseNumberInput } from "@/app/lib/numberInput";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

type PlanItem = {
  id: string;
  date: string;
  amount: string;
};

type PaymentPlanPayloadItem = {
  date: string;
  amount: string;
  status: string;
};

const DEFAULT_STATUS = "PARTIALLY_PAID";

const newPlanItem = (): PlanItem => ({
  id: `plan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  date: "",
  amount: "",
});

const buildPaymentPlan = (items: PlanItem[]): PaymentPlanPayloadItem[] => {
  return items.map((item) => ({
    date: (item.date ?? "").trim(),
    amount: String(parseNumberInput(item.amount ?? "")),
    status: "SCHEDULED",
  }));
};

const toNumber = (value: string) => {
  const n = parseNumberInput(value);
  return Number.isFinite(n) ? n : 0;
};

export default function AddWinnerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [playerName, setPlayerName] = useState("");
  const [playerContact, setPlayerContact] = useState("");
  const [winningDate, setWinningDate] = useState("");
  const [totalWinAmount, setTotalWinAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [planItems, setPlanItems] = useState<PlanItem[]>([newPlanItem()]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const createWinnerMutation = useMutation({
    mutationFn: winnerService.createWinner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["winners"] });
      router.push("/winners");
    },
    onError: () => {
      setError("Unable to save winner. Try again.");
      setMessage("");
    },
  });

  const onAddPlanItem = () => setPlanItems((prev) => [...prev, newPlanItem()]);

  const onRemovePlanItem = (id: string) =>
    setPlanItems((prev) => {
      const next = prev.filter((p) => p.id !== id);
      return next.length ? next : [newPlanItem()];
    });

  const onUpdatePlanItem = (id: string, patch: Partial<PlanItem>) =>
    setPlanItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const totalWin = toNumber(totalWinAmount);
    const paid = toNumber(amountPaid);

    if (!playerName.trim()) {
      setError("Player name is required.");
      return;
    }

    if (totalWin <= 0) {
      setError("Total win amount must be greater than 0.");
      return;
    }

    if (paid > totalWin) {
      setError("Amount paid cannot exceed total win amount.");
      return;
    }

    if (!playerContact.trim()) {
      setError("Player contact is required.");
      return;
    }

    if (!winningDate) {
      setError("Winning date is required.");
      return;
    }

    const incompletePlan = planItems.some((item) => {
      const hasDate = Boolean(item.date.trim());
      const hasAmount = Boolean(item.amount.trim());
      return (hasDate && !hasAmount) || (!hasDate && hasAmount);
    });
    if (incompletePlan) {
      setError("Complete all payment plan fields or remove the row.");
      return;
    }

    const payload: WinnerCreatePayload = {
      playerName: playerName.trim(),
      playerContact: playerContact.trim(),
      winningDate,
      totalWinAmount: totalWin,
      amountPaid: paid,
      status,
      paymentPlan: buildPaymentPlan(planItems),
    };

    createWinnerMutation.mutate(payload);
  };

  return (
    <AuthGuard allowedRoles={["OWNER", "MANAGER"]}>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Winners", href: "/winners" },
            { label: "Add Winner" },
          ]}
        />

        <Card className="p-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Add Winner</h1>
            <p className="text-sm text-slate-500">
              Log a new winner and schedule their payout plan.
            </p>
          </div>

          {message && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
            <Input
              label="Player Name"
              placeholder="Full name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>PARTIALLY_PAID</option>
                <option>PAID</option>
                <option>UNPAID</option>
                <option>ON_HOLD</option>
              </select>
            </div>

            <Input
              label="Total Win Amount"
              type="text"
              inputMode="decimal"
              placeholder="12500"
              value={totalWinAmount}
              onChange={(e) => setTotalWinAmount(formatNumberInput(e.target.value))}
              required
            />

            <Input
              label="Amount Paid"
              type="text"
              inputMode="decimal"
              placeholder="4000"
              value={amountPaid}
              onChange={(e) => setAmountPaid(formatNumberInput(e.target.value))}
              required
            />

            <Input
              label="Player Contact"
              placeholder="+1-972-555-1234"
              value={playerContact}
              onChange={(e) => setPlayerContact(e.target.value)}
              required
            />

            <Input
              label="Winning Date"
              type="datetime-local"
              value={winningDate}
              onChange={(e) => setWinningDate(e.target.value)}
              required
            />

            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Payment Plan</h3>
                <Button type="button" variant="subtle" size="sm" onClick={onAddPlanItem}>
                  Add Payment
                </Button>
              </div>

              <div className="space-y-3">
                {planItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    {/* Keep payment rows compact to reduce scrolling on mobile. */}
                    <input
                      type="date"
                      className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      value={item.date}
                      onChange={(e) => onUpdatePlanItem(item.id, { date: e.target.value })}
                    />

                    <input
                      type="text"
                      inputMode="decimal"
                      className="h-10 w-40 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) =>
                        onUpdatePlanItem(item.id, {
                          amount: formatNumberInput(e.target.value),
                        })
                      }
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemovePlanItem(item.id)}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" size="lg" disabled={createWinnerMutation.isPending}>
                {createWinnerMutation.isPending ? "Saving..." : "Save Winner"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AuthGuard>
  );
}

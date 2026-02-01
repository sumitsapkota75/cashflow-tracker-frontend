"use client";

import { useMemo } from "react";
import { AuthGuard } from "@/app/context/authGuard";
import { useQuery } from "@tanstack/react-query";
import { WinnerData, winnerService } from "@/app/services/winnerService";
import Link from "next/link";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import Card from "@/app/components/Card";
import Button, { ButtonLink } from "@/app/components/Button";

type WinnerRow = {
  id: string;
  playerName: string;
  totalWinAmount: string;
  amountPaid: string;
  remainingAmount: string;
  status: string;
  createdAt: string;
  createdByUsername: string;
};

const formatMoney = (value: number) => `$${value.toLocaleString("en-US")}`;

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function WinnersPage() {
  const { data: winners = [] } = useQuery({
    queryKey: ["winners"],
    queryFn: winnerService.getWinners,
  });

  const upcomingPlans = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return winners.flatMap((winner) => {
      const plan = winner.paymentPlan ?? [];
      return plan
        .filter((item) => {
          const d = new Date(item.date);
          d.setHours(0, 0, 0, 0);
          return d >= today;
        })
        .map((item) => ({
          id: `${winner.id}-${item.date}-${item.amount}`,
          playerName: winner.playerName,
          date: item.date,
          amount: item.amount,
          status: item.status ?? "SCHEDULED",
        }));
    });
  }, [winners]);

  const upcomingTotal = useMemo(
    () =>
      upcomingPlans.reduce(
        (sum, plan) => sum + (Number(plan.amount) || 0),
        0
      ),
    [upcomingPlans]
  );

  const winnerRows = useMemo<WinnerRow[]>(
    () =>
      winners.map((winner: WinnerData) => ({
        id: winner.id,
        playerName: winner.playerName,
        totalWinAmount: formatMoney(winner.totalWinAmount),
        amountPaid: formatMoney(winner.amountPaid),
        remainingAmount: formatMoney(winner.remainingAmount ?? 0),
        status: winner.status,
        createdAt: winner.createdAt ? formatDateTime(winner.createdAt) : "-",
        createdByUsername: winner.createdByUsername ?? "-",
      })),
    [winners]
  );

  return (
    <AuthGuard allowedRoles={["OWNER", "MANAGER"]}>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "Winners" }]} />

        <Card className="bg-gradient-to-br from-white via-white to-blue-50/70 px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Winners</p>
              <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                Payout plans for high-value winners
              </h1>
              <p className="text-sm text-slate-500">
                Track win totals, remaining balances, and scheduled payouts.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">
                Upcoming total: ${upcomingTotal.toLocaleString("en-US")}
              </div>
              <ButtonLink href="/winners/add">Add Winner</ButtonLink>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Winners Snapshot</h2>
              <p className="text-sm text-slate-500">Current tracked winners and balances.</p>
            </div>
            <Button variant="secondary" size="sm" type="button">
              Export
            </Button>
          </div>

          <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-100 md:block">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Player</span>
              <span>Total Win</span>
              <span>Paid</span>
              <span>Remaining</span>
              <span>Status</span>
              <span>Created</span>
              <span>Added By</span>
            </div>

            <div className="divide-y divide-slate-100">
              {winnerRows.map((winner) => (
                <div
                  key={winner.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-slate-600"
                >
                  <Link
                    className="font-semibold text-slate-800 hover:text-blue-700"
                    href={`/winners/${winner.id}`}
                  >
                    {winner.playerName}
                  </Link>
                  <span>{winner.totalWinAmount}</span>
                  <span>{winner.amountPaid}</span>
                  <span className="font-semibold text-slate-800">{winner.remainingAmount}</span>
                  <span
                    className={`font-semibold ${
                      winner.status === "PAID" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {winner.status}
                  </span>
                  <span>{winner.createdAt}</span>
                  <span>{winner.createdByUsername}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {winnerRows.map((winner) => (
              <div
                key={winner.id}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      className="font-semibold text-slate-800 hover:text-blue-700"
                      href={`/winners/${winner.id}`}
                    >
                      {winner.playerName}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {winner.createdAt} · {winner.createdByUsername}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                    {winner.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    Total Win
                    <div className="text-sm font-semibold text-slate-800">
                      {winner.totalWinAmount}
                    </div>
                  </div>
                  <div>
                    Paid
                    <div className="text-sm font-semibold text-slate-800">
                      {winner.amountPaid}
                    </div>
                  </div>
                  <div>
                    Remaining
                    <div className="text-sm font-semibold text-slate-800">
                      {winner.remainingAmount}
                    </div>
                  </div>
                  <div>
                    Status
                    <div className="text-sm font-semibold text-slate-800">
                      {winner.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AuthGuard>
  );
}

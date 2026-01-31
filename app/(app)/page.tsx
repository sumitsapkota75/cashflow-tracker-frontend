import { AuthGuard } from "../context/authGuard";
import Breadcrumbs from "../components/Breadcrumbs";
import Card from "../components/Card";
import { ButtonLink } from "../components/Button";

export default function Dashboard() {
  return (
    <AuthGuard>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Dashboard" }]} />

        <Card className="px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                Operations Overview
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                Daily money movement at a glance.
              </h1>
              <p className="max-w-2xl text-sm text-slate-500">
                Track cash-in, safe drops, and payout ratios across every location
                without digging through raw reports.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/period" variant="secondary">
                Manage Period
              </ButtonLink>
              <ButtonLink href="/machines/open">New Machine Entry</ButtonLink>
            </div>
          </div>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Cash In (30d)",
              value: "$182,640",
              delta: "+12.4%",
            },
            {
              label: "Net Profit (Last 7d)",
              value: "$38,920",
              delta: "+4.2%",
            },
            {
              label: "Safe Drop (Month)",
              value: "$61,300",
              delta: "-2.1%",
            },
            {
              label: "Payout Ratio",
              value: "63%",
              delta: "Target 60%",
            },
          ].map((card) => (
            <Card key={card.label} className="px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {card.label}
              </p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-2xl font-semibold text-slate-900">
                  {card.value}
                </p>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                  {card.delta}
                </span>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/3 rounded-full bg-blue-600/80" />
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Cash In Ratio Over Time
                </h2>
                <p className="text-sm text-slate-500">
                  Weekly trend from all locations.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Cash In
                <span className="ml-3 h-2 w-2 rounded-full bg-slate-300" />
                Payouts
              </div>
            </div>
            <div className="mt-6 grid grid-cols-12 items-end gap-2">
              {[72, 88, 65, 78, 92, 70, 84, 90, 76, 88, 95, 80].map(
                (height, index) => (
                  <div key={`cash-${index}`} className="space-y-1">
                    <div
                      className="rounded-lg bg-blue-600"
                      style={{ height: `${height}px` }}
                    />
                    <div
                      className="rounded-lg bg-slate-200"
                      style={{ height: `${Math.max(30, height - 40)}px` }}
                    />
                  </div>
                )
              )}
            </div>
            <div className="mt-4 flex justify-between text-xs text-slate-400">
              <span>Week 1</span>
              <span>Week 4</span>
              <span>Week 8</span>
              <span>Week 12</span>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Location Pulse
            </h2>
            <p className="text-sm text-slate-500">
              Snapshot of top-performing sites.
            </p>
            <div className="mt-6 space-y-4">
              {[
                { name: "Akshiv", value: "$24.1k", trend: "Up 9%" },
                { name: "Loop", value: "$18.7k", trend: "Up 4%" },
                { name: "Downtown Hub", value: "$15.3k", trend: "Down 2%" },
              ].map((location) => (
                <div
                  key={location.name}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {location.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {location.value} cash in
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                      {location.trend}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white">
                    <div className="h-full w-3/4 rounded-full bg-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Upcoming Safe Drops
            </h2>
            <p className="text-sm text-slate-500">
              Scheduled pickups across the network.
            </p>
            <div className="mt-4 divide-y divide-slate-100">
              {[
                {
                  site: "Akshiv",
                  date: "Today, 4:30 PM",
                  amount: "$6,300",
                },
                {
                  site: "Loop",
                  date: "Tomorrow, 10:00 AM",
                  amount: "$4,120",
                },
                {
                  site: "Downtown Hub",
                  date: "Fri, 2:15 PM",
                  amount: "$5,760",
                },
              ].map((drop) => (
                <div
                  key={drop.site}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-800">{drop.site}</p>
                    <p className="text-xs text-slate-500">{drop.date}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {drop.amount}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Notes for Shift
            </h2>
            <p className="text-sm text-slate-500">Alerts and next actions.</p>
            <div className="mt-4 space-y-3 text-sm">
              {[
                "Vault count reconciliation due Thursday.",
                "Two machines reporting low cash-in variance.",
                "Review payout spike at Downtown Hub.",
              ].map((note) => (
                <div
                  key={note}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-slate-600"
                >
                  {note}
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </AuthGuard>
  );
}

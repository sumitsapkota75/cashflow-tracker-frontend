export default function Dashboard() {
  return (
    <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-emerald-500">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Total Machines</h3>
        <p className="text-3xl font-bold text-emerald-600">24</p>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-cyan-500">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Active Today</h3>
        <p className="text-3xl font-bold text-cyan-600">18</p>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Total Revenue</h3>
        <p className="text-3xl font-bold text-blue-600">$4,523</p>
      </div>
    </div>
  </div>
  );
}

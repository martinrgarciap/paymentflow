export default function Navbar() {
  return (
    <nav className="bg-[#1e3a5f] text-white px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-sm">
            P
          </div>
          PaymentFlow
        </div>
        <div className="flex gap-6 text-sm">
          <button className="border-b-2 border-blue-400 pb-1 font-medium">
            Dashboard
          </button>
          <button className="text-gray-300 hover:text-white">
            Transactions
          </button>
          <button className="text-gray-300 hover:text-white">Audit Log</button>
        </div>
      </div>
      <div className="text-sm text-gray-300">Admin User ▾</div>
    </nav>
  );
}

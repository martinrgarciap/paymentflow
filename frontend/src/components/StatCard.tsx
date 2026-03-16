interface StatCardProps {
  label: string;
  value: number;
  iconBg: string;
  icon: string;
}

export default function StatCard({
  label,
  value,
  iconBg,
  icon,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4 flex-1">
      <div
        className={`${iconBg} text-white w-12 h-12 rounded-lg flex items-center justify-center text-xl`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

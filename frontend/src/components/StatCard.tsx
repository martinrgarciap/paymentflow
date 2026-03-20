interface StatCardProps {
  label: string;
  value: number;
  iconBg?: string;
  icon: string;
  colorFrom: string;
  colorTo: string;
  textColor: string;
  borderColor: string;
  active?: boolean;
  onClick?: () => void;
  flaggedCount?: number;
  onFlaggedClick?: () => void;
}

const FlagButton = ({
  label,
  flaggedCount,
  active,
  onClick,
}: {
  label: String;
  flaggedCount?: number;
  active?: boolean;
  onClick?: () => void;
}) => (
  <div className="mt-3">
    <p
      className={`text-s font-semibold uppercase tracking-wide transition-colors duration-200 ${active ? "text-white/80" : "text-gray-400"}`}
    >
      {label}
    </p>
    {flaggedCount !== undefined && flaggedCount > 0 && (
      <div className="flex justify-end mt-1">
        <span
          className={
            "text-xs font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 bg-red-100 text-red-500"
          }
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          ⚑ {flaggedCount}
        </span>
      </div>
    )}
  </div>
);

export default function StatCard({
  label,
  value,
  icon,
  colorFrom,
  colorTo,
  borderColor,
  active,
  onClick,
  flaggedCount,
  onFlaggedClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative flex-1 rounded-xl cursor-pointer overflow-hidden
        transition-all duration-200 ease-out select-none
        ${
          active
            ? `shadow-lg scale-[1.03] ring-2 ${borderColor}`
            : "shadow-sm hover:shadow-md hover:scale-[1.01] ring-1 ring-gray-200"
        }`}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}
        style={{
          background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
        }}
      />
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-200 ${active ? "opacity-0" : "opacity-100"}`}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl transition-opacity duration-200"
        style={{
          background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
          opacity: active ? 0 : 1,
        }}
      />

      <div className="relative px-2 py-4 hidden md:block">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200"
            style={{
              background: active ? "rgba(255,255,255,0.25)" : `${colorFrom}22`,
              color: active ? "white" : colorFrom,
            }}
          >
            {icon}
          </div>
          <div
            className={`text-3xl font-black tracking-tight transition-colors duration-200 ${active ? "text-white" : "text-gray-800"}`}
          >
            {value}
          </div>
        </div>
        <FlagButton
          label={label}
          flaggedCount={flaggedCount}
          active={active}
          onClick={onFlaggedClick}
        />
      </div>

      <div className="relative px-3 py-3 md:hidden">
        <div className="flex items-center justify-between mb-1.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-200"
            style={{
              background: active ? "rgba(255,255,255,0.25)" : `${colorFrom}22`,
              color: active ? "white" : colorFrom,
            }}
          >
            {icon}
          </div>
          <div
            className={`text-3xl font-black tracking-tight transition-colors duration-200 ${active ? "text-white" : "text-gray-800"}`}
          >
            {value}
          </div>
        </div>
        <FlagButton
          label={label}
          flaggedCount={flaggedCount}
          active={active}
          onClick={onFlaggedClick}
        />
      </div>
    </div>
  );
}

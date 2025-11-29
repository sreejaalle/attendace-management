const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    yellow: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  const bgClasses = {
    blue: 'bg-blue-500/10',
    green: 'bg-emerald-500/10',
    yellow: 'bg-amber-500/10',
    red: 'bg-red-500/10',
    purple: 'bg-purple-500/10',
    orange: 'bg-orange-500/10',
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <span>{trend > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% from last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${bgClasses[color]}`}>
            <Icon className={`w-6 h-6 bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`} style={{ color: color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'yellow' ? '#f59e0b' : color === 'red' ? '#ef4444' : color === 'purple' ? '#a855f7' : '#f97316' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

import { useEffect } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import useDashboardStore from '../../redux/dashboardStore';
import useAttendanceStore from '../../redux/attendanceStore';
import useAuthStore from '../../redux/authStore';
import { formatTime, formatDate, getStatusBadgeClass } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
  const { user } = useAuthStore();
  const { employeeStats, getEmployeeDashboard, isLoading } = useDashboardStore();
  const { checkIn, checkOut } = useAttendanceStore();

  useEffect(() => {
    getEmployeeDashboard();
  }, []);

  const handleCheckIn = async () => {
    const result = await checkIn();
    if (result.success) {
      toast.success('Checked in successfully!');
      getEmployeeDashboard();
    } else {
      toast.error(result.message);
    }
  };

  const handleCheckOut = async () => {
    const result = await checkOut();
    if (result.success) {
      toast.success('Checked out successfully!');
      getEmployeeDashboard();
    } else {
      toast.error(result.message);
    }
  };

  if (isLoading || !employeeStats) {
    return (
      <Layout>
        <Loading text="Loading dashboard..." />
      </Layout>
    );
  }

  const { today, thisMonth, recentAttendance } = employeeStats;

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-slate-400 mt-1">{formatDate(new Date())}</p>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex gap-3">
            {today.status === 'not-checked-in' || !today.checkInTime ? (
              <button
                onClick={handleCheckIn}
                className="px-6 py-3 rounded-xl font-semibold text-white gradient-success hover:opacity-90 transition-all flex items-center gap-2"
              >
                <FiCheckCircle className="w-5 h-5" />
                Check In
              </button>
            ) : !today.checkOutTime ? (
              <button
                onClick={handleCheckOut}
                className="px-6 py-3 rounded-xl font-semibold text-white gradient-danger hover:opacity-90 transition-all flex items-center gap-2"
              >
                <FiXCircle className="w-5 h-5" />
                Check Out
              </button>
            ) : (
              <div className="px-6 py-3 rounded-xl bg-slate-700 text-slate-300 font-medium">
                Day Complete ✓
              </div>
            )}
          </div>
        </div>

        {/* Today's Status Card */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-slate-400 text-sm font-medium">Today's Status</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className={`w-3 h-3 rounded-full ${today.checkInTime ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                <span className="text-xl font-semibold text-white">
                  {today.checkInTime ? 'Checked In' : 'Not Checked In'}
                </span>
              </div>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-slate-400 text-sm">Check In</p>
                <p className="text-white font-semibold">{formatTime(today.checkInTime)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Check Out</p>
                <p className="text-white font-semibold">{formatTime(today.checkOutTime)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Hours Worked</p>
                <p className="text-white font-semibold">{today.totalHours || 0}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Present Days"
            value={thisMonth.present}
            subtitle="This month"
            icon={FiCheckCircle}
            color="green"
          />
          <StatCard
            title="Absent Days"
            value={thisMonth.absent}
            subtitle="This month"
            icon={FiXCircle}
            color="red"
          />
          <StatCard
            title="Late Arrivals"
            value={thisMonth.late}
            subtitle="This month"
            icon={FiAlertCircle}
            color="yellow"
          />
          <StatCard
            title="Total Hours"
            value={`${thisMonth.totalHours}h`}
            subtitle="This month"
            icon={FiTrendingUp}
            color="blue"
          />
        </div>

        {/* Recent Attendance */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-display font-semibold text-lg text-white mb-4">
            Recent Attendance (Last 7 Days)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Check In</th>
                  <th className="pb-3 font-medium">Check Out</th>
                  <th className="pb-3 font-medium">Hours</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((record, index) => (
                    <tr key={index} className="border-b border-slate-700/50 last:border-0">
                      <td className="py-3">{formatDate(record.date)}</td>
                      <td className="py-3">{formatTime(record.checkInTime)}</td>
                      <td className="py-3">{formatTime(record.checkOutTime)}</td>
                      <td className="py-3">{record.totalHours || 0}h</td>
                      <td className="py-3">
                        <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;

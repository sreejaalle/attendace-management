import { useEffect, useState } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiMapPin } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/common/Loading';
import useAttendanceStore from '../../redux/attendanceStore';
import useDashboardStore from '../../redux/dashboardStore';
import { formatTime, formatDate } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';

const MarkAttendance = () => {
  const { todayStatus, getTodayStatus, checkIn, checkOut, isLoading } = useAttendanceStore();
  const { getEmployeeDashboard } = useDashboardStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    getTodayStatus();
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  const isCheckedIn = todayStatus?.checkInTime;
  const isCheckedOut = todayStatus?.checkOutTime;

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Mark Attendance</h1>
          <p className="text-slate-400 mt-1">Check in and out for today</p>
        </div>

        {/* Current Time Display */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/50 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
            <FiMapPin className="w-4 h-4" />
            <span>{formatDate(new Date())}</span>
          </div>
          
          <div className="font-display text-7xl font-bold text-white tracking-wider">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit',
              hour12: true 
            })}
          </div>
          
          <p className="text-slate-400 mt-4">
            Standard Working Hours: 9:00 AM - 6:00 PM
          </p>
        </div>

        {/* Attendance Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check In Card */}
          <div className={`rounded-2xl p-6 border ${isCheckedIn ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-xl ${isCheckedIn ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                <FiCheckCircle className={`w-8 h-8 ${isCheckedIn ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-white">Check In</h3>
                <p className="text-slate-400 text-sm">Mark your arrival</p>
              </div>
            </div>

            {isCheckedIn ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400">Checked in at</span>
                  <span className="font-semibold text-emerald-400">{formatTime(todayStatus.checkInTime)}</span>
                </div>
                <div className="text-center text-emerald-400 font-medium">
                  ✓ Already checked in for today
                </div>
              </div>
            ) : (
              <button
                onClick={handleCheckIn}
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-semibold text-white gradient-success hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    <FiCheckCircle className="w-5 h-5" />
                    Check In Now
                  </>
                )}
              </button>
            )}
          </div>

          {/* Check Out Card */}
          <div className={`rounded-2xl p-6 border ${isCheckedOut ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-xl ${isCheckedOut ? 'bg-blue-500/20' : 'bg-slate-700'}`}>
                <FiXCircle className={`w-8 h-8 ${isCheckedOut ? 'text-blue-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-white">Check Out</h3>
                <p className="text-slate-400 text-sm">Mark your departure</p>
              </div>
            </div>

            {isCheckedOut ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400">Checked out at</span>
                  <span className="font-semibold text-blue-400">{formatTime(todayStatus.checkOutTime)}</span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400">Total hours worked</span>
                  <span className="font-semibold text-white">{todayStatus.totalHours || 0}h</span>
                </div>
                <div className="text-center text-blue-400 font-medium">
                  ✓ Day completed
                </div>
              </div>
            ) : !isCheckedIn ? (
              <div className="py-4 text-center text-slate-500">
                Please check in first before checking out
              </div>
            ) : (
              <button
                onClick={handleCheckOut}
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-semibold text-white gradient-danger hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    <FiXCircle className="w-5 h-5" />
                    Check Out Now
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status Summary */}
        {todayStatus && todayStatus.status !== 'not-checked-in' && (
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h3 className="font-display font-semibold text-lg text-white mb-4">Today's Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-slate-400 text-sm">Status</p>
                <p className="text-white font-semibold capitalize mt-1">{todayStatus.status}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-slate-400 text-sm">Check In</p>
                <p className="text-white font-semibold mt-1">{formatTime(todayStatus.checkInTime)}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-slate-400 text-sm">Check Out</p>
                <p className="text-white font-semibold mt-1">{formatTime(todayStatus.checkOutTime)}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-slate-400 text-sm">Hours Worked</p>
                <p className="text-white font-semibold mt-1">{todayStatus.totalHours || 0}h</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MarkAttendance;

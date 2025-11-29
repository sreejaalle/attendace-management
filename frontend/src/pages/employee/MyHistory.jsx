import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiFilter } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Calendar from '../../components/common/Calendar';
import Loading from '../../components/common/Loading';
import useAttendanceStore from '../../redux/attendanceStore';
import { formatDate, formatTime, getStatusBadgeClass, getCurrentMonthYear, getMonthName } from '../../utils/dateHelpers';

const MyHistory = () => {
  const { myHistory, mySummary, getMyHistory, getMySummary, isLoading } = useAttendanceStore();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);

  useEffect(() => {
    getMyHistory(filterMonth, filterYear);
    getMySummary(filterMonth, filterYear);
  }, [filterMonth, filterYear]);

  const handleDateClick = (date, attendance) => {
    setSelectedDate(date);
    setSelectedRecord(attendance);
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [currentYear - 1, currentYear, currentYear + 1];

  if (isLoading) {
    return (
      <Layout>
        <Loading text="Loading attendance history..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">My Attendance History</h1>
            <p className="text-slate-400 mt-1">View your attendance records</p>
          </div>
          
          {/* View Toggle & Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex rounded-lg bg-slate-800 p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FiCalendar className="inline w-4 h-4 mr-2" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FiClock className="inline w-4 h-4 mr-2" />
                Table
              </button>
            </div>
            
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              {months.map((m) => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
            
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Monthly Summary */}
        {mySummary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-slate-400 text-sm">Total Days</p>
              <p className="text-2xl font-bold text-white mt-1">{mySummary.totalDays}</p>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
              <p className="text-emerald-400 text-sm">Present</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{mySummary.present}</p>
            </div>
            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
              <p className="text-red-400 text-sm">Absent</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{mySummary.absent}</p>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
              <p className="text-amber-400 text-sm">Late</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{mySummary.late}</p>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
              <p className="text-blue-400 text-sm">Total Hours</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{mySummary.totalHours}h</p>
            </div>
          </div>
        )}

        {/* Calendar or Table View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {viewMode === 'calendar' ? (
            <>
              <div className="lg:col-span-2">
                <Calendar 
                  attendanceData={myHistory} 
                  onDateClick={handleDateClick}
                  selectedDate={selectedDate}
                />
              </div>
              
              {/* Selected Date Details */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="font-display font-semibold text-lg text-white mb-4">
                  {selectedDate ? formatDate(selectedDate) : 'Select a date'}
                </h3>
                
                {selectedRecord ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-700/30 rounded-xl">
                      <span className="text-slate-400">Status</span>
                      <span className={`badge ${getStatusBadgeClass(selectedRecord.status)}`}>
                        {selectedRecord.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-700/30 rounded-xl">
                      <span className="text-slate-400">Check In</span>
                      <span className="text-white font-medium">{formatTime(selectedRecord.checkInTime)}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-700/30 rounded-xl">
                      <span className="text-slate-400">Check Out</span>
                      <span className="text-white font-medium">{formatTime(selectedRecord.checkOutTime)}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-700/30 rounded-xl">
                      <span className="text-slate-400">Hours Worked</span>
                      <span className="text-white font-medium">{selectedRecord.totalHours || 0}h</span>
                    </div>
                  </div>
                ) : selectedDate ? (
                  <p className="text-slate-500 text-center py-8">No attendance record for this date</p>
                ) : (
                  <p className="text-slate-500 text-center py-8">Click on a date to view details</p>
                )}
              </div>
            </>
          ) : (
            <div className="lg:col-span-3 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
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
                    {myHistory.length > 0 ? (
                      myHistory.map((record, index) => (
                        <tr key={index} className="border-b border-slate-700/50 last:border-0">
                          <td className="py-4">{formatDate(record.date)}</td>
                          <td className="py-4">{formatTime(record.checkInTime)}</td>
                          <td className="py-4">{formatTime(record.checkOutTime)}</td>
                          <td className="py-4">{record.totalHours || 0}h</td>
                          <td className="py-4">
                            <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          No attendance records found for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyHistory;

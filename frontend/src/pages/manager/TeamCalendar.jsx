import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiUsers } from 'react-icons/fi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/common/Loading';
import useAttendanceStore from '../../redux/attendanceStore';
import useDashboardStore from '../../redux/dashboardStore';
import { getMonthName, getStatusColor } from '../../utils/dateHelpers';

const TeamCalendar = () => {
  const { allAttendance, getAllAttendance, isLoading } = useAttendanceStore();
  const { employees, getAllEmployees } = useDashboardStore();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    getAllEmployees();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [currentMonth, currentYear, selectedEmployee]);

  const loadAttendance = () => {
    const params = {};
    if (selectedEmployee) params.employeeId = selectedEmployee;
    getAllAttendance(params);
  };

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(new Date(currentYear, currentMonth - 1)),
    end: endOfMonth(new Date(currentYear, currentMonth - 1))
  });

  const firstDayOfMonth = startOfMonth(new Date(currentYear, currentMonth - 1)).getDay();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getAttendanceForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allAttendance.filter(a => {
      const aDate = new Date(a.date);
      return format(aDate, 'yyyy-MM-dd') === dateStr;
    });
  };

  const getStatusSummary = (records) => {
    return {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length
    };
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Team Calendar</h1>
            <p className="text-slate-400 mt-1">View team attendance in calendar format</p>
          </div>
          
          {/* Employee Filter */}
          <div className="flex items-center gap-3">
            <FiUsers className="w-5 h-5 text-slate-400" />
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white min-w-[200px]"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.employeeId}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="font-display font-semibold text-2xl text-white">
              {getMonthName(currentMonth)} {currentYear}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-6 mb-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500"></div>
              <span className="text-slate-400 text-sm">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-slate-400 text-sm">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span className="text-slate-400 text-sm">Late</span>
            </div>
          </div>

          {isLoading ? (
            <Loading text="Loading calendar data..." />
          ) : (
            <>
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-slate-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before the first day of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {/* Actual days */}
                {days.map((day) => {
                  const records = getAttendanceForDate(day);
                  const summary = getStatusSummary(records);
                  const isWeekendDay = isWeekend(day);
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        aspect-square rounded-xl p-2 flex flex-col
                        ${isWeekendDay ? 'bg-slate-800/30' : 'bg-slate-700/30'}
                        ${isToday ? 'ring-2 ring-blue-500' : ''}
                      `}
                    >
                      <span className={`text-sm font-medium ${isWeekendDay ? 'text-slate-600' : 'text-white'}`}>
                        {format(day, 'd')}
                      </span>
                      
                      {!isWeekendDay && records.length > 0 && (
                        <div className="flex-1 flex flex-col justify-end gap-1">
                          {summary.present > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-xs text-emerald-400">{summary.present}</span>
                            </div>
                          )}
                          {summary.late > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                              <span className="text-xs text-amber-400">{summary.late}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30 text-center">
            <p className="text-3xl font-bold text-emerald-400">
              {allAttendance.filter(a => a.status === 'present').length}
            </p>
            <p className="text-sm text-emerald-400 mt-1">Total Present</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 text-center">
            <p className="text-3xl font-bold text-red-400">
              {allAttendance.filter(a => a.status === 'absent').length}
            </p>
            <p className="text-sm text-red-400 mt-1">Total Absent</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 text-center">
            <p className="text-3xl font-bold text-amber-400">
              {allAttendance.filter(a => a.status === 'late').length}
            </p>
            <p className="text-sm text-amber-400 mt-1">Total Late</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30 text-center">
            <p className="text-3xl font-bold text-blue-400">
              {allAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0).toFixed(0)}h
            </p>
            <p className="text-sm text-blue-400 mt-1">Total Hours</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeamCalendar;

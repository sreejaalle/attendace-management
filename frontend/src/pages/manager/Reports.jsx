import { useEffect, useState } from 'react';
import { FiDownload, FiFilter, FiFileText } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/common/Loading';
import useAttendanceStore from '../../redux/attendanceStore';
import useDashboardStore from '../../redux/dashboardStore';
import { formatDate, formatTime, getStatusBadgeClass } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';

const Reports = () => {
  const { allAttendance, getAllAttendance, exportAttendance, isLoading } = useAttendanceStore();
  const { employees, getAllEmployees } = useDashboardStore();
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
    department: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

  useEffect(() => {
    getAllEmployees();
    getAllAttendance({});
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGenerateReport = () => {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.employeeId) params.employeeId = filters.employeeId;
    if (filters.department) params.department = filters.department;
    getAllAttendance(params);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const result = await exportAttendance(filters);
    setIsExporting(false);
    
    if (result.success) {
      toast.success('Report exported successfully!');
    } else {
      toast.error('Failed to export report');
    }
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      employeeId: '',
      department: ''
    });
    getAllAttendance({});
  };

  // Calculate summary stats from current data
  const summary = {
    totalRecords: allAttendance.length,
    present: allAttendance.filter(a => a.status === 'present').length,
    absent: allAttendance.filter(a => a.status === 'absent').length,
    late: allAttendance.filter(a => a.status === 'late').length,
    halfDay: allAttendance.filter(a => a.status === 'half-day').length,
    totalHours: allAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0).toFixed(2)
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Reports</h1>
            <p className="text-slate-400 mt-1">Generate and export attendance reports</p>
          </div>
          
          <button
            onClick={handleExport}
            disabled={isExporting || allAttendance.length === 0}
            className="px-6 py-3 rounded-xl font-semibold text-white gradient-primary hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              'Exporting...'
            ) : (
              <>
                <FiDownload className="w-5 h-5" />
                Export to CSV
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-white">Report Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Employee</label>
              <select
                name="employeeId"
                value={filters.employeeId}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 rounded-lg font-medium text-white gradient-primary hover:opacity-90 transition-all flex items-center gap-2"
            >
              <FiFileText className="w-4 h-4" />
              Generate Report
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
            <p className="text-2xl font-bold text-white">{summary.totalRecords}</p>
            <p className="text-sm text-slate-400 mt-1">Total Records</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30 text-center">
            <p className="text-2xl font-bold text-emerald-400">{summary.present}</p>
            <p className="text-sm text-emerald-400 mt-1">Present</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 text-center">
            <p className="text-2xl font-bold text-red-400">{summary.absent}</p>
            <p className="text-sm text-red-400 mt-1">Absent</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 text-center">
            <p className="text-2xl font-bold text-amber-400">{summary.late}</p>
            <p className="text-sm text-amber-400 mt-1">Late</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30 text-center">
            <p className="text-2xl font-bold text-orange-400">{summary.halfDay}</p>
            <p className="text-sm text-orange-400 mt-1">Half Day</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30 text-center">
            <p className="text-2xl font-bold text-blue-400">{summary.totalHours}h</p>
            <p className="text-sm text-blue-400 mt-1">Total Hours</p>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">
            Report Data ({allAttendance.length} records)
          </h3>
          
          {isLoading ? (
            <Loading text="Loading report data..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                    <th className="pb-3 font-medium">Employee ID</th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Department</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Check In</th>
                    <th className="pb-3 font-medium">Check Out</th>
                    <th className="pb-3 font-medium">Hours</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {allAttendance.length > 0 ? (
                    allAttendance.map((record, index) => (
                      <tr key={index} className="border-b border-slate-700/50 last:border-0">
                        <td className="py-3 text-sm">{record.userId?.employeeId}</td>
                        <td className="py-3">{record.userId?.name}</td>
                        <td className="py-3 text-sm">{record.userId?.department}</td>
                        <td className="py-3 text-sm">{formatDate(record.date)}</td>
                        <td className="py-3 text-sm">{formatTime(record.checkInTime)}</td>
                        <td className="py-3 text-sm">{formatTime(record.checkOutTime)}</td>
                        <td className="py-3 text-sm">{record.totalHours || 0}h</td>
                        <td className="py-3">
                          <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-500">
                        No records found. Try adjusting your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;

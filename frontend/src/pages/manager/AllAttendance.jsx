import { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/common/Loading';
import useAttendanceStore from '../../redux/attendanceStore';
import useDashboardStore from '../../redux/dashboardStore';
import { formatDate, formatTime, getStatusBadgeClass } from '../../utils/dateHelpers';

const AllAttendance = () => {
  const { allAttendance, getAllAttendance, isLoading } = useAttendanceStore();
  const { employees, getAllEmployees } = useDashboardStore();
  
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    employeeId: '',
    department: ''
  });

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  const statuses = ['present', 'absent', 'late', 'half-day'];

  useEffect(() => {
    getAllEmployees();
    loadAttendance();
  }, []);

  const loadAttendance = () => {
    const params = {};
    if (filters.date) params.date = filters.date;
    if (filters.status) params.status = filters.status;
    if (filters.employeeId) params.employeeId = filters.employeeId;
    if (filters.department) params.department = filters.department;
    getAllAttendance(params);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadAttendance();
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      status: '',
      employeeId: '',
      department: ''
    });
    getAllAttendance({});
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-white">All Employees Attendance</h1>
          <p className="text-slate-400 mt-1">View and filter attendance records</p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-white">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status} className="capitalize">{status}</option>
                ))}
              </select>
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
              type="submit"
              className="px-4 py-2 rounded-lg font-medium text-white gradient-primary hover:opacity-90 transition-all flex items-center gap-2"
            >
              <FiSearch className="w-4 h-4" />
              Search
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </form>

        {/* Results Table */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          {isLoading ? (
            <Loading text="Loading attendance records..." />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">
                  Attendance Records ({allAttendance.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                      <th className="pb-3 font-medium">Employee</th>
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
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-sm">
                                {record.userId?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-white">{record.userId?.name}</p>
                                <p className="text-xs text-slate-500">{record.userId?.employeeId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">{record.userId?.department}</td>
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
                        <td colSpan="7" className="py-8 text-center text-slate-500">
                          No attendance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AllAttendance;

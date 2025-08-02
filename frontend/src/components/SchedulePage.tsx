import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { scheduleAPI, studentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen,
  Users,
  AlertCircle
} from 'lucide-react';

interface Schedule {
  id: number;
  subject: string;
  day: string;
  start_time: string;
  end_time: string;
  location: string;
  student_id?: number;
  student_name?: string;
  notes?: string;
  created_at: string;
}

interface Student {
  id: number;
  name: string;
  grade: string;
}

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [scheduleForm, setScheduleForm] = useState({
    subject: '',
    day: '',
    start_time: '',
    end_time: '',
    location: '',
    student_id: '',
    notes: ''
  });

  

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Art', 
    'Physical Education', 'Computer Science', 'Geography'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching schedule data...');
      
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      // Fetch schedule data
      console.log('Making API call to fetch schedule...');
      const scheduleResponse = await scheduleAPI.getAll();
      console.log('Schedule API response:', scheduleResponse);
      
      setSchedule(scheduleResponse.data || []);
      
      // Fetch students if teacher
      if (isTeacher) {
        console.log('Fetching students for teacher...');
        const studentsResponse = await studentAPI.getAll();
        console.log('Students API response:', studentsResponse);
        setStudents(studentsResponse.data || []);
      }
      
      console.log('Data fetched successfully');
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check if the server is running.');
      } else {
        toast.error('Failed to fetch schedule data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const { subject, day, start_time, end_time, location } = scheduleForm;
    
    console.log('Validating form:', scheduleForm);
    
    if (!subject.trim()) {
      toast.error('Please select a subject');
      return false;
    }
    
    if (!day.trim()) {
      toast.error('Please select a day');
      return false;
    }
    
    if (!start_time.trim()) {
      toast.error('Please enter start time');
      return false;
    }
    
    if (!end_time.trim()) {
      toast.error('Please enter end time');
      return false;
    }
    
    if (!location.trim()) {
      toast.error('Please enter location');
      return false;
    }

    // Validate day
    if (!days.includes(day)) {
      toast.error('Invalid day selected');
      return false;
    }

    // Validate that end time is after start time
    const startMinutes = parseInt(start_time.split(':')[0]) * 60 + parseInt(start_time.split(':')[1]);
    const endMinutes = parseInt(end_time.split(':')[0]) * 60 + parseInt(end_time.split(':')[1]);
    
    if (endMinutes <= startMinutes) {
      toast.error('End time must be after start time');
      return false;
    }

    console.log('Form validation passed');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted:', scheduleForm);
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = {
        subject: scheduleForm.subject.trim(),
        day: scheduleForm.day.trim(),
        start_time: scheduleForm.start_time.trim(),
        end_time: scheduleForm.end_time.trim(),
        location: scheduleForm.location.trim(),
        student_id: scheduleForm.student_id ? parseInt(scheduleForm.student_id) : null,
        notes: scheduleForm.notes.trim()
      };

      console.log('Submitting data:', submitData);

      if (editingSchedule) {
        console.log('Updating schedule with ID:', editingSchedule.id);
        await scheduleAPI.update(editingSchedule.id, submitData);
        toast.success('Schedule updated successfully');
      } else {
        console.log('Creating new schedule...');
        const response = await scheduleAPI.create(submitData);
        console.log('Create response:', response);
        toast.success('Schedule created successfully');
      }
      
      // Reset form and close modal
      handleCancel();
      
      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || 'Invalid data provided';
        toast.error(`Failed to save schedule: ${errorMessage}`);
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check if the server is running.');
      } else {
        toast.error('Failed to save schedule. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (scheduleItem: Schedule) => {
    setEditingSchedule(scheduleItem);
    setScheduleForm({
      subject: scheduleItem.subject,
      day: scheduleItem.day,
      start_time: scheduleItem.start_time,
      end_time: scheduleItem.end_time,
      location: scheduleItem.location,
      student_id: scheduleItem.student_id ? scheduleItem.student_id.toString() : '',
      notes: scheduleItem.notes || ''
    });
    setShowAddSchedule(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this schedule item?')) {
      try {
        console.log('Deleting schedule with ID:', id);
        await scheduleAPI.delete(id);
        toast.success('Schedule deleted successfully');
        await fetchData();
      } catch (error: any) {
        console.error('Error deleting schedule:', error);
        toast.error('Failed to delete schedule');
      }
    }
  };

  const handleCancel = () => {
    setShowAddSchedule(false);
    setEditingSchedule(null);
    setScheduleForm({ 
      subject: '', 
      day: '', 
      start_time: '', 
      end_time: '', 
      location: '', 
      student_id: '', 
      notes: '' 
    });
  };

  const groupScheduleByDay = () => {
    return days.map(day => ({
      day,
      items: schedule.filter(item => item.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time))
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isTeacher ? 'Class Schedule Management' : 'Class Schedule'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isTeacher ? 'Manage class schedules and assign them to specific students' : 'View your class schedule'}
          </p>
        </div>
        {isTeacher && (
          <button
            onClick={() => setShowAddSchedule(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
            disabled={submitting}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </button>
        )}
      </div>

      {/* Add/Edit Schedule Form */}
      {isTeacher && showAddSchedule && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">
              {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={scheduleForm.subject}
                onChange={(e) => setScheduleForm({...scheduleForm, subject: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day <span className="text-red-500">*</span>
              </label>
              <select
                value={scheduleForm.day}
                onChange={(e) => setScheduleForm({...scheduleForm, day: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Day</option>
                {days.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={scheduleForm.start_time}
                onChange={(e) => setScheduleForm({...scheduleForm, start_time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={scheduleForm.end_time}
                onChange={(e) => setScheduleForm({...scheduleForm, end_time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})}
                placeholder="e.g., Room 101, Science Lab, Gymnasium"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Student (Optional)
              </label>
              <select
                value={scheduleForm.student_id}
                onChange={(e) => setScheduleForm({...scheduleForm, student_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Students (General Schedule)</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.name} - {student.grade}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to make this schedule visible to all students
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                placeholder="Additional notes about this class..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-2 flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingSchedule ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error State */}
      {!loading && schedule.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Found</h3>
          <p className="text-gray-600 mb-4">
            {isTeacher ? 'Start by adding your first class schedule.' : 'No classes have been scheduled yet.'}
          </p>
          {isTeacher && (
            <button
              onClick={() => setShowAddSchedule(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Schedule
            </button>
          )}
        </div>
      )}

      {/* Schedule Grid */}
      {schedule.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {groupScheduleByDay().map(({ day, items }) => (
            <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  {day}
                  <span className="ml-auto text-sm text-gray-500 font-normal">
                    {items.length} {items.length === 1 ? 'class' : 'classes'}
                  </span>
                </h3>
              </div>
              <div className="p-6">
                {items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No classes scheduled</p>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                            {item.subject}
                          </h4>
                          {isTeacher && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {item.start_time} - {item.end_time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {item.location}
                          </div>
                          {item.student_name ? (
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                Assigned to: {item.student_name}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                General Schedule (All Students)
                              </span>
                            </div>
                          )}
                          {item.notes && (
                            <div className="flex items-start">
                              <BookOpen className="w-4 h-4 mr-2 mt-0.5" />
                              <span className="text-xs">{item.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Overview */}
      {schedule.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  {days.map(day => (
                    <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map(time => (
                  <tr key={time} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{time}</td>
                    {days.map(day => {
                      const classAtTime = schedule.find(item => 
                        item.day === day && 
                        item.start_time.substring(0, 5) <= time && 
                        item.end_time.substring(0, 5) > time
                      );
                      return (
                        <td key={day} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {classAtTime ? (
                            <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                              <div className="font-medium">{classAtTime.subject}</div>
                              <div className="text-xs text-blue-600">{classAtTime.location}</div>
                              {classAtTime.student_name && (
                                <div className="text-xs text-blue-500">({classAtTime.student_name})</div>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
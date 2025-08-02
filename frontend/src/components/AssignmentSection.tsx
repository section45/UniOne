import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Plus, Edit, Trash2, CheckCircle, AlertCircle, Star, Award, TrendingUp, Filter, SortAsc } from 'lucide-react';
import { assignmentAPI, studentAPI } from '../utils/api';

interface Assignment {
  id: number;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  status?: 'pending' | 'submitted' | 'graded';
  submission_status?: 'pending' | 'submitted' | 'graded';
  student_id?: number;
  student_name?: string;
  student_grade?: string;
  student_class?: string;
  teacher_name?: string;
  created_at: string;
  priority?: 'low' | 'medium' | 'high';
  points?: number;
  submitted_at?: string;
  student_score?: number;
  total_submissions?: number;
  submitted_count?: number;
  graded_count?: number;
}

interface Student {
  id: number;
  name: string;
  grade: string;
}

interface AssignmentSectionProps {
  userRole: string;
  userId: number;
}

const AssignmentSection: React.FC<AssignmentSectionProps> = ({ userRole, userId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('due_date');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    due_date: '',
    student_id: '',
    priority: 'medium',
    points: 100
  });

  // Fetch assignments from API
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getAll();
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students from API (for teachers)
  const fetchStudents = async () => {
    if (userRole === 'teacher') {
      try {
        const response = await studentAPI.getAll();
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchStudents();
  }, [userRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        due_date: formData.due_date,
        student_id: formData.student_id || null,
        priority: formData.priority,
        points: formData.points
      };

      if (editingAssignment) {
        await assignmentAPI.update(editingAssignment.id, assignmentData);
      } else {
        await assignmentAPI.create(assignmentData);
      }

      // Refresh assignments list
      await fetchAssignments();

      // Reset form
      setShowAddForm(false);
      setEditingAssignment(null);
      setFormData({
        title: '',
        description: '',
        subject: '',
        due_date: '',
        student_id: '',
        priority: 'medium',
        points: 100
      });
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Error saving assignment. Please try again.');
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      due_date: assignment.due_date,
      student_id: assignment.student_id?.toString() || '',
      priority: assignment.priority || 'medium',
      points: assignment.points || 100
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await assignmentAPI.delete(id);
      await fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Error deleting assignment. Please try again.');
    }
  };

  const handleSubmitAssignment = async (assignmentId: number, studentId: number) => {
    try {
      await assignmentAPI.submitAssignment(assignmentId, { student_id: studentId });
      await fetchAssignments();
      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'graded':
        return <Award className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'graded':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status === 'pending';
  };

  const filteredAndSortedAssignments = assignments
    .filter(assignment => {
      if (filterStatus === 'all') return true;
      const status = assignment.submission_status || assignment.status || 'pending';
      return status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });

  const getStats = () => {
    const total = assignments.length;
    const pending = assignments.filter(a => {
      const status = a.submission_status || a.status || 'pending';
      return status === 'pending';
    }).length;
    const submitted = assignments.filter(a => {
      const status = a.submission_status || a.status || 'pending';
      return status === 'submitted';
    }).length;
    const graded = assignments.filter(a => {
      const status = a.submission_status || a.status || 'pending';
      return status === 'graded';
    }).length;
    const overdue = assignments.filter(a => {
      const status = a.submission_status || a.status || 'pending';
      return isOverdue(a.due_date, status);
    }).length;
    
    return { total, pending, submitted, graded, overdue };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-5/6"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
            <p className="text-gray-600">Manage and track student assignments</p>
          </div>
        </div>
        {userRole === 'teacher' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Assignment</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-4 rounded-xl border border-yellow-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Submitted</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.submitted}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Graded</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.graded}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-100 p-4 rounded-xl border border-red-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <SortAsc className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="subject">Subject</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-8 p-6 border-2 border-indigo-200 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-gray-800">
            {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter assignment title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Subject name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Detailed assignment description and instructions"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assign to Student (Optional)
              </label>
              <select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Students</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.grade}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
              >
                {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAssignment(null);
                  setFormData({
                    title: '',
                    description: '',
                    subject: '',
                    due_date: '',
                    student_id: '',
                    priority: 'medium',
                    points: 100
                  });
                }}
                className="bg-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-400 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-6">
        {filteredAndSortedAssignments.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-600 mb-2">No assignments found</p>
            <p className="text-gray-500">Create your first assignment to get started</p>
          </div>
        ) : (
          filteredAndSortedAssignments.map((assignment, index) => {
            const status = assignment.submission_status || assignment.status || 'pending';
            const isOverdueAssignment = isOverdue(assignment.due_date, status);
            
            return (
              <div
                key={assignment.id}
                className={`assignment-card border-2 rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                  isOverdueAssignment
                    ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50 shadow-lg' 
                    : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-indigo-300'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{assignment.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(assignment.priority || 'medium')}`}>
                        {(assignment.priority || 'medium').charAt(0).toUpperCase() + (assignment.priority || 'medium').slice(1)} Priority
                      </span>
                      {getStatusIcon(status)}
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">{assignment.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium text-gray-700">{assignment.subject}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-700">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                      </div>
                      {assignment.student_name && (
                        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                          <span className="font-medium text-gray-700">Student: {assignment.student_name}</span>
                        </div>
                      )}
                      {assignment.points && (
                        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium text-gray-700">{assignment.points} pts</span>
                        </div>
                      )}
                      {assignment.student_grade && (
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-2 rounded-lg shadow-sm border border-green-200">
                          <Award className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-800">Grade: {assignment.student_grade}</span>
                        </div>
                      )}
                      {assignment.student_score && (
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-2 rounded-lg shadow-sm border border-blue-200">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-blue-800">Score: {assignment.student_score}</span>
                        </div>
                      )}
                      {userRole === 'teacher' && assignment.total_submissions && (
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-2 rounded-lg shadow-sm border border-purple-200">
                          <span className="font-medium text-purple-800">
                            {assignment.submitted_count || 0}/{assignment.total_submissions} Submitted
                          </span>
                        </div>
                      )}
                      {isOverdueAssignment && (
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-red-100 to-pink-100 px-3 py-2 rounded-lg shadow-sm border border-red-200">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="font-bold text-red-800">Overdue</span>
                        </div>
                      )}
                      {assignment.teacher_name && (
                        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                          <span className="font-medium text-gray-700">Teacher: {assignment.teacher_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-6">
                    {userRole === 'parent' && status === 'pending' && (
                      <button
                        onClick={() => handleSubmitAssignment(assignment.id, assignment.student_id || 0)}
                        className="p-3 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg"
                        title="Submit Assignment"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {userRole === 'teacher' && (
                      <>
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="p-3 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="p-3 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .assignment-card {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        /* Ensure consistent styling for all assignment cards */
        .assignment-card:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Smooth transitions for all interactive elements */
        .assignment-card * {
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AssignmentSection;
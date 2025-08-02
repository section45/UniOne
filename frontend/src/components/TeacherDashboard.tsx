import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, studentAPI, attendanceAPI, gradeAPI, feedbackAPI, scheduleAPI, feesAPI } from '../utils/api';
import { toast } from 'react-toastify';
import SchedulePage from './SchedulePage';
import FeesPage from './FeesPage';
import AssignmentSection from './AssignmentSection';
import CommunicationSection from './CommunicationSection';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Plus, 
  Edit,
  Trash2,
  Star,
  GraduationCap,
  LogOut,
  DollarSign,
  FileText,
  FileSpreadsheet,
  Menu,
  X,
  MessageCircle,
  Megaphone,
  Search,
  Filter,
  Bell,
  AlertCircle,
  Info,
  CheckCheck,
  Eye,
  ChevronDown,
  ChevronUp,
  Send,
  Target,
  Globe,
  School
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  grade: string;
  email: string;
  parent_contact: string;
}

interface DashboardStats {
  total_students: number;
  attendance_rate: number;
  class_average: number;
  total_feedback: number;
  total_fees: number;
  pending_fees: number;
}

interface Grade {
  id: number;
  student_id: number;
  student_name: string;
  student_grade: string;
  subject: string;
  score: number;
  date: string;
}

interface Feedback {
  id: number;
  student_id: number;
  student_name: string;
  student_grade: string;
  subject: string;
  message: string;
  rating: number;
  date: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  date: string;
  author: string;
  targetGrades: string[];
  isPublished: boolean;
}

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [attendanceClassFilter, setAttendanceClassFilter] = useState<string>('');
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [showAddFeedback, setShowAddFeedback] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddFee, setShowAddFee] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, studentId: number | null, studentName: string}>({
    show: false,
    studentId: null,
    studentName: ''
  });
  const [grades, setGrades] = useState<Grade[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [gradesClassFilter, setGradesClassFilter] = useState<string>('');
  const [feedbackClassFilter, setFeedbackClassFilter] = useState<string>('');
  const [deleteGradeConfirm, setDeleteGradeConfirm] = useState<{show: boolean, gradeId: number | null}>({
    show: false,
    gradeId: null
  });
  const [deleteFeedbackConfirm, setDeleteFeedbackConfirm] = useState<{show: boolean, feedbackId: number | null}>({
    show: false,
    feedbackId: null
  });

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showOnlyPublished, setShowOnlyPublished] = useState(false);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<number | null>(null);
  const [deleteAnnouncementConfirm, setDeleteAnnouncementConfirm] = useState<{show: boolean, announcementId: number | null, title: string}>({
    show: false,
    announcementId: null,
    title: ''
  });

  // Mock announcements data - in real app, this would come from API
  const mockAnnouncements: Announcement[] = [
    {
      id: 1,
      title: "🎉 Annual Sports Day - February 15th",
      content: "We are excited to announce our Annual Sports Day! All students are encouraged to participate in various sporting activities. Parents are welcome to attend and cheer for their children. Registration forms are available at the front office. Please ensure your child brings sports attire and water bottles. Event starts at 9:00 AM sharp.",
      priority: 'high',
      category: 'Events',
      date: '2025-01-15',
      author: 'Principal Johnson',
      targetGrades: ['1', '2', '3', '4', '5'],
      isPublished: true
    },
    {
      id: 2,
      title: "📚 Parent-Teacher Conference Scheduled",
      content: "Parent-Teacher conferences have been scheduled for January 25-27. Please book your slot through the school portal. Discuss your child's academic progress, behavior, and any concerns you might have. Each session is 15 minutes long.",
      priority: 'urgent',
      category: 'Academic',
      date: '2025-01-10',
      author: 'Academic Coordinator',
      targetGrades: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      isPublished: true
    },
    {
      id: 3,
      title: "🚌 Transportation Route Changes",
      content: "Due to road construction on Maple Street, Bus Route #7 will be temporarily modified. The new route will include an additional stop at Pine Avenue. Please note the revised pickup times. Changes effective from January 20th to March 1st.",
      priority: 'medium',
      category: 'Transportation',
      date: '2025-01-12',
      author: 'Transport Manager',
      targetGrades: ['6', '7', '8', '9', '10'],
      isPublished: false
    }
  ];

  // Announcement form
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: '',
    targetGrades: [] as string[],
    isPublished: false
  });

  useEffect(() => {
    setAnnouncements(mockAnnouncements);
  }, []);

  // Filter announcements based on search and filters
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || announcement.category === selectedCategory;
    const matchesPriority = selectedPriority === '' || announcement.priority === selectedPriority;
    const matchesPublishedStatus = !showOnlyPublished || announcement.isPublished;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesPublishedStatus;
  });

  // Get priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      case 'high':
        return <Bell className="w-4 h-4" />;
      case 'medium':
        return <Info className="w-4 h-4" />;
      case 'low':
        return <CheckCheck className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Handle adding new announcement
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAnnouncement: Announcement = {
        id: announcements.length + 1,
        ...announcementForm,
        date: new Date().toISOString().split('T')[0],
        author: user?.name || 'Teacher'
      };
      
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      toast.success('Announcement created successfully');
      setShowAddAnnouncement(false);
      setAnnouncementForm({
        title: '',
        content: '',
        priority: 'medium',
        category: '',
        targetGrades: [],
        isPublished: false
      });
    } catch (error) {
      toast.error('Failed to create announcement');
    }
  };

  // Handle toggling announcement publish status
  const togglePublishStatus = (announcementId: number) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, isPublished: !announcement.isPublished }
          : announcement
      )
    );
    toast.success('Announcement status updated');
  };

  // Handle deleting announcement
  const handleDeleteAnnouncement = (announcementId: number) => {
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== announcementId));
    toast.success('Announcement deleted successfully');
    setDeleteAnnouncementConfirm({show: false, announcementId: null, title: ''});
  };

  const confirmDeleteAnnouncement = (announcement: Announcement) => {
    setDeleteAnnouncementConfirm({
      show: true,
      announcementId: announcement.id,
      title: announcement.title
    });
  };

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data: any[], filename: string, title: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const headers = Object.keys(data[0] || {});
      const tableRows = data.map(row => 
        `<tr>${headers.map(header => `<td style="border: 1px solid #ddd; padding: 8px;">${row[header] || ''}</td>`).join('')}</tr>`
      ).join('');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #f5f5f5; border: 1px solid #ddd; padding: 12px; text-align: left; }
              td { border: 1px solid #ddd; padding: 8px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <table>
              <thead>
                <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleStudentsExport = (format: 'csv' | 'pdf') => {
    const exportData = filteredStudents.map(student => ({
      'Student ID': student.id,
      'Name': student.name,
      'Grade': student.grade,
      'Email': student.email,
      'Parent Contact': student.parent_contact
    }));
    
    if (format === 'csv') {
      exportToCSV(exportData, 'students_list');
    } else {
      exportToPDF(exportData, 'students_list', 'Students List');
    }
  };

  const handleAttendanceExport = (format: 'csv' | 'pdf') => {
  const exportData = filteredStudents
    .filter(student =>
      attendanceClassFilter === '' || student.grade === attendanceClassFilter
    )
    .map(student => ({
      'Student Name': student.name,
      'Class': student.grade,
      'Date': attendanceDate,
      'Status': 'Marked manually', // or leave blank or dynamic if tracking status
    }));

  if (format === 'csv') {
    exportToCSV(exportData, 'attendance_report');
  } else {
    exportToPDF(exportData, 'attendance_report', 'Attendance Report');
  }
};


  const handleGradesExport = (format: 'csv' | 'pdf') => {
    const exportData = grades
      .filter(grade => 
        gradesClassFilter === '' || 
        grade.student_grade === gradesClassFilter
      )
      .map(grade => ({
        'Student': grade.student_name,
        'Class': grade.student_grade,
        'Subject': grade.subject,
        'Score': grade.score,
        'Date': grade.date
      }));
    
    if (format === 'csv') {
      exportToCSV(exportData, 'grades_report');
    } else {
      exportToPDF(exportData, 'grades_report', 'Grades Report');
    }
  };

  const handleFeedbackExport = (format: 'csv' | 'pdf') => {
    const exportData = feedbacks
      .filter(feedback => 
        feedbackClassFilter === '' || 
        feedback.student_grade === feedbackClassFilter
      )
      .map(feedback => ({
        'Student': feedback.student_name,
        'Class': feedback.student_grade,
        'Subject': feedback.subject,
        'Rating': feedback.rating,
        'Message': feedback.message,
        'Date': feedback.date
      }));
    
    if (format === 'csv') {
      exportToCSV(exportData, 'feedback_records');
    } else {
      exportToPDF(exportData, 'feedback_records', 'Feedback Records');
    }
  };

  const handleAnnouncementsExport = (format: 'csv' | 'pdf') => {
    const exportData = filteredAnnouncements.map(announcement => ({
      'Title': announcement.title,
      'Category': announcement.category,
      'Priority': announcement.priority,
      'Date': announcement.date,
      'Author': announcement.author,
      'Status': announcement.isPublished ? 'Published' : 'Draft',
      'Target Grades': announcement.targetGrades.join(', ')
    }));
    
    if (format === 'csv') {
      exportToCSV(exportData, 'announcements_report');
    } else {
      exportToPDF(exportData, 'announcements_report', 'Announcements Report');
    }
  };

  // Add header and footer components
  const Header = () => (
    <header className="header bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="logo flex items-center flex-shrink-0">
            <div className="logo-icon w-8 h-8 text-blue-600 mr-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <span className="logo-text text-xl font-bold text-gray-900">MY UNIONE</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">Welcome, {user?.name}</span>
            <span className="text-xs text-gray-600 sm:hidden">Hi, {user?.name?.split(' ')[0]}</span>
            <button
              onClick={logout}
              className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm text-red-600 hover:text-red-800"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  const Footer = () => (
        <footer className="footer bg-white/95 backdrop-blur-sm border-t border-gray-200">
        <div className="footer-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="footer-section text-center sm:text-left">
              <div className="footer-logo flex items-center justify-center sm:justify-start mb-4">
                <div className="logo-icon w-8 h-8 text-blue-600 mr-3 flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">My UniOne</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">Connecting parents, students, and teachers for better educational outcomes through innovative digital solutions.</p>
            </div>
            <div className="footer-section text-center sm:text-left">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
              <li><a href="#dashboard" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">Dashboard</a></li>
              <li><a href="#attendance" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">Attendance</a></li>
              <li><a href="#grades" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">Grades</a></li>
              <li><a href="#feedback" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">Feedback</a></li>

              </ul>
            </div>
            <div className="footer-section text-center sm:text-left sm:col-span-2 lg:col-span-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h4>
              <div className="contact-info space-y-2">
                <div className="contact-item text-gray-600 text-sm sm:text-base">Greater Noida, India</div>
                <div className="contact-item text-gray-600 text-sm sm:text-base">support@My UniOne.edu</div>
                <div className="contact-item text-gray-600 text-sm sm:text-base">+91 98765 43210</div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-600 text-sm">&copy; 2025 My UniOne Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
  );

  // Form states
  const [studentForm, setStudentForm] = useState({
    name: '',
    grade: '',
    email: '',
    parent_contact: '',
  });

  const [gradeForm, setGradeForm] = useState({
    student_id: '',
    subject: '',
    score: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [feedbackForm, setFeedbackForm] = useState({
    student_id: '',
    subject: '',
    message: '',
    rating: 5,
    date: new Date().toISOString().split('T')[0],
  });

  const [scheduleForm, setScheduleForm] = useState({
    subject: '',
    day: '',
    start_time: '',
    end_time: '',
    location: '',
  });

  const [feeForm, setFeeForm] = useState({
    student_id: '',
    amount: '',
    fee_type: '',
    due_date: '',
  });

  useEffect(() => {
    fetchDashboardData();
    fetchStudents();
    fetchGrades();
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (selectedClass === '') {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(student => student.grade === selectedClass));
    }
  }, [students, selectedClass]);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await gradeAPI.getAll();
      setGrades(response.data);
    } catch (error) {
      toast.error('Failed to fetch grades');
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbackAPI.getAll();
      setFeedbacks(response.data);
    } catch (error) {
      toast.error('Failed to fetch feedbacks');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentAPI.create(studentForm);
      toast.success('Student added successfully');
      setShowAddStudent(false);
      setStudentForm({ name: '', grade: '', email: '', parent_contact: '' });
      fetchStudents();
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to add student');
    }
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await gradeAPI.create({
        ...gradeForm,
        score: parseInt(gradeForm.score),
      });
      toast.success('Grade added successfully');
      setShowAddGrade(false);
      setGradeForm({ student_id: '', subject: '', score: '', date: new Date().toISOString().split('T')[0] });
      fetchGrades();
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to add grade');
    }
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feedbackAPI.create(feedbackForm);
      toast.success('Feedback added successfully');
      setShowAddFeedback(false);
      setFeedbackForm({ student_id: '', subject: '', message: '', rating: 5, date: new Date().toISOString().split('T')[0] });
      fetchFeedbacks();
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to add feedback');
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete student');
      }
      
      toast.success('Student deleted successfully');
      setDeleteConfirm({show: false, studentId: null, studentName: ''});
      fetchStudents();
      fetchDashboardData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete student');
    }
  };

  const confirmDelete = (student: Student) => {
    setDeleteConfirm({
      show: true,
      studentId: student.id,
      studentName: student.name
    });
  };

  const handleDeleteGrade = async (gradeId: number) => {
    try {
      const response = await fetch(`/api/grades/${gradeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete grade');
      }
      
      toast.success('Grade deleted successfully');
      setDeleteGradeConfirm({show: false, gradeId: null});
      fetchGrades();
      fetchDashboardData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete grade');
    }
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }
      
      toast.success('Feedback deleted successfully');
      setDeleteFeedbackConfirm({show: false, feedbackId: null});
      fetchFeedbacks();
      fetchDashboardData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete feedback');
    }
  };

  const handleAttendanceChange = async (studentId: number, status: string) => {
    try {
      await attendanceAPI.create({
        student_id: studentId,
        date: attendanceDate,
        status,
      });
      toast.success('Attendance updated');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Art', 
    'Physical Education', 'Computer Science', 'Geography'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-6 xl:space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Users },
              
              { id: 'students', label: 'Students', icon: Users },
              { id: 'attendance', label: 'Attendance', icon: Calendar },
              { id: 'grades', label: 'Grades', icon: BookOpen },
              { id: 'feedback', label: 'Feedback', icon: MessageSquare },
              { id: 'schedule', label: 'Schedule', icon: Calendar },
               { id: 'fees', label: 'Fees', icon: DollarSign },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'communication', label: 'Messages', icon: MessageCircle },
              { id: 'announcements', label: 'Announcements', icon: Megaphone },
             
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile/Tablet Navigation */}
          <div className="lg:hidden">
            <div className="flex justify-between items-center py-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {activeTab === 'dashboard' ? 'Dashboard' : activeTab}
              </span>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="absolute left-0 right-0 top-full bg-white border-t border-gray-200 shadow-lg z-50">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-4">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: Users },
                    { id: 'announcements', label: 'Announcements', icon: Megaphone },
                    { id: 'students', label: 'Students', icon: Users },
                    { id: 'attendance', label: 'Attendance', icon: Calendar },
                    { id: 'grades', label: 'Grades', icon: BookOpen },
                    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
                    { id: 'schedule', label: 'Schedule', icon: Calendar },
                    { id: 'assignments', label: 'Assignments', icon: FileText },
                    { id: 'communication', label: 'Messages', icon: MessageCircle },
                    { id: 'fees', label: 'Fees', icon: DollarSign },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'schedule' && <SchedulePage />}
        {activeTab === 'fees' && <FeesPage />}
        {activeTab === 'assignments' && user && (
          <AssignmentSection userRole="teacher" userId={user.id} />
        )}
        {activeTab === 'communication' && user && (
          <CommunicationSection userRole="teacher" userName={user.name} />
        )}

        {/* Announcements Section */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                  <Megaphone className="w-8 h-8 mr-3 text-blue-600" />
                  Announcement Manager
                </h1>
                <p className="text-gray-600 mt-2">Create and manage school announcements for parents and students</p>
              </div>
              <button
                onClick={() => setShowAddAnnouncement(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Announcement
              </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    <option value="Academic">Academic</option>
                    <option value="Events">Events</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Cafeteria">Cafeteria</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Health">Health</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="relative">
                  <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Published Toggle */}
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyPublished}
                      onChange={(e) => setShowOnlyPublished(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                      showOnlyPublished ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                        showOnlyPublished ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700">Published only</span>
                  </label>
                </div>

                {/* Export */}
                <div className="relative group">
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <FileSpreadsheet className="w-4 h-4" />
                    Export
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={() => handleAnnouncementsExport('csv')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleAnnouncementsExport('pdf')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Export as PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Announcement Form */}
            {showAddAnnouncement && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  Create New Announcement
                </h3>
                <form onSubmit={handleAddAnnouncement} className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter announcement title..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={announcementForm.category}
                        onChange={(e) => setAnnouncementForm({...announcementForm, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Academic">Academic</option>
                        <option value="Events">Events</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Cafeteria">Cafeteria</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Health">Health</option>
                        <option value="Sports">Sports</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={announcementForm.priority}
                        onChange={(e) => setAnnouncementForm({...announcementForm, priority: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Grades</label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((grade) => (
                          <label key={grade} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={announcementForm.targetGrades.includes(grade.toString())}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAnnouncementForm({
                                    ...announcementForm,
                                    targetGrades: [...announcementForm.targetGrades, grade.toString()]
                                  });
                                } else {
                                  setAnnouncementForm({
                                    ...announcementForm,
                                    targetGrades: announcementForm.targetGrades.filter(g => g !== grade.toString())
                                  });
                                }
                              }}
                              className="mr-1"
                            />
                            <span className="text-sm text-gray-700">Class {grade}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter announcement content..."
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={announcementForm.isPublished}
                        onChange={(e) => setAnnouncementForm({...announcementForm, isPublished: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddAnnouncement(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Create Announcement
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Delete Announcement Confirmation Modal */}
            {deleteAnnouncementConfirm.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    Are you sure you want to delete the announcement <strong>"{deleteAnnouncementConfirm.title}"</strong>? 
                    This action cannot be undone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                    <button
                      onClick={() => setDeleteAnnouncementConfirm({show: false, announcementId: null, title: ''})}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteAnnouncementConfirm.announcementId && handleDeleteAnnouncement(deleteAnnouncementConfirm.announcementId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete Announcement
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Announcements List */}
            <div className="space-y-4">
              {filteredAnnouncements.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
                  <p className="text-gray-600 mb-4">Create your first announcement to communicate with parents and students</p>
                  <button
                    onClick={() => setShowAddAnnouncement(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Announcement
                  </button>
                </div>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`bg-white rounded-lg shadow-sm border transition-all duration-300 hover:shadow-md hover:border-blue-200 ${
                      !announcement.isPublished 
                        ? 'border-yellow-200 bg-yellow-50/30' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="p-4 sm:p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {announcement.title}
                            </h3>
                            {!announcement.isPublished && (
                              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-200">
                                Draft
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getPriorityBadge(announcement.priority)}`}>
                              {getPriorityIcon(announcement.priority)}
                              <span className="ml-1 capitalize">{announcement.priority}</span>
                            </span>
                            
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full border border-purple-200">
                              {announcement.category}
                            </span>
                            
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full border border-green-200">
                              <Target className="w-3 h-3 mr-1" />
                              Classes: {announcement.targetGrades.join(', ')}
                            </span>
                            
                            <span className="text-xs text-gray-500">
                              By {announcement.author} • {new Date(announcement.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => togglePublishStatus(announcement.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              announcement.isPublished 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-yellow-600 hover:bg-yellow-50'
                            }`}
                            title={announcement.isPublished ? 'Published' : 'Unpublished'}
                          >
                            {announcement.isPublished ? <Globe className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => confirmDeleteAnnouncement(announcement)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => setExpandedAnnouncement(
                              expandedAnnouncement === announcement.id ? null : announcement.id
                            )}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            {expandedAnnouncement === announcement.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className={`transition-all duration-300 overflow-hidden ${
                        expandedAnnouncement === announcement.id ? 'max-h-none' : 'max-h-16'
                      }`}>
                        <p className="text-gray-700 leading-relaxed">
                          {announcement.content}
                        </p>
                      </div>

                      {/* Expand/Collapse indicator for long content */}
                      {announcement.content.length > 150 && expandedAnnouncement !== announcement.id && (
                        <div className="mt-2">
                          <button
                            onClick={() => setExpandedAnnouncement(announcement.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            Read more...
                          </button>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            announcement.isPublished ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                          {announcement.isPublished ? 'Published' : 'Draft'}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePublishStatus(announcement.id)}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                              announcement.isPublished 
                                ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' 
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                            }`}
                          >
                            {announcement.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                          <button className="text-xs text-gray-600 hover:text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 transition-colors">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Teacher Dashboard</h1>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Welcome back! Here's an overview of your class performance.</p>
            
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                      <Users className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_students}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                      <Calendar className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Attendance Rate</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.attendance_rate}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                      <BookOpen className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Class Average</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.class_average}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
                      <MessageSquare className="w-5 sm:w-6 h-5 sm:h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Feedback Given</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_feedback}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Student Management</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-auto"
                  >
                    <option value="">All Classes</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((classNum) => (
                      <option key={classNum} value={classNum.toString()}>Class {classNum}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative group">
                    <button className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                      <span className="sm:hidden">Export Data</span>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => handleStudentsExport('csv')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleStudentsExport('pdf')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Export as PDF
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors text-sm w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add Student</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Add Student Form */}
            {showAddStudent && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Add New Student</h3>
                <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <select
                      value={studentForm.grade}
                      onChange={(e) => setStudentForm({...studentForm, grade: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">Select Class</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((classNum) => (
                        <option key={classNum} value={classNum.toString()}>{classNum}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Contact</label>
                    <input
                      type="tel"
                      value={studentForm.parent_contact}
                      onChange={(e) => setStudentForm({...studentForm, parent_contact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAddStudent(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add Student
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    Are you sure you want to delete <strong>{deleteConfirm.studentName}</strong>? 
                    This action cannot be undone and will remove all associated records including grades, attendance, and feedback.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                    <button
                      onClick={() => setDeleteConfirm({show: false, studentId: null, studentName: ''})}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteConfirm.studentId && handleDeleteStudent(deleteConfirm.studentId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete Student
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Grade Confirmation Modal */}
            {deleteGradeConfirm.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    Are you sure you want to delete this grade? This action cannot be undone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                    <button
                      onClick={() => setDeleteGradeConfirm({show: false, gradeId: null})}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteGradeConfirm.gradeId && handleDeleteGrade(deleteGradeConfirm.gradeId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete Grade
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Feedback Confirmation Modal */}
            {deleteFeedbackConfirm.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    Are you sure you want to delete this feedback? This action cannot be undone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                    <button
                      onClick={() => setDeleteFeedbackConfirm({show: false, feedbackId: null})}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteFeedbackConfirm.feedbackId && handleDeleteFeedback(deleteFeedbackConfirm.feedbackId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete Feedback
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Parent Contact</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">Class {student.grade}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">{student.email}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{student.parent_contact}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          <button
                            onClick={() => confirmDelete(student)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Attendance Tracker</h2>
              
               <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
                  <select
                    value={attendanceClassFilter}
                    onChange={(e) => setAttendanceClassFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-auto"
                  >
                    <option value="">All Classes</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((classNum) => (
                      <option key={classNum} value={classNum.toString()}>Class {classNum}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-auto"
                />
              </div>
                  <div className="relative group">
                <button className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">Export Data</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleAttendanceExport('csv')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleAttendanceExport('pdf')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Export as PDF
                  </button>
                </div>
              </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Grade</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents
                      .filter(student => 
                        attendanceClassFilter === '' || 
                        student.grade === attendanceClassFilter
                      )
                      .map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">Class {student.grade}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            onChange={() => handleAttendanceChange(student.id, 'present')}
                            className="text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            onChange={() => handleAttendanceChange(student.id, 'absent')}
                            className="text-red-600 focus:ring-red-500"
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            onChange={() => handleAttendanceChange(student.id, 'late')}
                            className="text-yellow-600 focus:ring-yellow-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Grade Manager</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
                  <select
                    value={gradesClassFilter}
                    onChange={(e) => setGradesClassFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-auto"
                  >
                    <option value="">All Classes</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((classNum) => (
                      <option key={classNum} value={classNum.toString()}>Class {classNum}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative group">
                    <button className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                      <span className="sm:hidden">Export Data</span>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => handleGradesExport('csv')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleGradesExport('pdf')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Export as PDF
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddGrade(true)}
                    className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors text-sm w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add Grade</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Add Grade Form */}
            {showAddGrade && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Add New Grade</h3>
                <form onSubmit={handleAddGrade} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <select
                      value={gradeForm.student_id}
                      onChange={(e) => setGradeForm({...gradeForm, student_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={gradeForm.subject}
                      onChange={(e) => setGradeForm({...gradeForm, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gradeForm.score}
                      onChange={(e) => setGradeForm({...gradeForm, score: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={gradeForm.date}
                      onChange={(e) => setGradeForm({...gradeForm, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAddGrade(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add Grade
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Grades Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Class</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grades
                      .filter(grade => 
                        gradesClassFilter === '' || 
                        grade.student_grade === gradesClassFilter
                      )
                      .map((grade) => (
                      <tr key={grade.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{grade.student_name}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">Class {grade.student_grade}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{grade.subject}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            grade.score >= 90 ? 'bg-green-100 text-green-800' :
                            grade.score >= 80 ? 'bg-blue-100 text-blue-800' :
                            grade.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {grade.score}%
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{new Date(grade.date).toLocaleDateString()}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          <button
                            onClick={() => setDeleteGradeConfirm({show: true, gradeId: grade.id})}
                            className="text-red-600 hover:text-red-800 transition-colors p-2"
                            title="Delete Grade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {grades.filter(grade => 
                gradesClassFilter === '' || 
                grade.student_grade === gradesClassFilter
              ).length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                  No grades found for the selected criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Feedback Manager</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
                  <select
                    value={feedbackClassFilter}
                    onChange={(e) => setFeedbackClassFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-auto"
                  >
                    <option value="">All Classes</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((classNum) => (
                      <option key={classNum} value={classNum.toString()}>Class {classNum}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative group">
                    <button className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                      <span className="sm:hidden">Export Data</span>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => handleFeedbackExport('csv')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleFeedbackExport('pdf')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Export as PDF
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddFeedback(true)}
                    className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors text-sm w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add Feedback</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Add Feedback Form */}
            {showAddFeedback && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Add New Feedback</h3>
                <form onSubmit={handleAddFeedback} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <select
                      value={feedbackForm.student_id}
                      onChange={(e) => setFeedbackForm({...feedbackForm, student_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={feedbackForm.subject}
                      onChange={(e) => setFeedbackForm({...feedbackForm, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                          className={`text-2xl ${star <= feedbackForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          <Star className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={feedbackForm.date}
                      onChange={(e) => setFeedbackForm({...feedbackForm, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={feedbackForm.message}
                      onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAddFeedback(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add Feedback
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Feedback Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Class</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Message</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Date</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feedbacks
                      .filter(feedback => 
                        feedbackClassFilter === '' || 
                        feedback.student_grade === feedbackClassFilter
                      )
                      .map((feedback) => (
                      <tr key={feedback.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{feedback.student_name}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">Class {feedback.student_grade}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{feedback.subject}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-500 max-w-xs truncate hidden lg:table-cell">{feedback.message}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden xl:table-cell">{new Date(feedback.date).toLocaleDateString()}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          <button
                            onClick={() => setDeleteFeedbackConfirm({show: true, feedbackId: feedback.id})}
                            className="text-red-600 hover:text-red-800 transition-colors p-2"
                            title="Delete Feedback"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {feedbacks.filter(feedback => 
                feedbackClassFilter === '' || 
                feedback.student_grade === feedbackClassFilter
              ).length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                  No feedback found for the selected criteria.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default TeacherDashboard;
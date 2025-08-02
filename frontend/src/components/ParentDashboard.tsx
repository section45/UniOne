import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, studentAPI, attendanceAPI, gradeAPI, feedbackAPI } from '../utils/api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import SchedulePage from './SchedulePage';
import FeesPage from './FeesPage';
import AssignmentSection from './AssignmentSection';
import CommunicationSection from './CommunicationSection';
import { 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  GraduationCap, 
  LogOut,
  User,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Award,
  Users,
  Globe,
  ChevronRight,
  Download,
  FileText,
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
  ChevronUp
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  grade: string;
  email: string;
}

interface Grade {
  id: number;
  subject: string;
  score: number;
  grade: string;
  date: string;
  student_name: string;
}

interface Feedback {
  id: number;
  subject: string;
  message: string;
  rating: number;
  date: string;
  student_name: string;
}

interface Attendance {
  id: number;
  date: string;
  status: string;
  student_name: string;
}

interface DashboardStats {
  attendance_rate: number;
  grade_average: number;
  total_feedback: number;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  date: string;
  author: string;
  isRead: boolean;
  targetGrades: string[];
}

const ParentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<number | null>(null);

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
      isRead: false,
      targetGrades: ['1', '2', '3', '4', '5']
    },
    {
      id: 2,
      title: "📚 Parent-Teacher Conference Scheduled",
      content: "Parent-Teacher conferences have been scheduled for January 25-27. Please book your slot through the school portal. Discuss your child's academic progress, behavior, and any concerns you might have. Each session is 15 minutes long.",
      priority: 'urgent',
      category: 'Academic',
      date: '2025-01-10',
      author: 'Academic Coordinator',
      isRead: true,
      targetGrades: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    },
    {
      id: 3,
      title: "🚌 Transportation Route Changes",
      content: "Due to road construction on Maple Street, Bus Route #7 will be temporarily modified. The new route will include an additional stop at Pine Avenue. Please note the revised pickup times. Changes effective from January 20th to March 1st.",
      priority: 'medium',
      category: 'Transportation',
      date: '2025-01-12',
      author: 'Transport Manager',
      isRead: false,
      targetGrades: ['6', '7', '8', '9', '10']
    },
    {
      id: 4,
      title: "🍕 New Lunch Menu Options Available",
      content: "We've added healthy and delicious new options to our cafeteria menu! Check out the vegetarian pasta, fresh salad bar, and fruit smoothies. Nutritional information is posted on our website. Special dietary requirements can be accommodated with advance notice.",
      priority: 'low',
      category: 'Cafeteria',
      date: '2025-01-08',
      author: 'Cafeteria Staff',
      isRead: true,
      targetGrades: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    },
    {
      id: 5,
      title: "🔬 Science Fair Registration Open",
      content: "The annual Science Fair is approaching! Students can now register their projects. Themes include Environment, Technology, Health, and Space. Registration deadline is February 1st. Prizes will be awarded in each category. Let's encourage our young scientists!",
      priority: 'high',
      category: 'Academic',
      date: '2025-01-13',
      author: 'Science Department',
      isRead: false,
      targetGrades: ['4', '5', '6', '7', '8', '9', '10']
    },
    {
      id: 6,
      title: "❄️ Winter Break Holiday Schedule",
      content: "Winter break begins December 23rd and classes resume January 8th. The office will be closed from December 24th to January 2nd. Emergency contact information is available on our website. Have a wonderful holiday season with your families!",
      priority: 'medium',
      category: 'Holiday',
      date: '2025-01-05',
      author: 'Administration',
      isRead: true,
      targetGrades: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    }
  ];

  useEffect(() => {
    setAnnouncements(mockAnnouncements);
  }, []);

  // Get current user's student data
  const getCurrentUserStudent = () => {
    return students.find(student => student.email === user?.email) || students[0];
  };

  // Filter data for current user's student
  const getFilteredAttendance = () => {
    const currentStudent = getCurrentUserStudent();
    if (!currentStudent) return [];
    return attendance.filter(record => record.student_name === currentStudent.name);
  };

  const getFilteredGrades = () => {
    const currentStudent = getCurrentUserStudent();
    if (!currentStudent) return [];
    return grades.filter(grade => grade.student_name === currentStudent.name);
  };

  const getFilteredFeedback = () => {
    const currentStudent = getCurrentUserStudent();
    if (!currentStudent) return [];
    return feedback.filter(fb => fb.student_name === currentStudent.name);
  };

  // Filter announcements based on search and filters
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || announcement.category === selectedCategory;
    const matchesPriority = selectedPriority === '' || announcement.priority === selectedPriority;
    const matchesReadStatus = !showOnlyUnread || !announcement.isRead;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesReadStatus;
  });

  // Mark announcement as read
  const markAsRead = (announcementId: number) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, isRead: true }
          : announcement
      )
    );
  };

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
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Count unread notifications
  const unreadCount = announcements.filter(a => !a.isRead).length;

  // Export functions
  const exportToPDF = (data: any[], title: string, columns: string[]) => {
    const doc = new jsPDF();
    const currentStudent = getCurrentUserStudent();
    
    // Add title
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    // Add student info
    doc.setFontSize(12);
    doc.text(`Student: ${currentStudent?.name || 'N/A'}`, 20, 35);
    doc.text(`Grade: ${currentStudent?.grade || 'N/A'}`, 20, 45);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);
    
    // Add table
    (doc as any).autoTable({
      head: [columns],
      body: data.map(item => columns.map(col => {
        const key = col.toLowerCase().replace(' ', '_');
        return item[key] || item[col] || '';
      })),
      startY: 65,
    });
    
    doc.save(`${title.toLowerCase().replace(' ', '_')}.pdf`);
  };

  const exportToExcel = (data: any[], title: string) => {
    const currentStudent = getCurrentUserStudent();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    
    // Add student info at the top
    const studentInfo = [
      [`Student: ${currentStudent?.name || 'N/A'}`],
      [`Grade: ${currentStudent?.grade || 'N/A'}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [''], // Empty row
    ];
    
    XLSX.utils.sheet_add_aoa(worksheet, studentInfo, { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title.toLowerCase().replace(' ', '_')}.xlsx`);
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
              className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm text-red-600 hover:text-red-800 transition-colors"
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

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [studentsRes, gradesRes, feedbackRes, attendanceRes, statsRes] = await Promise.all([
        studentAPI.getAll(),
        gradeAPI.getAll(),
        feedbackAPI.getAll(),
        attendanceAPI.getAll(),
        dashboardAPI.getStats(),
      ]);

      setStudents(studentsRes.data);
      setGrades(gradesRes.data);
      setFeedback(feedbackRes.data);
      setAttendance(attendanceRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const getAttendanceStats = () => {
    const filteredAttendance = getFilteredAttendance();
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter(a => a.status === 'present').length;
    const absent = filteredAttendance.filter(a => a.status === 'absent').length;
    const late = filteredAttendance.filter(a => a.status === 'late').length;
    
    return { total, present, absent, late };
  };

  const getGradesBySubject = () => {
    const filteredGrades = getFilteredGrades();
    const subjects = filteredGrades.reduce((acc, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = [];
      }
      acc[grade.subject].push(grade);
      return acc;
    }, {} as { [key: string]: Grade[] });

    return Object.entries(subjects).map(([subject, subjectGrades]) => ({
      subject,
      grades: subjectGrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      average: Math.round(subjectGrades.reduce((sum, g) => sum + g.score, 0) / subjectGrades.length),
    }));
  };

  const attendanceStats = getAttendanceStats();
  const gradesBySubject = getGradesBySubject();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 lg:space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: User },
             
              { id: 'attendance', label: 'Attendance', icon: Calendar },
              { id: 'grades', label: 'Grades', icon: BookOpen },
              { id: 'feedback', label: 'Feedback', icon: MessageSquare },
              { id: 'schedule', label: 'Schedule', icon: Calendar }, 
              { id: 'fees', label: 'Fees', icon: DollarSign },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'communication', label: 'Messages', icon: MessageCircle },
              { id: 'announcements', label: 'Announcements', icon: Megaphone, badge: unreadCount > 0 ? unreadCount : null },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
                {tab.badge && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex justify-between items-center py-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <span className="text-sm font-medium text-gray-900 capitalize flex items-center">
                {activeTab === 'announcements' && unreadCount > 0 && (
                  <span className="mr-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
                {activeTab === 'dashboard' ? 'Dashboard' : activeTab}
              </span>
              <div className="w-10"></div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="absolute left-0 right-0 top-full bg-white border-t border-gray-200 shadow-lg z-50">
                <div className="grid grid-cols-2 gap-1 p-4">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: User },
                    { id: 'announcements', label: 'Announcements', icon: Megaphone, badge: unreadCount > 0 ? unreadCount : null },
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
                      className={`flex flex-col items-center p-3 rounded-lg transition-colors relative ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative">
                        <tab.icon className="w-5 h-5 mb-1" />
                        {tab.badge && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 py-0.5 min-w-[16px] h-4 flex items-center justify-center text-[10px]">
                            {tab.badge}
                          </span>
                        )}
                      </div>
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
                  School Announcements
                </h1>
                <p className="text-gray-600 mt-2">Stay updated with the latest news and important information from school</p>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  <Bell className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-600 font-medium">{unreadCount} unread notifications</span>
                </div>
              )}
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                {/* Unread Toggle */}
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyUnread}
                      onChange={(e) => setShowOnlyUnread(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                      showOnlyUnread ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                        showOnlyUnread ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700">Show unread only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {filteredAnnouncements.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or filters</p>
                </div>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`bg-white rounded-lg shadow-sm border transition-all duration-300 hover:shadow-md hover:border-blue-200 ${
                      !announcement.isRead 
                        ? 'border-blue-200 bg-blue-50/30' 
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
                            {!announcement.isRead && (
                              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
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
                            
                            <span className="text-xs text-gray-500">
                              By {announcement.author} • {new Date(announcement.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {!announcement.isRead && (
                            <button
                              onClick={() => markAsRead(announcement.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </button>
                          )}
                          
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
                          <Eye className="w-4 h-4 mr-1" />
                          {announcement.isRead ? 'Read' : 'Unread'}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-gray-600 hover:text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 transition-colors">
                            Share
                          </button>
                          <button className="text-xs text-gray-600 hover:text-green-600 px-3 py-1 rounded-full hover:bg-green-50 transition-colors">
                            Save
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Welcome to Your Child's Academic Journey</h1>
            
            {/* Student Info */}
            {students.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
                    <User className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{students[0].name}</h2>
                    <p className="text-gray-600 text-sm sm:text-base">{students[0].grade}</p>
                    <p className="text-xs sm:text-sm text-gray-500">ID: {students[0].id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Overview Stats */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                      <BookOpen className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Grade Average</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.grade_average}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
                      <MessageSquare className="w-5 sm:w-6 h-5 sm:h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Teacher Feedback</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_feedback}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Attendance Tracking</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => exportToExcel(
                    getFilteredAttendance().map(record => ({
                      Date: record.date,
                      Status: record.status,
                      Student: record.student_name
                    })),
                    'Attendance Report'
                  )}
                  className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export Excel</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>
            
            {/* Attendance Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg mb-2 sm:mb-0 sm:mr-4 self-start">
                    <Calendar className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Days</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{attendanceStats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg mb-2 sm:mb-0 sm:mr-4 self-start">
                    <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Present</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{attendanceStats.present}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="p-2 sm:p-3 bg-red-100 rounded-lg mb-2 sm:mb-0 sm:mr-4 self-start">
                    <XCircle className="w-5 sm:w-6 h-5 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Absent</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{attendanceStats.absent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg mb-2 sm:mb-0 sm:mr-4 self-start">
                    <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Late</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{attendanceStats.late}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Records */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Attendance Records</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Student</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredAttendance().map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{record.date}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.status === 'present' ? 'bg-green-100 text-green-800' :
                            record.status === 'absent' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">{record.student_name}</td>
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Academic Performance</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => exportToExcel(
                    getFilteredGrades().map(grade => ({
                      Subject: grade.subject,
                      Score: `${grade.score}%`,
                      Grade: grade.grade,
                      Date: grade.date
                    })),
                    'Grades Report'
                  )}
                  className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export Excel</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>
            
            {/* Subject-wise Performance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {gradesBySubject.map((subjectData) => (
                <div key={subjectData.subject} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{subjectData.subject}</h3>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-600">{subjectData.average}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {subjectData.grades.slice(0, 3).map((grade) => (
                      <div key={grade.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{grade.date}</span>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 mr-2">{grade.grade}</span>
                          <span className="text-gray-500">({grade.score}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* All Grades Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">All Grades</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredGrades().map((grade) => (
                      <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{grade.subject}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{grade.score}%</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            grade.score >= 90 ? 'bg-green-100 text-green-800' :
                            grade.score >= 80 ? 'bg-blue-100 text-blue-800' :
                            grade.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {grade.grade}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">{grade.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Teacher Feedback</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => exportToExcel(
                    getFilteredFeedback().map(item => ({
                      Subject: item.subject,
                      Message: item.message,
                      Rating: `${item.rating}/5`,
                      Date: item.date
                    })),
                    'Feedback Report'
                  )}
                  className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export Excel</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {getFilteredFeedback().map((item) => (
                <div key={item.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{item.subject}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">{item.date}</p>
                    </div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            star <= item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ParentDashboard;
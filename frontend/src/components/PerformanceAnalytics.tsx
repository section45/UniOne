import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  Brain, 
  Activity,
  Calendar,
  Target,
  BookOpen,
  UserCheck,
  MessageCircle,
  Clock
} from 'lucide-react';

interface Insight {
  type: string;
  severity: 'high' | 'medium' | 'low' | 'positive';
  message: string;
  data?: any;
}

interface StudentInsights {
  studentId: number;
  studentName: string;
  insights: Insight[];
  risks: string[];
  overallRisk: 'high' | 'medium' | 'low';
  riskScore: number;
  lastAnalyzed: string;
}

interface HeatmapData {
  studentId: number;
  studentName: string;
  grade: string;
  engagementScore: number;
  attendanceRate: number;
  gradeAverage: number;
  level: 'high' | 'medium' | 'low';
}

interface DashboardSummary {
  totalStudents?: number;
  totalChildren?: number;
  highRiskStudents?: number;
  averagePerformance?: number;
  overallPerformance?: number;
  riskPercentage?: number;
  recentAlerts?: Array<{
    name: string;
    grade: string;
    issue: string;
    severity: string;
  }>;
  insights?: Array<{
    studentName: string;
    type: string;
    message: string;
    severity: string;
  }>;
}

interface TrendData {
  date: string;
  avg_score: number;
  subject: string;
}

const PerformanceAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'heatmap' | 'trends'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [studentInsights, setStudentInsights] = useState<StudentInsights | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [trendsData, setTrendsData] = useState<TrendData[]>([]);
  const [students, setStudents] = useState<Array<{ id: number; name: string; grade: string }>>([]);

  const userRole = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');

  // Fetch students list
  useEffect(() => {
    fetchStudents();
    fetchDashboardSummary();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'heatmap') {
      fetchHeatmapData();
    } else if (activeTab === 'trends') {
      fetchTrendsData();
    }
  }, [activeTab, selectedTimeframe]);

  // Fetch student insights when student is selected
  useEffect(() => {
    if (selectedStudent && activeTab === 'insights') {
      fetchStudentInsights(selectedStudent);
    }
  }, [selectedStudent, activeTab]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        if (data.length > 0 && !selectedStudent) {
          setSelectedStudent(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchDashboardSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/dashboard/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardSummary(data);
      } else {
        setError('Failed to fetch dashboard summary');
      }
    } catch (error) {
      setError('Error fetching dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentInsights = async (studentId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/student/${studentId}/insights`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudentInsights(data);
      } else {
        setError('Failed to fetch student insights');
      }
    } catch (error) {
      setError('Error fetching student insights');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/heatmap/${selectedTimeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHeatmapData(data);
      } else {
        setError('Failed to fetch heatmap data');
      }
    } catch (error) {
      setError('Error fetching heatmap data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendsData = async () => {
    setLoading(true);
    try {
      const endpoint = selectedStudent 
        ? `/api/analytics/trends/${selectedStudent}`
        : '/api/analytics/trends';
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTrendsData(data);
      } else {
        setError('Failed to fetch trends data');
      }
    } catch (error) {
      setError('Error fetching trends data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEngagementColor = (level: string, score: number) => {
    if (level === 'high' || score > 75) return 'bg-green-500';
    if (level === 'medium' || score > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'low': return <UserCheck className="w-5 h-5 text-green-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userRole === 'teacher' ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardSummary?.totalStudents || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Risk Students</p>
                  <p className="text-2xl font-bold text-red-600">
                    {dashboardSummary?.highRiskStudents || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Class Average</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardSummary?.averagePerformance || 0}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Risk Percentage</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardSummary?.riskPercentage || 0}%
                  </p>
                </div>
                <Brain className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Children</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardSummary?.totalChildren || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Performance</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardSummary?.overallPerformance || 0}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Alerts */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-500" />
          AI-Generated Insights
        </h3>
        <div className="space-y-3">
          {userRole === 'teacher' ? (
            dashboardSummary?.recentAlerts?.length ? (
              dashboardSummary.recentAlerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.name} ({alert.grade})</p>
                      <p className="text-sm opacity-75">{alert.issue}</p>
                    </div>
                    {getRiskIcon(alert.severity)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent alerts. All students are performing well!</p>
            )
          ) : (
            dashboardSummary?.insights?.length ? (
              dashboardSummary.insights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{insight.studentName}</p>
                      <p className="text-sm opacity-75">{insight.message}</p>
                    </div>
                    {getRiskIcon(insight.severity)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent insights. Your children are doing great!</p>
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      {/* Student Selector */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Student for Detailed Analysis
        </label>
        <select
          value={selectedStudent || ''}
          onChange={(e) => setSelectedStudent(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a student...</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.grade})
            </option>
          ))}
        </select>
      </div>

      {/* Student Insights */}
      {studentInsights && (
        <div className="space-y-6">
          {/* Risk Overview */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Risk Assessment: {studentInsights.studentName}
              </h3>
              <div className="flex items-center space-x-2">
                {getRiskIcon(studentInsights.overallRisk)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  studentInsights.overallRisk === 'high' ? 'bg-red-100 text-red-800' :
                  studentInsights.overallRisk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {studentInsights.overallRisk.toUpperCase()} RISK
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  studentInsights.riskScore > 60 ? 'bg-red-500' :
                  studentInsights.riskScore > 30 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${studentInsights.riskScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Risk Score: {studentInsights.riskScore}/100
            </p>
          </div>

          {/* AI Insights */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-500" />
              AI-Generated Insights
            </h3>
            <div className="space-y-3">
              {studentInsights.insights.length > 0 ? (
                studentInsights.insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {insight.type === 'academic_risk' && <BookOpen className="w-4 h-4 mr-2" />}
                          {insight.type === 'attendance_risk' && <Calendar className="w-4 h-4 mr-2" />}
                          {insight.type === 'parent_engagement' && <MessageCircle className="w-4 h-4 mr-2" />}
                          {insight.type === 'assignment_risk' && <Target className="w-4 h-4 mr-2" />}
                          <span className="font-medium capitalize">
                            {insight.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm">{insight.message}</p>
                        {insight.data && (
                          <div className="mt-2 text-xs opacity-75">
                            {JSON.stringify(insight.data, null, 2)}
                          </div>
                        )}
                      </div>
                      {insight.severity === 'high' && <AlertTriangle className="w-5 h-5 text-red-500 ml-2" />}
                      {insight.severity === 'positive' && <TrendingUp className="w-5 h-5 text-green-500 ml-2" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">No concerns detected. Student is performing well!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHeatmap = () => (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Engagement Heatmap</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTimeframe('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedTimeframe === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedTimeframe('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedTimeframe === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Engagement Level</span>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                Low
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                Medium
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                High
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {heatmapData.map((student) => (
            <div key={student.studentId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{student.studentName}</h4>
                  <p className="text-sm text-gray-600">{student.grade}</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full ${getEngagementColor(student.level, student.engagementScore)}`}
                  title={`Engagement Score: ${student.engagementScore}%`}
                ></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Engagement:</span>
                  <span className="font-medium">{student.engagementScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attendance:</span>
                  <span className="font-medium">{student.attendanceRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Grade Avg:</span>
                  <span className="font-medium">{student.gradeAverage}%</span>
                </div>
              </div>

              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getEngagementColor(student.level, student.engagementScore)}`}
                  style={{ width: `${student.engagementScore}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {heatmapData.length === 0 && !loading && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No engagement data available for the selected timeframe.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
          {userRole === 'teacher' && (
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : null)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Students</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.grade})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="h-64 flex items-center justify-center">
          {trendsData.length > 0 ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Grade Average Over Time</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Last 3 months</span>
                </div>
              </div>
              
              {/* Simple trend visualization */}
              <div className="space-y-2">
                {trendsData.slice(-10).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      {new Date(trend.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            trend.avg_score > 80 ? 'bg-green-500' :
                            trend.avg_score > 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${trend.avg_score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {Math.round(trend.avg_score)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No trend data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading && !dashboardSummary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="w-8 h-8 mr-3 text-purple-500" />
              Performance Analytics Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              AI-powered insights and risk detection for student performance
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'insights', label: 'AI Insights', icon: Brain },
              { id: 'heatmap', label: 'Engagement Heatmap', icon: Target },
              { id: 'trends', label: 'Performance Trends', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'insights' && renderInsights()}
          {activeTab === 'heatmap' && renderHeatmap()}
          {activeTab === 'trends' && renderTrends()}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
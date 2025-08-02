const mysql = require('mysql2/promise');

// AI Analytics Engine
class AnalyticsEngine {
  constructor(pool) {
    this.pool = pool;
  }

  // Calculate grade trend for a student
  async calculateGradeTrend(studentId, months = 2) {
    const connection = await this.pool.getConnection();
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    const [grades] = await connection.execute(
      `SELECT score, date, subject FROM grades 
       WHERE student_id = ? AND date >= ? 
       ORDER BY date ASC`,
      [studentId, cutoffDate.toISOString().split('T')[0]]
    );

    connection.release();

    if (grades.length < 2) return { trend: 'insufficient_data', change: 0 };

    const recentGrades = grades.slice(-3);
    const olderGrades = grades.slice(0, 3);

    const recentAvg = recentGrades.reduce((sum, g) => sum + g.score, 0) / recentGrades.length;
    const olderAvg = olderGrades.reduce((sum, g) => sum + g.score, 0) / olderGrades.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    return {
      trend: change > 10 ? 'improving' : change < -10 ? 'declining' : 'stable',
      change: Math.round(change),
      recentAvg: Math.round(recentAvg),
      olderAvg: Math.round(olderAvg)
    };
  }

  // Calculate attendance risk
  async calculateAttendanceRisk(studentId, days = 10) {
    const connection = await this.pool.getConnection();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const [attendance] = await connection.execute(
      `SELECT status FROM attendance 
       WHERE student_id = ? AND date >= ?`,
      [studentId, cutoffDate.toISOString().split('T')[0]]
    );

    connection.release();

    if (attendance.length === 0) return { risk: 'no_data', absentDays: 0 };

    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const attendanceRate = ((attendance.length - absentDays) / attendance.length) * 100;

    return {
      risk: attendanceRate < 70 ? 'high' : attendanceRate < 85 ? 'medium' : 'low',
      absentDays,
      attendanceRate: Math.round(attendanceRate),
      totalDays: attendance.length
    };
  }

  // Calculate parent engagement
  async calculateParentEngagement(parentId, days = 21) {
    const connection = await this.pool.getConnection();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Check feedback responses (simulated - in real app you'd have parent response tracking)
    const [feedback] = await connection.execute(
      `SELECT COUNT(*) as feedback_count FROM feedback f
       JOIN students s ON f.student_id = s.id
       WHERE s.parent_id = ? AND f.date >= ?`,
      [parentId, cutoffDate.toISOString().split('T')[0]]
    );

    connection.release();

    const engagementScore = Math.min(feedback[0].feedback_count * 20, 100);

    return {
      level: engagementScore > 60 ? 'high' : engagementScore > 30 ? 'medium' : 'low',
      score: engagementScore,
      lastActivity: days // Simulated
    };
  }

  // Generate AI insights for a student
  async generateStudentInsights(studentId) {
    const connection = await this.pool.getConnection();
    
    // Get student info
    const [students] = await connection.execute(
      'SELECT * FROM students WHERE id = ?',
      [studentId]
    );

    if (students.length === 0) {
      connection.release();
      return null;
    }

    const student = students[0];
    const insights = [];
    const risks = [];

    // Grade trend analysis
    const gradeTrend = await this.calculateGradeTrend(studentId);
    if (gradeTrend.trend === 'declining' && gradeTrend.change < -20) {
      insights.push({
        type: 'academic_risk',
        severity: 'high',
        message: `${student.name} has a ${Math.abs(gradeTrend.change)}% decline in grades over the last 2 months. Immediate intervention recommended.`,
        data: gradeTrend
      });
      risks.push('academic_decline');
    } else if (gradeTrend.trend === 'improving') {
      insights.push({
        type: 'academic_improvement',
        severity: 'positive',
        message: `${student.name} shows ${gradeTrend.change}% improvement in grades. Great progress!`,
        data: gradeTrend
      });
    }

    // Attendance risk analysis
    const attendanceRisk = await this.calculateAttendanceRisk(studentId);
    if (attendanceRisk.risk === 'high') {
      insights.push({
        type: 'attendance_risk',
        severity: 'high',
        message: `${student.name} missed ${attendanceRisk.absentDays} classes in the last 10 days. Risk of disengagement.`,
        data: attendanceRisk
      });
      risks.push('attendance_risk');
    }

    // Parent engagement analysis
    if (student.parent_id) {
      const parentEngagement = await this.calculateParentEngagement(student.parent_id);
      if (parentEngagement.level === 'low') {
        insights.push({
          type: 'parent_engagement',
          severity: 'medium',
          message: `Parent hasn't been actively engaged in the last 3 weeks. Consider reaching out.`,
          data: parentEngagement
        });
        risks.push('low_parent_engagement');
      }
    }

    // Assignment submission analysis (simulated)
    const [assignments] = await connection.execute(
      `SELECT COUNT(*) as total_assignments,
       SUM(CASE WHEN score < 60 THEN 1 ELSE 0 END) as failed_assignments
       FROM grades WHERE student_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`,
      [studentId]
    );

    if (assignments[0].total_assignments > 0) {
      const failureRate = (assignments[0].failed_assignments / assignments[0].total_assignments) * 100;
      if (failureRate > 50) {
        insights.push({
          type: 'assignment_risk',
          severity: 'high',
          message: `${student.name} is failing ${Math.round(failureRate)}% of recent assignments. Academic support needed.`,
          data: { failureRate: Math.round(failureRate), totalAssignments: assignments[0].total_assignments }
        });
        risks.push('assignment_failure');
      }
    }

    // Calculate overall risk score
    let riskScore = 0;
    if (risks.includes('academic_decline')) riskScore += 40;
    if (risks.includes('attendance_risk')) riskScore += 30;
    if (risks.includes('low_parent_engagement')) riskScore += 20;
    if (risks.includes('assignment_failure')) riskScore += 30;

    const overallRisk = riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low';

    connection.release();

    return {
      studentId,
      studentName: student.name,
      insights,
      risks,
      overallRisk,
      riskScore: Math.min(riskScore, 100),
      lastAnalyzed: new Date().toISOString()
    };
  }

  // Generate class-wide insights
  async generateClassInsights(grade) {
    const connection = await this.pool.getConnection();
    
    const [students] = await connection.execute(
      'SELECT id, name FROM students WHERE grade = ?',
      [grade]
    );

    const classInsights = {
      grade,
      totalStudents: students.length,
      highRiskStudents: 0,
      mediumRiskStudents: 0,
      insights: [],
      engagementHeatmap: []
    };

    // Analyze each student
    for (const student of students) {
      const studentAnalysis = await this.generateStudentInsights(student.id);
      if (studentAnalysis) {
        if (studentAnalysis.overallRisk === 'high') classInsights.highRiskStudents++;
        if (studentAnalysis.overallRisk === 'medium') classInsights.mediumRiskStudents++;

        // Add to heatmap
        classInsights.engagementHeatmap.push({
          studentId: student.id,
          studentName: student.name,
          riskLevel: studentAnalysis.overallRisk,
          riskScore: studentAnalysis.riskScore
        });
      }
    }

    // Generate class-level insights
    const riskPercentage = (classInsights.highRiskStudents / classInsights.totalStudents) * 100;
    if (riskPercentage > 25) {
      classInsights.insights.push({
        type: 'class_risk',
        severity: 'high',
        message: `${Math.round(riskPercentage)}% of students in ${grade} are at high risk. Class-wide intervention needed.`
      });
    }

    // Check recent assignment performance
    const [assignmentStats] = await connection.execute(
      `SELECT AVG(score) as avg_score, COUNT(*) as total_assignments
       FROM grades g JOIN students s ON g.student_id = s.id
       WHERE s.grade = ? AND g.date >= DATE_SUB(NOW(), INTERVAL 2 WEEKS)`,
      [grade]
    );

    if (assignmentStats[0].avg_score < 70) {
      classInsights.insights.push({
        type: 'class_performance',
        severity: 'medium',
        message: `Class average for recent assignments is ${Math.round(assignmentStats[0].avg_score)}%. Consider reviewing teaching methods.`
      });
    }

    connection.release();
    return classInsights;
  }

  // Generate engagement heatmap data
  async generateEngagementHeatmap(timeframe = 'week') {
    const connection = await this.pool.getConnection();
    
    const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const [students] = await connection.execute('SELECT id, name, grade FROM students');
    
    const heatmapData = [];

    for (const student of students) {
      // Calculate engagement score based on multiple factors
      const [attendance] = await connection.execute(
        `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
         FROM attendance WHERE student_id = ? AND date >= ?`,
        [student.id, cutoffDate.toISOString().split('T')[0]]
      );

      const [grades] = await connection.execute(
        `SELECT AVG(score) as avg_score, COUNT(*) as grade_count
         FROM grades WHERE student_id = ? AND date >= ?`,
        [student.id, cutoffDate.toISOString().split('T')[0]]
      );

      const attendanceRate = attendance[0].total > 0 ? (attendance[0].present / attendance[0].total) * 100 : 0;
      const gradeAvg = grades[0].avg_score || 0;
      const hasRecentGrades = grades[0].grade_count > 0;

      // Calculate engagement score (0-100)
      let engagementScore = 0;
      engagementScore += attendanceRate * 0.4; // 40% weight for attendance
      engagementScore += (gradeAvg / 100) * 40; // 40% weight for grades
      engagementScore += hasRecentGrades ? 20 : 0; // 20% weight for recent activity

      heatmapData.push({
        studentId: student.id,
        studentName: student.name,
        grade: student.grade,
        engagementScore: Math.round(engagementScore),
        attendanceRate: Math.round(attendanceRate),
        gradeAverage: Math.round(gradeAvg),
        level: engagementScore > 75 ? 'high' : engagementScore > 50 ? 'medium' : 'low'
      });
    }

    connection.release();
    return heatmapData;
  }
}

module.exports = AnalyticsEngine;
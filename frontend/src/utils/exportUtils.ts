import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Dashboard Export Functions
export const exportDashboardToPDF = (
  studentName: string,
  studentGrade: string,
  stats: any,
  grades: any[],
  attendance: any[],
  feedback: any[]
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Student Dashboard Report', 20, 20);
  
  // Student Info
  doc.setFontSize(12);
  doc.text(`Student: ${studentName}`, 20, 40);
  doc.text(`Grade: ${studentGrade}`, 20, 50);
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 60);
  
  // Stats
  doc.setFontSize(14);
  doc.text('Performance Overview', 20, 80);
  doc.setFontSize(10);
  doc.text(`Attendance Rate: ${stats?.attendance_rate || 0}%`, 20, 90);
  doc.text(`Grade Average: ${stats?.grade_average || 0}%`, 20, 100);
  doc.text(`Total Feedback: ${stats?.total_feedback || 0}`, 20, 110);
  
  // Recent Grades Table
  if (grades.length > 0) {
    doc.autoTable({
      startY: 120,
      head: [['Subject', 'Score', 'Grade', 'Date']],
      body: grades.slice(0, 10).map(grade => [
        grade.subject,
        `${grade.score}%`,
        grade.grade,
        grade.date
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
  }
  
  doc.save(`${studentName}_dashboard_report.pdf`);
};

export const exportDashboardToExcel = (
  studentName: string,
  studentGrade: string,
  stats: any,
  grades: any[],
  attendance: any[],
  feedback: any[]
) => {
  const wb = XLSX.utils.book_new();
  
  // Overview Sheet
  const overviewData = [
    ['Student Dashboard Report'],
    [''],
    ['Student Name', studentName],
    ['Grade', studentGrade],
    ['Report Date', new Date().toLocaleDateString()],
    [''],
    ['Performance Overview'],
    ['Attendance Rate', `${stats?.attendance_rate || 0}%`],
    ['Grade Average', `${stats?.grade_average || 0}%`],
    ['Total Feedback', stats?.total_feedback || 0]
  ];
  
  const overviewWS = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, overviewWS, 'Overview');
  
  // Grades Sheet
  if (grades.length > 0) {
    const gradesData = [
      ['Subject', 'Score', 'Grade', 'Date'],
      ...grades.map(grade => [grade.subject, grade.score, grade.grade, grade.date])
    ];
    const gradesWS = XLSX.utils.aoa_to_sheet(gradesData);
    XLSX.utils.book_append_sheet(wb, gradesWS, 'Grades');
  }
  
  // Attendance Sheet
  if (attendance.length > 0) {
    const attendanceData = [
      ['Date', 'Status', 'Student'],
      ...attendance.map(record => [record.date, record.status, record.student_name])
    ];
    const attendanceWS = XLSX.utils.aoa_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(wb, attendanceWS, 'Attendance');
  }
  
  // Feedback Sheet
  if (feedback.length > 0) {
    const feedbackData = [
      ['Subject', 'Rating', 'Message', 'Date'],
      ...feedback.map(item => [item.subject, item.rating, item.message, item.date])
    ];
    const feedbackWS = XLSX.utils.aoa_to_sheet(feedbackData);
    XLSX.utils.book_append_sheet(wb, feedbackWS, 'Feedback');
  }
  
  XLSX.writeFile(wb, `${studentName}_dashboard_report.xlsx`);
};

// Fees Export Functions
export const exportFeesToPDF = (fees: any[], stats: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Fee Records Report', 20, 20);
  
  // Summary
  doc.setFontSize(12);
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 40);
  
  doc.setFontSize(14);
  doc.text('Fee Summary', 20, 60);
  doc.setFontSize(10);
  doc.text(`Total Fees: $${stats.total.toFixed(2)}`, 20, 70);
  doc.text(`Paid: $${stats.paid.toFixed(2)}`, 20, 80);
  doc.text(`Pending: $${stats.pending.toFixed(2)}`, 20, 90);
  doc.text(`Overdue: $${stats.overdue.toFixed(2)}`, 20, 100);
  
  // Fees Table
  if (fees.length > 0) {
    doc.autoTable({
      startY: 110,
      head: [['Student', 'Fee Type', 'Amount', 'Due Date', 'Status', 'Paid Date']],
      body: fees.map(fee => [
        fee.student_name || '',
        fee.fee_type,
        `$${fee.amount.toFixed(2)}`,
        fee.due_date,
        fee.status,
        fee.paid_date || '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
  }
  
  doc.save('fee_records_report.pdf');
};

export const exportFeesToExcel = (fees: any[], stats: any) => {
  const wb = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    ['Fee Records Report'],
    [''],
    ['Report Date', new Date().toLocaleDateString()],
    [''],
    ['Fee Summary'],
    ['Total Fees', `$${stats.total.toFixed(2)}`],
    ['Paid', `$${stats.paid.toFixed(2)}`],
    ['Pending', `$${stats.pending.toFixed(2)}`],
    ['Overdue', `$${stats.overdue.toFixed(2)}`]
  ];
  
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
  
  // Fees Sheet
  if (fees.length > 0) {
    const feesData = [
      ['Student', 'Fee Type', 'Amount', 'Due Date', 'Status', 'Paid Date', 'Payment Method'],
      ...fees.map(fee => [
        fee.student_name || '',
        fee.fee_type,
        fee.amount,
        fee.due_date,
        fee.status,
        fee.paid_date || '',
        fee.payment_method || ''
      ])
    ];
    const feesWS = XLSX.utils.aoa_to_sheet(feesData);
    XLSX.utils.book_append_sheet(wb, feesWS, 'Fee Records');
  }
  
  XLSX.writeFile(wb, 'fee_records_report.xlsx');
};

// Schedule Export Functions
export const exportScheduleToPDF = (schedule: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Class Schedule Report', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 40);
  
  // Schedule Table
  if (schedule.length > 0) {
    doc.autoTable({
      startY: 60,
      head: [['Subject', 'Day', 'Start Time', 'End Time', 'Location']],
      body: schedule.map(item => [
        item.subject,
        item.day,
        item.start_time,
        item.end_time,
        item.location
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
  }
  
  doc.save('class_schedule_report.pdf');
};

export const exportScheduleToExcel = (schedule: any[]) => {
  const wb = XLSX.utils.book_new();
  
  // Overview Sheet
  const overviewData = [
    ['Class Schedule Report'],
    [''],
    ['Report Date', new Date().toLocaleDateString()],
    ['Total Classes', schedule.length]
  ];
  
  const overviewWS = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, overviewWS, 'Overview');
  
  // Schedule Sheet
  if (schedule.length > 0) {
    const scheduleData = [
      ['Subject', 'Day', 'Start Time', 'End Time', 'Location', 'Notes'],
      ...schedule.map(item => [
        item.subject,
        item.day,
        item.start_time,
        item.end_time,
        item.location,
        item.notes || ''
      ])
    ];
    const scheduleWS = XLSX.utils.aoa_to_sheet(scheduleData);
    XLSX.utils.book_append_sheet(wb, scheduleWS, 'Schedule');
  }
  
  // Weekly View Sheet
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  
  const weeklyData = [
    ['Time', ...days],
    ...times.map(time => [
      time,
      ...days.map(day => {
        const classAtTime = schedule.find(item => 
          item.day === day && 
          item.start_time.substring(0, 5) <= time && 
          item.end_time.substring(0, 5) > time
        );
        return classAtTime ? classAtTime.subject : '';
      })
    ])
  ];
  
  const weeklyWS = XLSX.utils.aoa_to_sheet(weeklyData);
  XLSX.utils.book_append_sheet(wb, weeklyWS, 'Weekly View');
  
  XLSX.writeFile(wb, 'class_schedule_report.xlsx');
};
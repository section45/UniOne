require('dotenv').config();
console.log("=== MySQL Database Configuration ===");
console.log("Host:", process.env.DB_HOST);
console.log("Database:", process.env.DB_NAME);
console.log("User:", process.env.DB_USER);
console.log("Make sure MySQL server is running and accessible");
console.log("=====================================");

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');



const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Middleware

app.use(cors({
  origin: 'https://unione-frontend-lkcw.onrender.com', // or '*' for testing only
  credentials: true // if using cookies or auth headers
}));

app.use(express.json());

// MySQL Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Consult!1234',
  database: process.env.DB_NAME || 'school_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool

const pool = mysql.createPool(dbConfig);


// Initialize database and create tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
   
    
    // Users table (teachers and parents)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role ENUM('teacher', 'parent') NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Students table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        grade VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        parent_contact VARCHAR(20) NOT NULL,
        parent_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id)
      )
    `);

    // Attendance table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent', 'late') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        UNIQUE KEY unique_attendance (student_id, date)
      )
    `);

    // Grades table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject VARCHAR(100) NOT NULL,
        score INT NOT NULL CHECK (score >= 0 AND score <= 100),
        grade VARCHAR(5) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // Feedback table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // Announcements table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high') NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Drop the existing schedule_events table if it exists with wrong schema
    await connection.execute(`DROP TABLE IF EXISTS schedule_events`);
    console.log('Dropped existing schedule_events table to recreate with correct schema');
    
    // Create schedule_events table with correct schema
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS schedule_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(100) NOT NULL,
        day VARCHAR(20) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        location VARCHAR(100),
        student_id INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);
    console.log('Schedule events table created successfully with correct schema');

    // Create fees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS fees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        fee_type VARCHAR(100) NOT NULL,
        due_date DATE NOT NULL,
        paid_date DATE,
        status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // Create assignments table
await connection.execute(`
  CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'submitted', 'graded') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    points INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    teacher_id INT,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
  )
`);

// Create assignment_submissions table
await connection.execute(`
  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'submitted', 'graded') DEFAULT 'pending',
    submitted_at TIMESTAMP NULL,
    grade VARCHAR(5) NULL,
    score INT NULL,
    feedback TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment_student (assignment_id, student_id)
  )
`);


    // Insert demo data
    const hashedTeacherPassword = bcrypt.hashSync('teacher123', 10);
    const hashedParentPassword = bcrypt.hashSync('parent123', 10);

    // Insert demo users
    await connection.execute(`
      INSERT IGNORE INTO users (email, password, role, name, phone) VALUES 
      ('teacher@demo.com', ?, 'teacher', 'Sarah Johnson', '9876543211'),
      ('parent@demo.com', ?, 'parent', 'Michael Smith', '9876543210')
    `, [hashedTeacherPassword, hashedParentPassword]);

    // Insert demo students
    await connection.execute(`
      INSERT IGNORE INTO students (name, grade, email, parent_contact, parent_id) VALUES 
      ('Emma Smith', '10th Grade', 'emma.smith@school.com', '9876543210', 2),
      ('Jake Wilson', '9th Grade', 'jake.wilson@school.com', '9876543212', 2),
      ('Lily Brown', '10th Grade', 'lily.brown@school.com', '9876543213', 2)
    `);

    await connection.execute(`
      INSERT IGNORE INTO users (email, password, role, name, phone) VALUES 
      ('Preet@demo.com', ?, 'teacher', 'Preet Deddha', '9876543212'),
      ('parent.aarav@example.com', ?, 'parent', 'Rohit Mehta', '9876500001')
    `, [hashedTeacherPassword, hashedParentPassword]);

    await connection.execute(`
      INSERT IGNORE INTO users (email, password, role, name, phone) VALUES 
      ('Sunil@demo.com', ?, 'teacher', 'Sunil Sharma', '9876546553'),
      ('Kunal@demo.com', ?, 'parent', 'Kunal tyagi', '9876543889')
    `, [hashedTeacherPassword, hashedParentPassword]);

    await connection.execute(`
      INSERT IGNORE INTO users (email, password, role, name, phone) VALUES 
      ('Pradeep@demo.com', ?, 'teacher', 'Pradeep Patil', '9876391212'),
      ('Rahul@demo.com', ?, 'parent', 'Rahul Kumar', '9876541929')
    `, [hashedTeacherPassword, hashedParentPassword]);

    await connection.execute(`
      INSERT IGNORE INTO users (email, password, role, name, phone) VALUES 
      ('Asmita@demo.com', ?, 'teacher', 'Asmita Raut', '9806112212'),
      ('Priya@demo.com', ?, 'parent', 'Priya Desai', '989650009')
    `, [hashedTeacherPassword, hashedParentPassword]);

    

    // Insert demo attendance
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    await connection.execute(`
      INSERT IGNORE INTO attendance (student_id, date, status) VALUES 
      (1, ?, 'present'),
      (2, ?, 'present'),
      (3, ?, 'late'),
      (1, ?, 'present'),
      (2, ?, 'absent'),
      (3, ?, 'present')
    `, [
      today.toISOString().split('T')[0],
      today.toISOString().split('T')[0],
      today.toISOString().split('T')[0],
      yesterday.toISOString().split('T')[0],
      yesterday.toISOString().split('T')[0],
      yesterday.toISOString().split('T')[0]
    ]);

    // Insert demo grades
    await connection.execute(`
      INSERT IGNORE INTO grades (student_id, subject, score, grade, date) VALUES 
      (1, 'Mathematics', 92, 'A', '2024-01-15'),
      (1, 'Science', 88, 'B+', '2024-01-16'),
      (1, 'English', 95, 'A+', '2024-01-17'),
      (2, 'Mathematics', 85, 'B', '2024-01-15'),
      (2, 'Science', 78, 'B-', '2024-01-16'),
      (2, 'English', 82, 'B', '2024-01-17'),
      (3, 'Mathematics', 90, 'A-', '2024-01-15'),
      (3, 'Science', 93, 'A', '2024-01-16'),
      (3, 'English', 87, 'B+', '2024-01-17')
    `);

    // Insert demo feedback
    await connection.execute(`
      INSERT IGNORE INTO feedback (student_id, subject, message, rating, date) VALUES 
      (1, 'Mathematics', 'Emma shows excellent problem-solving skills and is always eager to learn new concepts.', 5, '2024-01-20'),
      (1, 'Science', 'Great participation in lab experiments. Keep up the good work!', 4, '2024-01-21'),
      (2, 'Mathematics', 'Jake has improved significantly this term. Needs to work on homework consistency.', 3, '2024-01-20'),
      (3, 'English', 'Lily has excellent writing skills and contributes well to class discussions.', 5, '2024-01-22')
    `);

    // Insert demo announcements
    await connection.execute(`
      INSERT IGNORE INTO announcements (title, content, priority, date) VALUES 
      ('Parent-Teacher Meeting', 'Annual parent-teacher meetings scheduled for next week. Please check your email for appointment details.', 'high', '2024-01-25'),
      ('Science Fair', 'The annual science fair will be held on February 15th. Students can start preparing their projects.', 'medium', '2024-01-23'),
      ('Winter Break Notice', 'School will be closed from December 25th to January 5th for winter break.', 'low', '2024-01-24')
    `);

    // Insert demo schedule events
    await connection.execute(`
      INSERT IGNORE INTO schedule_events (subject, day, start_time, end_time, location, student_id, notes) VALUES 
      ('Mathematics', 'Monday', '09:00:00', '09:45:00', 'Room 101', NULL, 'General Mathematics class for all students'),
      ('Science', 'Monday', '10:00:00', '10:45:00', 'Lab 1', NULL, 'Physics - Motion and Force'),
      ('English', 'Monday', '11:00:00', '11:45:00', 'Room 102', NULL, 'Literature - Shakespeare'),
      ('Mathematics', 'Tuesday', '09:00:00', '09:45:00', 'Room 101', 1, 'Special tutoring for Emma Smith'),
      ('Science', 'Tuesday', '10:00:00', '10:45:00', 'Lab 1', NULL, 'Chemistry - Elements for all students'),
      ('Physical Education', 'Wednesday', '14:00:00', '15:00:00', 'Gymnasium', NULL, 'Sports activities'),
      ('Computer Science', 'Thursday', '11:00:00', '12:00:00', 'Computer Lab', 2, 'Programming basics for Jake Wilson'),
      ('Art', 'Friday', '13:00:00', '14:00:00', 'Art Room', NULL, 'Creative arts session')
    `);
    console.log('Demo schedule data inserted successfully');

    // Insert demo fees
    await connection.execute(`
      INSERT IGNORE INTO fees (student_id, amount, fee_type, due_date, status) VALUES 
      (1, 2500.00, 'Tuition Fee', '2025-03-01', 'pending'),
      (2, 2500.00, 'Tuition Fee', '2025-03-01', 'paid'),
      (3, 2500.00, 'Tuition Fee', '2025-03-01', 'pending'),
      (1, 500.00, 'Library Fee', '2025-02-15', 'paid'),
      (2, 500.00, 'Library Fee', '2025-02-15', 'pending')
    `);



    connection.release();
    console.log('Database initialized successfully with MySQL');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize database on startup
initializeDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Schedule routes
app.get('/api/schedule', authenticateToken, async (req, res) => {
  console.log('GET /api/schedule - User role:', req.user.role, 'User ID:', req.user.id);
  
  try {
    const connection = await pool.getConnection();
    
    if (req.user.role === 'parent') {
      // For parents, show schedules for their children (both general and specific)
      console.log('Fetching schedule for parent ID:', req.user.id);
      const [events] = await connection.execute(
        `SELECT s.*, st.name as student_name, st.grade as student_grade
         FROM schedule_events s 
         LEFT JOIN students st ON s.student_id = st.id 
         WHERE s.student_id IS NULL OR st.parent_id = ?
         ORDER BY 
           CASE s.day 
             WHEN 'Monday' THEN 1 
             WHEN 'Tuesday' THEN 2 
             WHEN 'Wednesday' THEN 3 
             WHEN 'Thursday' THEN 4 
             WHEN 'Friday' THEN 5 
             WHEN 'Saturday' THEN 6 
             ELSE 7 
           END, 
           s.start_time ASC`,
        [req.user.id]
      );
      console.log('Parent schedule events found:', events.length);
      connection.release();
      res.json(events);
    } else {
      // For teachers, show all schedules
      console.log('Fetching all schedules for teacher');
      const [events] = await connection.execute(
        `SELECT s.*, st.name as student_name, st.grade as student_grade
         FROM schedule_events s 
         LEFT JOIN students st ON s.student_id = st.id 
         ORDER BY 
           CASE s.day 
             WHEN 'Monday' THEN 1 
             WHEN 'Tuesday' THEN 2 
             WHEN 'Wednesday' THEN 3 
             WHEN 'Thursday' THEN 4 
             WHEN 'Friday' THEN 5 
             WHEN 'Saturday' THEN 6 
             ELSE 7 
           END, 
           s.start_time ASC`
      );
      console.log('Teacher schedule events found:', events.length);
      connection.release();
      res.json(events);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all assignments
app.get('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const [assignments] = await pool.query('SELECT * FROM assignments');
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new assignment
app.post('/api/assignments', authenticateToken, async (req, res) => {
  const { title, description, subject, due_date, priority, points, teacher_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO assignments (title, description, subject, due_date, priority, points, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, subject, due_date, priority, points, teacher_id]
    );
    res.status(201).json({ message: 'Assignment created', id: result.insertId });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update assignment
app.put('/api/assignments/:id', authenticateToken, async (req, res) => {
  const assignmentId = req.params.id;
  const { title, description, subject, due_date, status, priority, points } = req.body;
  try {
    await pool.query(
      'UPDATE assignments SET title=?, description=?, subject=?, due_date=?, status=?, priority=?, points=? WHERE id=?',
      [title, description, subject, due_date, status, priority, points, assignmentId]
    );
    res.json({ message: 'Assignment updated' });
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete assignment
app.delete('/api/assignments/:id', authenticateToken, async (req, res) => {
  const assignmentId = req.params.id;
  try {
    await pool.query('DELETE FROM assignments WHERE id=?', [assignmentId]);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get submissions for an assignment
app.get('/api/assignments/:id/submissions', authenticateToken, async (req, res) => {
  const assignmentId = req.params.id;
  try {
    const [submissions] = await pool.query(
      `SELECT s.id AS submission_id, st.name AS student_name, s.status, s.grade, s.score, s.feedback
       FROM assignment_submissions s
       JOIN students st ON s.student_id = st.id
       WHERE s.assignment_id = ?`,
      [assignmentId]
    );
    res.json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Grade a submission
app.put('/api/assignments/:assignmentId/submissions/:submissionId', authenticateToken, async (req, res) => {
  const { assignmentId, submissionId } = req.params;
  const { grade, score, feedback } = req.body;
  try {
    await pool.query(
      'UPDATE assignment_submissions SET grade=?, score=?, feedback=?, status="graded" WHERE id=? AND assignment_id=?',
      [grade, score, feedback, submissionId, assignmentId]
    );
    res.json({ message: 'Submission graded' });
  } catch (err) {
    console.error('Error grading submission:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Student/Parent submits assignment
app.put('/api/assignments/:assignmentId/submit', authenticateToken, async (req, res) => {
  const { assignmentId } = req.params;
  const { student_id } = req.body;
  try {
    await pool.query(
      'UPDATE assignment_submissions SET status="submitted", submitted_at=NOW() WHERE assignment_id=? AND student_id=?',
      [assignmentId, student_id]
    );
    res.json({ message: 'Assignment submitted successfully' });
  } catch (err) {
    console.error('Error submitting assignment:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.post('/api/schedule', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied. Only teachers can add schedule events.' });
  }

  console.log('POST /api/schedule - User:', req.user.role, 'Request body:', req.body);
  
  const { subject, day, start_time, end_time, location, student_id, notes } = req.body;

  // Validate required fields
  if (!subject || !day || !start_time || !end_time || !location) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).json({ error: 'All required fields must be filled: subject, day, start time, end time, and location' });
  }

  // Trim whitespace from string fields
  const trimmedSubject = subject.trim();
  const trimmedDay = day.trim();
  const trimmedStartTime = start_time.trim();
  const trimmedEndTime = end_time.trim();
  const trimmedLocation = location.trim();
  const trimmedNotes = notes ? notes.trim() : '';

  // Additional validation
  if (!trimmedSubject || !trimmedDay || !trimmedStartTime || !trimmedEndTime || !trimmedLocation) {
    console.log('Validation failed: Empty fields after trimming');
    return res.status(400).json({ error: 'All required fields must contain valid data (not just spaces)' });
  }

  // Validate day
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (!validDays.includes(trimmedDay)) {
    console.log('Validation failed: Invalid day:', trimmedDay);
    return res.status(400).json({ error: `Invalid day "${trimmedDay}". Must be one of: ${validDays.join(', ')}` });
  }

  // Validate time format (HH:MM) - more flexible regex
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(trimmedStartTime)) {
    console.log('Validation failed: Invalid start time format:', trimmedStartTime);
    return res.status(400).json({ error: `Invalid start time format "${trimmedStartTime}". Use HH:MM format (e.g., 09:00)` });
  }
  
  if (!timeRegex.test(trimmedEndTime)) {
    console.log('Validation failed: Invalid end time format:', trimmedEndTime);
    return res.status(400).json({ error: `Invalid end time format "${trimmedEndTime}". Use HH:MM format (e.g., 10:00)` });
  }

  // Validate that end time is after start time
  const startMinutes = parseInt(trimmedStartTime.split(':')[0]) * 60 + parseInt(trimmedStartTime.split(':')[1]);
  const endMinutes = parseInt(trimmedEndTime.split(':')[0]) * 60 + parseInt(trimmedEndTime.split(':')[1]);
  
  if (endMinutes <= startMinutes) {
    console.log('Validation failed: End time not after start time');
    return res.status(400).json({ error: `End time (${trimmedEndTime}) must be after start time (${trimmedStartTime})` });
  }

  // Validate student_id if provided
  let finalStudentId = null;
  if (student_id && student_id !== '' && student_id !== 'null' && student_id !== 'undefined') {
    finalStudentId = parseInt(student_id);
    if (isNaN(finalStudentId)) {
      console.log('Validation failed: Invalid student_id:', student_id);
      return res.status(400).json({ error: 'Invalid student ID provided' });
    }
  }
  
  console.log('Processed data:', {
    subject: trimmedSubject,
    day: trimmedDay,
    start_time: trimmedStartTime,
    end_time: trimmedEndTime,
    location: trimmedLocation,
    student_id: finalStudentId,
    notes: trimmedNotes
  });

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `INSERT INTO schedule_events (subject, day, start_time, end_time, location, student_id, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [trimmedSubject, trimmedDay, trimmedStartTime, trimmedEndTime, trimmedLocation, finalStudentId, trimmedNotes]
    );
    
    console.log('Schedule event created with ID:', result.insertId);
    connection.release();
    
    res.json({ 
      id: result.insertId, 
      message: 'Schedule event added successfully',
      schedule: {
        id: result.insertId,
        subject: trimmedSubject,
        day: trimmedDay,
        start_time: trimmedStartTime,
        end_time: trimmedEndTime,
        location: trimmedLocation,
        student_id: finalStudentId,
        notes: trimmedNotes
      }
    });
  } catch (error) {
    console.error('Database insert error:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid student selected' });
    }
    return res.status(500).json({ error: 'Database error: Failed to add schedule event' });
  }
});

app.put('/api/schedule/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied. Only teachers can update schedule events.' });
  }

  console.log('PUT /api/schedule/:id - ID:', req.params.id, 'Request body:', req.body);
  
  const { id } = req.params;
  const { subject, day, start_time, end_time, location, student_id, notes } = req.body;

  // Validate required fields
  if (!subject || !day || !start_time || !end_time || !location) {
    return res.status(400).json({ error: 'All required fields must be filled: subject, day, start time, end time, and location' });
  }

  // Trim whitespace from string fields
  const trimmedSubject = subject.trim();
  const trimmedDay = day.trim();
  const trimmedStartTime = start_time.trim();
  const trimmedEndTime = end_time.trim();
  const trimmedLocation = location.trim();
  const trimmedNotes = notes ? notes.trim() : '';

  // Validate day
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (!validDays.includes(trimmedDay)) {
    return res.status(400).json({ error: `Invalid day "${trimmedDay}". Must be one of: ${validDays.join(', ')}` });
  }

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(trimmedStartTime)) {
    return res.status(400).json({ error: `Invalid start time format "${trimmedStartTime}". Use HH:MM format` });
  }
  if (!timeRegex.test(trimmedEndTime)) {
    return res.status(400).json({ error: `Invalid end time format "${trimmedEndTime}". Use HH:MM format` });
  }

  // Validate that end time is after start time
  const startMinutes = parseInt(trimmedStartTime.split(':')[0]) * 60 + parseInt(trimmedStartTime.split(':')[1]);
  const endMinutes = parseInt(trimmedEndTime.split(':')[0]) * 60 + parseInt(trimmedEndTime.split(':')[1]);
  
  if (endMinutes <= startMinutes) {
    return res.status(400).json({ error: `End time (${trimmedEndTime}) must be after start time (${trimmedStartTime})` });
  }

  let finalStudentId = null;
  if (student_id && student_id !== '' && student_id !== 'null' && student_id !== 'undefined') {
    finalStudentId = parseInt(student_id);
    if (isNaN(finalStudentId)) {
      return res.status(400).json({ error: 'Invalid student ID provided' });
    }
  }

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `UPDATE schedule_events 
       SET subject = ?, day = ?, start_time = ?, end_time = ?, location = ?, student_id = ?, notes = ? 
       WHERE id = ?`,
      [trimmedSubject, trimmedDay, trimmedStartTime, trimmedEndTime, trimmedLocation, finalStudentId, trimmedNotes, id]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Schedule event not found' });
    }

    console.log('Schedule event updated, ID:', id);
    res.json({ message: 'Schedule event updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error: Failed to update schedule event' });
  }
});

app.delete('/api/schedule/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied. Only teachers can delete schedule events.' });
  }

  console.log('DELETE /api/schedule/:id - ID:', req.params.id);
  
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute('DELETE FROM schedule_events WHERE id = ?', [id]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Schedule event not found' });
    }

    console.log('Schedule event deleted, ID:', id);
    res.json({ message: 'Schedule event deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error: Failed to delete schedule event' });
  }
});

// Fees routes
app.get('/api/fees', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    if (req.user.role === 'parent') {
      const [fees] = await connection.execute(
        `SELECT f.*, s.name as student_name, s.grade 
         FROM fees f 
         JOIN students s ON f.student_id = s.id 
         WHERE s.parent_id = ?
         ORDER BY f.due_date DESC`,
        [req.user.id]
      );
      connection.release();
      res.json(fees);
    } else {
      const [fees] = await connection.execute(
        `SELECT f.*, s.name as student_name, s.grade 
         FROM fees f 
         JOIN students s ON f.student_id = s.id 
         ORDER BY f.due_date DESC`
      );
      connection.release();
      res.json(fees);
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/fees', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can create fee records' });
  }

  const { student_id, amount, fee_type, due_date } = req.body;

  if (!student_id || !amount || !fee_type || !due_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if due date is in the past to set overdue status
  const currentDate = new Date().toISOString().split('T')[0];
  const status = due_date < currentDate ? 'overdue' : 'pending';

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO fees (student_id, amount, fee_type, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [student_id, amount, fee_type, due_date, status]
    );
    connection.release();
    
    res.json({ 
      id: result.insertId, 
      message: 'Fee record created successfully',
      fee: {
        id: result.insertId,
        student_id,
        amount,
        fee_type,
        due_date,
        status
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to create fee record' });
  }
});

app.post('/api/fees/payment', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can add fee payments' });
  }

  const { fee_id, payment_method, paid_date } = req.body;

  try {
    const connection = await pool.getConnection();
    const [fees] = await connection.execute('SELECT * FROM fees WHERE id = ?', [fee_id]);

    if (fees.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Fee record not found' });
    }

    const fee = fees[0];
    if (fee.status === 'paid') {
      connection.release();
      return res.status(400).json({ error: 'Fee is already paid' });
    }

    await connection.execute(
      'UPDATE fees SET status = ?, paid_date = ?, payment_method = ? WHERE id = ?',
      ['paid', paid_date, payment_method, fee_id]
    );
    connection.release();

    res.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to record payment' });
  }
});

app.delete('/api/fees/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can delete fee records' });
  }

  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute('DELETE FROM fees WHERE id = ?', [id]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fee record not found' });
    }

    res.json({ message: 'Fee record deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to delete fee record' });
  }
});

// Helper function to get letter grade
const getLetterGrade = (score) => {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 65) return 'D';
  return 'F';
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, role]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/mobile-login', async (req, res) => {
  try {
    const { phone, role } = req.body;

    if (!phone || !role) {
      return res.status(400).json({ error: 'Phone and role are required' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE phone = ? AND role = ?',
      [phone, role]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid phone number or role' });
    }

    // In a real app, you would send an actual OTP
    // For demo purposes, we'll accept any 6-digit OTP
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      demoOtp: '123456' // For demo purposes
    });
  } catch (error) {
    console.error('Mobile login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp, role } = req.body;

    if (!phone || !otp || !role) {
      return res.status(400).json({ error: 'Phone, OTP, and role are required' });
    }

    // For demo purposes, accept '123456' as valid OTP
    if (otp !== '123456') {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE phone = ? AND role = ?',
      [phone, role]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid phone number or role' });
    }

    const user = users[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Student routes
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    if (req.user.role === 'parent') {
      const [students] = await connection.execute(
        'SELECT * FROM students WHERE parent_id = ?',
        [req.user.id]
      );
      connection.release();
      res.json(students);
    } else {
      const [students] = await connection.execute('SELECT * FROM students');
      connection.release();
      res.json(students);
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/students', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can add students' });
  }

  const { name, grade, email, parent_contact } = req.body;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO students (name, grade, email, parent_contact) VALUES (?, ?, ?, ?)',
      [name, grade, email, parent_contact]
    );
    connection.release();
    
    res.json({ id: result.insertId, message: 'Student added successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to add student' });
  }
});

// Attendance routes
app.get('/api/attendance', authenticateToken, async (req, res) => {
  const { date } = req.query;
  
  try {
    const connection = await pool.getConnection();
    
    if (req.user.role === 'parent') {
      const query = `SELECT a.*, s.name as student_name, s.grade 
                     FROM attendance a 
                     JOIN students s ON a.student_id = s.id 
                     WHERE s.parent_id = ? ${date ? 'AND a.date = ?' : ''}
                     ORDER BY a.date DESC`;
      const params = date ? [req.user.id, date] : [req.user.id];
      const [attendance] = await connection.execute(query, params);
      connection.release();
      res.json(attendance);
    } else {
      const query = `SELECT a.*, s.name as student_name, s.grade 
                     FROM attendance a 
                     JOIN students s ON a.student_id = s.id 
                     ${date ? 'WHERE a.date = ?' : ''}
                     ORDER BY a.date DESC`;
      const params = date ? [date] : [];
      const [attendance] = await connection.execute(query, params);
      connection.release();
      res.json(attendance);
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/attendance', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can record attendance' });
  }

  const { student_id, date, status } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)',
      [student_id, date, status]
    );
    connection.release();
    
    res.json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// Grades routes
app.get('/api/grades', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    if (req.user.role === 'parent') {
      const [grades] = await connection.execute(
        `SELECT g.*, s.name as student_name, s.grade as student_grade 
         FROM grades g 
         JOIN students s ON g.student_id = s.id 
         WHERE s.parent_id = ?
         ORDER BY g.date DESC`,
        [req.user.id]
      );
      connection.release();
      res.json(grades);
    } else {
      const [grades] = await connection.execute(
        `SELECT g.*, s.name as student_name, s.grade as student_grade 
         FROM grades g 
         JOIN students s ON g.student_id = s.id 
         ORDER BY g.date DESC`
      );
      connection.release();
      res.json(grades);
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/grades', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can add grades' });
  }

  const { student_id, subject, score, date } = req.body;
  const grade = getLetterGrade(score);

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO grades (student_id, subject, score, grade, date) VALUES (?, ?, ?, ?, ?)',
      [student_id, subject, score, grade, date]
    );
    connection.release();
    
    res.json({ id: result.insertId, message: 'Grade added successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to add grade' });
  }
});

// Feedback routes
app.get('/api/feedback', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    if (req.user.role === 'parent') {
      const [feedback] = await connection.execute(
        `SELECT f.*, s.name as student_name, s.grade as student_grade 
         FROM feedback f 
         JOIN students s ON f.student_id = s.id 
         WHERE s.parent_id = ?
         ORDER BY f.date DESC`,
        [req.user.id]
      );
      connection.release();
      res.json(feedback);
    } else {
      const [feedback] = await connection.execute(
        `SELECT f.*, s.name as student_name, s.grade as student_grade 
         FROM feedback f 
         JOIN students s ON f.student_id = s.id 
         ORDER BY f.date DESC`
      );
      connection.release();
      res.json(feedback);
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/assignments/my-children', authenticateToken, async (req, res) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ error: 'Access denied. Only parents can access this endpoint.' });
  }

  try {
    const connection = await pool.getConnection();
    
    const [assignments] = await connection.execute(`
      SELECT 
        a.id as assignment_id,
        a.title,
        a.description,
        a.subject,
        a.due_date,
        a.priority,
        a.points,
        s.id as student_id,
        s.name as student_name,
        s.grade as student_grade,
        asub.status as submission_status,
        asub.submitted_at,
        asub.grade as submission_grade,
        asub.score as submission_score,
        asub.feedback as submission_feedback
      FROM students s
      CROSS JOIN assignments a
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND s.id = asub.student_id
      WHERE s.parent_id = ?
      ORDER BY a.due_date DESC, s.name ASC
    `, [req.user.id]);
    
    connection.release();
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching parent assignments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/feedback', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can add feedback' });
  }

  const { student_id, subject, message, rating, date } = req.body;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO feedback (student_id, subject, message, rating, date) VALUES (?, ?, ?, ?, ?)',
      [student_id, subject, message, rating, date]
    );
    connection.release();
    
    res.json({ id: result.insertId, message: 'Feedback added successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to add feedback' });
  }
});

// Announcements routes
app.get('/api/announcements', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [announcements] = await connection.execute(
      'SELECT * FROM announcements ORDER BY date DESC, priority DESC'
    );
    connection.release();
    res.json(announcements);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/announcements', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can add announcements' });
  }

  const { title, content, priority, date } = req.body;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO announcements (title, content, priority, date) VALUES (?, ?, ?, ?)',
      [title, content, priority, date]
    );
    connection.release();
    
    res.json({ id: result.insertId, message: 'Announcement added successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to add announcement' });
  }
});

// Dashboard stats routes
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    if (req.user.role === 'teacher') {
      // Teacher dashboard stats
      const [studentCount] = await connection.execute('SELECT COUNT(*) as total_students FROM students');

      const today = new Date().toISOString().split('T')[0];
      const [attendanceStats] = await connection.execute(
        `SELECT 
          COUNT(*) as total_attendance,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count
         FROM attendance WHERE date = ?`,
        [today]
      );

      const [gradeStats] = await connection.execute('SELECT AVG(score) as avg_score FROM grades');
      const [feedbackCount] = await connection.execute('SELECT COUNT(*) as total_feedback FROM feedback');

      const attendanceRate = attendanceStats[0].total_attendance > 0 
        ? Math.round((attendanceStats[0].present_count / attendanceStats[0].total_attendance) * 100)
        : 0;

      connection.release();
      res.json({
        total_students: studentCount[0].total_students,
        attendance_rate: attendanceRate,
        class_average: Math.round(gradeStats[0].avg_score || 0),
        total_feedback: feedbackCount[0].total_feedback
      });
    } else {
      // Parent dashboard stats
      const [attendanceStats] = await connection.execute(
        `SELECT 
          COUNT(*) as total_attendance,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count
         FROM attendance a 
         JOIN students s ON a.student_id = s.id 
         WHERE s.parent_id = ?`,
        [req.user.id]
      );

      const [gradeStats] = await connection.execute(
        `SELECT AVG(score) as avg_score 
         FROM grades g 
         JOIN students s ON g.student_id = s.id 
         WHERE s.parent_id = ?`,
        [req.user.id]
      );

      const [feedbackCount] = await connection.execute(
        `SELECT COUNT(*) as total_feedback 
         FROM feedback f 
         JOIN students s ON f.student_id = s.id 
         WHERE s.parent_id = ?`,
        [req.user.id]
      );

      const attendanceRate = attendanceStats[0]?.total_attendance > 0 
        ? Math.round((attendanceStats[0].present_count / attendanceStats[0].total_attendance) * 100)
        : 0;

      connection.release();
      res.json({
        attendance_rate: attendanceRate,
        grade_average: Math.round(gradeStats[0].avg_score || 0),
        total_feedback: feedbackCount[0].total_feedback
      });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Analytics routes
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const connection = await pool.getConnection();
    
    // Calculate date range based on timeframe
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Overview stats
    const [studentCount] = await connection.execute('SELECT COUNT(*) as total FROM students');
    const [avgGrade] = await connection.execute(
      'SELECT AVG(score) as avg FROM grades WHERE date >= ? AND date <= ?',
      [startDateStr, endDateStr]
    );
    const [attendanceRate] = await connection.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
       FROM attendance WHERE date >= ? AND date <= ?`,
      [startDateStr, endDateStr]
    );

    const overview = {
      totalStudents: studentCount[0].total,
      averageGrade: Math.round(avgGrade[0].avg || 0),
      attendanceRate: attendanceRate[0].total > 0 
        ? Math.round((attendanceRate[0].present / attendanceRate[0].total) * 100) 
        : 0,
      engagementScore: 75 // Calculated based on multiple factors
    };

    // AI Insights
    const insights = await generateAIInsights(connection, startDateStr, endDateStr);
    
    // Risk Students
    const riskStudents = await calculateRiskStudents(connection, startDateStr, endDateStr);
    
    // Engagement Heatmap
    const engagementHeatmap = await generateEngagementHeatmap(connection, startDateStr, endDateStr);
    
    // Trends
    const trends = await calculateTrends(connection, timeframe);
    
    // Class Performance
    const classPerformance = await getClassPerformance(connection, startDateStr, endDateStr);

    connection.release();

    res.json({
      overview,
      insights,
      riskStudents,
      engagementHeatmap,
      trends,
      classPerformance
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Helper function to generate AI insights
async function generateAIInsights(connection, startDate, endDate) {
  const insights = [];

  // Check for declining grades
  const [gradeDecline] = await connection.execute(`
    SELECT s.name, s.id, AVG(g.score) as avg_score,
           COUNT(g.id) as grade_count
    FROM students s
    LEFT JOIN grades g ON s.id = g.student_id 
    WHERE g.date >= ? AND g.date <= ?
    GROUP BY s.id, s.name
    HAVING avg_score < 70 AND grade_count >= 3
  `, [startDate, endDate]);

  if (gradeDecline.length > 0) {
    insights.push({
      id: 'grade-decline-1',
      type: 'warning',
      title: `${gradeDecline.length} students showing grade decline`,
      description: `Students with average grades below 70% in the selected period. This indicates potential academic struggles.`,
      actionable: 'Schedule individual meetings with these students and consider additional tutoring support.',
      confidence: 85,
      category: 'academic'
    });
  }

  // Check for attendance issues
  const [attendanceIssues] = await connection.execute(`
    SELECT s.name, s.id, 
           COUNT(a.id) as total_records,
           SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count
    FROM students s
    LEFT JOIN attendance a ON s.id = a.student_id 
    WHERE a.date >= ? AND a.date <= ?
    GROUP BY s.id, s.name
    HAVING (present_count / total_records) < 0.8
  `, [startDate, endDate]);

  if (attendanceIssues.length > 0) {
    insights.push({
      id: 'attendance-risk-1',
      type: 'critical',
      title: `${attendanceIssues.length} students with poor attendance`,
      description: `Students with attendance rate below 80%. Poor attendance strongly correlates with academic failure.`,
      actionable: 'Contact parents immediately and implement attendance monitoring program.',
      confidence: 92,
      category: 'attendance'
    });
  }

  // Check for fee payment issues
  const [feeIssues] = await connection.execute(`
    SELECT COUNT(*) as overdue_count
    FROM fees 
    WHERE status = 'pending' AND due_date < CURDATE()
  `);

  if (feeIssues[0].overdue_count > 0) {
    insights.push({
      id: 'fee-overdue-1',
      type: 'warning',
      title: `${feeIssues[0].overdue_count} overdue fee payments`,
      description: 'Multiple students have overdue fee payments which may affect their continued enrollment.',
      actionable: 'Send payment reminders and offer payment plan options to affected families.',
      confidence: 95,
      category: 'financial'
    });
  }

  // Positive insight for high performers
  const [highPerformers] = await connection.execute(`
    SELECT COUNT(*) as high_performer_count
    FROM (
      SELECT s.id, AVG(g.score) as avg_score
      FROM students s
      JOIN grades g ON s.id = g.student_id 
      WHERE g.date >= ? AND g.date <= ?
      GROUP BY s.id
      HAVING avg_score >= 90
    ) as high_performers
  `, [startDate, endDate]);

  if (highPerformers[0].high_performer_count > 0) {
    insights.push({
      id: 'high-performers-1',
      type: 'success',
      title: `${highPerformers[0].high_performer_count} students excelling academically`,
      description: 'Students maintaining 90%+ average grades. Consider advanced placement opportunities.',
      actionable: 'Offer enrichment programs and leadership opportunities to these high-achieving students.',
      confidence: 88,
      category: 'academic'
    });
  }
  return insights;
}

// Helper function to calculate risk students
async function calculateRiskStudents(connection, startDate, endDate) {
  const [students] = await connection.execute(`
    SELECT s.*, 
           AVG(g.score) as avg_grade,
           COUNT(a.id) as attendance_records,
           SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
           COUNT(f.id) as feedback_count,
           MAX(a.date) as last_attendance
    FROM students s
    LEFT JOIN grades g ON s.id = g.student_id AND g.date >= ? AND g.date <= ?
    LEFT JOIN attendance a ON s.id = a.student_id AND a.date >= ? AND a.date <= ?
    LEFT JOIN feedback f ON s.id = f.student_id AND f.date >= ? AND f.date <= ?
    GROUP BY s.id
  `, [startDate, endDate, startDate, endDate, startDate, endDate]);

  return students.map(student => {
    const riskFactors = [];
    let riskScore = 0;

    // Grade risk
    if (student.avg_grade && student.avg_grade < 60) {
      riskFactors.push('Failing grades');
      riskScore += 30;
    } else if (student.avg_grade && student.avg_grade < 70) {
      riskFactors.push('Low grades');
      riskScore += 20;
    }

    // Attendance risk
    const attendanceRate = student.attendance_records > 0 
      ? (student.present_count / student.attendance_records) * 100 
      : 0;
    
    if (attendanceRate < 60) {
      riskFactors.push('Poor attendance');
      riskScore += 25;
    } else if (attendanceRate < 80) {
      riskFactors.push('Irregular attendance');
      riskScore += 15;
    }

    // Engagement risk
    if (student.feedback_count === 0) {
      riskFactors.push('No recent feedback');
      riskScore += 10;
    }

    // Recent activity risk
    const daysSinceLastAttendance = student.last_attendance 
      ? Math.floor((new Date() - new Date(student.last_attendance)) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (daysSinceLastAttendance > 7) {
      riskFactors.push('No recent activity');
      riskScore += 15;
    }

    let riskLevel = 'low';
    if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 25) riskLevel = 'medium';

    return {
      id: student.id,
      name: student.name,
      grade: student.grade,
      riskLevel,
      riskFactors,
      riskScore,
      lastActivity: student.last_attendance || 'No recent activity'
    };
  }).filter(student => student.riskScore > 0)
    .sort((a, b) => b.riskScore - a.riskScore);
}

// Helper function to generate engagement heatmap
async function generateEngagementHeatmap(connection, startDate, endDate) {
  const [students] = await connection.execute('SELECT id, name FROM students LIMIT 10');
  
  return students.map(student => {
    // Generate mock weekly engagement data
    const weeklyEngagement = Array.from({ length: 7 }, () => 
      Math.floor(Math.random() * 40) + 60 // Random between 60-100
    );
    
    const overallScore = Math.floor(weeklyEngagement.reduce((a, b) => a + b) / 7);
    
    // Determine trend
    const firstHalf = weeklyEngagement.slice(0, 3).reduce((a, b) => a + b) / 3;
    const secondHalf = weeklyEngagement.slice(4).reduce((a, b) => a + b) / 3;
    
    let trend = 'stable';
    if (secondHalf > firstHalf + 5) trend = 'up';
    else if (secondHalf < firstHalf - 5) trend = 'down';

    return {
      studentId: student.id,
      studentName: student.name,
      weeklyEngagement,
      overallScore,
      trend
    };
  });
}

// Helper function to calculate trends
async function calculateTrends(connection, timeframe) {
  const periods = [];
  const now = new Date();
  
  // Generate periods based on timeframe
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    if (timeframe === '7d') {
      date.setDate(date.getDate() - i);
      periods.push(date.toLocaleDateString());
    } else if (timeframe === '30d') {
      date.setDate(date.getDate() - (i * 5));
      periods.push(date.toLocaleDateString());
    } else {
      date.setMonth(date.getMonth() - i);
      periods.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
  }

  // Generate mock trend data
  return periods.map(period => ({
    period,
    grades: Math.floor(Math.random() * 20) + 75, // 75-95
    attendance: Math.floor(Math.random() * 15) + 80, // 80-95
    engagement: Math.floor(Math.random() * 25) + 70 // 70-95
  }));
}

// Helper function to get class performance
async function getClassPerformance(connection, startDate, endDate) {
  const [classes] = await connection.execute(`
    SELECT 
      s.grade as className,
      COUNT(DISTINCT s.id) as studentsCount,
      AVG(g.score) as averageGrade,
      COUNT(a.id) as total_attendance,
      SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count
    FROM students s
    LEFT JOIN grades g ON s.id = g.student_id AND g.date >= ? AND g.date <= ?
    LEFT JOIN attendance a ON s.id = a.student_id AND a.date >= ? AND a.date <= ?
    GROUP BY s.grade
  `, [startDate, endDate, startDate, endDate]);

  return classes.map(classData => {
    const attendanceRate = classData.total_attendance > 0 
      ? Math.round((classData.present_count / classData.total_attendance) * 100)
      : 0;
    
    const averageGrade = Math.round(classData.averageGrade || 0);
    const engagementLevel = Math.floor((attendanceRate + averageGrade) / 2);
    
    // Determine trend (mock calculation)
    const trendScore = Math.random();
    let trend = 'stable';
    if (trendScore > 0.6) trend = 'improving';
    else if (trendScore < 0.4) trend = 'declining';

    return {
      className: classData.className,
      studentsCount: classData.studentsCount,
      averageGrade,
      attendanceRate,
      engagementLevel,
      trend
    };
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('\n=== Demo Credentials ===');
  console.log('Teacher Login:');
  console.log('  Email: teacher@demo.com');
  console.log('  Password: teacher123');
  console.log('  Mobile: 9876543211');
  console.log('Parent Login:');
  console.log('  Email: parent@demo.com');
  console.log('  Password: parent123');
  console.log('  Mobile: 9876543210');
  console.log('OTP for mobile login: 123456');
  console.log('========================\n');
  console.log('\n=== MySQL Database Configuration ===');
  console.log('Host:', dbConfig.host);
  console.log('Database:', dbConfig.database);
  console.log('User:', dbConfig.user);
  console.log('Make sure MySQL server is running and accessible');
  console.log('=====================================\n');
});

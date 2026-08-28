import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, UserRecord } from './db.js';
import { AuthUser, UserRole } from '../src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';

// Middleware to protect routes
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Middleware to ensure user is faculty
export const requireFaculty = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as AuthUser | undefined;
  if (!user || user.role !== 'faculty') {
    return res.status(403).json({ error: 'Forbidden: Faculty access required' });
  }
  next();
};

export const initializeAdmin = async () => {
  const count = db.getUsersCount();
  if (count === 0) {
    // Seed default admin
    const passwordHash = await bcrypt.hash('admin123', 10);
    db.createUser({
      id: `u_${Date.now()}`,
      username: 'admin',
      password_hash: passwordHash,
      role: 'faculty',
      name: 'Department Admin',
    });
    console.log('Seeded default admin user (username: admin, password: admin123)');
  }

  // Migrate existing students to users if they are missing
  const students = db.getStudents();
  for (const student of students) {
    const existing = db.getUserByUsername(student.register_no);
    if (!existing) {
      const passwordHash = await bcrypt.hash(student.register_no, 10);
      db.createUser({
        id: `u_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        username: student.register_no,
        password_hash: passwordHash,
        role: 'student',
        name: student.student_name,
        student_id: student.id,
      });
      console.log(`Created default login for existing student: ${student.register_no}`);
    }
  }
};

export const generateToken = (user: UserRecord): string => {
  const payload: AuthUser = {
    id: user.student_id || user.id, // For students, use student_id as primary identifier in token
    role: user.role,
    username: user.username,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

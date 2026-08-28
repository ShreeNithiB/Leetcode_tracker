import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StudentWithLatest, Snapshot } from '../types';
import { RefreshCw, Activity, Award, Calendar, AlertCircle, UserCircle, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StudentDashboardViewProps {
  studentId: string;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({ studentId }) => {
  const [student, setStudent] = useState<StudentWithLatest | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStudent(studentId);
      setStudent(data.student);
      setSnapshots(data.snapshots);
      setRecentSubmissions(data.recent_submissions);
    } catch (err: any) {
      setError(err.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await api.fetchStudentData(studentId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  if (loading && !student) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-red-600 border border-red-200">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-6 h-6" />
          <h2 className="text-lg font-bold">Error</h2>
        </div>
        <p className="mt-2">{error || 'Student not found'}</p>
      </div>
    );
  }

  const snap = student.latest_snapshot;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{student.student_name}</h1>
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center space-x-1">
              <UserCircle className="w-3.5 h-3.5" />
              <span>Student Role</span>
            </span>
          </div>
          <p className="text-slate-500 font-medium">{student.register_no} • {student.section} Section • {student.year} Year</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <a
            href={`https://leetcode.com/${student.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            View LeetCode Profile
          </a>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      {snap ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 text-slate-500 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-medium text-sm">Total Solved</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{snap.total_solved}</p>
            <div className="mt-2 text-xs text-slate-500 flex justify-between">
              <span className="text-emerald-600">Easy: {snap.easy}</span>
              <span className="text-amber-600">Med: {snap.medium}</span>
              <span className="text-rose-600">Hard: {snap.hard}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 text-slate-500 mb-2">
              <Award className="w-5 h-5 text-purple-500" />
              <h3 className="font-medium text-sm">Contest Rating</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{Math.round(snap.contest_rating)}</p>
            <p className="mt-2 text-xs text-slate-500">Global Rank: {snap.contest_rank > 0 ? snap.contest_rank.toLocaleString() : 'N/A'}</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 text-slate-500 mb-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <h3 className="font-medium text-sm">Activity Status</h3>
            </div>
            <p className="text-lg font-bold text-slate-800">{snap.activity_status}</p>
            <p className="mt-1 text-xs text-slate-500">{student.days_inactive} days since last activity</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 text-slate-500 mb-2">
              <RefreshCw className="w-5 h-5 text-slate-400" />
              <h3 className="font-medium text-sm">Engagement Score</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{snap.engagement_score}</p>
            <p className="mt-2 text-xs text-slate-500">Performance: {snap.performance_tier}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500">
          <p>No LeetCode data found. Please click "Sync Now" to fetch your latest data.</p>
        </div>
      )}

      {snap && snap.skills && snap.skills.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
            <span>Topic-wise Performance</span>
          </h3>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="h-64 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={snap.skills.slice(0, 10)}
                    dataKey="problemsSolved"
                    nameKey="tagName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {snap.skills.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#3b82f6'][index % 10]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} problems`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Top Skills</h4>
              <div className="grid grid-cols-2 gap-3">
                {snap.skills.slice(0, 8).map(skill => (
                  <div key={skill.tagName} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-sm font-medium text-slate-700 truncate mr-2" title={skill.tagName}>{skill.tagName}</span>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{skill.problemsSolved}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {recentSubmissions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Recent Submissions</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recentSubmissions.slice(0, 10).map(sub => (
              <div key={sub.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <a 
                    href={`https://leetcode.com/problems/${sub.titleSlug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {sub.title}
                  </a>
                  <p className="text-xs text-slate-500 mt-1">{sub.language} • {sub.statusDisplay}</p>
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(parseInt(sub.timestamp) * 1000).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

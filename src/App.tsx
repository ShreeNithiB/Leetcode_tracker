import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './pages/DashboardView';
import { TracksView } from './pages/TracksView';
import { StudentsView } from './pages/StudentsView';
import { LeaderboardView } from './pages/LeaderboardView';
import { ProgressView } from './pages/ProgressView';
import { SectionsView } from './pages/SectionsView';
import { InterventionView } from './pages/InterventionView';
import { ReportsView } from './pages/ReportsView';
import { SettingsView } from './pages/SettingsView';
import { LoginView } from './pages/LoginView';
import { StudentDashboardView } from './pages/StudentDashboardView';

import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentFormModal } from './components/StudentFormModal';
import { ImportStudentsModal } from './components/ImportStudentsModal';
import { BatchFetchModal } from './components/BatchFetchModal';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';

import { api } from './services/api';
import { 
  DashboardSummary, 
  SectionStat, 
  BatchStat, 
  StudentWithLatest, 
  SystemSettings, 
  BatchFetchProgress,
  AuthUser
} from './types';
import { RefreshCw, AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // App Data
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sectionStats, setSectionStats] = useState<SectionStat[]>([]);
  const [batchStats, setBatchStats] = useState<BatchStat[]>([]);
  const [timeline, setTimeline] = useState<{ date: string; total_problems: number; avg_problems: number; avg_rating: number }[]>([]);
  const [students, setStudents] = useState<StudentWithLatest[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [batchProgress, setBatchProgress] = useState<BatchFetchProgress | undefined>(undefined);

  // Modal states
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentWithLatest | null>(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Auth Session Restore
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (storedToken && storedUser) {
      try {
        setAuthUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }

    const handleUnauthorized = () => {
      handleLogout();
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  // Initial Load (Only when faculty logged in)
  useEffect(() => {
    if (authUser && authUser.role === 'faculty') {
      loadAllData();
    }
  }, [authUser]);

  // Poll batch progress
  useEffect(() => {
    const checkProgress = async () => {
      try {
        const p = await api.getBatchProgress();
        setBatchProgress(p);
      } catch (e) {
        // ignore
      }
    };
    checkProgress();
    const interval = setInterval(checkProgress, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');

      const [dashData, studentList] = await Promise.all([
        api.getDashboard(),
        api.getStudents(),
      ]);

      setSummary(dashData.summary);
      setSectionStats(dashData.sectionStats);
      setBatchStats(dashData.batchStats);
      setTimeline(dashData.timeline);
      setSettings(dashData.settings);
      setStudents(studentList);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to backend service');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStudentDetail = (id: string) => {
    setSelectedStudentId(id);
    setIsDetailOpen(true);
  };

  const handleOpenAddStudent = () => {
    setStudentToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditStudent = (s: StudentWithLatest) => {
    setStudentToEdit(s);
    setIsFormOpen(true);
  };

  const handleLogin = (user: AuthUser, token: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setAuthUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setAuthUser(null);
  };

  // Render active view
  const renderActiveView = () => {
    if (loading && !summary) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading Department Analytics...</p>
        </div>
      );
    }

    if (error && !summary) {
      return (
        <div className="p-6 max-w-lg mx-auto bg-rose-950/30 border border-rose-800/50 rounded-xl text-center space-y-4 my-12">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-100">Unable to Connect</h2>
          <p className="text-xs text-rose-300">{error}</p>
          <button
            onClick={loadAllData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    if (!summary || !settings) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            summary={summary}
            sectionStats={sectionStats}
            batchStats={batchStats}
            timeline={timeline}
            students={students}
            onOpenBatchSync={() => setIsBatchModalOpen(true)}
            onOpenAddStudent={handleOpenAddStudent}
            onSelectStudent={handleOpenStudentDetail}
            onNavigateTab={setActiveTab}
          />
        );

      case 'tracks':
        return (
          <TracksView
            students={students}
            onOpenStudentDetail={handleOpenStudentDetail}
          />
        );

      case 'students':
        return (
          <StudentsView
            students={students}
            onSelectStudent={handleOpenStudentDetail}
            onOpenAddStudent={handleOpenAddStudent}
            onOpenEditStudent={handleOpenEditStudent}
            onOpenImport={() => setIsImportOpen(true)}
            onOpenBatchSync={() => setIsBatchModalOpen(true)}
            onDataRefresh={loadAllData}
          />
        );

      case 'leaderboard':
        return (
          <LeaderboardView
            students={students}
            onSelectStudent={handleOpenStudentDetail}
          />
        );

      case 'progress':
        return (
          <ProgressView
            students={students}
            onSelectStudent={handleOpenStudentDetail}
          />
        );

      case 'sections':
        return (
          <SectionsView
            sectionStats={sectionStats}
            batchStats={batchStats}
            onSelectStudent={handleOpenStudentDetail}
          />
        );

      case 'intervention':
        return (
          <InterventionView
            students={students}
            thresholdDays={settings.inactivity_threshold_days}
            onSelectStudent={handleOpenStudentDetail}
            onDataRefresh={loadAllData}
          />
        );

      case 'reports':
        return (
          <ReportsView
            summary={summary}
            sectionStats={sectionStats}
            students={students}
          />
        );

      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onSettingsUpdated={loadAllData}
          />
        );

      default:
        return null;
    }
  };

  if (!authUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  if (authUser.role === 'student') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
        <Header 
          onOpenBatchSync={() => {}} 
          onOpenPrivacy={() => setIsPrivacyOpen(true)} 
          user={authUser} 
          onLogout={handleLogout} 
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto w-full mx-auto max-w-[1200px]">
          <StudentDashboardView studentId={authUser.id} />
        </main>
        
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
        <PrivacyNoticeModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        onOpenBatchSync={() => setIsBatchModalOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        batchProgress={batchProgress}
        onRefreshCurrentView={loadAllData}
        isRefreshing={loading}
        user={authUser}
        onLogout={handleLogout}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row w-full mx-auto max-w-[1600px]">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          interventionCount={summary?.inactive_students || 0}
          totalStudents={summary?.total_students || students.length}
        />

        {/* Dynamic View Content Area */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto max-w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* MODALS */}
      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedStudentId(null);
        }}
        onDataUpdated={loadAllData}
      />

      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setStudentToEdit(null);
        }}
        onSaved={loadAllData}
        studentToEdit={studentToEdit}
      />

      <ImportStudentsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={loadAllData}
      />

      <BatchFetchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onCompleted={loadAllData}
      />

      <PrivacyNoticeModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

    </div>
  );
}

export default App;

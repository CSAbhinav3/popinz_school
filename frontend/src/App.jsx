import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Activity from './pages/Activity';
import Feedback from './pages/Feedback';
import Attendance from './pages/Attendance';
import Announcements from './pages/Announcements';

function App() {
  return (
    <div className="app-container">
      <Layout>
        <Routes>
          {/* Public Routes — Home is combined landing (hero + about + team + contact) */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Navigate to="/#about" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Public - Activity & Feedback (open for everyone) */}
          <Route path="/activity" element={<Activity />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/announcements" element={<Announcements />} />

          {/* Admin only: create teacher accounts */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Teacher routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Students />
              </ProtectedRoute>
            }
          />

          {/* Parent, Teacher, Admin - mark/view attendance */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={['parent', 'teacher']}>
                <Attendance />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Layout>
    </div>
  );
}

export default App;
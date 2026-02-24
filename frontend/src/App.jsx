import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
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
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />

          {/* Public - Activity & Feedback (open for everyone) */}
          <Route path="/activity" element={<Activity />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/announcements" element={<Announcements />} />

          {/* Admin + Teacher Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <Students />
              </ProtectedRoute>
            }
          />

          {/* Parent, Teacher, Admin - mark/view attendance */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={['parent', 'teacher', 'admin']}>
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
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import EditProject from './pages/EditProject';
import Hackathons from './pages/Hackathons';
import CreateHackathon from './pages/CreateHackathon';
import HackathonDetails from './pages/HackathonDetails';
import SubmitProject from './pages/SubmitProject';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with sidebar layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/hackathons/new" element={<CreateHackathon />} />
            <Route path="/hackathons/:id" element={<HackathonDetails />} />
            <Route path="/teams/:id/submit" element={<SubmitProject />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/projects/:id/edit" element={<EditProject />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

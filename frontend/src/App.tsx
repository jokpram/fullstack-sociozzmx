import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatDashboard from './pages/ChatDashboard';
import FeedDashboard from './pages/FeedDashboard';
import ExploreDashboard from './pages/ExploreDashboard';
import SettingsDashboard from './pages/SettingsDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ProfileDashboard from './pages/ProfileDashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<ChatDashboard />} />
        <Route path="/feed" element={<FeedDashboard />} />
        <Route path="/explore" element={<ExploreDashboard />} />
        <Route path="/settings" element={<SettingsDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<ProfileDashboard />} />
        <Route path="/profile/:username" element={<ProfileDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

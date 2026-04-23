import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRouteWithLayout from '../components/layout/ProtectedRouteWithLayout';
import PublicLayout from '../components/layout/PublicLayout';
import Home from '../pages/Home';
import Courses from '../pages/Courses';
import Colleges from '../pages/Colleges';
import CollegeDetail from '../pages/CollegeDetail';
import Apply from '../pages/Apply';
import PaymentSuccess from '../pages/PaymentSuccess';
import NotFound from '../pages/NotFound';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import OTPVerification from '../components/auth/OTPVerification';
import ForgotPassword from '../components/auth/ForgotPassword';
import StudentDashboard from '../components/student/Dashboard';
import StudentProfile from '../components/student/Profile';
import StudentApplications from '../components/student/Applications';
import StudentDocuments from '../components/student/Documents';
import StudentPayments from '../components/student/Payments';
import AdminDashboard from '../components/college/AdminDashboard';
import SubscriptionHistory from '../components/college/SubscriptionHistory';
import SubscriptionPage from '../components/college/SubscriptionPage';
import MyCollege from '../components/college/MyCollege';
import CollegeAnalytics from '../components/college/Analytics';
import SuperAdminDashboard from '../components/superadmin/SuperAdminDashboard';
import PlatformAnalytics from '../components/superadmin/PlatformAnalytics';
import AdvancedAnalytics from '../components/superadmin/AdvancedAnalytics';
import AIAgent from '../components/ai/AIAgent';
import AdminAIAgent from '../components/ai/AdminAIAgent';
import SuperAdminAIAgent from '../components/ai/SuperAdminAIAgent';
import CreditPurchase from '../components/student/CreditPurchase';
import Notifications from '../pages/Notifications';
import ApplicationDetail from '../components/college/ApplicationDetail';
import CourseAdminDashboard from '../components/course_admin/Dashboard';
import CourseAdminManageCourses from '../components/course_admin/ManageCourses';
import CourseAdminReviewApplications from '../components/course_admin/ReviewApplications';
import CourseAdminDepartmentInfo from '../components/course_admin/DepartmentInfo';
import CourseAdminApplicationDetail from '../components/course_admin/ApplicationDetail';
import CourseAdminManualEntry from '../components/course_admin/ManualEntry';
import CourseAdminAIAgent from '../components/ai/CourseAdminAIAgent';
import SeatAllocation from '../components/college/SeatAllocation';
import UniversityAdminDashboard from '../components/university/UniversityAdminDashboard';
import UniversityAdminAIAgent from '../components/ai/UniversityAdminAIAgent';
import UniversitySubscription from '../components/university/UniversitySubscription';
import StudentSupportTickets from '../components/student/SupportTickets';
import StudentUniversities from '../components/student/Universities';
import UniversityDetail from '../components/student/UniversityDetail';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
      <Route path="/colleges" element={<PublicLayout><Colleges /></PublicLayout>} />
      <Route path="/colleges/:id" element={<PublicLayout><CollegeDetail /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/signup" element={<PublicLayout><Signup /></PublicLayout>} />
      <Route path="/verify-otp" element={<PublicLayout><OTPVerification /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRouteWithLayout requiredRole="student"><StudentDashboard /></ProtectedRouteWithLayout>} />
      <Route path="/student/courses" element={<ProtectedRouteWithLayout requiredRole="student"><Courses basePath="/student/courses" /></ProtectedRouteWithLayout>} />
      <Route path="/student/colleges" element={<ProtectedRouteWithLayout requiredRole="student"><Colleges basePath="/student/colleges" /></ProtectedRouteWithLayout>} />
      <Route path="/student/colleges/:id" element={<ProtectedRouteWithLayout requiredRole="student"><CollegeDetail /></ProtectedRouteWithLayout>} />
      <Route path="/student/universities" element={<ProtectedRouteWithLayout requiredRole="student"><StudentUniversities /></ProtectedRouteWithLayout>} />
      <Route path="/student/universities/:id" element={<ProtectedRouteWithLayout requiredRole="student"><UniversityDetail /></ProtectedRouteWithLayout>} />
      <Route path="/student/profile" element={<ProtectedRouteWithLayout requiredRole="student"><StudentProfile /></ProtectedRouteWithLayout>} />
      <Route path="/student/applications" element={<ProtectedRouteWithLayout requiredRole="student"><StudentApplications /></ProtectedRouteWithLayout>} />
      <Route path="/student/documents" element={<ProtectedRouteWithLayout requiredRole="student"><StudentDocuments /></ProtectedRouteWithLayout>} />
      <Route path="/student/payments" element={<ProtectedRouteWithLayout requiredRole="student"><StudentPayments /></ProtectedRouteWithLayout>} />
      <Route path="/student/ai" element={<ProtectedRouteWithLayout requiredRole="student"><AIAgent /></ProtectedRouteWithLayout>} />
      <Route path="/student/credits/purchase" element={<ProtectedRouteWithLayout requiredRole="student"><CreditPurchase /></ProtectedRouteWithLayout>} />
      <Route path="/student/support" element={<ProtectedRouteWithLayout requiredRole="student"><StudentSupportTickets /></ProtectedRouteWithLayout>} />
      <Route path="/apply" element={<ProtectedRouteWithLayout requiredRole="student"><Apply /></ProtectedRouteWithLayout>} />
      <Route path="/payment-success" element={<ProtectedRouteWithLayout requiredRole="student"><PaymentSuccess /></ProtectedRouteWithLayout>} />
      <Route path="/notifications" element={<ProtectedRouteWithLayout><Notifications /></ProtectedRouteWithLayout>} />

      {/* College Admin Routes */}
      <Route path="/admin" element={<ProtectedRouteWithLayout requiredRole="college_admin"><AdminDashboard /></ProtectedRouteWithLayout>} />
      <Route path="/admin/my-college" element={<ProtectedRouteWithLayout requiredRole="college_admin"><MyCollege /></ProtectedRouteWithLayout>} />
      <Route path="/admin/departments" element={<ProtectedRouteWithLayout requiredRole="college_admin"><AdminDashboard tab="courses" /></ProtectedRouteWithLayout>} />
      <Route path="/admin/courses" element={<ProtectedRouteWithLayout requiredRole="college_admin"><AdminDashboard tab="courses" /></ProtectedRouteWithLayout>} />
      <Route path="/admin/applications" element={<ProtectedRouteWithLayout requiredRole="college_admin"><AdminDashboard tab="applications" /></ProtectedRouteWithLayout>} />
      <Route path="/admin/analytics" element={<ProtectedRouteWithLayout requiredRole="college_admin"><CollegeAnalytics /></ProtectedRouteWithLayout>} />
      <Route path="/admin/subscription" element={<ProtectedRouteWithLayout requiredRole="college_admin"><SubscriptionPage /></ProtectedRouteWithLayout>} />
      <Route path="/admin/subscription/history" element={<ProtectedRouteWithLayout requiredRole="college_admin"><SubscriptionHistory /></ProtectedRouteWithLayout>} />
      <Route path="/admin/applications/:appId/documents" element={<ProtectedRouteWithLayout requiredRole="college_admin"><ApplicationDetail /></ProtectedRouteWithLayout>} />
      <Route path="/admin/ai" element={<ProtectedRouteWithLayout requiredRole="college_admin"><AdminAIAgent /></ProtectedRouteWithLayout>} />
      <Route path="/admin/seat-allocation" element={<ProtectedRouteWithLayout requiredRole="college_admin"><SeatAllocation /></ProtectedRouteWithLayout>} />

      {/* Course Admin Routes (Department Admin) */}
      <Route path="/course-admin" element={<ProtectedRouteWithLayout requiredRole="course_admin"><CourseAdminDashboard /></ProtectedRouteWithLayout>} />
      <Route path="/course-admin/my-department" element={<ProtectedRouteWithLayout requiredRole="course_admin"><CourseAdminDepartmentInfo /></ProtectedRouteWithLayout>} />
      <Route path="/course-admin/courses" element={<ProtectedRouteWithLayout requiredRole="course_admin"><CourseAdminManageCourses /></ProtectedRouteWithLayout>} />
      <Route path="/course-admin/applications" element={<ProtectedRouteWithLayout requiredRole="course_admin"><CourseAdminReviewApplications /></ProtectedRouteWithLayout>} />
      <Route path="/course-admin/applications/:appId" element={<ProtectedRouteWithLayout requiredRole="course_admin"><CourseAdminApplicationDetail /></ProtectedRouteWithLayout>} />
      <Route path="/course-admin/manual-entry" element={<ProtectedRouteWithLayout requiredRole="course_admin"><CourseAdminManualEntry /></ProtectedRouteWithLayout>} />
      <Route path="/course-admin/ai" element={<ProtectedRouteWithLayout requiredRole="course_admin"><CourseAdminAIAgent /></ProtectedRouteWithLayout>} />

      {/* University Admin Routes */}
      <Route path="/university-admin" element={<ProtectedRouteWithLayout requiredRole="university_admin"><UniversityAdminDashboard /></ProtectedRouteWithLayout>} />
      <Route path="/university-admin/my-university" element={<ProtectedRouteWithLayout requiredRole="university_admin"><UniversityAdminDashboard tab="overview" /></ProtectedRouteWithLayout>} />
      <Route path="/university-admin/colleges" element={<ProtectedRouteWithLayout requiredRole="university_admin"><UniversityAdminDashboard tab="colleges" /></ProtectedRouteWithLayout>} />
      <Route path="/university-admin/college-admins" element={<ProtectedRouteWithLayout requiredRole="university_admin"><UniversityAdminDashboard tab="college-admins" /></ProtectedRouteWithLayout>} />
      <Route path="/university-admin/analytics" element={<ProtectedRouteWithLayout requiredRole="university_admin"><UniversityAdminDashboard tab="analytics" /></ProtectedRouteWithLayout>} />
      <Route path="/university-admin/ai" element={<ProtectedRouteWithLayout requiredRole="university_admin"><UniversityAdminAIAgent /></ProtectedRouteWithLayout>} />
      <Route path="/university-admin/support" element={<ProtectedRouteWithLayout requiredRole="university_admin"><UniversityAdminDashboard tab="support" /></ProtectedRouteWithLayout>} />
      <Route path="/university-admin/subscription" element={<ProtectedRouteWithLayout requiredRole="university_admin"><UniversitySubscription /></ProtectedRouteWithLayout>} />

      {/* Super Admin Routes */}
      <Route path="/superadmin" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminDashboard /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/universities" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminDashboard tab="universities" /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/university-admins" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminDashboard tab="admins" /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/colleges" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminDashboard tab="colleges" /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/students" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminDashboard tab="students" /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/admins" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminDashboard tab="admins" /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/analytics" element={<ProtectedRouteWithLayout requiredRole="super_admin"><PlatformAnalytics /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/advanced-analytics" element={<ProtectedRouteWithLayout requiredRole="super_admin"><AdvancedAnalytics /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/plans" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminDashboard tab="plans" /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/plans/university" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminDashboard tab="plans" /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/plans/college" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminDashboard tab="plans" /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/plans/student" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminDashboard tab="plans" /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/ai" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminAIAgent /></ProtectedRouteWithLayout>} />
      <Route path="/superadmin/support" element={<ProtectedRouteWithLayout requiredRole="super_admin"><SuperAdminDashboard tab="support" /></ProtectedRouteWithLayout>} />

      {/* 404 */}
      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  );
};

export default AppRoutes;

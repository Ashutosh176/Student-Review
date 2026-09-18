import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';

import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { CollegesListingPage } from '@/pages/CollegesListingPage';
import { ComparePage } from '@/pages/ComparePage';
import { RankingsPage } from '@/pages/RankingsPage';
import { WriteReviewPage } from '@/pages/WriteReviewPage';
import { ClaimProfilePage } from '@/pages/ClaimProfilePage';
import { QuestionDetailPage } from '@/pages/QuestionDetailPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { CollegeLayout } from '@/pages/college/CollegeLayout';
import { CollegeOverviewPage } from '@/pages/college/CollegeOverviewPage';
import { CollegeReviewsPage } from '@/pages/college/CollegeReviewsPage';
import { CollegeQuestionsPage } from '@/pages/college/CollegeQuestionsPage';
import { CollegePlacementsPage } from '@/pages/college/CollegePlacementsPage';
import { CollegeCoursesPage } from '@/pages/college/CollegeCoursesPage';
import { CollegeJobsPage } from '@/pages/college/CollegeJobsPage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { AcceptInvitePage } from '@/pages/organization/AcceptInvitePage';

import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage';
import { ProfilePage } from '@/pages/student/ProfilePage';
import { MyReviewsPage } from '@/pages/student/MyReviewsPage';
import { MyQuestionsPage } from '@/pages/student/MyQuestionsPage';
import { SavedCollegesPage } from '@/pages/student/SavedCollegesPage';
import { NotificationsPage } from '@/pages/student/NotificationsPage';
import { SettingsPage } from '@/pages/student/SettingsPage';

import { OrgLayout } from '@/pages/organization/OrgLayout';
import { OrgDashboardPage } from '@/pages/organization/OrgDashboardPage';
import { OrgProfilePage } from '@/pages/organization/OrgProfilePage';
import { OrgReviewsPage } from '@/pages/organization/OrgReviewsPage';
import { OrgQuestionsPage } from '@/pages/organization/OrgQuestionsPage';
import { OrgAnalyticsPage } from '@/pages/organization/OrgAnalyticsPage';
import { OrgSentimentPage } from '@/pages/organization/OrgSentimentPage';
import { OrgJobsPage } from '@/pages/organization/OrgJobsPage';
import { OrgTeamPage } from '@/pages/organization/OrgTeamPage';
import { OrgSettingsPage } from '@/pages/organization/OrgSettingsPage';

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminCollegesPage } from '@/pages/admin/AdminCollegesPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminOrganizationsPage } from '@/pages/admin/AdminOrganizationsPage';
import { AdminVerificationsPage } from '@/pages/admin/AdminVerificationsPage';
import { AdminJobsPage } from '@/pages/admin/AdminJobsPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

import { AboutPage } from '@/pages/legal/AboutPage';
import { FaqPage } from '@/pages/FaqPage';
import { ContactPage } from '@/pages/legal/ContactPage';
import { PrivacyPage } from '@/pages/legal/PrivacyPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { CommunityGuidelinesPage } from '@/pages/legal/CommunityGuidelinesPage';
import { ReviewGuidelinesPage } from '@/pages/legal/ReviewGuidelinesPage';
import { OrgResponsePolicyPage } from '@/pages/legal/OrgResponsePolicyPage';
import { ReportContentPage } from '@/pages/legal/ReportContentPage';

function AuthHydrator() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    authApi
      .refresh()
      .then((res) => setAccessToken(res.accessToken, res.user))
      .catch(() => {})
      .finally(() => setHydrated());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthHydrator />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/colleges" element={<CollegesListingPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/rankings/:metric" element={<RankingsPage />} />

          <Route path="/college/:slug" element={<CollegeLayout />}>
            <Route index element={<CollegeOverviewPage />} />
            <Route path="reviews" element={<CollegeReviewsPage />} />
            <Route path="questions" element={<CollegeQuestionsPage />} />
            <Route path="placements" element={<CollegePlacementsPage />} />
            <Route path="courses" element={<CollegeCoursesPage />} />
            <Route path="jobs" element={<CollegeJobsPage />} />
          </Route>
          <Route path="/college/:slug/questions/:id" element={<QuestionDetailPage />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/community-guidelines" element={<CommunityGuidelinesPage />} />
          <Route path="/review-guidelines" element={<ReviewGuidelinesPage />} />
          <Route path="/org-response-policy" element={<OrgResponsePolicyPage />} />
          <Route path="/report-content" element={<ReportContentPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
        </Route>

        <Route path="/claim/:slug" element={<ClaimProfilePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/write-review" element={<WriteReviewPage />} />
          <Route element={<DashboardLayout kind="student" />}>
            <Route path="/dashboard" element={<StudentDashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-reviews" element={<MyReviewsPage />} />
            <Route path="/my-questions" element={<MyQuestionsPage />} />
            <Route path="/saved-colleges" element={<SavedCollegesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['ORGANIZATION']} />}>
          <Route path="/organization" element={<OrgLayout />}>
            <Route path="dashboard" element={<OrgDashboardPage />} />
            <Route path="profile" element={<OrgProfilePage />} />
            <Route path="reviews" element={<OrgReviewsPage />} />
            <Route path="questions" element={<OrgQuestionsPage />} />
            <Route path="analytics" element={<OrgAnalyticsPage />} />
            <Route path="sentiment" element={<OrgSentimentPage />} />
            <Route path="jobs" element={<OrgJobsPage />} />
            <Route path="internships" element={<OrgJobsPage />} />
            <Route path="team" element={<OrgTeamPage />} />
            <Route path="settings" element={<OrgSettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN', 'MODERATOR']} />}>
          <Route element={<DashboardLayout kind="admin" />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/colleges" element={<AdminCollegesPage />} />
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/organizations" element={<AdminOrganizationsPage />} />
            <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

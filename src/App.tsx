import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { Dashboard } from './pages/Dashboard';
import { NotificationsRules } from './pages/NotificationsRules';
import { NotificationRuleEdit } from './pages/NotificationRuleEdit';
import { NotificationTemplates } from './pages/NotificationTemplates';
import { NotificationTemplateEdit } from './pages/NotificationTemplateEdit';
import { NotificationLogs } from './pages/NotificationLogs';
import { ExecuteRule } from './pages/ExecuteRule';
import { SendNotification } from './pages/SendNotification';

function App() {
  return (
    <div className="App">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px'
          }
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/notifications/dashboard" />} />
        <Route
          path="/notifications/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications/rules"
          element={
            <PrivateRoute>
              <Layout>
                <NotificationsRules />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications/rules/new"
          element={
            <PrivateRoute>
              <Layout>
                <NotificationRuleEdit />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications/rules/:id"
          element={
            <PrivateRoute>
              <Layout>
                <NotificationRuleEdit />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications/templates"
          element={
            <PrivateRoute>
              <Layout>
                <NotificationTemplates />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications/templates/new"
          element={
            <PrivateRoute>
              <Layout>
                <NotificationTemplateEdit />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications/templates/:id"
          element={
            <PrivateRoute>
              <Layout>
                <NotificationTemplateEdit />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications/logs"
          element={
            <PrivateRoute>
              <Layout>
                <NotificationLogs />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications/execute"
          element={
            <PrivateRoute>
              <Layout>
                <ExecuteRule />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications/send"
          element={
            <PrivateRoute>
              <Layout>
                <SendNotification />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

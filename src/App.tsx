import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StudentProvider } from "@/context/StudentContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { AddStudent } from "./pages/AddStudent";
import { StudentList } from "./pages/StudentList";
import { StudentProfile } from "./pages/StudentProfile";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { AdminDashboard } from "./pages/AdminDashboard";
import { NotFound } from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { state } = useAuth();
  
  // Show loading while checking auth
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Require authentication for all users
  if (!state.isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/student/:id" element={<StudentProfile />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        {state.isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StudentProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </StudentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

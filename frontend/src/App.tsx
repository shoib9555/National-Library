import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import LibrarianDashboard from "./pages/LibrarianDashboard"
import StudentDashboard from "./pages/StudentDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import LibrarianLayout from "./layouts/LibrarianLayout"
import Students from "./pages/librarian/Students"
import Seats from "./pages/librarian/Seats"
import Attendance from "./pages/librarian/Attendance"
import Memberships from "./pages/librarian/Memberships"
import Payments from "./pages/librarian/Payments"
import Settings from "./pages/Settings"
import LibrarianNotifications from "./pages/librarian/LibrarianNotifications"



import Notifications from "./pages/student/Notifications"
import StudentLayout from "./layouts/StudentLayout"
import Profile from "./pages/student/Profile"
import MySeat from "./pages/student/MySeat"
import Membership from "./pages/student/Membership"
import StudentAttendance from "./pages/student/Attendance"
import TodoList from "./pages/student/TodoList"
import Notes from "./pages/student/Notes"
import StudentPayments from "./pages/student/Payments"
import StudentSettings from "./pages/student/StudentSettings"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Librarian Portal */}
        <Route element={<ProtectedRoute allowedRole="LIBRARIAN" />}>
          <Route path="/librarian" element={<LibrarianLayout />}>
            <Route index element={<LibrarianDashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="seats" element={<Seats />} />
            <Route path="memberships" element={<Memberships />} />
            <Route path="payments" element={<Payments />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="notifications"
              element={<LibrarianNotifications />}
            />
          </Route>
        </Route>

        {/* Student Portal */}
        <Route element={<ProtectedRoute allowedRole="STUDENT" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="seat" element={<MySeat />} />
            <Route path="membership" element={<Membership />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="todos" element={<TodoList />} />
            <Route path="notes" element={<Notes />} />
            <Route path="payments" element={<StudentPayments />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="/student/settings" element={<StudentSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
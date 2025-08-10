import React, { Suspense } from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import "@fontsource/poppins"; // Defaults to weight 400

// 🔒 Protected Layout Component
import { ProtectedLayout } from "./components/Admin/ProtectedLayout";
import Units from "./components/Admin/Units-table";
import Subscription from "./components/Admin/Subsecription";
import WalletManagement from "./components/Admin/Wallet";
import SubscriptionPlans from "./components/Admin/subscription-plans";
import Bookings from "./components/Admin/Booking";
import Locations from "./components/Admin/Locations";
import Reports from "./components/Admin/Reports";

// 🚀 Lazy Load Components
const LoginPage = React.lazy(() => import("./components/Login"));
const Dashboard = React.lazy(() => import("./components/Admin/Dashboard"));
const UsersTable = React.lazy(() => import("./components/Admin/Users-table"));

// 🧠 Custom Hook to Preload Components on Hover
// const usePreloadRoute = () => {
//   const preload = (path: string) => {
//     if (path === "/Admin") import("./components/Admin/Dashboard");
//     if (path === "/Admin/users") import("./components/Admin/Users-table");
//   };

//   return preload;
// };

// 🧱 Page Loader Component
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="ml-2 text-muted-foreground">Loading...</span>
  </div>
);

// 🔐 Protected Layout Wrapper
const ProtectedLayoutComponent = () => (
  <ProtectedLayout>
    <Outlet />
  </ProtectedLayout>
);

function App() {
  // const preload = usePreloadRoute();

  return (
    <Routes>
      {/* 🔓 Public Route */}
      <Route
        path="/"
        element={
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        }
      />

      {/* 🛡️ Protected Routes */}
      <Route element={<ProtectedLayoutComponent />}>
        <Route
          path="/Admin"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/Admin/users"
          element={
            <Suspense fallback={<PageLoader />}>
              <UsersTable />
            </Suspense>
          }
        />
        <Route
          path="/Admin/units"
          element={
            <Suspense fallback={<PageLoader />}>
              <Units />
            </Suspense>
          }
        />
        <Route
          path="/Admin/reservations"
          element={
            <Suspense fallback={<PageLoader />}>
              <Bookings />
            </Suspense>
          }
        />
        <Route
          path="/Admin/subscriptions"
          element={
            <Suspense fallback={<PageLoader />}>
              <Subscription />
            </Suspense>
          }
        />
        <Route
          path="/Admin/wallets"
          element={
            <Suspense fallback={<PageLoader />}>
              <WalletManagement />
            </Suspense>
          }
        />
<Route
  path="/Admin/reports"
  element={
    <Suspense fallback={<PageLoader />}>
      <Reports />
    </Suspense>
  }
>
  <Route path=":id" element={null} /> {/* This enables the nested route */}
</Route>       <Route
          path="/Admin/Locations"
          element={
            <Suspense fallback={<PageLoader />}>
              <Locations />
            </Suspense>
          }
        />
        <Route
          path="/Admin/subscription-plans"
          element={
            <Suspense fallback={<PageLoader />}>
<SubscriptionPlans />            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
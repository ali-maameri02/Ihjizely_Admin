import { Outlet } from "react-router-dom";
import { ProtectedLayout } from "./ProtectedLayout";

export default function Layout() {
  return (
    <ProtectedLayout>
      <Outlet /> {/* Dynamic content goes here */}
    </ProtectedLayout>
  );
}
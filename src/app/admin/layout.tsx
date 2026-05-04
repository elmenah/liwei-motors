import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Login page is allowed without auth
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {session && <AdminSidebar user={session.user} />}
      <main className={`flex-1 ${session ? "md:pl-64 pt-14 md:pt-0" : ""}`}>{children}</main>
    </div>
  );
}

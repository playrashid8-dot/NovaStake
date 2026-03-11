export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-6xl px-3 py-4 pb-24 md:px-6 md:pb-6">
        {children}
      </div>
    </div>
  );
}
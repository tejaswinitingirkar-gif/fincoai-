'use client';

export default function DashboardLayout({ topSection, mainSection, sideSection }) {
  return (
    <div className="space-y-12">
      {/* Top Grid: CIBIL & Goals */}
      {topSection && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {topSection}
        </div>
      )}

      {/* Main Grid: Charts, Forms, Lists & AI Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {mainSection}
        </div>
        <div className="lg:col-span-4">
          {sideSection}
        </div>
      </div>
    </div>
  );
}

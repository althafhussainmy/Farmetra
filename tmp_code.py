from pathlib import Path
text = Path('frontend/src/pages/Home.jsx').read_text(encoding='utf-8')
start = text.index('  if (token && role) {')
end = text.index('  // Not logged in:')
farmer_idx = text.index("        {role === 'farmer' && (")
prefix = '''  if (token && role) {
    return (
      <div className="space-y-8">
        <div className="headline">
          <span className="headline-square" />
          <h1 className="headline-text">
            {role === 'admin' && 'Admin'}
            {role === 'officer' && 'Officer'}
            {role === 'farmer' && 'Farmer'}
            {role === 'worker' && 'Worker'}
            {role === 'user' && 'User'}
            {' dashboard'}
          </h1>
        </div>

        {role === 'admin' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashboardCard to="/admin/officers" title="Add officers" description="Create staff accounts for Krishi Bhavan." icon="???" />
            <DashboardCard to="/admin/complaints" title="View complaints & send replies" description="Reply to farmer and user complaints." icon="??" />
            <DashboardCard to="/admin/seed-requests" title="Seed & fertilizer" description="Add stock; approve or reject farmer requests. Stock decreases after approval." icon="??" />
            <DashboardCard to="/admin/subsidy" title="Subsidy schemes" description="Add schemes and approve farmer applications." icon="??" />
            <DashboardCard to="/admin/crop-disease-reports" title="Crop disease reports" description="View farmer reports and respond." icon="??" />
            <DashboardCard to="/admin/notifications" title="Scheme notifications" description="Post announcements for farmers." icon="??" />
          </div>
        )}

        {role === 'officer' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashboardCard to="/officer/dashboard" title="Officer dashboard" description="At-a-glance queues and quick actions." icon="??" />
            <DashboardCard to="/admin/verify-farmers" title="Verify farmers" description="Approve or reject farmer registrations." icon="??" />
            <DashboardCard to="/admin/farming-products" title="Manage farming products" description="Add, edit, or remove catalog products." icon="??" />
            <DashboardCard to="/admin/users" title="View users" description="Browse & approve app users." icon="??" />
            <DashboardCard to="/admin/user-orders" title="View user orders" description="See orders placed by users." icon="??" />
            <DashboardCard to="/admin/fp-orders" title="View FP orders & payments" description="Farmer orders and payments." icon="??" />
            <DashboardCard to="/admin/workers" title="Approve workers" description="View and approve workers." icon="??" />
            <DashboardCard to="/admin/work-requests" title="View work requests" description="See requested and accepted works." icon="??" />
          </div>
        )}

'''
new_text = text[:start] + prefix + text[farmer_idx:end] + text[end:]
Path('frontend/src/pages/Home.jsx').write_text(new_text, encoding='utf-8')

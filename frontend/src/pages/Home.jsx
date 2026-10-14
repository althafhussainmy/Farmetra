import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/ui/PageTransition'

function DashboardCard({ to, external, title, description, icon }) {
  const className = 'card text-left hover:shadow-md transition border-l-4 border-l-primary-600 block'
  const content = (
    <>
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <h2 className="text-lg font-semibold text-primary-800 mb-1">{title}</h2>
      {description && <p className="text-gray-600 text-sm">{description}</p>}
    </>
  )
  if (external) {
    return <a href={to} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
  }
  return <Link to={to} className={className}>{content}</Link>
}

export default function Home() {
  const { token, role, profile, loading } = useAuth()

  const approvalBanner = (() => {
    if (role === 'farmer' && profile && profile.state !== 'approved') {
      return (
        <div className="card border-amber-200 bg-amber-50 text-amber-900">
          Your farmer account is awaiting officer approval. You can browse, but selling and requests are blocked until approval.
        </div>
      )
    }
    if (role === 'user' && profile && profile.approved === false) {
      return (
        <div className="card border-amber-200 bg-amber-50 text-amber-900">
          Your user account is awaiting officer approval. You can browse, but cart and checkout stay locked until approval.
        </div>
      )
    }
    if (role === 'worker' && profile && profile.approved === false) {
      return (
        <div className="card border-amber-200 bg-amber-50 text-amber-900">
          Your worker account is awaiting officer approval. You can browse, but work requests will be available after approval.
        </div>
      )
    }
    return null
  })()

  if (token && loading) {
    return (
      <PageTransition>
        <div className="home-hero">
          <div className="home-bg">
            <div className="card text-gray-600">Loading your dashboard...</div>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (token && role) {
    return (
      <PageTransition>
        <div className="home-hero">
          <div className="home-bg space-y-8">
            {approvalBanner}

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
                <DashboardCard to="/admin/officers" title="Add officers" description="Create staff accounts for Farmetra." icon="Staff" />
                <DashboardCard to="/admin/complaints" title="View complaints & send replies" description="Reply to farmer and user complaints." icon="Support" />
                <DashboardCard to="/admin/seed-requests" title="Seed & fertilizer" description="Add stock; approve or reject farmer requests. Stock decreases after approval." icon="Seed" />
                <DashboardCard to="/admin/subsidy" title="Subsidy schemes" description="Add schemes and approve farmer applications." icon="Grant" />
                <DashboardCard to="/admin/crop-disease-reports" title="Crop disease reports" description="View farmer reports and respond." icon="Care" />
                <DashboardCard to="/admin/schemes" title="Added schemes" description="View schemes already added by admin." icon="Schemes" />
              </div>
            )}

            {role === 'officer' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DashboardCard to="/officer/dashboard" title="Officer dashboard" description="At-a-glance queues and quick actions." icon="Officer cockpit" />
                <DashboardCard to="/admin/verify-farmers" title="Verify farmers" description="Approve or reject farmer registrations." icon="Verify" />
                <DashboardCard to="/admin/users" title="View users" description="Browse & approve app users." icon="Users" />
                <DashboardCard to="/admin/user-orders" title="View user orders" description="See orders placed by users." icon="Orders" />
                <DashboardCard to="/admin/fp-orders" title="View FP orders & payments" description="Farmer orders and payments." icon="Payments" />
                <DashboardCard to="/admin/workers" title="Approve workers" description="View and approve workers." icon="Workers" />
                <DashboardCard to="/admin/work-requests" title="View work requests" description="See requested and accepted works." icon="Requests" />
              </div>
            )}

            {role === 'farmer' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DashboardCard to="/profile" title="Manage profile" description="Update place, address, and account details" icon="Profile" />
                <DashboardCard to="/my-products" title="Add product" description="Add and manage your products" icon="Stock" />
                <DashboardCard to="/orders" title="View orders & payments" description="See customer orders for your products and payment details" icon="Orders" />
                <DashboardCard to="/crop-recommendation" title="Crop recommendation" description="Get crop suggestions by soil, climate & water" icon="Crop" />
                <DashboardCard to="/workers" title="Find workers" description="Browse available workers" icon="Workers" />
                <DashboardCard to="/work-requests" title="Send work requests" description="Send and track work requests to workers" icon="Requests" />
                <DashboardCard to="/seed-requests" title="Request seeds / fertilizer" description="Request from Farmetra stock; admin can approve or reject." icon="Seed" />
                <DashboardCard to="/subsidy" title="Subsidy schemes" description="Apply for subsidy schemes. Track status (Pending, Approved, Rejected)." icon="Grant" />
                <DashboardCard to="/crop-disease-report" title="Crop disease report" description="Upload crop image and description; admin can view and respond." icon="Care" />
                <DashboardCard to="/notifications" title="Scheme notifications" description="View latest announcements from Farmetra." icon="News" />
                <DashboardCard to="/complaints" title="Complaints" description="Send complaints and view replies" icon="Support" />
              </div>
            )}

            {role === 'worker' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <DashboardCard to="/profile" title="View profile" description="Your place, skills, and address" icon="Profile" />
                <DashboardCard to="/work-requests" title="View work requests" description="Approve or reject requests from farmers" icon="Requests" />
              </div>
            )}

            {role === 'user' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DashboardCard to="/products/farmer-products" title="View farmers & products" description="Browse farmers and their products" icon="Shop" />
                <DashboardCard to="/cart" title="Cart & make payment" description="Add to cart and checkout" icon="Cart" />
                <DashboardCard to="/orders" title="View orders" description="See your order history" icon="Orders" />
                <DashboardCard to="/complaints" title="Complaints" description="Send complaints and view replies" icon="Support" />
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="home-hero">
        <div className="home-bg space-y-12">
          <section className="text-left py-12 md:py-20">
            <div className="headline mb-4">
              <span className="headline-square" />
              <h1 className="text-4xl md:text-5xl font-bold text-primary-800">
                Farmetra
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mb-8">
              Connecting farmers, workers, and users on one platform. Browse products, get crop recommendations, and manage work requests.
            </p>
            <div className="flex flex-wrap justify-start gap-4">
              <Link to="/products/farmer-products" className="btn btn-primary text-lg px-6 py-3">
                Browse Products
              </Link>
              <Link to="/register" className="btn btn-outline border-primary-600 text-primary-700 text-lg px-6 py-3">
                Register
              </Link>
              <Link to="/login" className="btn btn-secondary text-lg px-6 py-3">
                Login
              </Link>
            </div>
          </section>

          <section>
            <div className="headline">
              <span className="headline-square" />
              <h2 className="headline-text">Roles</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card text-left">
                <h2 className="text-lg font-semibold text-primary-800 mb-2">Farmer</h2>
                <p className="text-gray-600 text-sm">Sell products, get crop recommendations, and send work requests to workers.</p>
                <Link to="/register" className="text-primary-600 text-sm font-medium mt-2 inline-block">Register as Farmer -&gt;</Link>
              </div>
              <div className="card text-left">
                <h2 className="text-lg font-semibold text-primary-800 mb-2">User</h2>
                <p className="text-gray-600 text-sm">Browse and buy farmer products, rate orders, and send complaints.</p>
                <Link to="/register" className="text-primary-600 text-sm font-medium mt-2 inline-block">Register as User -&gt;</Link>
              </div>
              <div className="card text-left">
                <h2 className="text-lg font-semibold text-primary-800 mb-2">Worker</h2>
                <p className="text-gray-600 text-sm">Receive work requests from farmers and approve or reject them.</p>
                <Link to="/register" className="text-primary-600 text-sm font-medium mt-2 inline-block">Register as Worker -&gt;</Link>
              </div>
            </div>
          </section>

          <section className="card bg-primary-50 border-primary-200">
            <div className="headline mb-4">
              <span className="headline-square" />
              <h2 className="headline-text text-xl">Features</h2>
            </div>
            <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
              <li>- E-commerce for agricultural products</li>
              <li>- Crop recommendation by soil, climate & water</li>
              <li>- Work requests between farmers and workers</li>
              <li>- Complaint system with admin replies</li>
              <li>- Reviews and ratings on farmer products</li>
              <li>- Farmer verification by Farmetra</li>
              <li>- Seed & fertilizer distribution: admin adds stock, farmers request, admin approve/reject, stock decreases</li>
              <li>- Subsidy application: admin adds schemes, farmers apply, status (Pending / Approved / Rejected)</li>
              <li>- Crop disease reporting: farmer uploads image + description, admin views and responds</li>
              <li>- Scheme notifications: admin posts announcements, farmers view latest</li>
            </ul>
          </section>
        </div>
      </div>
    </PageTransition>
  )
}

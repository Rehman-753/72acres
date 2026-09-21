import { Route, Routes } from 'react-router-dom'
import SiteLayout from './components/SiteLayout.jsx'
import Home from './pages/Home.jsx'
import Properties from './pages/Properties.jsx'
import PropertyDetail from './pages/PropertyDetail.jsx'
import Login from './pages/lister/Login.jsx'
import ListerLayout from './pages/lister/ListerLayout.jsx'
import Dashboard from './pages/lister/Dashboard.jsx'
import MyProperties from './pages/lister/MyProperties.jsx'
import PropertyForm from './pages/lister/PropertyForm.jsx'
import ListerPropertyView from './pages/lister/ListerPropertyView.jsx'
import Profile from './pages/lister/Profile.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        {/* public */}
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />

        {/* lister portal */}
        <Route path="/lister/login" element={<Login />} />
        <Route path="/lister" element={<ListerLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="properties" element={<MyProperties />} />
          <Route path="properties/add" element={<PropertyForm />} />
          <Route path="properties/:id" element={<ListerPropertyView />} />
          <Route path="properties/:id/edit" element={<PropertyForm />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<div className="empty"><h2>Page not found</h2></div>} />
      </Route>
    </Routes>
  )
}

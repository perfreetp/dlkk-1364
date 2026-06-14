import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Home from "@/pages/Home";
import Library from "@/pages/Library";
import ToolDetail from "@/pages/ToolDetail";
import Compare from "@/pages/Compare";
import Profile from "@/pages/Profile";
import CollectionDetail from "@/pages/CollectionDetail";
import Share from "@/pages/Share";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/tool/:id" element={<ToolDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/collection/:id" element={<CollectionDetail />} />
          <Route path="/share/:token" element={<Share />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-gray-500 mb-6">页面不存在或链接无效</p>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                返回首页
              </button>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

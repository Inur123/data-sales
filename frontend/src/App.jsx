import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  BarChart3, 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  Package, 
  Search, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Brain,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown
} from "lucide-react";
import "./App.css";

const API_BASE = "http://localhost:8000/api/v1";

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [isLoginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (username, password) => {
    setLoginLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${API_BASE}/auth/login`, { username, password });
      setToken(resp.data.access_token);
      setUser(resp.data);
      localStorage.setItem("token", resp.data.access_token);
      localStorage.setItem("user", JSON.stringify(resp.data));
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal login. Pastikan backend sudah jalan.");
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} isLoading={isLoginLoading} error={error} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar user={user} onLogout={logout} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Dashboard />
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login Page
// ---------------------------------------------------------------------------
function LoginPage({ onLogin, isLoading, error }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");

  const submit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Brain className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mini Sales AI</h1>
          <p className="text-slate-500 mt-2">Masuk ke Dashboard Analisis Anda</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400 outline-none"
              placeholder="Masukkan username"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400 outline-none"
              placeholder="Masukkan password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-sm italic">Demo: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function Dashboard() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [predictData, setPredictData] = useState({ jumlah_penjualan: 0, harga: 0, diskon: 0 });
  const [prediction, setPrediction] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);

  useEffect(() => {
    fetchSales();
    setCurrentPage(1); // reset to page 1 on search
  }, [searchTerm]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.get(`${API_BASE}/sales`, {
        params: { search: searchTerm },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(resp.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side Pagination Logic
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sales.slice(start, start + itemsPerPage);
  }, [sales, currentPage]);

  const totalPages = Math.ceil(sales.length / itemsPerPage);

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredictLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.post(`${API_BASE}/predict`, predictData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrediction(resp.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Gagal prediksi");
    } finally {
      setPredictLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Table Section */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Data Penjualan</h2>
            <p className="text-sm text-slate-500">Tampilan {sales.length} produk dalam dataset</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all text-slate-900" 
              placeholder="Cari nama produk..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-slate-400 animate-pulse">Memuat data penjualan...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Sales</th>
                  <th className="px-6 py-4">Price (IDR)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((s) => (
                  <tr key={s.product_id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">{s.product_id}</span>
                        <span className="font-semibold text-slate-800">{s.product_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{s.jumlah_penjualan}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{s.harga.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${
                        s.status === 'Laris' 
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                        : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                      }`}>
                        {s.status === 'Laris' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Halaman {currentPage} dari {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button 
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-500"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-500"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0 || loading}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Side Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">AI Prediction</h2>
            <p className="text-sm text-slate-500 mt-1">Uji metrik produk baru di sini</p>
          </div>

          <form onSubmit={handlePredict} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Jumlah Penjualan</label>
              <input 
                type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 transition-all font-medium" 
                value={predictData.jumlah_penjualan}
                onChange={(e) => setPredictData({...predictData, jumlah_penjualan: parseInt(e.target.value)})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Harga Satuan</label>
              <input 
                type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 transition-all font-medium"
                value={predictData.harga}
                onChange={(e) => setPredictData({...predictData, harga: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Diskon (%)</label>
              <input 
                type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 transition-all font-medium"
                value={predictData.diskon}
                onChange={(e) => setPredictData({...predictData, diskon: parseFloat(e.target.value)})}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 shadow-md" 
              disabled={predictLoading}
            >
              {predictLoading ? "Menghitung..." : "Jalankan Prediksi AI"}
            </button>
          </form>

          {prediction && (
            <div className={`mt-8 p-6 rounded-2xl border-2 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              prediction.status_prediksi === 'Laris' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
              : 'bg-rose-50 border-rose-100 text-rose-900'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                prediction.status_prediksi === 'Laris' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
              }`}>
                {prediction.status_prediksi === 'Laris' ? <CheckCircle2 className="text-emerald-600" size={28} /> : <AlertCircle className="text-rose-600" size={28} />}
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight">
                  {prediction.status_prediksi === 'Laris' ? 'Produk Laris!' : 'Tidak Laris'}
                </h3>
                <p className="text-sm opacity-70 font-medium">Confidence: {(prediction.probabilitas_laris * 100).toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-indigo-600 rounded-2xl shadow-lg p-6 text-white overflow-hidden relative group">
          <BarChart3 className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Model Insight
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-white/70 text-sm">Accuracy</span>
              <span className="font-bold text-xl">100%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Engine</span>
              <span className="font-bold">Random Forest</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 group cursor-default">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100 transform group-hover:rotate-6 transition-transform">
            <Brain className="text-white" size={20} />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">Sales Predictor</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-slate-800 leading-none">{user.full_name}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{user.role}</span>
          </div>
          <button 
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center border border-slate-100"
            onClick={onLogout}
            title="Sesi Selesai"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}

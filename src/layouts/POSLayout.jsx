import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import api from "../api/axios";
import { Store, LogOut, ArrowLeft } from "lucide-react";

export default function POSLayout() {
  const navigate = useNavigate();
  const { user, lokasi, logout, token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    api.get("/auth/me").catch(() => {
      logout();
      navigate("/login");
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen flex flex-col bg-surface">
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-primary-100 shrink-0">
        {/* Kiri: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-dark-500">
              {lokasi?.namalokasi || "POS"}
            </h1>
            <p className="text-[10px] text-dark-300">{user?.namauser}</p>
          </div>
        </div>

        {/* Kanan: Back Office & Keluar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-dark-300 hover:bg-warm-50 hover:text-dark-500 transition-colors"
            title="Kembali ke Back Office"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back Office
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-dark-300 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token de convite ausente.");
      setValidating(false);
      return;
    }

    async function validate() {
      try {
        const response = await fetch("/api/team/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "validateInvite", data: { token } }),
        });
        const data = await response.json();

        if (data.error) throw new Error(data.error);
        setInvite(data);
      } catch (err: any) {
        setError(err.message || "Erro ao validar convite.");
      } finally {
        setValidating(false);
      }
    }

    validate();
  }, [token]);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    
    try {
      // 1. Sign Up the user to Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invite.email,
        password: password,
        options: {
          data: {
            name: invite.email.split('@')[0], // Default name
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Falha ao criar usuário.");

      // 2. Accept Invite via our API (Bypass)
      const acceptResponse = await fetch("/api/team/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "acceptInvite", 
          data: { 
            token, 
            supabaseUser: {
              id: authData.user.id,
              email: authData.user.email,
              user_metadata: authData.user.user_metadata
            } 
          } 
        }),
      });

      const acceptData = await acceptResponse.json();
      if (acceptData.error) throw new Error(acceptData.error);

      toast.success("Bem-vindo(a)!", {
        description: "Seu cadastro foi concluído com sucesso."
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Invite Error:", err);
      setError(err.message || "Falha ao concluir cadastro.");
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-sm text-gray-500 font-medium">Validando seu convite...</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Convite Inválido</h2>
        <p className="text-sm text-gray-500 mb-6">{error || "Este link expirou ou já foi utilizado."}</p>
        <button 
          onClick={() => router.push("/login")}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Voltar para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Você foi convidado!</h2>
        <p className="text-sm text-gray-500 mt-1">
          Complete seu cadastro para acessar a <span className="font-semibold text-gray-700">Central de Produto</span> como <span className="text-blue-600 font-bold">{invite.role}</span>.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">E-mail de Acesso</label>
        <p className="text-sm font-semibold text-gray-700">{invite.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Defina sua Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
            <AlertCircle size={10} /> Mínimo de 6 caracteres
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || password.length < 6}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-200"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? "Processando..." : "Aceitar e Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function InvitePage() {
  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-gray-100 p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md mb-3">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" />
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.7" />
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.7" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Onboarding de Time</h1>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        }>
          <InviteContent />
        </Suspense>
      </div>

      <p className="text-center text-[10px] text-gray-400 mt-6 uppercase tracking-widest font-bold">
        Bloxs Capital © {new Date().getFullYear()} — Setup de Acesso
      </p>
    </div>
  );
}

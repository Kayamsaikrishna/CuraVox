import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const from = location.state?.from?.pathname || '/home';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success('Login successful!');
        try {
          const { default: VoiceService } = await import('../../services/voiceService');
          VoiceService.getInstance().speak('Login successful.');
        } catch (e) { }
        navigate(from, { replace: true });
      } else {
        const msg = result.message || 'Login failed.';
        toast.error(msg);
        try {
          const { default: VoiceService } = await import('../../services/voiceService');
          VoiceService.getInstance().speak(msg);
        } catch (e) { }
      }
    } catch (error) {
      const msg = 'An unexpected error occurred.';
      toast.error(msg);
      try {
        const { default: VoiceService } = await import('../../services/voiceService');
        VoiceService.getInstance().speak(msg);
      } catch (e) { }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden font-sans antialiased">
      {/* Ambient Light Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-100/50 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-100/50 blur-[120px] rounded-full"></div>

      <div className="max-w-6xl w-full relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">

        {/* Left Side: Dominant Branding */}
        <div className="flex-1 text-center lg:text-left group order-1 lg:order-1">
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img
              src={logo}
              alt="CuraVox Logo"
              className="w-64 h-64 md:w-96 md:h-96 relative drop-shadow-[0_30px_60px_rgba(79,70,229,0.35)] object-contain rounded-[4rem] transform transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-2"
            />
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic leading-none">
            CuraVox
          </h1>
          <div className="h-2 w-48 bg-indigo-600 rounded-full mb-8 mx-auto lg:mx-0 shadow-lg shadow-indigo-200"></div>
          <p className="text-lg md:text-xl text-slate-500 font-bold uppercase tracking-[0.3em] opacity-80 max-w-md mx-auto lg:mx-0 leading-relaxed italic">
            Your Premium Health AI Companion
          </p>

          <div className="mt-12 hidden lg:flex flex-wrap gap-4 opacity-40">
            <div className="px-4 py-2 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Protocol</div>
            <div className="px-4 py-2 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">Neural Sync</div>
            <div className="px-4 py-2 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">256-Bit Crypt</div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="w-full max-w-lg order-2 lg:order-2">
          <div className="bg-white/70 backdrop-blur-[60px] rounded-[4rem] p-10 md:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-white/50 relative overflow-hidden group transition-all duration-700 hover:shadow-prism">
            {/* Subtle Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-emerald-400"></div>

            <header className="mb-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic leading-none">
                Sign In
              </h2>
              <p className="text-slate-500 font-bold text-sm tracking-tight opacity-60">
                Welcome back to your clinical node
              </p>
            </header>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="group">
                  <label htmlFor="email" className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-2 transition-colors group-focus-within:text-indigo-600">
                    Email / Username
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-full text-slate-900 font-bold text-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="group">
                  <label htmlFor="password" className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-2 transition-colors group-focus-within:text-indigo-600">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-full text-slate-900 font-bold text-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-6 flex items-center transition-colors text-slate-400 hover:text-indigo-600 outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <label className="flex items-center group cursor-pointer">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="w-5 h-5 border-2 border-slate-200 rounded-lg text-indigo-600 focus:ring-indigo-100 bg-white transition-all cursor-pointer shadow-inner"
                  />
                  <span className="ml-3 text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                    Remember
                  </span>
                </label>
                <a href="#" className="text-[11px] font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-widest italic transition-colors underline decoration-indigo-100 underline-offset-4">
                  Forgot Key?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 rounded-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.5em] transition-all shadow-xl hover:bg-slate-800 active:scale-95 disabled:opacity-50 group/btn relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? 'Processing...' : 'Sign In'}
                </span>
              </button>
            </form>

            <footer className="mt-12 text-center">
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest border-t border-slate-100 pt-8">
                New to CuraVox?{' '}
                <Link to="/register" className="text-emerald-600 hover:text-emerald-500 italic font-black transition-colors underline decoration-emerald-100 underline-offset-4">
                  Join Platform
                </Link>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

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

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };

      const response = await api.post('/auth/register', payload);

      if (response.data.success) {
        toast.success('Account created successfully!');
        try {
          const { default: VoiceService } = await import('../../services/voiceService');
          VoiceService.getInstance().speak('Account created.');
        } catch (e) { }
        await login(formData.email, formData.password);
        navigate('/home');
      } else {
        const msg = response.data.message || 'Registration failed';
        toast.error(msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden font-sans antialiased">
      {/* Ambient Light Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-100/50 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-100/50 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl w-full relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

        {/* Left Side: Dominant Branding */}
        <div className="flex-1 text-center lg:text-left group order-1 lg:order-1">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img
              src={logo}
              alt="CuraVox Logo"
              className="w-56 h-56 md:w-80 md:h-80 relative drop-shadow-[0_40px_80px_rgba(16,185,129,0.3)] object-contain rounded-[3.5rem] transform transition-transform duration-1000 group-hover:scale-105 group-hover:-rotate-2"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic leading-none">
            CuraVox
          </h1>
          <div className="h-2 w-32 bg-emerald-600 rounded-full mb-8 mx-auto lg:mx-0 shadow-lg shadow-emerald-200"></div>
          <p className="text-base md:text-lg text-slate-500 font-bold uppercase tracking-[0.3em] opacity-80 max-w-sm mx-auto lg:mx-0 leading-relaxed italic">
            Global Health Registry Node
          </p>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="w-full max-w-2xl order-2 lg:order-2">
          <div className="bg-white/70 backdrop-blur-[60px] rounded-[3.5rem] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-white/50 relative overflow-hidden group transition-all duration-700 hover:shadow-prism">
            {/* Subtle Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-indigo-400"></div>

            <header className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic leading-none">
                Register
              </h2>
              <p className="text-slate-500 font-bold text-sm tracking-tight opacity-60">
                Join our premium health ecosystem
              </p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-2">First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-7 py-4 bg-slate-50/50 border border-slate-100 rounded-full text-slate-900 font-bold text-base focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white outline-none transition-all shadow-inner"
                    placeholder="John"
                  />
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-2">Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-7 py-4 bg-slate-50/50 border border-slate-100 rounded-full text-slate-900 font-bold text-base focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white outline-none transition-all shadow-inner"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-7 py-4 bg-slate-50/50 border border-slate-100 rounded-full text-slate-900 font-bold text-base focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white outline-none transition-all shadow-inner"
                  placeholder="email@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-2">Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-7 py-4 bg-slate-50/50 border border-slate-100 rounded-full text-slate-900 font-bold text-base focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white outline-none transition-all shadow-inner"
                      placeholder="••••••••"
                    />
                    <button type="button" className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="group relative">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-2">Confirm</label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-7 py-4 bg-slate-50/50 border border-slate-100 rounded-full text-slate-900 font-bold text-base focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white outline-none transition-all shadow-inner"
                      placeholder="••••••••"
                    />
                    <button type="button" className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 rounded-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.5em] transition-all shadow-xl hover:bg-slate-800 active:scale-95 disabled:opacity-50 group/btn relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10">{isLoading ? 'Processing...' : 'Create Account'}</span>
              </button>
            </form>

            <footer className="mt-10 text-center">
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest border-t border-slate-100 pt-6">
                Already Joined?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500 italic font-black transition-colors underline decoration-indigo-100 underline-offset-4">
                  Sign In
                </Link>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
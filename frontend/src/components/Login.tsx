import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';
import School from './School';
import { 
  GraduationCap, 
  User, 
  Users, 
  BookOpen, 
  Phone, 
  Mail, 
  Eye, 
  EyeOff,
  Calendar,
  ClipboardCheck,
  Star,
  TrendingUp,
  Shield,
  Clock,
  Award,
  MessageCircle,
  CreditCard,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  School as SchoolIcon,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSchools, setShowSchools] = useState(false);
  const [userType, setUserType] = useState<'parent' | 'teacher'>('parent');
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Animation states
  const [animatedText, setAnimatedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});


  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    countryCode: '+91',
    otp: ['', '', '', '', '', ''],
  });

  // Animated text effect for hero title
  const heroWords = ['Empowering', 'Education', 'Through', 'Digital', 'Innovation'];
  
  useEffect(() => {
    if (!showLogin && !showSchools) {
      const timer = setTimeout(() => {
        if (currentWordIndex < heroWords.length) {
          setAnimatedText(prev => prev + (prev ? ' ' : '') + heroWords[currentWordIndex]);
          setCurrentWordIndex(prev => prev + 1);
        }
      }, currentWordIndex === 0 ? 500 : 300);

      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, showLogin, showSchools]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [showLogin, showSchools]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...formData.otp];
      newOtp[index] = value;
      setFormData(prev => ({ ...prev, otp: newOtp }));

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        role: userType,
      });

      login(response.data.token, response.data.user);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isOtpSent) {
        const response = await authAPI.mobileLogin({
          phone: formData.countryCode + formData.phone,
          role: userType,
        });

        setIsOtpSent(true);
        toast.success('OTP sent successfully! Use: 123456');
        startOtpTimer();
      } else {
        const otpValue = formData.otp.join('');
        const response = await authAPI.verifyOTP({
          phone: formData.countryCode + formData.phone,
          otp: otpValue,
          role: userType,
        });

        login(response.data.token, response.data.user);
        toast.success('Login successful!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const startOtpTimer = () => {
    setOtpTimer(30);
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = async () => {
    try {
      await authAPI.mobileLogin({
        phone: formData.countryCode + formData.phone,
        role: userType,
      });
      toast.success('OTP resent successfully!');
      startOtpTimer();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // Show Schools component
  if (showSchools) {
    return <School onBack={() => setShowSchools(false)} />;
  }

  if (showLogin) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-100/60"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <header className="header bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 animate-slideDown">
            <nav className="nav-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="logo flex items-center cursor-pointer group" onClick={() => setShowLogin(false)}>
                  <div className="logo-icon w-8 h-8 text-blue-600 mr-3 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                  </div>
                  <span className="logo-text text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">My UniOne</span>
                </div>
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-gray-600 hover:text-blue-600 flex items-center gap-2 text-sm sm:text-base group transition-all duration-300 hover:scale-105"
                >
                  <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden xs:inline">Back to Home</span>
                  <span className="xs:hidden">Back</span>
                </button>
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="main-content flex items-center justify-center p-4 min-h-[calc(100vh-140px)]">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md mx-auto animate-fadeInUp border border-white/20">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4 animate-pulse">
                  <GraduationCap className="w-8 h-8 text-blue-600 animate-bounce" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 animate-slideUp">Welcome Back</h1>
                <p className="text-gray-600 text-sm sm:text-base animate-slideUp animation-delay-200">Sign in to access your UNIONE account</p>
              </div>

              {/* User Type Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6 animate-slideUp animation-delay-400">
                <button
                  type="button"
                  onClick={() => setUserType('parent')}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 rounded-md transition-all duration-300 text-sm transform hover:scale-105 ${
                    userType === 'parent'
                      ? 'bg-white text-blue-600 shadow-sm scale-105'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden xs:inline">Parent</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('teacher')}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 rounded-md transition-all duration-300 text-sm transform hover:scale-105 ${
                    userType === 'teacher'
                      ? 'bg-white text-blue-600 shadow-sm scale-105'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden xs:inline">Teacher</span>
                </button>
              </div>

              {/* Login Method Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6 animate-slideUp animation-delay-600">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('mobile');
                    setIsOtpSent(false);
                  }}
                  className={`flex-1 py-2 px-2 sm:px-4 rounded-md transition-all duration-300 text-xs sm:text-sm transform hover:scale-105 ${
                    loginMethod === 'mobile'
                      ? 'bg-white text-blue-600 shadow-sm scale-105'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mobile OTP
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-2 sm:px-4 rounded-md transition-all duration-300 text-xs sm:text-sm transform hover:scale-105 ${
                    loginMethod === 'email'
                      ? 'bg-white text-blue-600 shadow-sm scale-105'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Email & Password
                </button>
              </div>

              {/* Login Forms */}
              {loginMethod === 'mobile' ? (
                <form onSubmit={handleMobileLogin} className="space-y-6 animate-slideUp animation-delay-800">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <div className="flex">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="w-16 sm:w-20 px-2 sm:px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300 focus:scale-105"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+86">+86</option>
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter mobile number"
                        className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300 focus:scale-105"
                        required
                      />
                    </div>
                  </div>

                  {isOtpSent && (
                    <div className="animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter OTP
                      </label>
                      <div className="flex gap-1 sm:gap-2 mb-4 justify-center">
                        {formData.otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            className="w-10 h-10 sm:w-12 sm:h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300 focus:scale-110 focus:border-blue-400"
                            maxLength={1}
                            required
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        {otpTimer > 0 ? (
                          <span className="text-gray-600 animate-pulse">
                            Resend OTP in {otpTimer}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={resendOtp}
                            className="text-blue-600 hover:text-blue-800 transition-colors hover:underline"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <Phone className="w-4 h-4" />
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : isOtpSent ? 'Verify OTP' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEmailLogin} className="space-y-6 animate-slideUp animation-delay-800">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300 focus:scale-105"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10 transition-all duration-300 focus:scale-105"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <Mail className="w-4 h-4" />
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Signing in...
                      </>
                    ) : 'Sign In'}
                  </button>
                </form>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="footer bg-white/95 backdrop-blur-sm border-t border-gray-200">
            <div className="footer-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="footer-section text-center sm:text-left">
                  <div className="footer-logo flex items-center justify-center sm:justify-start mb-4">
                    <div className="logo-icon w-8 h-8 text-blue-600 mr-3 flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">My UniOne</h3>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">Connecting parents, students, and teachers for better educational outcomes through innovative digital solutions.</p>
                </div>
                <div className="footer-section text-center sm:text-left">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
                  <ul className="space-y-2">
                    <li><button onClick={() => scrollToSection('home')} className="text-gray-600 hover:text-blue-600 text-sm sm:text-base transition-colors">Home</button></li>
                    <li><button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-blue-600 text-sm sm:text-base transition-colors">Features</button></li>
                    <li><button onClick={() => scrollToSection('about')} className="text-gray-600 hover:text-blue-600 text-sm sm:text-base transition-colors">About Us</button></li>
                    <li><button onClick={() => setShowSchools(true)} className="text-gray-600 hover:text-blue-600 text-sm sm:text-base transition-colors">Schools</button></li>
                    <li><button onClick={() => setShowLogin(true)} className="text-gray-600 hover:text-blue-600 text-sm sm:text-base transition-colors">Login</button></li>
                  </ul>
                </div>
                <div className="footer-section text-center sm:text-left sm:col-span-2 lg:col-span-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h4>
                  <div className="contact-info space-y-2">
                    <div className="contact-item text-gray-600 text-sm sm:text-base">Greater Noida, India</div>
                    <div className="contact-item text-gray-600 text-sm sm:text-base">support@My UniOne.edu</div>
                    <div className="contact-item text-gray-600 text-sm sm:text-base">+91 98765 43210</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-bottom border-t border-gray-200 py-4">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-gray-600 text-sm">&copy; 2025 My UniOne Ltd. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="header bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 fixed w-full z-50 animate-slideDown">
        <nav className="nav-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="logo flex items-center flex-shrink-0 group">
              <div className="logo-icon w-8 h-8 text-blue-600 mr-3 group-hover:rotate-12 transition-transform duration-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <span className="logo-text text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">My UniOne</span>
            </div>
            
            {/* Desktop Navigation */}
            <ul className="nav-menu hidden md:flex space-x-6 lg:space-x-8 items-center">
              <li><button onClick={() => scrollToSection('home')} className="nav-link1 text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm lg:text-base relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button></li>
              <li><button onClick={() => scrollToSection('features')} className="nav-link1 text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm lg:text-base relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button></li>
              <li><button onClick={() => scrollToSection('about')} className="nav-link1 text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm lg:text-base relative group">
                About Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button></li>
              <li><button onClick={() => setShowSchools(true)} className="nav-link1 text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm lg:text-base flex items-center gap-1 relative group">
                Schools
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button></li>
              <li><button onClick={() => setShowLogin(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm lg:text-base transform hover:scale-105 hover:shadow-lg">Login</button></li>
            </ul>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-600 p-2 transition-all duration-300 hover:scale-110"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 py-4 absolute left-0 right-0 top-16 shadow-lg animate-slideDown">
              <div className="flex flex-col space-y-4 px-4">
                <button onClick={() => scrollToSection('home')} className="text-left text-gray-700 hover:text-blue-600 transition-colors py-2 hover:pl-2 duration-300">Home</button>
                <button onClick={() => scrollToSection('features')} className="text-left text-gray-700 hover:text-blue-600 transition-colors py-2 hover:pl-2 duration-300">Features</button>
                <button onClick={() => scrollToSection('about')} className="text-left text-gray-700 hover:text-blue-600 transition-colors py-2 hover:pl-2 duration-300">About Us</button>
                <button onClick={() => setShowSchools(true)} className="text-left text-gray-700 hover:text-blue-600 transition-colors py-2 flex items-center gap-2 hover:pl-2 duration-300">
                  Schools
                </button>
                <button onClick={() => setShowLogin(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 w-full text-center transform hover:scale-105">Login</button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/60"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              <span className="inline-block">
                {animatedText.split(' ').map((word, index) => (
                  <span
                    key={index}
                    className={`inline-block mr-2 ${index < currentWordIndex ? 'animate-slideInLeft' : 'opacity-0'}`}
                    style={{ animationDelay: `${index * 300}ms` }}
                  >
                    {word}
                  </span>
                ))}
              </span>
              {currentWordIndex >= heroWords.length && (
                <span className="text-blue-300 block animate-slideInUp animation-delay-1500">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                    Digital Innovation
                    <Zap className="w-8 h-8 animate-bounce" />
                  </span>
                </span>
              )}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-6 sm:mb-8 leading-relaxed px-4 animate-fadeInUp animation-delay-2000">
              My UniOne bridges the gap between schools, teachers, and parents with comprehensive digital solutions for modern education management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 animate-fadeInUp animation-delay-2500">
              <button 
                onClick={() => setShowLogin(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:scale-105 group"
              >
                <span className="flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Explore Features
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Animation Elements */}
        <div className="hidden lg:block absolute top-20 left-10 animate-float">
          <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
            <BookOpen className="w-8 h-8 text-blue-300" />
          </div>
        </div>
        <div className="hidden lg:block absolute top-40 right-20 animate-float animation-delay-1000">
          <div className="w-12 h-12 bg-indigo-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
            <GraduationCap className="w-6 h-6 text-indigo-300" />
          </div>
        </div>
        <div className="hidden lg:block absolute bottom-40 left-20 animate-float animation-delay-2000">
          <div className="w-14 h-14 bg-purple-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Users className="w-7 h-7 text-purple-300" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative overflow-hidden" data-animate>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${isVisible.features ? 'animate-slideUp' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Comprehensive School Management
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Our platform provides all the tools needed to streamline school operations and enhance communication between all stakeholders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature Cards with Staggered Animation */}
            {[
              {
                icon: ClipboardCheck,
                title: "Attendance Management",
                description: "Effortlessly track and manage student attendance with real-time updates and automated notifications to parents.",
                features: ["Digital attendance tracking"],
                color: "blue",
                delay: "0"
              },
              {
                icon: BarChart3,
                title: "Grade Management",
                description: "Comprehensive grading system with detailed analytics and progress tracking for better student assessment.",
                features: ["Digital gradebook"],
                color: "green",
                delay: "200"
              },
              {
                icon: Calendar,
                title: "Schedule Management",
                description: "Create and manage class schedules, assignments, and important events with automated reminders.",
                features: ["Interactive calendar"],
                color: "purple",
                delay: "400"
              },
              {
                icon: MessageCircle,
                title: "Feedback System",
                description: "Streamlined communication between teachers and parents with detailed feedback and progress reports.",
                features: ["Real-time messaging"],
                color: "orange",
                delay: "600"
              },
              {
                icon: CreditCard,
                title: "Fee Management",
                description: "Complete fee management system with Payment Structure, receipts, and automated reminders.",
                features: ["Payment Structure"],
                color: "red",
                delay: "800"
              },
              {
                icon: Shield,
                title: "Communication System",
                description: "Seamless messaging between teachers and parents",
                features: ["Real-time Messaging"],
                color: "indigo",
                delay: "1000"
              },
              {
                icon: BookOpen,
                title: "Assignment Section",
                description: "Create, track, and grade assignments efficiently",
                features: ["Assignment Creation"],
                color: "pink",
                delay: "1200"
              },
              {
                icon: Star,
                title: "Announcement Management",
                description: "Broadcast important updates and news",
                features: ["School-wide Alerts"],
                color: "yellow",
                delay: "1400"
              },
              {
                icon: Shield,
                title: "Secure Access",
                description: "Role-based access control ensuring data privacy and security for all users in the system.",
                features: ["Multi-factor authentication"],
                color: "teal",
                delay: "1600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 group cursor-pointer border border-gray-100 ${
                  isVisible.features ? 'animate-slideUp' : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: feature.delay + 'ms' }}
              >
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-600 group-hover:animate-pulse`} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center group-hover:text-gray-700 transition-colors">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden" data-animate id="stats">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center transition-all duration-1000 ${isVisible.stats ? 'animate-slideUp' : 'opacity-0 translate-y-10'}`}>
            {[
              { number: "100+", label: "Schools Connected", delay: "0" },
              { number: "5K+", label: "Active Students", delay: "200" },
              { number: "1K+", label: "Teachers", delay: "400" },
              { number: "99.9%", label: "Uptime", delay: "600" }
            ].map((stat, index) => (
              <div
                key={index}
                className={`text-white group cursor-pointer transition-all duration-500 hover:scale-110 ${
                  isVisible.stats ? 'animate-slideUp' : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: stat.delay + 'ms' }}
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300 animate-countUp">
                  {stat.number}
                </div>
                <div className="text-blue-200 text-sm sm:text-base group-hover:text-white transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${isVisible.about ? 'animate-slideUp' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                About My UniOne
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              We are passionate about transforming education through innovative technology solutions that connect schools, teachers, parents, and students.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-12 sm:mb-16">
            <div className={`order-2 lg:order-1 transition-all duration-1000 ${isVisible.about ? 'animate-slideInLeft' : 'opacity-0 -translate-x-10'}`}>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Our Mission</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                At My UniOne, we believe that education is the foundation of progress. Our mission is to empower educational institutions with cutting-edge digital tools that streamline administrative processes, enhance communication, and ultimately improve learning outcomes for students.
              </p>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                We understand the challenges faced by modern schools in managing day-to-day operations while maintaining quality education. That's why we've developed a comprehensive platform that addresses every aspect of school management, from attendance tracking to fee collection.
              </p>
              <div className="flex items-center gap-4 group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                  <TrendingUp className="w-6 h-6 text-blue-600 group-hover:animate-bounce" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Continuous Innovation</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Always evolving to meet educational needs</p>
                </div>
              </div>
            </div>
            <div className={`order-1 lg:order-2 relative transition-all duration-1000 ${isVisible.about ? 'animate-slideInRight' : 'opacity-0 translate-x-10'}`}>
              <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <GraduationCap className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600 mx-auto mb-4 animate-bounce" />
                  <p className="text-blue-800 font-semibold">Educational Technology</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                <Award className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className={`relative transition-all duration-1000 ${isVisible.about ? 'animate-slideInLeft animation-delay-500' : 'opacity-0 -translate-x-10'}`}>
              <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-green-100 to-blue-200 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 sm:w-20 sm:h-20 text-green-600 mx-auto mb-4 animate-pulse" />
                  <p className="text-green-800 font-semibold">Team Collaboration</p>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-16 h-16 sm:w-24 sm:h-24 bg-green-600 rounded-full flex items-center justify-center animate-bounce">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
            <div className={`transition-all duration-1000 ${isVisible.about ? 'animate-slideInRight animation-delay-500' : 'opacity-0 translate-x-10'}`}>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Our Vision</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                We envision a future where technology seamlessly integrates with education, creating an ecosystem where teachers can focus on teaching, parents stay informed and engaged, and students receive the best possible educational experience.
              </p>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Our platform is designed to be intuitive, secure, and scalable, ensuring that schools of all sizes can benefit from our solutions. We're committed to supporting educational institutions in their digital transformation journey.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 group cursor-pointer hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <Clock className="w-6 h-6 text-green-600 group-hover:animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">24/7 Support</h4>
                    <p className="text-gray-600 text-sm sm:text-base">Round-the-clock assistance for all users</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                    <Star className="w-6 h-6 text-purple-600 group-hover:animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Excellence Driven</h4>
                    <p className="text-gray-600 text-sm sm:text-base">Committed to delivering the highest quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Values */}
          <div className={`mt-16 sm:mt-20 transition-all duration-1000 ${isVisible.about ? 'animate-slideUp animation-delay-1000' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">Our Core Values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: Shield,
                  title: "Security & Privacy",
                  description: "We prioritize the security and privacy of all user data with enterprise-grade protection and compliance standards.",
                  color: "blue",
                  delay: "0"
                },
                {
                  icon: Users,
                  title: "Collaboration",
                  description: "Fostering seamless communication and collaboration between all stakeholders in the educational ecosystem.",
                  color: "green",
                  delay: "200"
                },
                {
                  icon: TrendingUp,
                  title: "Innovation",
                  description: "Continuously evolving our platform with the latest technologies to meet changing educational needs.",
                  color: "purple",
                  delay: "400"
                }
              ].map((value, index) => (
                <div
                  key={index}
                  className={`text-center group cursor-pointer hover:scale-105 transition-all duration-500 ${
                    isVisible.about ? 'animate-slideUp' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ animationDelay: (1000 + parseInt(value.delay)) + 'ms' }}
                >
                  <div className={`w-16 h-16 bg-${value.color}-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-${value.color}-200 transition-colors group-hover:scale-110`}>
                    <value.icon className={`w-8 h-8 text-${value.color}-600 group-hover:animate-pulse`} />
                  </div>
                  <h4 className={`text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-${value.color}-600 transition-colors`}>
                    {value.title}
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden" data-animate id="cta">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-float animation-delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-float animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className={`transition-all duration-1000 ${isVisible.cta ? 'animate-slideUp' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your School?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
              Join thousands of schools already using My UniOne to streamline their operations and enhance educational outcomes.
            </p>
            <button 
              onClick={() => setShowLogin(true)}
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2 group"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-white/95 backdrop-blur-sm border-t border-gray-200">
        <div className="footer-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="footer-section text-center sm:text-left">
              <div className="footer-logo flex items-center justify-center sm:justify-start mb-4 group">
                <div className="logo-icon w-8 h-8 text-blue-600 mr-3 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">My UniOne</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Connecting parents, students, and teachers for better educational outcomes through innovative digital solutions.</p>
            </div>
            <div className="footer-section text-center sm:text-left">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('home')} className="text-gray-600 hover:text-blue-600 text-sm sm:text-base transition-all duration-300 hover:translate-x-1">Home</button></li>
                <li><button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-blue-600 text-sm sm:text-base transition-all duration-300 hover:translate-x-1">Features</button></li>
                <li><button onClick={() => scrollToSection('about')} className="text-gray-600 hover:text-blue-600 text-sm sm:text-base transition-all duration-300 hover:translate-x-1">About Us</button></li>
                <li><button onClick={() => setShowSchools(true)} className="text-gray-600 hover:text-blue-600 text-sm sm:text-base transition-all duration-300 hover:translate-x-1">Schools</button></li>
                <li><button onClick={() => setShowLogin(true)} className="text-gray-600 hover:text-blue-600 text-sm sm:text-base transition-all duration-300 hover:translate-x-1">Login</button></li>
              </ul>
            </div>
            <div className="footer-section text-center sm:text-left sm:col-span-2 lg:col-span-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h4>
              <div className="contact-info space-y-2">
                <div className="contact-item text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors cursor-pointer">Greater Noida, India</div>
                <div className="contact-item text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors cursor-pointer">support@My UniOne.edu</div>
                <div className="contact-item text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors cursor-pointer">+91 98765 43210</div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-600 text-sm">&copy; 2025 My UniOne Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
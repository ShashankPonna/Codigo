import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useEffect, useState } from 'react';
import escapeRoomImg from 'figma:asset/e3ffa7d1f804ca323a4967a4bd3630d14c44b0cb.png';
import bugBountyImg from 'figma:asset/769ed4f8bdea5bff959ec08a5ef510cce7c13f23.png';
import blindCodingImg from 'figma:asset/89e87056e044605e1ba65b6d052a9f05950ca52f.png';
import qrCodeImg from 'figma:asset/eab32427696b15da123304e86c248bedac76bc1e.png';
import { supabase } from '@/utils/supabaseClient';
import { toast, Toaster } from 'sonner';

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Create floating particles
    const createParticles = () => {
      const hero = document.getElementById('hero');
      if (!hero) return;

      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        // Random positions
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const endX = (Math.random() - 0.5) * 200;
        const endY = (Math.random() - 0.5) * 200;
        
        particle.style.left = `${startX}%`;
        particle.style.top = `${startY}%`;
        particle.style.setProperty('--tx', `${endX}px`);
        particle.style.setProperty('--ty', `${endY}px`);
        particle.style.animationDelay = `${Math.random() * 8}s`;
        particle.style.animationDuration = `${8 + Math.random() * 4}s`;
        
        hero.appendChild(particle);
      }
    };

    createParticles();

    // Smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href') || '');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Scroll reveal animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const college = formData.get('college') as string;
      const phone = formData.get('phone') as string;
      const member2Name = formData.get('member2Name') as string;
      const member3Name = formData.get('member3Name') as string;
      const upiId = formData.get('upiId') as string;
      const screenshot = formData.get('screenshot') as File;

      // Validate file exists
      if (!screenshot || screenshot.size === 0) {
        toast.error('Please select a transaction screenshot to upload.');
        setIsSubmitting(false);
        return;
      }

      // Validate file size (max 5MB)
      if (screenshot.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB.');
        setIsSubmitting(false);
        return;
      }

      // Get file extension
      const fileExt = screenshot.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `screenshot-${name.replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('codigo-registrations')
        .upload(fileName, screenshot, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        if (error.message.includes('Bucket not found')) {
          toast.error('Storage setup required. Please create the "codigo-registrations" bucket in Supabase Storage.');
        } else if (error.message.includes('row-level security policy') || error.message.includes('RLS')) {
          toast.error('Storage permissions not configured. Please add upload policy to the bucket.');
        } else {
          toast.error(`Failed to upload screenshot: ${error.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      // Insert registration data
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert([
          {
            name,
            email,
            college,
            phone,
            member2_name: member2Name,
            member3_name: member3Name || null,
            upi_id: upiId,
            screenshot_url: data.path
          }
        ]);

      if (registrationError) {
        console.error('Registration error:', registrationError);
        toast.error(`Failed to register: ${registrationError.message}`);
        setIsSubmitting(false);
        return;
      }

      toast.success('Registration successful! Welcome to CODIGO 4.0.');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-theme="wizarding" className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-900 to-black backdrop-blur-md border-b border-indigo-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-amber-200" style={{ fontFamily: 'Cinzel, serif' }}>
                CODIGO 4.0
              </h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <a href="#round1" className="text-indigo-200 hover:text-yellow-300 hover:animate-pulse transition-all px-3 py-2 relative group">
                  Round 1
                  <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-yellow-300 text-xs transition-opacity">✨</span>
                </a>
                <a href="#round2" className="text-indigo-200 hover:text-yellow-300 hover:animate-pulse transition-all px-3 py-2 relative group">
                  Round 2
                  <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-yellow-300 text-xs transition-opacity">✨</span>
                </a>
                <a href="#round3" className="text-indigo-200 hover:text-yellow-300 hover:animate-pulse transition-all px-3 py-2 relative group">
                  Round 3
                  <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-yellow-300 text-xs transition-opacity">✨</span>
                </a>
                <a href="#register" className="text-indigo-200 hover:text-yellow-300 hover:animate-pulse transition-all px-3 py-2 relative group">
                  Register
                  <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-yellow-300 text-xs transition-opacity">✨</span>
                </a>
              </div>
            </div>
            <button className="md:hidden text-indigo-200 hover:text-yellow-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-r from-indigo-900 to-black">
            <a href="#round1" onClick={() => setMobileMenuOpen(false)} className="block text-indigo-200 hover:text-yellow-300 hover:animate-pulse transition-all px-3 py-2 relative group">
              Round 1
              <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-yellow-300 text-xs transition-opacity">✨</span>
            </a>
            <a href="#round2" onClick={() => setMobileMenuOpen(false)} className="block text-indigo-200 hover:text-yellow-300 hover:animate-pulse transition-all px-3 py-2 relative group">
              Round 2
              <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-yellow-300 text-xs transition-opacity">✨</span>
            </a>
            <a href="#round3" onClick={() => setMobileMenuOpen(false)} className="block text-indigo-200 hover:text-yellow-300 hover:animate-pulse transition-all px-3 py-2 relative group">
              Round 3
              <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-yellow-300 text-xs transition-opacity">✨</span>
            </a>
            <a href="#register" onClick={() => setMobileMenuOpen(false)} className="block text-indigo-200 hover:text-yellow-300 hover:animate-pulse transition-all px-3 py-2 relative group">
              Register
              <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-yellow-300 text-xs transition-opacity">✨</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="hero" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-black">
        {/* Floating stars background */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                opacity: Math.random() * 0.7 + 0.3
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10 animate-fadeIn">
          <h2 className="text-7xl md:text-9xl font-bold mb-8 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent leading-tight animate-float" style={{ fontFamily: 'Cinzel, serif' }}>
            CODIGO 4.0
          </h2>
          
          <p className="text-2xl md:text-3xl text-purple-200 mb-4 tracking-wide" style={{ fontFamily: 'Crimson Text, serif' }}>
            Organized by Coding Club RSCOE
          </p>
          
          <p className="text-xl md:text-2xl text-purple-300 mb-16 font-light" style={{ fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
            Team-based coding competition • 2-3 members per team
          </p>
          
          <div className="flex justify-center animate-bounceOnce">
            <a 
              href="#register" 
              className="group relative px-12 py-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-purple-900 rounded-xl font-bold text-xl transition-all duration-300 hover:from-amber-400 hover:to-yellow-400 transform hover:scale-110"
              style={{ 
                fontFamily: 'Cinzel, serif',
                boxShadow: '0 0 20px rgb(255, 215, 0, 0.5), 0 0 40px rgb(255, 215, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgb(255, 215, 0, 0.8), 0 0 60px rgb(255, 215, 0, 0.5), 0 0 80px rgb(255, 215, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgb(255, 215, 0, 0.5), 0 0 40px rgb(255, 215, 0, 0.3)';
              }}
            >
              ⚡ Register Now ⚡
            </a>
          </div>
        </div>
      </header>

      {/* Rounds Preview Section */}
      <section id="rounds" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent" style={{ fontFamily: 'Cinzel, serif' }}>
              The Three Trials
            </h3>
            <p className="text-purple-300 text-lg" style={{ fontFamily: 'Crimson Text, serif' }}>
              Each round tests a different aspect of your magical coding abilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Round 1 Card - Magical Portal Style */}
            <article className="scroll-reveal group relative bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 rounded-3xl p-8 border-2 border-purple-400/40 hover:border-amber-300 transition-all duration-500 hover:transform hover:scale-110 backdrop-blur-lg overflow-hidden shadow-2xl hover:shadow-amber-500/30">
              {/* Magical glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 via-amber-400/0 to-amber-400/0 group-hover:from-amber-400/20 group-hover:via-transparent group-hover:to-amber-400/10 transition-all duration-500"></div>
              
              {/* Sparkle effects on hover */}
              <div className="absolute top-4 right-4 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300">✨</div>
              <div className="absolute bottom-4 left-4 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300" style={{ animationDelay: '0.3s' }}>✨</div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-amber-400/50 transition-shadow duration-300 group-hover:rotate-12 transform">
                  <span className="text-4xl">🔐</span>
                </div>
                
                <h4 className="text-3xl font-bold text-amber-200 mb-4 group-hover:text-amber-100 transition-colors" style={{ fontFamily: 'Cinzel, serif' }}>
                  Round 1: Escape Room
                </h4>
                
                <p className="text-purple-100 mb-6 leading-relaxed text-lg" style={{ fontFamily: 'Crimson Text, serif' }}>
                  Solve a series of linked challenges to unlock the final QR and qualify for the next round.
                </p>
                
                <div className="flex items-center text-sm text-purple-200 bg-purple-900/40 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  45 minutes • No electronic devices
                </div>
              </div>
            </article>

            {/* Round 2 Card - Magical Portal Style */}
            <article className="scroll-reveal group relative bg-gradient-to-br from-indigo-700 via-blue-800 to-purple-900 rounded-3xl p-8 border-2 border-indigo-400/40 hover:border-amber-300 transition-all duration-500 hover:transform hover:scale-110 backdrop-blur-lg overflow-hidden shadow-2xl hover:shadow-amber-500/30" style={{ animationDelay: '0.2s' }}>
              {/* Magical glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 via-amber-400/0 to-amber-400/0 group-hover:from-amber-400/20 group-hover:via-transparent group-hover:to-amber-400/10 transition-all duration-500"></div>
              
              {/* Sparkle effects on hover */}
              <div className="absolute top-4 right-4 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300">✨</div>
              <div className="absolute bottom-4 left-4 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300" style={{ animationDelay: '0.3s' }}>✨</div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-amber-400/50 transition-shadow duration-300 group-hover:rotate-12 transform">
                  <span className="text-4xl">🐛</span>
                </div>
                
                <h4 className="text-3xl font-bold text-amber-200 mb-4 group-hover:text-amber-100 transition-colors" style={{ fontFamily: 'Cinzel, serif' }}>
                  Round 2: Bug Bounty
                </h4>
                
                <p className="text-purple-100 mb-6 leading-relaxed text-lg" style={{ fontFamily: 'Crimson Text, serif' }}>
                  Identify and fix logical and syntax errors in a given program to produce the correct output.
                </p>
                
                <div className="flex items-center text-sm text-purple-200 bg-indigo-900/40 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  60 minutes • No internet or AI tools
                </div>
              </div>
            </article>

            {/* Round 3 Card - Magical Portal Style */}
            <article className="scroll-reveal group relative bg-gradient-to-br from-purple-800 via-pink-800 to-purple-900 rounded-3xl p-8 border-2 border-pink-400/40 hover:border-amber-300 transition-all duration-500 hover:transform hover:scale-110 backdrop-blur-lg overflow-hidden shadow-2xl hover:shadow-amber-500/30" style={{ animationDelay: '0.4s' }}>
              {/* Magical glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 via-amber-400/0 to-amber-400/0 group-hover:from-amber-400/20 group-hover:via-transparent group-hover:to-amber-400/10 transition-all duration-500"></div>
              
              {/* Sparkle effects on hover */}
              <div className="absolute top-4 right-4 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300">✨</div>
              <div className="absolute bottom-4 left-4 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300" style={{ animationDelay: '0.3s' }}>✨</div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-amber-400/50 transition-shadow duration-300 group-hover:rotate-12 transform">
                  <span className="text-4xl">👁️‍🗨️</span>
                </div>
                
                <h4 className="text-3xl font-bold text-amber-200 mb-4 group-hover:text-amber-100 transition-colors" style={{ fontFamily: 'Cinzel, serif' }}>
                  Round 3: Blind Coding
                </h4>
                
                <p className="text-purple-100 mb-6 leading-relaxed text-lg" style={{ fontFamily: 'Crimson Text, serif' }}>
                  Write correct code without execution under strict time blocks.
                </p>
                
                <div className="flex items-center text-sm text-purple-200 bg-pink-900/40 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  60 minutes • No execution or debugging
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Round 1 Details - Spell Book */}
      <section id="round1" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-700 via-indigo-800 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Magical Illustration */}
            <div className="scroll-reveal order-2 lg:order-1">
              <ImageWithFallback 
                src={escapeRoomImg}
                alt="Magic Spell Book"
                className="rounded-3xl shadow-2xl border-4 border-amber-400/30 hover:border-amber-300 transition-all duration-500 hover:scale-105 hover:shadow-amber-500/40 w-full h-auto max-h-[100vh] object-contain"
              />
            </div>
            
            {/* Right - Description */}
            <div className="scroll-reveal order-1 lg:order-2" style={{ animationDelay: '0.2s' }}>
              <div className="inline-block px-4 py-2 rounded-full bg-purple-600/50 border border-purple-400/50 text-purple-200 text-sm mb-4">
                Round 1
              </div>
              <h3 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent" style={{ fontFamily: 'Cinzel, serif' }}>
                Escape Room
              </h3>
              <p className="text-purple-100 text-xl mb-8 leading-relaxed" style={{ fontFamily: 'Crimson Text, serif' }}>
                A 45-minute escape room–based challenge with four linked tasks that must be solved sequentially. Teams must unlock the final QR page within limited attempts to qualify for the next round.
              </p>
              
              <div className="space-y-6">
                <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
                  <h4 className="text-xl font-bold text-amber-300 mb-3 flex items-center" style={{ fontFamily: 'Cinzel, serif' }}>
                    <span className="text-2xl mr-3">📋</span>
                    Tasks / Details
                  </h4>
                  <ul className="space-y-2 text-purple-100" style={{ fontFamily: 'Crimson Text, serif' }}>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Solve 4 interconnected challenges in sequence</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Enter the final password via the official QR page</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Only 3 attempts allowed to submit the password</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Password is case-sensitive</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Use of mobile phones, laptops, calculators, smartwatches, or any digital devices is strictly prohibited</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Only materials provided by organizers are allowed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Fastest completion time and fewer attempts get priority if slots are limited</span>
                    </li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-amber-300 font-bold mb-1" style={{ fontFamily: 'Cinzel, serif' }}>Duration</div>
                    <div className="text-purple-100 text-lg">45 minutes</div>
                  </div>
                  <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-amber-300 font-bold mb-1" style={{ fontFamily: 'Cinzel, serif' }}>Attempts</div>
                    <div className="text-purple-100 text-lg">3 maximum</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Round 2 Details - Tournament */}
      <section id="round2" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-800 via-blue-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Description */}
            <div className="scroll-reveal">
              <div className="inline-block px-4 py-2 rounded-full bg-indigo-600/50 border border-indigo-400/50 text-indigo-200 text-sm mb-4">
                Round 2
              </div>
              <h3 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent" style={{ fontFamily: 'Cinzel, serif' }}>
                Bug Bounty
              </h3>
              <p className="text-purple-100 text-xl mb-8 leading-relaxed" style={{ fontFamily: 'Crimson Text, serif' }}>
                Participants are given a working program containing logical and syntax errors. The task is to analyze the code, identify bugs, and fix them to produce the correct output without changing the program's core structure.
              </p>
              
              <div className="space-y-6">
                <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-6 backdrop-blur-sm">
                  <h4 className="text-xl font-bold text-amber-300 mb-3 flex items-center" style={{ fontFamily: 'Cinzel, serif' }}>
                    <span className="text-2xl mr-3">📋</span>
                    Tasks / Details
                  </h4>
                  <ul className="space-y-2 text-purple-100" style={{ fontFamily: 'Crimson Text, serif' }}>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Identify and fix logical and syntax bugs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>No runtime errors will be present</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Core program structure must remain unchanged</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Input and output format must not be modified</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Internet, AI tools, and mobile phones are not allowed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Submissions are evaluated on correctness and submission time</span>
                    </li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-amber-300 font-bold mb-1" style={{ fontFamily: 'Cinzel, serif' }}>Duration</div>
                    <div className="text-purple-100 text-lg">60 minutes</div>
                  </div>
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-amber-300 font-bold mb-1" style={{ fontFamily: 'Cinzel, serif' }}>Focus</div>
                    <div className="text-purple-100 text-lg">Debugging</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right - Magical Illustration */}
            <div className="scroll-reveal" style={{ animationDelay: '0.2s' }}>
              <ImageWithFallback 
                src={bugBountyImg}
                alt="Magic Tournament"
                className="rounded-3xl shadow-2xl border-4 border-amber-400/30 hover:border-amber-300 transition-all duration-500 hover:scale-105 hover:shadow-amber-500/40 w-full h-auto max-h-[100vh] object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Round 3 Details - Grand Ritual */}
      <section id="round3" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-800 via-pink-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Magical Illustration */}
            <div className="scroll-reveal order-2 lg:order-1">
              <ImageWithFallback 
                src={blindCodingImg}
                alt="Potion Brewing"
                className="rounded-3xl shadow-2xl border-4 border-amber-400/30 hover:border-amber-300 transition-all duration-500 hover:scale-105 hover:shadow-amber-500/40 w-full h-auto max-h-[100vh] object-contain"
              />
            </div>
            
            {/* Right - Description */}
            <div className="scroll-reveal order-1 lg:order-2" style={{ animationDelay: '0.2s' }}>
              <div className="inline-block px-4 py-2 rounded-full bg-pink-600/50 border border-pink-400/50 text-pink-200 text-sm mb-4">
                Round 3
              </div>
              <h3 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent" style={{ fontFamily: 'Cinzel, serif' }}>
                Blind Coding
              </h3>
              <p className="text-purple-100 text-xl mb-8 leading-relaxed" style={{ fontFamily: 'Crimson Text, serif' }}>
                A blind coding challenge consisting of three coding problems with increasing difficulty. Code must be written without execution, compilation, or output verification, testing accuracy and logic under strict time limits.
              </p>
              
              <div className="space-y-6">
                <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
                  <h4 className="text-xl font-bold text-amber-300 mb-3 flex items-center" style={{ fontFamily: 'Cinzel, serif' }}>
                    <span className="text-2xl mr-3">📋</span>
                    Tasks / Details
                  </h4>
                  <ul className="space-y-2 text-purple-100" style={{ fontFamily: 'Crimson Text, serif' }}>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>3 fixed 20-minute blocks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>One coding problem per block</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Only the assigned team member can code in their block</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>No collaboration between team members during blocks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Code execution, debugging, or testing is strictly prohibited</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>For teams with 2 members, one member attempts two blocks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-400 mr-3">✦</span>
                      <span>Evaluation based on points, difficulty, errors, and time</span>
                    </li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pink-900/30 border border-pink-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-amber-300 font-bold mb-1" style={{ fontFamily: 'Cinzel, serif' }}>Duration</div>
                    <div className="text-purple-100 text-lg">60 minutes</div>
                  </div>
                  <div className="bg-pink-900/30 border border-pink-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-amber-300 font-bold mb-1" style={{ fontFamily: 'Cinzel, serif' }}>Per Problem</div>
                    <div className="text-purple-100 text-lg">20 minutes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Round Details Section */}
      <section id="details" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-indigo-950/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent" style={{ fontFamily: 'Cinzel, serif' }}>
              The Sacred Scrolls
            </h3>
            <p className="text-purple-300 text-lg" style={{ fontFamily: 'Crimson Text, serif' }}>
              Everything you need to know before embarking on your journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Event Details */}
            <div className="bg-gradient-to-br from-purple-800/30 via-indigo-800/30 to-purple-900/30 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm">
              <h4 className="text-2xl font-bold text-amber-300 mb-6 flex items-center" style={{ fontFamily: 'Cinzel, serif' }}>
                <span className="text-3xl mr-3">📜</span>
                Event Details
              </h4>
              
              <dl className="space-y-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                <div className="flex border-b border-purple-500/20 pb-3">
                  <dt className="text-purple-300 w-32">Date:</dt>
                  <dd className="text-purple-100 font-semibold">3 Feb 2026</dd>
                </div>
                <div className="flex border-b border-purple-500/20 pb-3">
                  <dt className="text-purple-300 w-32">Time:</dt>
                  <dd className="text-purple-100 font-semibold">10:00 AM - 3:00 PM</dd>
                </div>
                <div className="flex border-b border-purple-500/20 pb-3">
                  <dt className="text-purple-300 w-32">Venue:</dt>
                  <dd className="text-purple-100 font-semibold">JSPM's RSCOE</dd>
                </div>
                <div className="flex border-b border-purple-500/20 pb-3">
                  <dt className="text-purple-300 w-32">Format:</dt>
                  <dd className="text-purple-100 font-semibold">Team Competition</dd>
                </div>
                <div className="flex pb-3">
                  <dt className="text-purple-300 w-32">Platform:</dt>
                  <dd className="text-purple-100 font-semibold">Offline College</dd>
                </div>
              </dl>
            </div>

            {/* Rules & Requirements */}
            <div className="bg-gradient-to-br from-indigo-800/30 via-purple-800/30 to-indigo-900/30 rounded-2xl p-8 border border-indigo-500/30 backdrop-blur-sm">
              <h4 className="text-2xl font-bold text-amber-300 mb-6 flex items-center" style={{ fontFamily: 'Cinzel, serif' }}>
                <span className="text-3xl mr-3">⚡</span>
                Rules & Requirements
              </h4>
              
              <ul className="space-y-4 text-purple-100" style={{ fontFamily: 'Crimson Text, serif' }}>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-3 mt-1">✦</span>
                  <span>Must be enrolled in a recognized academy of computing arts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-3 mt-1">✦</span>
                  <span>Proficiency in at least one programming language (Python, Java, C++, or JavaScript)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-3 mt-1">✦</span>
                  <span>Bring your own enchanted device (laptop with stable internet)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-3 mt-1">✦</span>
                  <span>No use of dark magic (plagiarism, unauthorized tools, or external assistance)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-3 mt-1">✦</span>
                  <span>Code must be original and written during the event</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Prizes Section */}
          <div className="mt-12 bg-gradient-to-r from-amber-900/30 via-yellow-900/30 to-amber-900/30 rounded-2xl p-8 border border-amber-500/40 backdrop-blur-sm">
            <h4 className="text-3xl font-bold text-amber-300 mb-6 text-center flex items-center justify-center" style={{ fontFamily: 'Cinzel, serif' }}>
              <span className="text-4xl mr-3">🏅</span>
              Rewards & Glory
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-xl border border-amber-400/40">
                <div className="text-5xl mb-3">🥇</div>
                <div className="text-2xl font-bold text-amber-200 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>First Place</div>
                <div className="text-xl text-purple-200" style={{ fontFamily: 'Crimson Text, serif' }}> Rs.4000</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-gray-300/20 to-gray-400/20 rounded-xl border border-gray-300/40">
                <div className="text-5xl mb-3">🥈</div>
                <div className="text-2xl font-bold text-gray-200 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Second Place</div>
                <div className="text-xl text-purple-200" style={{ fontFamily: 'Crimson Text, serif' }}>Rs.2000</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-600/20 to-amber-700/20 rounded-xl border border-orange-400/40">
                <div className="text-5xl mb-3">🥉</div>
                <div className="text-2xl font-bold text-orange-200 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Third Place</div>
                <div className="text-xl text-purple-200" style={{ fontFamily: 'Crimson Text, serif' }}>Rs.1000</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent" style={{ fontFamily: 'Cinzel, serif' }}>
              Join the Quest
            </h3>
            <p className="text-purple-300 text-lg" style={{ fontFamily: 'Crimson Text, serif' }}>
              Register now to secure your place among the elite code wizards
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-purple-800/40 via-indigo-800/40 to-purple-900/40 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm space-y-6">
            <div>
              <label htmlFor="name" className="block text-purple-200 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Team Leader Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 bg-purple-900/50 border border-purple-500/50 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-purple-200 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 bg-purple-900/50 border border-purple-500/50 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all"
                placeholder="wizard@example.com"
              />
            </div>
             <div>
              <label htmlFor="member2Name" className="block text-purple-200 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Member 2 Name *
              </label>
              <input
                type="text"
                id="member2Name"
                name="member2Name"
                required
                className="w-full px-4 py-3 bg-purple-900/50 border border-purple-500/50 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all"
                placeholder="Enter member 2 name"
              />
            </div>

            <div>
              <label htmlFor="member3Name" className="block text-purple-200 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Member 3 Name (Optional)
              </label>
              <input
                type="text"
                id="member3Name"
                name="member3Name"
                className="w-full px-4 py-3 bg-purple-900/50 border border-purple-500/50 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all"
                placeholder="Enter member 3 name"
              />
            </div>
            <div>
              <label htmlFor="college" className="block text-purple-200 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                College *
              </label>
              <input
                type="text"
                id="college"
                name="college"
                required
                className="w-full px-4 py-3 bg-purple-900/50 border border-purple-500/50 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all"
                placeholder="Your college name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-purple-200 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className="w-full px-4 py-3 bg-purple-900/50 border border-purple-500/50 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all"
                placeholder="+91 1234567890"
              />
            </div>

            {/* QR Code for Payment */}
            <div className="flex flex-col items-center justify-center p-6 bg-purple-900/30 border border-purple-500/30 rounded-lg">
              <h3 className="text-xl font-bold text-amber-200 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                Scan to Pay
              </h3>
              <ImageWithFallback 
                src={qrCodeImg}
                alt="UPI Payment QR Code"
                className="w-64 h-64 rounded-lg shadow-xl border-4 border-amber-400/30 hover:border-amber-300 transition-all duration-300"
              />
              <p className="text-purple-200 text-sm mt-4 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
                Scan this QR code with any UPI app to make payment
              </p>
            </div>

            <div>
              <label htmlFor="upiId" className="block text-purple-200 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                UPI Transaction ID *
              </label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                required
                className="w-full px-4 py-3 bg-purple-900/50 border border-purple-500/50 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all"
                placeholder="Enter UPI transaction ID"
              />
            </div>
            <div>
              <label htmlFor="screenshot" className="block text-purple-200 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Transaction Screenshot *
              </label>
              <input
                type="file"
                id="screenshot"
                name="screenshot"
                required
                accept="image/*"
                className="w-full px-4 py-3 bg-purple-900/50 border border-purple-500/50 rounded-lg text-purple-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-500 file:text-purple-900 file:font-semibold hover:file:bg-amber-400 file:cursor-pointer focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all"
              />
              <p className="mt-2 text-sm text-purple-300" style={{ fontFamily: 'Crimson Text, serif' }}>
                Upload payment screenshot (JPG, PNG, or PDF)
              </p>
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-purple-900 rounded-lg hover:from-amber-400 hover:to-yellow-400 transition-all transform hover:scale-105 shadow-lg shadow-amber-500/50 font-bold text-lg"
              style={{ fontFamily: 'Cinzel, serif' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : '⚡ Submit Registration Spell ⚡'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-transparent to-black/50 border-t border-purple-500/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h5 className="text-amber-300 font-bold mb-4 text-lg" style={{ fontFamily: 'Cinzel, serif' }}>
                About CODIGO
              </h5>
              <p className="text-purple-300 text-sm leading-relaxed" style={{ fontFamily: 'Crimson Text, serif' }}>
                The premier wizarding coding competition bringing together the brightest minds in algorithmic sorcery.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="text-amber-300 font-bold mb-4 text-lg" style={{ fontFamily: 'Cinzel, serif' }}>
                Quick Links
              </h5>
              <ul className="space-y-2 text-purple-300 text-sm" style={{ fontFamily: 'Crimson Text, serif' }}>
                <li><a href="#hero" className="hover:text-amber-300 transition-colors">Home</a></li>
                <li><a href="#rounds" className="hover:text-amber-300 transition-colors">Rounds</a></li>
                <li><a href="#details" className="hover:text-amber-300 transition-colors">Details</a></li>
                <li><a href="#register" className="hover:text-amber-300 transition-colors">Register</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="text-amber-300 font-bold mb-4 text-lg" style={{ fontFamily: 'Cinzel, serif' }}>
                Contact
              </h5>
              <ul className="space-y-2 text-purple-300 text-sm" style={{ fontFamily: 'Crimson Text, serif' }}>
                <li>📧 info@codigo.wizard</li>
                <li>📞 +1 (555) MAGIC-99</li>
                <li>📍 Platform 9¾, Tech Tower</li>
              </ul>
            </div>

            {/* Social */}
            <div className="hidden">
              <h5 className="text-amber-300 font-bold mb-4 text-lg" style={{ fontFamily: 'Cinzel, serif' }}>
                Follow Us
              </h5>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-purple-800/50 rounded-lg flex items-center justify-center text-purple-200 hover:text-amber-300 hover:bg-purple-700/50 transition-all border border-purple-500/30">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-purple-800/50 rounded-lg flex items-center justify-center text-purple-200 hover:text-amber-300 hover:bg-purple-700/50 transition-all border border-purple-500/30">
                  <span className="sr-only">Discord</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-purple-800/50 rounded-lg flex items-center justify-center text-purple-200 hover:text-amber-300 hover:bg-purple-700/50 transition-all border border-purple-500/30">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-500/30 pt-8 text-center">
            <p className="text-purple-300 text-sm" style={{ fontFamily: 'Crimson Text, serif' }}>
              © 2026 CODIGO. All magical rights reserved. May your code be bug-free and your algorithms swift.
            </p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
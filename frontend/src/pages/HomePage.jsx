import { CheckCircle, Zap, Target, Share2, Clock, Award, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';

export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const heroCards = [
    {
      title: 'Member-Only Discounts: 100+ Vendors',
      items: [
        'Exclusive discounts from 100+ vetted vendors',
        'One tag, or one vendor discount and the membership can pay for itself.',
      ],
      buttons: ['Open', 'Key Benefits'],
      openTarget: 'deals', // Open → deals.aixrbenefits.com
    },
    {
      title: 'Job Board Built for Hiring and Posting For Employers',
      items: [
        'Hiring: Post roles directly to a qualified, industry-specific audience',
        'Finding Jobs: Opportunities across VR, AR, XR...',
      ],
      buttons: ['Open', 'Key Benefits'],
      openTarget: 'jobs', // Open → login if not logged in, then /jobs
    },
    {
      title: 'Events: All High Tech, AI, XR',
      items: [
        'AI and XR events near you',
        'All innovation events in your region or regions you are visiting',
      ],
      buttons: ['Open', 'Key Benefits'],
      openTarget: 'events', // Open → /events
    },
  ];

  const handleOpenClick = (e, openTarget) => {
    e.preventDefault();
    e.stopPropagation();
    if (openTarget === 'deals') {
      window.open('https://deals.aixrbenefits.com', '_blank', 'noopener,noreferrer');
      return;
    }
    if (openTarget === 'events') {
      navigate('/events');
      return;
    }
    if (openTarget === 'jobs') {
      if (token) {
        navigate('/jobs');
      }
      else{
        navigate('/login', { state: { from: '/jobs', message: 'Please login to access the job board' } });
      }
      // when !token: use Link in render so user goes to /login with state
    }
  };

  return (
    <div
      className="min-h-screen mt-10 text-white overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #030815 0%, #0a0e27 20%, #050d1a 40%, #12a1e2 60%, #030815 80%, #0a0e27 100%)',
      }}
    >
      <div className="relative z-10">
        <section className="max-w-7xl mx-auto px-8 mb-24">
          <div className="rounded-3xl border-2 bg-gradient-to-br from-slate-900/60 to-slate-800/40 overflow-hidden animate-fade-in-up" style={{ borderColor: '#12a1e2' }}>
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
              <img
                src="/hero.png"
                alt="AI and Innovation Team"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/90" />
            </div>

            <div className="px-6 py-12 md:px-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance leading-tight text-white animate-fade-in-up">
                Your Membership Multiplies Your Benefits.
              </h1>
              <p className="text-lg text-slate-200 mb-12 text-balance max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                When you are a member, you unlock 3 MORE enterprise-grade platforms and your community:
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {heroCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border-2 bg-gradient-to-br from-slate-900/40 to-slate-800/20 p-6 text-left hover:shadow-lg transition-all animate-fade-in-up hover:scale-105"
                    style={{
                      borderColor: '#12a1e2',
                      animationDelay: `${idx * 0.15}s`
                    }}
                  >
                    <h3 className="text-lg font-bold mb-6 text-white">{card.title}</h3>
                    <ul className="space-y-3 mb-8">
                      {card.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-slate-200 text-sm">
                          <span style={{ color: '#12a1e2' }} className="mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-3">
                      {card.buttons.map((btn, btnIdx) => {
                        const isOpen = btnIdx === 0;
                        const isJobsOpenNotLoggedIn = isOpen && card.openTarget === 'jobs' && !token;
                        if (isJobsOpenNotLoggedIn) {
                          return (
                            <Link
                              key={btnIdx}
                              to="/login"
                              state={{ from: '/jobs', message: 'Please login to access the job board' }}
                              className="flex-1 py-2 text-sm rounded-lg transition-all hover:opacity-90 text-center font-medium"
                              style={{
                                background: 'linear-gradient(90deg, #12a1e2, #0e8cd4)',
                                color: 'white',
                                border: '1px solid #12a1e2',
                                textDecoration: 'none',
                              }}
                            >
                              {btn}
                            </Link>
                          );
                        }
                        return (
                          <Button
                            key={btnIdx}
                            type="button"
                            className="flex-1 py-2 text-sm rounded-lg transition-all hover:opacity-90"
                            style={{
                              background: isOpen ? 'linear-gradient(90deg, #12a1e2, #0e8cd4)' : 'transparent',
                              color: 'white',
                              border: '1px solid #12a1e2',
                            }}
                            onClick={isOpen ? (e) => handleOpenClick(e, card.openTarget) : undefined}
                          >
                            {btn}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="rounded-3xl border-2 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-12 overflow-hidden animate-fade-in-up" style={{ borderColor: '#12a1e2' }}>
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-green-900/40 border text-green-300 text-xs font-bold" style={{ borderColor: '#10b981' }}>
              ⚠ THE PROBLEM
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-4xl font-bold mb-6 text-white">
                  Teams Today Are Typically Paying Twice
                </h2>
                <p className="text-slate-200 mb-6 leading-relaxed">
                  Enterprise teams in AI & XR face a fragmented vendor landscape that drains resources and creates inefficiency. The costs compound quickly:
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#12a1e2' }} />
                    <span className="text-slate-200">Tools that overlap but do not integrate</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#12a1e2' }} />
                    <span className="text-slate-200">Recruiters that cost more than the hire itself</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#12a1e2' }} />
                    <span className="text-slate-200">Events that feel optional until you miss the right one</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#12a1e2' }} />
                    <span className="text-slate-200">Vendor pricing built for one-off buyers, not operators</span>
                  </li>
                </ul>
                <p className="text-slate-200 leading-relaxed">
                  Most memberships don't solve this problem. They add another logo, another login, and another line item—without addressing the underlying fragmentation.
                </p>
              </div>
              <div className="relative h-96 rounded-2xl overflow-hidden bg-slate-900/40" style={{ borderColor: '#12a1e2', borderWidth: '1px' }}>
                <img
                  src="/teams-original.png"
                  alt="Fragmented vendor landscape"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="rounded-3xl border-2 bg-gradient-to-br from-slate-900/60 to-slate-800/40 overflow-hidden animate-fade-in-up" style={{ borderColor: '#12a1e2' }}>
            <div className="relative h-72 md:h-96 w-full overflow-hidden">
              <img
                src="/data-center.avif"
                alt="Job Board Platform"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/90" />
            </div>

            <div className="p-12">
              <h2 className="text-4xl font-bold mb-4 text-white">
                AI-Job Board Built For Hiring & Posting
              </h2>
              <p className="text-slate-200 mb-12">
                The most comprehensive job board for AI and XR professionals. Designed to connect top talent with visionary companies.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="rounded-lg bg-slate-900/40 p-6 hover:scale-105 transition-all" style={{ borderColor: '#12a1e2', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-4 text-white" style={{ color: '#12a1e2' }}>For Companies</h3>
                  <ul className="space-y-3 text-slate-200">
                    <li className="flex items-center gap-2">
                      <Zap className="h-5 w-5" style={{ color: '#12a1e2' }} />
                      Post unlimited positions
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-5 w-5" style={{ color: '#12a1e2' }} />
                      Access pre-vetted AI & XR talent
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-5 w-5" style={{ color: '#12a1e2' }} />
                      Integrated hiring tools
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-5 w-5" style={{ color: '#12a1e2' }} />
                      Analytics & insights
                    </li>
                  </ul>
                </div>
                <div className="rounded-lg bg-slate-900/40 p-6 hover:scale-105 transition-all" style={{ borderColor: '#12a1e2', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-4 text-white" style={{ color: '#12a1e2' }}>For Professionals</h3>
                  <ul className="space-y-3 text-slate-200">
                    <li className="flex items-center gap-2">
                      <Zap className="h-5 w-5" style={{ color: '#12a1e2' }} />
                      Curated opportunities
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-5 w-5" style={{ color: '#12a1e2' }} />
                      Career development resources
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-5 w-5" style={{ color: '#12a1e2' }} />
                      Direct company access
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-5 w-5" style={{ color: '#12a1e2' }} />
                      Networking opportunities
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="rounded-3xl border-2 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-12 overflow-hidden animate-fade-in-up" style={{ borderColor: '#12a1e2' }}>
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-green-900/40 border text-green-300 text-xs font-bold" style={{ borderColor: '#10b981' }}>
              GLOBAL NETWORK
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-4xl font-bold mb-6 text-white">Global High-Tech Talent</h2>
                <p className="text-slate-200 mb-8">
                  Access the world's most sought-after AI and XR talent through our exclusive network. Our membership connects you to professionals who are shaping the future of technology.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500/20 border flex-shrink-0" style={{ borderColor: '#12a1e2' }}>
                      <Target className="h-6 w-6" style={{ color: '#12a1e2' }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Vetted Professionals</h4>
                      <p className="text-sm text-slate-400">Only the best talent from top organizations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500/20 border flex-shrink-0" style={{ borderColor: '#12a1e2' }}>
                      <Clock className="h-6 w-6" style={{ color: '#12a1e2' }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Quick Matching</h4>
                      <p className="text-sm text-slate-400">AI-powered talent matching for speed and accuracy</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-80 rounded-2xl overflow-hidden bg-slate-900/40" style={{ borderColor: '#12a1e2', borderWidth: '1px' }}>
                <img
                  src="/global-talent.jpg"
                  alt="Global talent network"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="rounded-3xl border-2 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-12 animate-fade-in-up" style={{ borderColor: '#12a1e2' }}>
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-green-900/40 border text-green-300 text-xs font-bold" style={{ borderColor: '#10b981' }}>
              MEMBER BENEFITS
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">Member-Only Discounts From 100+ Vendors</h2>
            <p className="text-slate-200 mb-12">Exclusive deals and discounts from the world's leading AI, XR, and technology vendors.</p>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { title: 'Cloud Services', discount: '25%+' },
                { title: 'Development Tools', discount: '30%+' },
                { title: 'AI Platforms', discount: '20%+' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-slate-900/40 p-6 text-center hover:scale-105 transition-all animate-fade-in-up"
                  style={{ borderColor: '#12a1e2', borderWidth: '1px', animationDelay: `${idx * 0.1}s` }}
                >
                  <p className="text-slate-300 text-sm mb-2">{item.title}</p>
                  <p className="text-3xl font-bold" style={{ color: '#12a1e2' }}>{item.discount} Off</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button className="text-white px-8 py-6 rounded-lg hover:opacity-90" style={{ background: 'linear-gradient(90deg, #12a1e2, #0e8cd4)' }}>
                Unlock Vendor Discounts
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="rounded-3xl border-2 bg-gradient-to-br from-slate-900/60 to-slate-800/40 overflow-hidden animate-fade-in-up" style={{ borderColor: '#12a1e2' }}>
            <div className="relative h-72 md:h-96 w-full overflow-hidden">
              <img
                src="/ai-section.png"
                alt="Unified Membership Platform"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/90" />
            </div>

            <div className="p-12">
              <div className="inline-block mb-6 px-4 py-2 rounded-full bg-green-900/40 border text-green-300 text-xs font-bold" style={{ borderColor: '#10b981' }}>
                WHAT SETS US APART
              </div>
              <h2 className="text-4xl font-bold mb-8 text-white">
                This Is Different: A Membership Reborn For Your Leverage.
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold" style={{ color: '#12a1e2' }}>What You Get</h3>
                  <div className="space-y-3">
                    {[
                      'Integrated job board & hiring tools',
                      'Exclusive global talent network',
                      'Member-only vendor discounts',
                      'Premium event access',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 border flex items-center justify-center flex-shrink-0 mt-0.5" style={{ borderColor: '#12a1e2' }}>
                          <span className="text-sm font-bold" style={{ color: '#12a1e2' }}>✓</span>
                        </div>
                        <span className="text-slate-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold" style={{ color: '#12a1e2' }}>Why It Matters</h3>
                  <p className="text-slate-300 leading-relaxed">
                    In the fragmented vendor landscape, memberships that deliver across multiple dimensions—hiring, talent discovery, discounts, and events—are the antidote to vendor fatigue. Your membership should multiply value, not just aggregate it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="rounded-3xl border-2 bg-gradient-to-br from-slate-900/60 to-slate-800/40 overflow-hidden animate-fade-in-up" style={{ borderColor: '#12a1e2' }}>
            <div className="relative h-72 md:h-96 w-full overflow-hidden">
              <img
                src="/products.avif"
                alt="Enterprise Grade Tools"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/90" />
            </div>

            <div className="p-12">
              <div className="inline-block mb-6 px-4 py-2 rounded-full bg-green-900/40 border text-green-300 text-xs font-bold" style={{ borderColor: '#10b981' }}>
                PLATFORM 1
              </div>
              <h2 className="text-4xl font-bold mb-4 text-white">
                Three Premium Tools Included
              </h2>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Immediately usable. No add-ons. No upsell maze.
              </h3>
              <p className="text-slate-200 mb-8 leading-relaxed max-w-3xl">
                These are enterprise-grade tools designed to increase output per employee, reduce friction across marketing, sales, and operations, and replace multiple single-purpose subscriptions.
              </p>

              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="h-6 w-6" style={{ color: '#12a1e2' }} />
                    <h4 className="text-lg font-bold text-white">Increase Output Per Employee</h4>
                  </div>
                  <p className="text-slate-200 ml-9">Tools that amplify individual productivity and team velocity</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Share2 className="h-6 w-6" style={{ color: '#12a1e2' }} />
                    <h4 className="text-lg font-bold text-white">Reduce Cross-Functional Friction</h4>
                  </div>
                  <p className="text-slate-200 ml-9">Seamless integration across marketing, sales, and operations</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="h-6 w-6" style={{ color: '#12a1e2' }} />
                    <h4 className="text-lg font-bold text-white">Replace Multiple Subscriptions</h4>
                  </div>
                  <p className="text-slate-200 ml-9">Consolidate point solutions into a coherent stack</p>
                </div>
              </div>

              <p className="text-slate-200 leading-relaxed max-w-3xl">
                These are tools teams already pay for—now included as part of membership, reducing software sprawl and subscription fatigue.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl max-w-7xl mx-auto px-6 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-12 mb-24" style={{ borderColor: '#12a1e2', borderWidth: '2px' }}>
          <h2 className="text-4xl font-bold mb-12 text-balance text-white">The Math: Membership as Consolidation</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: '3', label: 'Premium Tools Included', sub: 'Consolidates vendor subscriptions' },
              { number: '100+', label: 'Exclusive Discounts', sub: 'Saves on vendor spend' },
              { number: '1', label: 'Platform', sub: 'One unified membership' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-slate-900/40 p-8 text-center"
                style={{
                  border: '2px solid #12a1e2',
                  backgroundColor: 'rgba(18, 161, 226, 0.1)',
                }}
              >
                <div className="text-5xl font-bold mb-2" style={{ color: '#12a1e2' }}>{stat.number}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                <div className="text-sm text-slate-300 mt-2">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl max-w-7xl mx-auto px-6 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-12 mb-24" style={{ borderColor: '#12a1e2', borderWidth: '2px' }}>
          <h2 className="text-3xl font-bold mb-12 text-center text-balance">Trusted by Industry Leaders</h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { text: 'AI Teams', value: '500+' },
              { text: 'XR Professionals', value: '1000+' },
              { text: 'Vendors', value: '100+' },
              { text: 'Success Rate', value: '95%' },
              { text: 'Active Users', value: '5000+' },
            ].map((metric, idx) => (
              <div
                key={idx}
                className="rounded-full px-8 py-6 text-center transition-colors"
                style={{
                  border: '2px solid #12a1e2',
                  backgroundColor: 'rgba(18, 161, 226, 0.1)',
                }}
              >
                <div className="text-2xl font-bold" style={{ color: '#12a1e2' }}>{metric.value}</div>
                <div className="text-xs text-slate-400 mt-1">{metric.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="rounded-2xl text-center mb-24 p-12" style={{ borderColor: '#12a1e2', borderWidth: '2px', background: 'linear-gradient(135deg, rgba(18, 161, 226, 0.15), rgba(15, 23, 42, 0.4))' }}>
          <h2 className="text-4xl font-bold mb-6 text-balance">Activate Enterprise Access</h2>
          <p className="text-xl text-slate-300 mb-2">
            Consolidate your AI and XR vendor landscape.
          </p>
          <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
            Get access to premium tools, exclusive talent, and vendor discounts—all in one membership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="text-white px-8 py-6 text-lg rounded-lg hover:opacity-90" style={{ background: 'linear-gradient(90deg, #12a1e2, #0e8cd4)' }}>
              Get Started Now
            </Button>
            <button
              type="button"
              className="bg-transparent px-8 py-6 text-lg rounded-lg hover:opacity-90 transition-all"
              style={{ borderColor: '#12a1e2', color: '#12a1e2', border: '1px solid #12a1e2' }}
            >
              Schedule Demo
            </button>
          </div>
        </div> */}

        <div className="text-center py-12">
          <p className="text-slate-400 mb-6">Ready to unlock the power of consolidated membership?</p>
          <Button className="text-white px-8 py-6 text-lg rounded-lg hover:opacity-90" style={{ background: 'linear-gradient(90deg, #12a1e2, #0e8cd4)' }}>
            Join Now <ExternalLink className="ml-2 h-5 w-5 inline" />
          </Button>
        </div>

        <footer className="backdrop-blur-sm mt-20" style={{ borderTop: '1px solid rgba(18, 161, 226, 0.3)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div>
                <h4 className="font-bold mb-4" style={{ color: '#12a1e2' }}>Product</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><a href="#" style={{ color: '#12a1e2' }} className="hover:opacity-80">Features</a></li>
                  <li><a href="#" style={{ color: '#12a1e2' }} className="hover:opacity-80">Pricing</a></li>
                  <li><a href="#" style={{ color: '#12a1e2' }} className="hover:opacity-80">Job Board</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4" style={{ color: '#12a1e2' }}>Community</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><a href="#" className="hover:opacity-80">Professionals</a></li>
                  <li><a href="#" className="hover:opacity-80">Companies</a></li>
                  <li><a href="#" className="hover:opacity-80">Partners</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4" style={{ color: '#12a1e2' }}>Resources</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><a href="#" className="hover:opacity-80">Blog</a></li>
                  <li><a href="#" className="hover:opacity-80">Help Center</a></li>
                  <li><a href="#" className="hover:opacity-80">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4" style={{ color: '#12a1e2' }}>Legal</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><a href="#" className="hover:opacity-80">Privacy</a></li>
                  <li><a href="#" className="hover:opacity-80">Terms</a></li>
                  <li><a href="#" className="hover:opacity-80">Sitemap</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 text-center text-slate-500 text-sm" style={{ borderTop: '1px solid rgba(18, 161, 226, 0.3)' }}>
              <p>&copy; 2024 AIXR Benefits. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

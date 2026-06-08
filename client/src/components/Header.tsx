import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [, navigate] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const navItems = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.grammar'), href: '/grammar' },
    { label: t('nav.nounsVocab'), href: '/vocabulary/nouns' },
    { label: t('nav.verbsVocab'), href: '/vocabulary/verbs' },
    { label: t('nav.kana'), href: '/kana' },
    { label: t('nav.practice'), href: '/practice' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        {/* Logo - Centered */}
        <div className="flex items-center justify-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/manus-storage/logo_0ebfce3c.png"
              alt="Logo"
              className="w-16 h-16 rounded-lg"
            />
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gray-900">
                {t('appName')}
              </h1>
            </div>
          </button>
        </div>

        {/* Navigation & Language Switcher */}
        <div className="flex items-center justify-between gap-4">
          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.href)}
                className="text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Language Switcher */}
          <div className="relative ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">
                {language === 'zh' ? '中文' : '日本語'}
              </span>
            </Button>

            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setLanguage('zh');
                    setShowLanguageMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    language === 'zh'
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => {
                    setLanguage('ja');
                    setShowLanguageMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    language === 'ja'
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  日本語
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex flex-wrap gap-2 mt-4 justify-center">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.href)}
              className="text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}

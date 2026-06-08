import { useLocation, useRoute } from 'wouter';
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
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/manus-storage/logo_0ebfce3c.png"
              alt="Logo"
              className="w-10 h-10 rounded-lg"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">
                {t('appName')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t('appDescription')}
              </p>
            </div>
          </button>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.href)}
                className="text-sm"
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Language Switcher */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">
                {language === 'zh' ? '中文' : '日本語'}
              </span>
            </Button>

            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-border rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setLanguage('zh');
                    setShowLanguageMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent ${
                    language === 'zh' ? 'bg-accent font-semibold' : ''
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => {
                    setLanguage('ja');
                    setShowLanguageMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent ${
                    language === 'ja' ? 'bg-accent font-semibold' : ''
                  }`}
                >
                  日本語
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex flex-wrap gap-2 mt-3">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.href)}
              className="text-xs"
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}

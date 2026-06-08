import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearch } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

export default function Home() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { search, getHistory, clearHistory } = useSearch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const history = getHistory();

  // Handle search
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const searchResults = search(searchQuery);
      setResults(searchResults);
      setShowResults(true);
      setShowHistory(false);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      setShowHistory(false);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (!query.trim() && history.length > 0) {
      setShowHistory(true);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigate to result
  const handleResultClick = (result: any) => {
    if (result.type === 'grammar') {
      navigate(`/grammar?id=${result.id}`);
    } else if (result.type === 'noun') {
      navigate(`/vocabulary/nouns?id=${result.id}`);
    } else if (result.type === 'verb') {
      navigate(`/vocabulary/verbs?id=${result.id}`);
    }
  };

  // Module cards - Simplified
  const modules = [
    {
      id: 'grammar',
      title: t('home.grammarCard'),
      href: '/grammar',
      icon: '📚',
    },
    {
      id: 'nouns',
      title: t('home.nounsCard'),
      href: '/vocabulary/nouns',
      icon: '🏷️',
    },
    {
      id: 'verbs',
      title: t('home.verbsCard'),
      href: '/vocabulary/verbs',
      icon: '⚡',
    },
    {
      id: 'kana',
      title: t('home.kanaCard'),
      href: '/kana',
      icon: 'あ',
    },
    {
      id: 'practice',
      title: t('home.practiceCard'),
      href: '/practice',
      icon: '✏️',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
            {t('home.title')}
          </h1>
          <p className="text-lg text-gray-600 mb-8 font-light">
            {t('home.subtitle')}
          </p>

          {/* Search Box */}
          <div ref={searchBoxRef} className="max-w-2xl mx-auto relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={query}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(query);
                    }
                  }}
                  className="w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:border-gray-500"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setShowResults(false);
                      setShowHistory(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => handleSearch(query)}
                className="px-6 bg-gray-800 hover:bg-gray-900 text-white"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>

            {/* Search History */}
            {showHistory && history.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm text-gray-900">
                    {t('search.history')}
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {t('search.clearHistory')}
                  </button>
                </div>
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(item.query);
                        handleSearch(item.query);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors text-gray-700"
                    >
                      {item.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <div>
                    <div className="px-4 py-3 border-b border-gray-200 text-sm text-gray-600">
                      {t('search.resultCount').replace('{count}', results.length.toString())}
                    </div>
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
                      >
                        <div className="font-semibold text-sm text-gray-900">
                          {result.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {result.content}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {result.type === 'grammar' && '文法'}
                          {result.type === 'noun' && '名詞'}
                          {result.type === 'verb' && '動詞'}
                          {result.type === 'kana' && '五十音'}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    {t('search.noResults')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Module Cards - Simplified */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {modules.map((module) => (
            <Card
              key={module.id}
              className="p-6 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all border border-gray-200 bg-white"
              onClick={() => navigate(module.href)}
            >
              <div className="text-4xl mb-3 text-center">{module.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                {module.title}
              </h3>
            </Card>
          ))}
        </div>
      </section>

      {/* Decorative background elements */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="fixed bottom-0 right-10 w-64 h-64 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
    </div>
  );
}

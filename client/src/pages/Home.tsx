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

  // Module cards
  const modules = [
    {
      id: 'grammar',
      title: t('home.grammarCard'),
      description: t('home.grammarDesc'),
      href: '/grammar',
      color: 'from-amber-100 to-orange-100',
    },
    {
      id: 'nouns',
      title: t('home.nounsCard'),
      description: t('home.nounsDesc'),
      href: '/vocabulary/nouns',
      color: 'from-blue-100 to-cyan-100',
    },
    {
      id: 'verbs',
      title: t('home.verbsCard'),
      description: t('home.verbsDesc'),
      href: '/vocabulary/verbs',
      color: 'from-green-100 to-emerald-100',
    },
    {
      id: 'kana',
      title: t('home.kanaCard'),
      description: t('home.kanaDesc'),
      href: '/kana',
      color: 'from-pink-100 to-rose-100',
    },
    {
      id: 'practice',
      title: t('home.practiceCard'),
      description: t('home.practiceDesc'),
      href: '/practice',
      color: 'from-purple-100 to-violet-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('home.title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
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
                  className="w-full pl-4 pr-10 py-3 text-base"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setShowResults(false);
                      setShowHistory(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => handleSearch(query)}
                className="px-6 bg-amber-600 hover:bg-amber-700"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>

            {/* Search History */}
            {showHistory && history.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-50 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm text-foreground">
                    {t('search.history')}
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-muted-foreground hover:text-foreground"
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
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-accent rounded transition-colors"
                    >
                      {item.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <div>
                    <div className="px-4 py-3 border-b border-border text-sm text-muted-foreground">
                      {t('search.resultCount').replace('{count}', results.length.toString())}
                    </div>
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-4 py-3 border-b border-border hover:bg-accent transition-colors last:border-b-0"
                      >
                        <div className="font-semibold text-sm text-foreground">
                          {result.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.content}
                        </div>
                        <div className="text-xs text-amber-600 mt-1">
                          {result.type === 'grammar' && '文法'}
                          {result.type === 'noun' && '名詞'}
                          {result.type === 'verb' && '動詞'}
                          {result.type === 'kana' && '五十音'}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    {t('search.noResults')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Module Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card
              key={module.id}
              className={`bg-gradient-to-br ${module.color} p-6 cursor-pointer hover:shadow-lg transition-shadow`}
              onClick={() => navigate(module.href)}
            >
              <h3 className="text-xl font-bold text-foreground mb-2">
                {module.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {module.description}
              </p>
              <Button
                variant="default"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
              >
                {t('common.home')}
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

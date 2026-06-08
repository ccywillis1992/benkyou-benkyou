import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Noun {
  id: string;
  wordJa: string;
  kana: string;
  romaji: string;
  meaningZh: string;
  pitchAccent: number | string;
  category: string;
  examples: string[];
  tags: string[];
}

interface Verb {
  id: string;
  dictionaryForm: string;
  masuForm: string;
  teForm: string;
  kana: string;
  romaji: string;
  meaningZh: string;
  pitchAccent: number | string;
  verbGroup: string;
  examples: string[];
  tags: string[];
}

type VocabularyItem = Noun | Verb;

const ITEMS_PER_PAGE = 10;

export default function Vocabulary() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [vocabType, setVocabType] = useState<'nouns' | 'verbs'>('nouns');
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Determine vocab type from URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('verbs')) {
      setVocabType('verbs');
    } else {
      setVocabType('nouns');
    }
  }, []);

  // Load vocabulary data
  useEffect(() => {
    const loadVocab = async () => {
      try {
        const file = vocabType === 'nouns' ? 'nouns.json' : 'verbs.json';
        const data = await fetch(`/data/${file}`).then(r => r.json());
        setVocabulary(data);
        setCurrentPage(1);
      } catch (error) {
        console.error('Failed to load vocabulary:', error);
      }
    };

    loadVocab();
  }, [vocabType]);

  // Pagination
  const totalPages = Math.ceil(vocabulary.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVocab = vocabulary.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Get pitch accent display
  const getPitchAccentDisplay = (accent: number | string) => {
    if (accent === 0) return '平板型';
    if (accent === 1) return '頭高型';
    if (accent === 2) return '2拍下降';
    if (accent === 3) return '3拍下降';
    return String(accent);
  };

  const isNoun = (item: VocabularyItem): item is Noun => {
    return 'wordJa' in item;
  };

  const isVerb = (item: VocabularyItem): item is Verb => {
    return 'dictionaryForm' in item;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 font-serif">
          {vocabType === 'nouns' ? t('vocabulary.nouns') : t('vocabulary.verbs')}
        </h1>

        {/* Type Switcher */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={vocabType === 'nouns' ? 'default' : 'outline'}
            onClick={() => setVocabType('nouns')}
            className={vocabType === 'nouns' ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}
          >
            {t('vocabulary.nouns')}
          </Button>
          <Button
            variant={vocabType === 'verbs' ? 'default' : 'outline'}
            onClick={() => setVocabType('verbs')}
            className={vocabType === 'verbs' ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}
          >
            {t('vocabulary.verbs')}
          </Button>
        </div>

        {/* Vocabulary List */}
        <div className="space-y-4 mb-8">
          {paginatedVocab.map((item) => (
            <Card
              key={item.id}
              className="p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all border border-gray-200"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isNoun(item) ? item.wordJa : item.dictionaryForm}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {isNoun(item) ? item.kana : item.kana}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        {isNoun(item) ? item.meaningZh : item.meaningZh}
                      </span>
                      <span className="inline-block px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-semibold">
                        {getPitchAccentDisplay(isNoun(item) ? item.pitchAccent : item.pitchAccent)}
                      </span>
                    </div>
                  </div>
                  {expandedId === item.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === item.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {isNoun(item) && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {t('vocabulary.kana')}
                          </h4>
                          <p className="text-sm text-gray-700">{item.kana}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {t('vocabulary.romaji')}
                          </h4>
                          <p className="text-sm text-gray-700">{item.romaji}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {t('vocabulary.category')}
                        </h4>
                        <p className="text-sm text-gray-700">{item.category}</p>
                      </div>
                    </>
                  )}

                  {isVerb(item) && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {t('vocabulary.dictionaryForm')}
                          </h4>
                          <p className="text-sm text-gray-700">{item.dictionaryForm}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {t('vocabulary.masuForm')}
                          </h4>
                          <p className="text-sm text-gray-700">{item.masuForm}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {t('vocabulary.teForm')}
                          </h4>
                          <p className="text-sm text-gray-700">{item.teForm}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {t('vocabulary.verbGroup')}
                        </h4>
                        <p className="text-sm text-gray-700">{item.verbGroup}</p>
                      </div>
                    </>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      {t('vocabulary.examples')}
                    </h4>
                    <div className="space-y-1">
                      {item.examples.map((example, idx) => (
                        <p key={idx} className="text-sm text-gray-700">
                          • {example}
                        </p>
                      ))}
                    </div>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        {t('vocabulary.category')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}
              >
                {page}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Decorative background */}
      <div className="fixed bottom-0 left-10 w-64 h-64 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
    </div>
  );
}

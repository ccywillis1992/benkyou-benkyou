import { useEffect, useState } from 'react';

interface SearchResult {
  type: 'grammar' | 'noun' | 'verb' | 'kana';
  id: string;
  title: string;
  content: string;
  data: any;
}

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

const SEARCH_HISTORY_KEY = 'benkyou_search_history';
const MAX_HISTORY = 10;

export function useSearch() {
  const [grammar, setGrammar] = useState<any[]>([]);
  const [nouns, setNouns] = useState<any[]>([]);
  const [verbs, setVerbs] = useState<any[]>([]);
  const [kana, setKana] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [grammarData, nounsData, verbsData, kanaData] = await Promise.all([
          fetch('/data/grammar.json').then(r => r.json()),
          fetch('/data/nouns.json').then(r => r.json()),
          fetch('/data/verbs.json').then(r => r.json()),
          fetch('/data/kana.json').then(r => r.json()),
        ]);

        setGrammar(grammarData);
        setNouns(nounsData);
        setVerbs(verbsData);
        setKana(kanaData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoading(false);
      }
    };

    loadData();

    // Load search history
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load search history:', e);
      }
    }
  }, []);

  // Determine if input is a sentence or single word
  const isSentence = (query: string): boolean => {
    // Check for common sentence indicators
    const sentenceIndicators = ['は', 'を', 'に', 'が', 'で', 'も', 'から', 'まで', 'より', 'ます', 'ません', 'です', 'か', '。'];
    return sentenceIndicators.some(indicator => query.includes(indicator));
  };

  // Search grammar by keywords or regex
  const searchGrammar = (query: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    grammar.forEach(item => {
      let matched = false;

      // Check matchKeywords
      if (item.matchKeywords && Array.isArray(item.matchKeywords)) {
        matched = item.matchKeywords.some((keyword: string) =>
          query.includes(keyword)
        );
      }

      // Check matchRegex
      if (!matched && item.matchRegex) {
        try {
          const regex = new RegExp(item.matchRegex);
          matched = regex.test(query);
        } catch (e) {
          console.error('Invalid regex:', item.matchRegex);
        }
      }

      // Check pattern, meaning, or explanation
      if (!matched) {
        matched =
          item.pattern?.includes(query) ||
          item.meaningZh?.toLowerCase().includes(lowerQuery) ||
          item.titleZh?.toLowerCase().includes(lowerQuery);
      }

      if (matched) {
        results.push({
          type: 'grammar',
          id: item.id,
          title: item.titleZh,
          content: item.pattern,
          data: item,
        });
      }
    });

    return results;
  };

  // Search vocabulary
  const searchVocabulary = (query: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search nouns
    nouns.forEach(item => {
      if (
        item.wordJa?.includes(query) ||
        item.kana?.includes(query) ||
        item.romaji?.toLowerCase().includes(lowerQuery) ||
        item.meaningZh?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'noun',
          id: item.id,
          title: item.wordJa,
          content: item.meaningZh,
          data: item,
        });
      }
    });

    // Search verbs
    verbs.forEach(item => {
      if (
        item.dictionaryForm?.includes(query) ||
        item.kana?.includes(query) ||
        item.romaji?.toLowerCase().includes(lowerQuery) ||
        item.meaningZh?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'verb',
          id: item.id,
          title: item.dictionaryForm,
          content: item.meaningZh,
          data: item,
        });
      }
    });

    return results;
  };

  // Main search function
  const search = (query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const trimmedQuery = query.trim();
    let results: SearchResult[] = [];

    if (isSentence(trimmedQuery)) {
      // Search grammar for sentences
      results = searchGrammar(trimmedQuery);
    } else {
      // Search vocabulary for single words
      results = searchVocabulary(trimmedQuery);
    }

    // Add to search history
    addToHistory(trimmedQuery);

    return results;
  };

  // Add to search history
  const addToHistory = (query: string) => {
    const newHistory = [
      { query, timestamp: Date.now() },
      ...searchHistory.filter(item => item.query !== query),
    ].slice(0, MAX_HISTORY);

    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  // Get search history
  const getHistory = (): SearchHistoryItem[] => {
    return searchHistory;
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  return {
    search,
    getHistory,
    clearHistory,
    loading,
    data: { grammar, nouns, verbs, kana },
  };
}

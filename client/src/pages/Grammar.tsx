import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';

interface GrammarItem {
  id: string;
  level: string;
  titleZh: string;
  pattern: string;
  meaningZh: string;
  explanationZh: string;
  examples: Array<{ ja: string; zhLiteral: string }>;
}

interface NewGrammarDraft {
  level: string;
  pattern: string;
  meaningZh: string;
  explanationZh: string;
  examples: Array<{ ja: string; zhLiteral: string }>;
}

const ITEMS_PER_PAGE = 10;

export default function Grammar() {
  const { t } = useLanguage();
  const [grammar, setGrammar] = useState<GrammarItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGrammar, setNewGrammar] = useState<NewGrammarDraft>({
    level: 'N5',
    pattern: '',
    meaningZh: '',
    explanationZh: '',
    examples: [
      { ja: '', zhLiteral: '' },
      { ja: '', zhLiteral: '' },
    ],
  });
  const [drafts, setDrafts] = useState<NewGrammarDraft[]>([]);

  // Load grammar data
  useEffect(() => {
    const loadGrammar = async () => {
      try {
        const data = await fetch('/data/grammar.json').then(r => r.json());
        setGrammar(data);
      } catch (error) {
        console.error('Failed to load grammar:', error);
      }
    };

    loadGrammar();

    // Load drafts from localStorage
    const savedDrafts = localStorage.getItem('grammar_drafts');
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (e) {
        console.error('Failed to load drafts:', e);
      }
    }
  }, []);

  // Pagination
  const totalPages = Math.ceil(grammar.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGrammar = grammar.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Validate new grammar
  const validateGrammar = (data: NewGrammarDraft): string | null => {
    if (!data.pattern.trim()) return t('grammar.validation.required');
    if (!data.meaningZh.trim()) return t('grammar.validation.required');
    if (!data.explanationZh.trim()) return t('grammar.validation.required');
    if (data.examples.filter(e => e.ja.trim() && e.zhLiteral.trim()).length < 2) {
      return t('grammar.validation.minExamples');
    }
    return null;
  };

  // Handle add grammar
  const handleAddGrammar = () => {
    const error = validateGrammar(newGrammar);
    if (error) {
      alert(error);
      return;
    }

    // Add to drafts
    const updatedDrafts = [...drafts, newGrammar];
    setDrafts(updatedDrafts);
    localStorage.setItem('grammar_drafts', JSON.stringify(updatedDrafts));

    // Reset form
    setNewGrammar({
      level: 'N5',
      pattern: '',
      meaningZh: '',
      explanationZh: '',
      examples: [
        { ja: '', zhLiteral: '' },
        { ja: '', zhLiteral: '' },
      ],
    });
    setShowAddForm(false);

    alert(t('grammar.success'));
  };

  // Export drafts as JSON
  const handleExportDrafts = () => {
    if (drafts.length === 0) {
      alert('No drafts to export');
      return;
    }

    const dataStr = JSON.stringify(drafts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grammar_drafts_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-foreground mb-8">{t('grammar.title')}</h1>

        {/* Grammar List */}
        <div className="space-y-4 mb-8">
          {paginatedGrammar.map((item) => (
            <Card
              key={item.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                        {item.level}
                      </span>
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.titleZh}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.pattern}
                    </p>
                  </div>
                  {expandedId === item.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === item.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('grammar.meaning')}
                    </h4>
                    <p className="text-sm text-muted-foreground">{item.meaningZh}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('grammar.explanation')}
                    </h4>
                    <p className="text-sm text-muted-foreground">{item.explanationZh}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {t('grammar.examples')}
                    </h4>
                    <div className="space-y-2">
                      {item.examples.map((example, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="font-medium text-foreground">
                            {idx + 1}. {example.ja}
                          </p>
                          <p className="text-muted-foreground">
                            —— {example.zhLiteral}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                {page}
              </Button>
            ))}
          </div>
        )}

        {/* Add Grammar Section */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {t('grammar.addNew')}
            </h2>
            {drafts.length > 0 && (
              <Button
                onClick={handleExportDrafts}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('grammar.export')} ({drafts.length})
              </Button>
            )}
          </div>

          {!showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {t('grammar.addTitle')}
            </Button>
          ) : (
            <Card className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {t('grammar.selectLevel')}
                </label>
                <select
                  value={newGrammar.level}
                  onChange={(e) =>
                    setNewGrammar({ ...newGrammar, level: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                >
                  <option value="N5">N5</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                  <option value="N2">N2</option>
                  <option value="N1">N1</option>
                  <option value="其他">{t('grammar.levels.other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {t('grammar.inputPattern')}
                </label>
                <Input
                  value={newGrammar.pattern}
                  onChange={(e) =>
                    setNewGrammar({ ...newGrammar, pattern: e.target.value })
                  }
                  placeholder="例：A は B です"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {t('grammar.inputMeaning')}
                </label>
                <Input
                  value={newGrammar.meaningZh}
                  onChange={(e) =>
                    setNewGrammar({ ...newGrammar, meaningZh: e.target.value })
                  }
                  placeholder="例：A 是 B"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {t('grammar.inputExplanation')}
                </label>
                <textarea
                  value={newGrammar.explanationZh}
                  onChange={(e) =>
                    setNewGrammar({ ...newGrammar, explanationZh: e.target.value })
                  }
                  placeholder="輸入說明..."
                  className="w-full px-3 py-2 border border-border rounded-lg min-h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {t('grammar.examples')}
                </label>
                {newGrammar.examples.map((example, idx) => (
                  <div key={idx} className="space-y-2 mb-4 p-3 bg-slate-50 rounded-lg">
                    <Input
                      placeholder={t('grammar.exampleJa')}
                      value={example.ja}
                      onChange={(e) => {
                        const updated = [...newGrammar.examples];
                        updated[idx].ja = e.target.value;
                        setNewGrammar({ ...newGrammar, examples: updated });
                      }}
                    />
                    <Input
                      placeholder={t('grammar.exampleZh')}
                      value={example.zhLiteral}
                      onChange={(e) => {
                        const updated = [...newGrammar.examples];
                        updated[idx].zhLiteral = e.target.value;
                        setNewGrammar({ ...newGrammar, examples: updated });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddGrammar}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {t('grammar.submit')}
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                >
                  {t('grammar.cancel')}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

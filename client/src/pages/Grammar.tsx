import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Grammar {
  id: string;
  level: string;
  titleZh: string;
  pattern: string;
  meaningZh: string;
  explanationZh: string;
  matchKeywords: string[];
  examples: Array<{
    ja: string;
    zhLiteral: string;
  }>;
}

const ITEMS_PER_PAGE = 10;
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1', '其他'];

export default function Grammar() {
  const { t } = useLanguage();
  const [grammar, setGrammar] = useState<Grammar[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGrammar, setNewGrammar] = useState({
    level: 'N5',
    titleZh: '',
    pattern: '',
    meaningZh: '',
    explanationZh: '',
    examples: [{ ja: '', zhLiteral: '' }],
  });
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

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
  }, []);

  // Filter by level
  const filteredGrammar = selectedLevel
    ? grammar.filter(g => g.level === selectedLevel)
    : grammar;

  // Pagination
  const totalPages = Math.ceil(filteredGrammar.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGrammar = filteredGrammar.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handle add grammar
  const handleAddGrammar = () => {
    if (!newGrammar.titleZh || !newGrammar.pattern) {
      toast.error('請填寫文法標題與模式');
      return;
    }

    const grammarItem: Grammar = {
      id: `grammar-${Date.now()}`,
      level: newGrammar.level,
      titleZh: newGrammar.titleZh,
      pattern: newGrammar.pattern,
      meaningZh: newGrammar.meaningZh,
      explanationZh: newGrammar.explanationZh,
      matchKeywords: newGrammar.pattern.match(/【(.*?)】/g) || [],
      examples: newGrammar.examples.filter(e => e.ja && e.zhLiteral),
    };

    setGrammar([...grammar, grammarItem]);
    setNewGrammar({
      level: 'N5',
      titleZh: '',
      pattern: '',
      meaningZh: '',
      explanationZh: '',
      examples: [{ ja: '', zhLiteral: '' }],
    });
    setShowAddForm(false);
    toast.success('文法已新增！');
  };

  // Handle export JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(grammar, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'grammar-export.json';
    link.click();
    toast.success('文法資料已匯出！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 font-serif">
          {t('grammar.title')}
        </h1>

        {/* Level Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedLevel === null ? 'default' : 'outline'}
            onClick={() => {
              setSelectedLevel(null);
              setCurrentPage(1);
            }}
            className={selectedLevel === null ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}
          >
            全部
          </Button>
          {LEVELS.map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? 'default' : 'outline'}
              onClick={() => {
                setSelectedLevel(level);
                setCurrentPage(1);
              }}
              className={selectedLevel === level ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}
            >
              {level}
            </Button>
          ))}
        </div>

        {/* Grammar List */}
        <div className="space-y-4 mb-8">
          {paginatedGrammar.map((item) => (
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
                      <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-semibold">
                        {item.level}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.titleZh}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-600 font-mono">
                      {item.pattern}
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
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      意思
                    </h4>
                    <p className="text-sm text-gray-700">{item.meaningZh}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      說明
                    </h4>
                    <p className="text-sm text-gray-700">{item.explanationZh}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      例句
                    </h4>
                    <div className="space-y-2">
                      {item.examples.map((example, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="font-mono text-gray-900 mb-1">
                            {idx + 1}. {example.ja}
                          </div>
                          <div className="text-gray-600 ml-4">
                            —— {example.zhLiteral}
                          </div>
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
                className={currentPage === page ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}
              >
                {page}
              </Button>
            ))}
          </div>
        )}

        {/* Add Grammar Form */}
        <div className="mb-8">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gray-800 hover:bg-gray-900 text-white mb-4"
          >
            {showAddForm ? '取消' : '新增文法'}
          </Button>

          {showAddForm && (
            <Card className="p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                新增文法
              </h3>

              <div className="space-y-4">
                {/* Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    分類
                  </label>
                  <select
                    value={newGrammar.level}
                    onChange={(e) =>
                      setNewGrammar({ ...newGrammar, level: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    文法標題
                  </label>
                  <Input
                    value={newGrammar.titleZh}
                    onChange={(e) =>
                      setNewGrammar({ ...newGrammar, titleZh: e.target.value })
                    }
                    placeholder="例：基本肯定句"
                    className="border-gray-300"
                  />
                </div>

                {/* Pattern */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    文法模式
                  </label>
                  <Input
                    value={newGrammar.pattern}
                    onChange={(e) =>
                      setNewGrammar({ ...newGrammar, pattern: e.target.value })
                    }
                    placeholder="例：【 A は B です 】"
                    className="border-gray-300 font-mono"
                  />
                </div>

                {/* Meaning */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    意思
                  </label>
                  <Input
                    value={newGrammar.meaningZh}
                    onChange={(e) =>
                      setNewGrammar({ ...newGrammar, meaningZh: e.target.value })
                    }
                    placeholder="例：A 是 B"
                    className="border-gray-300"
                  />
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    說明
                  </label>
                  <Textarea
                    value={newGrammar.explanationZh}
                    onChange={(e) =>
                      setNewGrammar({ ...newGrammar, explanationZh: e.target.value })
                    }
                    placeholder="詳細說明此文法的用法"
                    className="border-gray-300 min-h-24"
                  />
                </div>

                {/* Examples */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    例句
                  </label>
                  {newGrammar.examples.map((example, idx) => (
                    <div key={idx} className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <Input
                        value={example.ja}
                        onChange={(e) => {
                          const updated = [...newGrammar.examples];
                          updated[idx].ja = e.target.value;
                          setNewGrammar({ ...newGrammar, examples: updated });
                        }}
                        placeholder="日文例句"
                        className="mb-2 border-gray-300"
                      />
                      <Input
                        value={example.zhLiteral}
                        onChange={(e) => {
                          const updated = [...newGrammar.examples];
                          updated[idx].zhLiteral = e.target.value;
                          setNewGrammar({ ...newGrammar, examples: updated });
                        }}
                        placeholder="中文翻譯"
                        className="border-gray-300"
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNewGrammar({
                        ...newGrammar,
                        examples: [
                          ...newGrammar.examples,
                          { ja: '', zhLiteral: '' },
                        ],
                      })
                    }
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    新增例句
                  </Button>
                </div>

                {/* Submit */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAddGrammar}
                    className="bg-gray-800 hover:bg-gray-900 text-white"
                  >
                    確認新增
                  </Button>
                  <Button
                    onClick={handleExportJSON}
                    variant="outline"
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    匯出 JSON
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Decorative background */}
      <div className="fixed top-40 right-10 w-64 h-64 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
    </div>
  );
}

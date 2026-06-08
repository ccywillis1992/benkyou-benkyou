import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KanaRow {
  id: string;
  row: string;
  items: Array<{
    hiragana: string;
    katakana: string;
    romaji: string;
    mnemonic: string;
  }>;
}

export default function Kana() {
  const { t } = useLanguage();
  const [kanaData, setKanaData] = useState<KanaRow[]>([]);
  const [activeTab, setActiveTab] = useState('hiragana');

  useEffect(() => {
    const loadKana = async () => {
      try {
        const data = await fetch('/data/kana.json').then(r => r.json());
        setKanaData(data);
      } catch (error) {
        console.error('Failed to load kana:', error);
      }
    };

    loadKana();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('kana.title')}</h1>
        <p className="text-lg text-muted-foreground mb-8">
          {t('kana.hiragana')} • {t('kana.katakana')}
        </p>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="hiragana">{t('kana.hiragana')}</TabsTrigger>
            <TabsTrigger value="katakana">{t('kana.katakana')}</TabsTrigger>
          </TabsList>

          {/* Hiragana Tab */}
          <TabsContent value="hiragana" className="space-y-6">
            {kanaData.map((row) => (
              <div key={row.id}>
                <h2 className="text-2xl font-bold text-foreground mb-4">{row.row}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {row.items.map((item, idx) => (
                    <Card
                      key={idx}
                      className="p-4 text-center hover:shadow-lg transition-shadow"
                    >
                      <div className="text-4xl font-bold text-amber-600 mb-2">
                        {item.hiragana}
                      </div>
                      <div className="text-sm font-semibold text-foreground mb-1">
                        {item.romaji}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.mnemonic}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Katakana Tab */}
          <TabsContent value="katakana" className="space-y-6">
            {kanaData.map((row) => (
              <div key={row.id}>
                <h2 className="text-2xl font-bold text-foreground mb-4">{row.row}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {row.items.map((item, idx) => (
                    <Card
                      key={idx}
                      className="p-4 text-center hover:shadow-lg transition-shadow"
                    >
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {item.katakana}
                      </div>
                      <div className="text-sm font-semibold text-foreground mb-1">
                        {item.romaji}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.mnemonic}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Learning Tips */}
        <Card className="p-6 bg-amber-50 border border-amber-200">
          <h3 className="text-lg font-bold text-foreground mb-3">💡 {t('common.loading')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 每天練習 5-10 個新的假名，直到熟悉為止</li>
            <li>• 使用記憶提示（Mnemonic）幫助記憶</li>
            <li>• 嘗試寫出假名，加強肌肉記憶</li>
            <li>• 平假名用於日常文字，片假名用於外來語</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

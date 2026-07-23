/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Utensils, Info, AlertCircle, Loader2, ChevronRight, RefreshCw, Heart, Droplets, Activity, Wine, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { checkFoodSafety, generateMealPlan, DayPlan } from './services/gemini';
import { cn } from './lib/utils';
import { CONDITIONS, getCondition, ConditionKey } from '@/shared/conditions';

const CONDITION_ICONS: Record<ConditionKey, React.ElementType> = {
  kidney: Heart,
  diabetes: Droplets,
  hypertension: Activity,
  liver: Wine,
  diet: Flame,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'plan'>('search');
  const [condition, setCondition] = useState<ConditionKey>('kidney');
  const [foodQuery, setFoodQuery] = useState('');
  const [foodResult, setFoodResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [mealPlan, setMealPlan] = useState<DayPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const config = getCondition(condition);
  const [healthStage, setHealthStage] = useState(config.stages[0]);

  const handleConditionChange = (key: ConditionKey) => {
    setCondition(key);
    setHealthStage(getCondition(key).stages[0]);
    setMealPlan(null);
    setFoodResult(null);
  };

  const handleFoodSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodQuery.trim()) return;

    setIsSearching(true);
    setFoodResult(null);
    const result = await checkFoodSafety(foodQuery, condition);
    setFoodResult(result);
    setIsSearching(false);
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    const plan = await generateMealPlan(healthStage, condition);
    if (plan) setMealPlan(plan);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <Heart size={20} fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">맞춤 건강 식단 가이드</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Condition Selector */}
        <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap sm:overflow-visible sm:justify-center gap-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {CONDITIONS.map((c) => {
            const Icon = CONDITION_ICONS[c.key];
            const isActive = condition === c.key;
            return (
              <button
                key={c.key}
                onClick={() => handleConditionChange(c.key)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 border whitespace-nowrap",
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
                )}
              >
                <Icon size={16} />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-200/50 rounded-xl mb-8 w-fit mx-auto">
          <button
            onClick={() => setActiveTab('search')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeTab === 'search' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Search size={16} />
            음식 검색
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeTab === 'plan' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Utensils size={16} />
            하루 식단 제안
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'search' ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="text-emerald-500" size={20} />
                  {config.label}에 좋은 음식인지 확인해보세요
                </h2>
                <form onSubmit={handleFoodSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={foodQuery}
                      onChange={(e) => setFoodQuery(e.target.value)}
                      placeholder="예: 바나나, 고구마, 잡곡밥..."
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    검색
                  </button>
                </form>
                <p className="mt-3 text-sm text-slate-500 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {config.label} 관리 단계에 따라 권장 사항이 다를 수 있습니다.
                </p>
              </div>

              {foodResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 prose prose-slate max-w-none"
                >
                  <div className="flex items-center gap-2 mb-4 text-emerald-700 font-semibold text-lg border-b border-slate-100 pb-2">
                    <Search size={20} />
                    '{foodQuery}' 검색 결과
                  </div>
                  <div className="markdown-body">
                    <Markdown>{foodResult}</Markdown>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Utensils className="text-emerald-500" size={20} />
                  맞춤형 하루 식단 생성
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">현재 건강 상태 또는 관리 단계</label>
                    <select
                      value={healthStage}
                      onChange={(e) => setHealthStage(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      {config.stages.map((stage) => (
                        <option key={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleGeneratePlan}
                    disabled={isGenerating}
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        식단 구성 중...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={20} />
                        새로운 식단 제안받기
                      </>
                    )}
                  </button>
                </div>
              </div>

              {mealPlan && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MealCard title="아침 식사" meal={mealPlan.breakfast} icon="🌅" />
                    <MealCard title="점심 식사" meal={mealPlan.lunch} icon="☀️" />
                    <MealCard title="저녁 식사" meal={mealPlan.dinner} icon="🌙" />
                    <MealCard title="간식" meal={mealPlan.snack} icon="🍎" />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                    <h3 className="text-amber-800 font-bold mb-3 flex items-center gap-2">
                      <Info size={18} />
                      오늘의 {config.label} 건강 팁
                    </h3>
                    <ul className="space-y-2">
                      {mealPlan.tips.map((tip, i) => (
                        <li key={i} className="text-amber-900 text-sm flex items-start gap-2">
                          <ChevronRight size={16} className="mt-0.5 shrink-0 text-amber-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-400 text-sm">
        <p>© 2026 맞춤 건강 식단 가이드. 본 정보는 참고용이며, 반드시 전문의나 영양사와 상담하십시오.</p>
      </footer>
    </div>
  );
}

function MealCard({ title, meal, icon }: { title: string; meal: any; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-200 transition-colors group">
      <div className="flex justify-between items-start mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{meal.time}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">{title}: {meal.menu}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{meal.description}</p>
    </div>
  );
}

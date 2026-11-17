import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Search,
  RefreshCw,
  TrendingUp,
  Flame,
  Check,
  Info,
} from 'lucide-react';
import { ResearchProject, EvaluationResult } from '../types';
import { LABS_DATA } from '../data/labsData';

interface AiEvaluatorViewProps {
  project: ResearchProject;
  onApplyEvaluation: (evalResult: EvaluationResult) => void;
  onApplyQuestion: (upgradedQuestion: string) => void;
  onApplyNewTopic: (topic: any) => void;
  onChangeProject?: (updated: Partial<ResearchProject>) => void;
  onNavigateTab?: (tab: any) => void;
}

export const AiEvaluatorView: React.FC<AiEvaluatorViewProps> = ({
  project,
  onApplyEvaluation,
  onApplyQuestion,
  onApplyNewTopic,
  onChangeProject,
  onNavigateTab,
}) => {
  const [loadingEval, setLoadingEval] = useState(false);
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [interestKeyword, setInterestKeyword] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [appliedQuestionNotice, setAppliedQuestionNotice] = useState(false);
  const [aiNotice, setAiNotice] = useState('');
  const [recommendationIsFallback, setRecommendationIsFallback] = useState(false);

  const currentLab = LABS_DATA.find((l) => l.id === project.labId) || LABS_DATA[0];

  const handleRunEvaluation = async () => {
    setLoadingEval(true);
    setAiNotice('');
    try {
      const res = await fetch('/api/gemini/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labName: currentLab.name,
          question: project.mainQuestion,
          phenomenon: project.fourP.phenomenon,
          problem: project.fourP.problem,
          project: project.fourP.project,
          practice: project.fourP.practice,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        onApplyEvaluation({ ...json.data, isFallback: Boolean(json.isFallback) });
        setAiNotice(
          json.isFallback
            ? 'Gemini 연결 없이 규칙 기반 안전 모드로 진단했습니다. 점수와 제안은 학습 참고용입니다.'
            : 'Gemini AI가 진단했습니다. 중요한 사실·도서·통계는 제출 전에 직접 확인하세요.'
        );
      } else {
        throw new Error('평가 결과를 받지 못했습니다.');
      }
    } catch (err) {
      console.error('Evaluation fetch error:', err);
      setAiNotice('평가 서버에 연결하지 못했습니다. 잠시 후 다시 시도하거나 관리자에게 문의하세요.');
    } finally {
      setLoadingEval(false);
    }
  };

  const handleRecommendTopics = async () => {
    setLoadingRecommend(true);
    setAiNotice('');
    try {
      const res = await fetch('/api/gemini/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labName: currentLab.name,
          interestKeyword: interestKeyword || currentLab.inquiryKeywords[0],
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setRecommendations(json.data);
        setRecommendationIsFallback(Boolean(json.isFallback));
        setAiNotice(
          json.isFallback
            ? '규칙 기반 안전 모드가 주제를 추천했습니다. 예시를 그대로 제출하지 말고 학생의 조사 내용으로 수정하세요.'
            : 'Gemini AI가 주제를 추천했습니다. 자료의 정확성과 출처를 직접 확인하세요.'
        );
      } else {
        throw new Error('추천 결과를 받지 못했습니다.');
      }
    } catch (err) {
      console.error('Recommendation fetch error:', err);
      setAiNotice('추천 서버에 연결하지 못했습니다. 잠시 후 다시 시도하세요.');
    } finally {
      setLoadingRecommend(false);
    }
  };

  const handleSelectQuestion = (q: string) => {
    onApplyQuestion(q);
    setAppliedQuestionNotice(true);
    setTimeout(() => setAppliedQuestionNotice(false), 2000);
  };

  const evalData = project.evaluationResult;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20 backdrop-blur-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Gemini 연동 AI 학술 멘토링
            </span>
            <span className="text-xs text-indigo-200">읽·걷·쓰 4P 전공연계 평가 엔진</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            AI 탐구 질문 정밀 진단 및 3단계 발전소
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 mt-2 leading-relaxed">
            작성 중인 4P 탐구 계획서를 전공 학문성과 사회적 실천성 관점에서 다각도로 평가받고, 초보적 질문을 학술적·실천적 완성형 질문으로 업그레이드하세요.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              id="btn-run-evaluation"
              onClick={handleRunEvaluation}
              disabled={loadingEval}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingEval ? 'animate-spin' : ''}`} />
              <span>{loadingEval ? 'AI 평가 분석 중...' : '내 4P 계획서 AI 정밀 진단하기'}</span>
            </button>
            <span className="text-xs text-indigo-200">
              현재 연구실: <strong className="text-white">{currentLab.name}</strong>
            </span>
          </div>
        </div>
      </div>

      {appliedQuestionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>선택한 심화 탐구 질문이 연구 계획서의 핵심 질문으로 즉시 업데이트되었습니다!</span>
        </div>
      )}

      {aiNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2" role="status">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <span>{aiNotice}</span>
        </div>
      )}

      {/* Evaluation Results (if available) */}
      {evalData ? (
        <div className="space-y-6">
          {/* Score & Dimension Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Score Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                4P 종합 탐구 지수
              </span>
              <div className="my-3 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-indigo-600 tracking-tight">
                  {evalData.totalScore}
                </span>
                <span className="text-sm font-bold text-slate-400">/ 100점</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                {evalData.isFallback ? '규칙 기반 참고 진단' : evalData.totalScore >= 90
                  ? '최우수 탐구 설계 (Level A+)'
                  : evalData.totalScore >= 80
                  ? '우수 탐구 설계 (Level A)'
                  : '발전 가능성 풍부 (Level B)'}
              </div>
              <p className="text-[11px] text-slate-500 mt-3 max-w-xs leading-relaxed">
                현상 관찰, 문제 원인 규명, 전공 과업 방법론, 사회적 실천의 4단계 균형도를 종합 채점한 결과입니다.
              </p>
            </div>

            {/* 4P Step Dimension Scores */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                단계별 세부 평가 지표 (각 25점 만점)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    key: 'phenomenon',
                    label: 'P1. 현상 포착',
                    score: evalData.pScores?.phenomenon || 22,
                    color: 'bg-indigo-600',
                  },
                  {
                    key: 'problem',
                    label: 'P2. 문제 정의',
                    score: evalData.pScores?.problem || 21,
                    color: 'bg-blue-600',
                  },
                  {
                    key: 'project',
                    label: 'P3. 전공 과업',
                    score: evalData.pScores?.project || 23,
                    color: 'bg-purple-600',
                  },
                  {
                    key: 'practice',
                    label: 'P4. 사회 실천',
                    score: evalData.pScores?.practice || 22,
                    color: 'bg-emerald-600',
                  },
                ].map((item) => {
                  const percent = Math.round((item.score / 25) * 100);
                  return (
                    <div key={item.key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">
                        {item.label}
                      </span>
                      <span className="text-xl font-bold text-slate-900">{item.score}점</span>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percent}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">{percent}% 달성</span>
                    </div>
                  );
                })}
              </div>

              {/* Review Quote */}
              <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-indigo-950 block mb-1">멘토 총평:</span>
                {evalData.overallReview}
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                돋보이는 강점 (Strengths)
              </h4>
              <ul className="space-y-2">
                {evalData.strengths.map((str, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                보완 및 발전 포인트 (Improvements)
              </h4>
              <ul className="space-y-2">
                {evalData.improvements.map((imp, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-amber-50/40 p-2.5 rounded-lg border border-amber-100">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3-Level Question Upgrade Ladder */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  질문 3단계 발전 사다리 (Question Upgrade Ladder)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  관찰 질문에서 출발하여 학술적 인과 분석과 지역사회 실천을 관통하는 완성형 질문으로 도약하세요.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {evalData.questionUpgrades?.map((qu, idx) => {
                const isLevel3 = idx === 2;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLevel3
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 ring-1 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLevel3
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {qu.level}
                        </span>
                        <span className="text-[11px] text-slate-500">{qu.description}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                        &ldquo;{qu.question}&rdquo;
                      </p>
                    </div>

                    <button
                      id={`btn-apply-question-${idx}`}
                      onClick={() => handleSelectQuestion(qu.question)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 self-start sm:self-auto transition-all ${
                        isLevel3
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>이 질문 적용하기</span>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations: Books & Practice Ideas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommended Books/Papers */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                <BookOpen className="w-4 h-4 text-amber-600" />
                AI 추천 연계 필독서 및 학술 자료
              </h4>
              <div className="space-y-2.5">
                {evalData.recommendedBooks?.map((book, i) => (
                  <div key={i} className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/60 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{book.title}</span>
                      <span className="text-[10px] text-amber-800 font-medium">{book.author}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{book.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Action Ideas */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                추천 지역사회 실천(P4) 프로젝트 아이디어
              </h4>
              <div className="space-y-2">
                {evalData.practiceActionIdeas?.map((act, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/60 text-xs text-slate-800 flex items-start gap-2">
                    <span className="font-bold text-emerald-600 mt-0.5">#{i + 1}</span>
                    <span className="leading-relaxed">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {onNavigateTab && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold">
                  👥
                </div>
                <div>
                  <span className="font-extrabold text-indigo-950">
                    지역사회 3대 이해관계자(소상공인·환경운동가·공무원) 다각도 검증
                  </span>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    해결책(과업·실천) 작성과 실시간 피드백 루프는 [4P 탐구 워크스페이스] 화면에서 진행됩니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('workspace')}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shrink-0 transition-colors"
              >
                4P 워크스페이스 이동 →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">아직 평가 결과가 생성되지 않았습니다</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            상단의 &lsquo;내 4P 계획서 AI 정밀 진단하기&rsquo; 버튼을 누르면 Gemini 연결 시 AI가, 연결되지 않은 경우 규칙 기반 안전 모드가 질문과 4P 구조를 평가하고 3단계 심화 질문을 제시합니다.
          </p>
          <button
            onClick={handleRunEvaluation}
            disabled={loadingEval}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            지금 평가 시작하기
          </button>
        </div>
      )}

      {/* Interactive AI Topic Idea Generator */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="max-w-2xl mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            AI 전공 연계 신규 주제 발굴기
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            관심 있는 단어(예: 딥페이크, 고독사, 텀블러, 청소년 도박 등)를 입력하면 해당 연구실 전공 관점의 4P 연구 주제를 자동 생성합니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 max-w-xl mb-4">
          <div className="relative grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="input-interest-keyword"
              type="text"
              value={interestKeyword}
              onChange={(e) => setInterestKeyword(e.target.value)}
              placeholder="관심 키워드 입력 (예: 청소년 수면, 갯벌 탄소, 노인 키오스크)"
              className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              onKeyDown={(e) => e.key === 'Enter' && handleRecommendTopics()}
            />
          </div>
          <button
            id="btn-recommend-topics"
            onClick={handleRecommendTopics}
            disabled={loadingRecommend}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shrink-0 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loadingRecommend ? 'animate-spin' : ''}`} />
            <span>{loadingRecommend ? '생성 중...' : '주제 3선 추천'}</span>
          </button>
        </div>

        {recommendations.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <p className="mb-3 text-[11px] font-bold text-slate-500">
              {recommendationIsFallback ? '규칙 기반 참고 추천' : 'Gemini AI 추천'} · 사실과 출처를 확인한 뒤 활용하세요.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    추천 {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">{item.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    <strong className="text-slate-700">질문:</strong> {item.mainQuestion}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 line-clamp-2">
                    <strong className="text-indigo-600">P3 과업:</strong> {item.projectSummary}
                  </p>
                </div>
                <button
                  id={`btn-apply-rec-${idx}`}
                  onClick={() =>
                    onApplyNewTopic({
                      title: item.title,
                      mainQuestion: item.mainQuestion,
                      p1: item.phenomenonSummary,
                      p2: item.problemSummary,
                      p3: item.projectSummary,
                      p4: item.practiceSummary,
                    })
                  }
                  className="mt-3 pt-2 border-t border-slate-200/60 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-end"
                >
                  <span>이 주제로 연구하기</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

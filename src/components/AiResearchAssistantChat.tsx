import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  ChevronDown,
  RefreshCw,
  Lightbulb,
  BookOpen,
  Footprints,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { ResearchProject, LabId } from '../types';
import { LABS_DATA } from '../data/labsData';

interface AiResearchAssistantChatProps {
  project: ResearchProject;
  onApplyToStep?: (step: 'phenomenon' | 'problem' | 'project' | 'practice', text: string) => void;
  onNavigateTab?: (tab: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isFallback?: boolean;
  suggestedPrompts?: string[];
}

export const AiResearchAssistantChat: React.FC<AiResearchAssistantChatProps> = ({
  project,
  onApplyToStep,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentLab = LABS_DATA.find((l) => l.id === project.labId) || LABS_DATA[0];

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: `안녕하세요! 인천 '읽·걷·쓰' 4P 전공연계 사회문제탐구 **AI 학술 멘토**입니다. 🎓\n\n현재 **[${currentLab.name}]** 연구실에서 **"${project.title || '새 탐구 프로젝트'}"**를 진행 중이시네요. 탐구 질문을 날카롭게 다듬거나, 인천 공공데이터 연계, 4P(현상-문제-과업-실천) 작성 중 막히는 부분이 있다면 무엇이든 편하게 물어보세요!`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        '내 탐구 질문을 학술형으로 업그레이드해줘',
        '인천 10개 군·구 공공데이터 어떻게 인용해?',
        'P3 연구방법(과업)에 쓸 수 있는 모델 추천해줘',
        'P4 실천 방안 아이디어 3가지 제안해줘',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          projectContext: {
            labName: currentLab.name,
            title: project.title,
            mainQuestion: project.mainQuestion,
            fourP: project.fourP,
            readingLogsCount: project.readingLogs?.length || 0,
            walkingLogsCount: project.walkingLogs?.length || 0,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: data.data.reply,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            isFallback: Boolean(data.isFallback),
            suggestedPrompts: data.data.suggestedPrompts || [],
          },
        ]);
      } else {
        throw new Error('응답 실패');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: '일시적인 네트워크 오류가 발생했습니다. 잠시 후 다시 질문해 주세요.',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 group"
          title="AI 학술 멘토 열기"
        >
          <div className="relative">
            <Bot className="w-5 h-5 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-bold text-sm tracking-tight pr-0.5">AI 학술 멘토</span>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
            질문·피드백
          </span>
        </button>
      )}

      {/* Slide-in Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[440px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">인천 읽걷쓰 AI 학술 멘토</h3>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.2 rounded font-medium">
                    실시간
                  </span>
                </div>
                <p className="text-[11px] text-indigo-100 truncate max-w-[240px]">
                  {currentLab.name} • {project.title || '4P 탐구 진행 중'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`p-3.5 rounded-2xl shadow-sm text-[13px] leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* AI Message Footer Tools */}
                  {msg.sender === 'ai' && (
                    <div className="flex items-center gap-2 mt-1.5 px-1 text-[11px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {msg.isFallback && (
                        <span className="text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          표준가이드
                        </span>
                      )}
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="hover:text-slate-600 flex items-center gap-1 transition-colors ml-auto"
                        title="답변 복사"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>복사</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Suggested Follow-up Chips */}
                  {msg.sender === 'ai' && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {msg.suggestedPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          disabled={loading}
                          className="text-[11.5px] px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors text-left truncate max-w-full"
                        >
                          💬 {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>인천 지역 맥락과 4P 전공 프레임워크를 분석하는 중...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Context Bar */}
          <div className="bg-slate-100/90 border-t border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-indigo-600" />
              <span>연구실: {currentLab.name}</span>
            </span>
            {onNavigateTab && (
              <button
                onClick={() => {
                  onNavigateTab('evaluator');
                  setIsOpen(false);
                }}
                className="hover:text-indigo-600 font-semibold flex items-center gap-0.5"
              >
                <span>AI 정밀 평가실 이동</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="탐구 질문, 인천 데이터, 4P 작성법을 질문하세요..."
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shrink-0"
              title="전송"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

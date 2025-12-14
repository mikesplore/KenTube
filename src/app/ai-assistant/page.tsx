"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Video, Music, Search, Sparkles, BarChart3, Globe, MessageCircle, Send, X, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const [question, setQuestion] = useState('What are the top trending videos in Kenya?');
  const [answer, setAnswer] = useState<string>('');
  const [parsed, setParsed] = useState<any>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm KenAI, your KenTube assistant. Ask me anything about Kenyan YouTube trends, channels, videos, or statistics!",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    { icon: TrendingUp, text: 'Top trending videos in Kenya', color: 'from-primary to-primary/90' },
    { icon: Music, text: 'Latest Kenyan music videos', color: 'from-accent to-accent/90' },
    { icon: Users, text: 'Most subscribed Kenyan channels', color: 'from-muted-foreground to-muted-foreground/90' },
    { icon: Video, text: 'Popular Kenyan comedy videos', color: 'from-primary to-destructive' },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const onAsk = async () => {
    setLoading(true);
    setError(null);
    setAnswer('');
    setParsed(null);
    try {
      // Call YouTube API directly without AI
      const res = await fetch(`/api/youtube-direct?q=${encodeURIComponent(question)}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setAnswer(JSON.stringify(data, null, 2));
      setParsed(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const quickApiCall = async (query: string) => {
    setQuestion(query);
    setLoading(true);
    setError(null);
    setAnswer('');
    setParsed(null);
    try {
      const res = await fetch(`/api/youtube-direct?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setAnswer(JSON.stringify(data, null, 2));
      setParsed(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Get YouTube data with AI response
      const res = await fetch(`/api/youtube-stats?q=${encodeURIComponent(chatInput)}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.aiAnswer || 'I found some information for you, but couldn\'t generate a detailed response.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      onAsk();
    }
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <>
      <main className="min-h-screen bg-background">
      {/* Hero Header with App Theme */}
      <div className="relative bg-gradient-to-r from-primary/90 via-primary to-accent/80 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(255,255,255,0.03) 100px, rgba(255,255,255,0.03) 200px)`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary p-3 rounded-xl shadow-xl">
                <Globe className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  KenTube
                </h1>
                <p className="text-primary-foreground/90 text-lg mt-2">
                  Real-time insights into Kenyan YouTube trends, powered by YouTube Data API
                </p>
              </div>
            </div>
            
            {/* AI Chat Toggle Button */}
            <Button
              onClick={() => setShowChat(!showChat)}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-6 py-6 rounded-2xl shadow-2xl flex items-center gap-3 transition-all"
            >
              <Bot className="w-6 h-6" />
              <span className="font-bold text-lg">KenAI</span>
              {!showChat && (
                <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
              )}
            </Button>
          </div>
          
          {/* Kenya Flag Accent */}
          <div className="flex gap-1 mt-6 h-2 rounded-full overflow-hidden shadow-lg">
            <div className="flex-1 bg-black"></div>
            <div className="flex-1 bg-red-600"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-green-600"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* API Quick Actions Section */}
        <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="bg-gradient-to-r from-accent to-primary text-primary-foreground rounded-t-lg py-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground/20 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Quick YouTube API Functions</CardTitle>
                <p className="text-xs text-primary-foreground/80 mt-0.5">Direct API calls without AI - One click access</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => quickApiCall('Top trending videos in Kenya')}
                disabled={loading}
                size="sm"
                className="h-auto py-2 px-3 bg-white hover:bg-primary/10 text-foreground border-2 border-primary/20 hover:border-primary rounded-lg"
              >
                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-semibold">Trending</span>
              </Button>

              <Button
                onClick={() => quickApiCall('Latest Kenyan music videos')}
                disabled={loading}
                size="sm"
                className="h-auto py-2 px-3 bg-white hover:bg-primary/10 text-foreground border-2 border-primary/20 hover:border-primary rounded-lg"
              >
                <Music className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-semibold">Music</span>
              </Button>

              <Button
                onClick={() => quickApiCall('Popular Kenyan comedy videos')}
                disabled={loading}
                size="sm"
                className="h-auto py-2 px-3 bg-white hover:bg-primary/10 text-foreground border-2 border-primary/20 hover:border-primary rounded-lg"
              >
                <Video className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-semibold">Comedy</span>
              </Button>

              <Button
                onClick={() => quickApiCall('Kenyan gospel music trending')}
                disabled={loading}
                size="sm"
                className="h-auto py-2 px-3 bg-white hover:bg-primary/10 text-foreground border-2 border-primary/20 hover:border-primary rounded-lg"
              >
                <Music className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-semibold">Gospel</span>
              </Button>

              <Button
                onClick={() => quickApiCall('Trending Kenyan news videos')}
                disabled={loading}
                size="sm"
                className="h-auto py-2 px-3 bg-white hover:bg-primary/10 text-foreground border-2 border-primary/20 hover:border-primary rounded-lg"
              >
                <Globe className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-semibold">News</span>
              </Button>

              <Button
                onClick={() => quickApiCall('Kenyan entertainment videos')}
                disabled={loading}
                size="sm"
                className="h-auto py-2 px-3 bg-white hover:bg-primary/10 text-foreground border-2 border-primary/20 hover:border-primary rounded-lg"
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-semibold">Entertainment</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setQuestion(q.text)}
              className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${q.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${q.color} flex items-center justify-center mb-3 shadow-md`}>
                  <q.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
                  {q.text}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Main Search Card */}
        <Card className="border-2 border-gray-200 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Search className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl">Quick Search</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., What are the top trending videos in Kenya?"
                  disabled={loading}
                  className="pl-12 h-14 text-lg border-2 border-gray-300 focus:border-red-500 rounded-xl"
                />
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={onAsk}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 h-12 text-lg font-semibold rounded-xl shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => setQuestion('What are the top trending videos in Kenya?')}
                  disabled={loading}
                  className="h-12 px-6 rounded-xl border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 bg-white text-gray-700"
                >
                  Reset
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            )}

            {parsed && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Trending Videos Grid */}
                {parsed.trendingVideos && Array.isArray(parsed.trendingVideos) && parsed.trendingVideos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-red-600 p-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Trending in Kenya</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {parsed.trendingVideos.slice(0, 6).map((v: any, i: number) => (
                        <div key={v.id || i} className="group bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-red-500 hover:shadow-xl transition-all duration-300">
                          <div className="flex gap-3">
                            <div className="bg-gradient-to-br from-red-600 to-red-700 text-white font-bold text-lg w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors mb-1">
                                {v.title || 'Untitled video'}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2">{v.channel || v.channelTitle || 'Unknown'}</p>
                              {v.views && (
                                <div className="inline-flex items-center gap-1 bg-red-100 px-2 py-1 rounded-md">
                                  <BarChart3 className="w-3 h-3 text-red-600" />
                                  <span className="text-xs font-semibold text-red-600">{v.views} views</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other sections remain the same... */}
                {/* Raw JSON Toggle */}
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setShowRaw((v) => !v)}
                    className="border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 bg-white text-gray-700 rounded-lg"
                  >
                    {showRaw ? 'Hide' : 'Show'} Raw JSON
                  </Button>
                </div>

                {showRaw && answer && (
                  <div className="bg-gray-900 rounded-xl p-4 overflow-auto max-h-96 border-2 border-gray-700">
                    <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
                      {answer}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {!parsed && !loading && (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">Submit a question to explore Kenyan YouTube insights</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer with Kenya Flag */}
        <div className="text-center py-6">
          <div className="flex gap-2 justify-center h-1 mb-3">
            <div className="w-16 bg-black rounded-full"></div>
            <div className="w-16 bg-red-600 rounded-full"></div>
            <div className="w-16 bg-white border border-gray-300 rounded-full"></div>
            <div className="w-16 bg-green-600 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-600">Powered by YouTube Data API v3 • Real-time Kenya Statistics</p>
        </div>
      </div>
    </main>

    {/* AI Chat Panel - Fixed Overlay */}
    {showChat && (
      <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowChat(false)}>
        <Card className="w-full max-w-md h-[80vh] mr-4 mb-4 border-2 border-primary/30 shadow-2xl bg-card animate-in slide-in-from-right duration-300 flex flex-col" onClick={(e) => e.stopPropagation()}>
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary-foreground/20 p-2 rounded-lg">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">KenAI Assistant</CardTitle>
                  <p className="text-sm text-primary-foreground/80">Ask me anything about Kenyan YouTube</p>
                </div>
              </div>
              <Button
                onClick={() => setShowChat(false)}
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-primary to-primary/90' 
                      : 'bg-gradient-to-br from-accent to-accent/90'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className={`flex-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
                        : 'bg-card border-2 border-primary/20 text-card-foreground'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      ) : (
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-primary">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-2">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Loading/Typing Indicator */}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-accent to-accent/90">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-card border-2 border-primary/20 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">KenAI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t-2 border-border p-4 bg-muted/50 flex-shrink-0">
              <div className="flex gap-2 mb-3">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder="Ask me about Kenyan YouTube..."
                  disabled={chatLoading}
                  className="flex-1 h-12 text-base border-2 border-input focus:border-primary rounded-xl"
                />
                <Button
                  onClick={handleChatSubmit}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground h-12 px-6 rounded-xl"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['Trending videos', 'Top channels', 'Music trends', 'Comedy videos'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setChatInput(suggestion)}
                    className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
    </>
  );
}
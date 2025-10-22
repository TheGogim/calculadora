'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Eye, EyeOff } from 'lucide-react';

interface ChatbotProps {
  distribution: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function Chatbot({ distribution, isVisible, onToggleVisibility }: ChatbotProps) {
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState<Array<{content: string, sender: 'user' | 'bot'}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const API_KEY = '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';
  const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const CURRENT_MODEL = 'deepseek/deepseek-chat-v3.1:free';

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      content: `¡Hola! Soy un asistente para estadística especializado en la distribución ${distribution}. Puedo resolver problemas, explicar conceptos y ayudarte con cálculos. Usa notación LaTeX para fórmulas; las renderizaré automáticamente. ¿En qué puedo ayudarte?`,
      sender: 'bot'
    }]);
  }, [distribution]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const showStatus = (message: string, type: 'success' | 'error') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 5000);
  };

  const processMathFormulas = (text: string): string => {
    if (!text || typeof text !== 'string') return text;

    // Convert \( ... \) y \[ ... \] 
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, (m, g1) => `$${g1}$`);
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (m, g1) => `$$${g1}$$`);

    return text;
  };

  const markdownToHtml = (md: string): string => {
    if (!md) return '';
    
    let html = md;

    // Escape HTML tags
    html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, function(m, code) {
      return '<pre><code>' + code.replace(/&lt;/g, '<').replace(/&gt;/g, '>') + '</code></pre>';
    });

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Lists
    html = html.replace(/^(?:- (.*)$\n?)+/gim, function(m) {
      const items = m.trim().split(/\n/).map(line => line.replace(/^- /, ''));
      return '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
    });

    // Paragraphs
    html = html.split(/\n\s*\n/).map(para => {
      if (/^(<h|<ul|<pre|<code|<blockquote)/.test(para.trim())) return para;
      return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
    }).join('');

    return html;
  };

  const sendMessage = async () => {
    const text = inputMessage.trim();
    if (!text) return;

    // Add user message
    setMessages(prev => [...prev, { content: text, sender: 'user' }]);
    setInputMessage('');
    setIsLoading(true);

    // Add loading message
    const loadingId = Date.now();
    setMessages(prev => [...prev, { content: '<i>Pensando...</i>', sender: 'bot' }]);

    try {
      const systemPrompt = `Eres un experto en probabilidad y estadística, especializado en la distribución ${distribution}. Responde con explicación clara y usa notación LaTeX para fórmulas. Formatea en Markdown (usa títulos, listas y bloques de código si procede).`;

      const body = {
        model: CURRENT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.2,
        max_tokens: 2048
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'ChatEstadistica'
        },
        body: JSON.stringify(body)
      });

      // Remove loading message
      setMessages(prev => prev.slice(0, -1));

      if (response.status === 429) {
        setMessages(prev => [...prev, { 
          content: '❌ Demasiadas solicitudes (429). Intenta en unos segundos.', 
          sender: 'bot' 
        }]);
        showStatus('Límite de peticiones alcanzado', 'error');
        return;
      }

      if (response.status === 404) {
        setMessages(prev => [...prev, { 
          content: '❌ 404: Modelo no disponible. Verifica la configuración.', 
          sender: 'bot' 
        }]);
        showStatus('Modelo no disponible', 'error');
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
        setMessages(prev => [...prev, { 
          content: `❌ Error: ${error?.error?.message || response.statusText}`, 
          sender: 'bot' 
        }]);
        showStatus('Error en la API', 'error');
        return;
      }

      const data = await response.json();
      const raw = data?.choices?.[0]?.message?.content || '(sin respuesta)';
      const processed = processMathFormulas(raw);

      setMessages(prev => [...prev, { 
        content: markdownToHtml(processed), 
        sender: 'bot' 
      }]);

      // Trigger MathJax rendering
      if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise()
          .then(() => { /* Renderizado OK */ })
          .catch((err: any) => console.warn('MathJax error', err));
      }

      showStatus('Respuesta recibida', 'success');

    } catch (error) {
      setMessages(prev => prev.slice(0, -1));
      setMessages(prev => [...prev, { 
        content: `❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`, 
        sender: 'bot' 
      }]);
      showStatus('Error de conexión', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Calculadora Directa (Chatbot)</span>
            </div>
            <Button variant="outline" size="sm" onClick={onToggleVisibility}>
              <Eye className="h-4 w-4 mr-2" />
              Mostrar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Calculadora Directa (Chatbot)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onToggleVisibility}>
            <EyeOff className="h-4 w-4 mr-2" />
            Ocultar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={chatContainerRef}
          className="min-h-[220px] max-h-[420px] border rounded-md p-3 overflow-y-auto bg-muted/50"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-3 p-3 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground ml-8' 
                  : 'bg-muted text-muted-foreground mr-8'
              }`}
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta aquí... ej: Calcular P(3≤X≤5) con λ=2"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {status && (
          <div className={`text-sm p-2 rounded ${
            status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {status.message}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Las fórmulas matemáticas se renderizan automáticamente. Usa notación LaTeX: $x^2$ o $$\int_a^b f(x)dx$$
        </div>
      </CardContent>
    </Card>
  );
}
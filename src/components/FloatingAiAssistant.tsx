import { useState, useRef, useEffect } from 'react';
import { Paperclip, Link as LinkIcon, Code, Mic, Send, Info, Bot, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'bot' | 'user';
  content: string;
  options?: string[];
}

export default function FloatingAiAssistant() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Olá! Sou o assistente virtual do PetCare. Como posso ajudar você hoje?',
      options: ['Horários de atendimento', 'Serviços disponíveis', 'Fazer agendamento', 'Falar com atendente']
    }
  ]);
  const [charCount, setCharCount] = useState(0);
  const [waitingForOption, setWaitingForOption] = useState(true);
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setCharCount(value.length);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOptionSelect = (option: string) => {
    setMessages(prev => [...prev, { role: 'user', content: option }]);
    
    let response: Message;
    
    switch (option) {
      case 'Horários de atendimento':
        response = {
          role: 'bot',
          content: 'Nosso horário de atendimento é de segunda a sexta das 8h às 18h, e sábados das 8h às 12h.',
          options: ['Serviços disponíveis', 'Fazer agendamento', 'Falar com atendente', 'Voltar ao menu']
        };
        break;
      case 'Serviços disponíveis':
        response = {
          role: 'bot',
          content: 'Oferecemos: Consulta Veterinária, Vacinação, Banho e Tosa, Banho Terapêutico, Check-up Completo e Adestramento.',
          options: ['Ver preços', 'Fazer agendamento', 'Falar com atendente', 'Voltar ao menu']
        };
        break;
      case 'Ver preços':
        response = {
          role: 'bot',
          content: 'Consulta: R$ 150,00 | Vacinação: R$ 80,00 | Banho e Tosa: R$ 100,00 | Check-up: R$ 200,00',
          options: ['Fazer agendamento', 'Falar com atendente', 'Voltar ao menu']
        };
        break;
      case 'Fazer agendamento':
        response = {
          role: 'bot',
          content: 'Para fazer um agendamento, acesse nossa página de agendamentos ou fale com um atendente.',
          options: ['Falar com atendente', 'Voltar ao menu']
        };
        break;
      case 'Falar com atendente':
        response = {
          role: 'bot',
          content: 'Você será redirecionado para falar com um de nossos atendentes via WhatsApp. Tel: (77) 98819-7912',
          options: ['Voltar ao menu']
        };
        setTimeout(() => {
          window.open('https://wa.me/5577988197912', '_blank');
        }, 1000);
        break;
      case 'Voltar ao menu':
        response = {
          role: 'bot',
          content: 'Como posso ajudar você?',
          options: ['Horários de atendimento', 'Serviços disponíveis', 'Fazer agendamento', 'Falar com atendente']
        };
        break;
      default:
        response = {
          role: 'bot',
          content: 'Por favor, selecione uma das opções disponíveis.',
          options: ['Horários de atendimento', 'Serviços disponíveis', 'Fazer agendamento', 'Falar com atendente']
        };
    }
    
    setTimeout(() => {
      setMessages(prev => [...prev, response]);
      setWaitingForOption(true);
    }, 500);
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      setMessage('');
      setCharCount(0);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'bot',
          content: 'Por favor, escolha uma das opções abaixo:',
          options: ['Horários de atendimento', 'Serviços disponíveis', 'Fazer agendamento', 'Falar com atendente']
        }]);
        setWaitingForOption(true);
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        if (!(event.target as Element).closest('.floating-ai-button')) {
          setIsChatOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button 
        className={`floating-ai-button relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform ${
          isChatOpen ? 'rotate-90' : 'rotate-0'
        } bg-gradient-to-br from-primary to-accent shadow-lg hover:shadow-xl hover:scale-110`}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
        <div className="relative z-10">
          {isChatOpen ? <X className="w-8 h-8 text-white" /> : <Bot className="w-8 h-8 text-white" />}
        </div>
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary"></div>
      </button>

      {isChatOpen && (
        <div 
          ref={chatRef}
          className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-2rem)] transition-all duration-300 origin-bottom-right animate-scale-in"
        >
          <div className="relative flex flex-col rounded-3xl bg-card border border-border shadow-2xl backdrop-blur-3xl overflow-hidden max-h-[600px]">
            
            <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-border">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-muted-foreground">Assistente PetCare</span>
              </div>
              <Button 
                onClick={() => setIsChatOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-foreground'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    {msg.options && (
                      <div className="mt-3 space-y-2">
                        {msg.options.map((option, optIndex) => (
                          <Button
                            key={optIndex}
                            onClick={() => handleOptionSelect(option)}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="relative overflow-hidden border-t border-border">
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={3}
                className="w-full px-6 py-4 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder-muted-foreground"
                placeholder="Digite sua mensagem"
              />
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground">
                  <span>{charCount}</span>/<span>{maxChars}</span>
                </div>

                <Button 
                  onClick={handleSend}
                  size="icon"
                  className="rounded-xl"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

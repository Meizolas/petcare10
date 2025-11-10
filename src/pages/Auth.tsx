import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const countryCodes = [
  { code: '+55', country: 'BR', name: 'Brasil' },
  { code: '+1', country: 'US', name: 'EUA' },
  { code: '+44', country: 'GB', name: 'Reino Unido' },
  { code: '+34', country: 'ES', name: 'Espanha' },
  { code: '+351', country: 'PT', name: 'Portugal' },
  { code: '+49', country: 'DE', name: 'Alemanha' },
  { code: '+33', country: 'FR', name: 'França' },
  { code: '+39', country: 'IT', name: 'Itália' },
  { code: '+54', country: 'AR', name: 'Argentina' },
  { code: '+52', country: 'MX', name: 'México' },
];

const signUpSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const resetSchema = z.object({
  email: z.string().email('Email inválido'),
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [countryCode, setCountryCode] = useState('+55');
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [resetEmail, setResetEmail] = useState('');

  // Particles animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;

    const make = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      for (let i = 0; i < count; i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        ctx.fillStyle = `rgba(250,250,250,${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      signUpSchema.parse(signUpData);
      setIsLoading(true);

      const { error } = await signUp(
        signUpData.email,
        signUpData.password,
        signUpData.fullName,
        signUpData.phone
      );

      if (!error) {
        navigate('/');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      signInSchema.parse(signInData);
      setIsLoading(true);

      const { error } = await signIn(signInData.email, signInData.password);

      if (!error) {
        navigate('/');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      resetSchema.parse({ email: resetEmail });
      setIsLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast.error('Erro ao enviar email de recuperação');
      } else {
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setShowResetForm(false);
        setResetEmail('');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ email: error.errors[0].message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="fixed inset-0 bg-zinc-950 text-zinc-50">
      <style>{`
        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .hline,.vline{position:absolute;background:hsl(var(--primary)/ 0.3);will-change:transform,opacity}
        .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .hline:nth-child(1){top:18%;animation-delay:.12s}
        .hline:nth-child(2){top:50%;animation-delay:.22s}
        .hline:nth-child(3){top:82%;animation-delay:.32s}
        .vline:nth-child(4){left:22%;animation-delay:.42s}
        .vline:nth-child(5){left:50%;animation-delay:.54s}
        .vline:nth-child(6){left:78%;animation-delay:.66s}
        .hline::after,.vline::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,hsla(var(--primary),0.4),transparent);opacity:0;animation:shimmer .9s ease-out forwards}
        .hline:nth-child(1)::after{animation-delay:.12s}
        .hline:nth-child(2)::after{animation-delay:.22s}
        .hline:nth-child(3)::after{animation-delay:.32s}
        .vline:nth-child(4)::after{animation-delay:.42s}
        .vline:nth-child(5)::after{animation-delay:.54s}
        .vline:nth-child(6)::after{animation-delay:.66s}
        @keyframes drawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes drawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
        @keyframes shimmer{0%{opacity:0}35%{opacity:.25}100%{opacity:0}}

        .card-animate {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards;
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,hsla(var(--primary),0.1),transparent_60%)]" />

      <div className="accent-lines">
        <div className="hline" />
        <div className="hline" />
        <div className="hline" />
        <div className="vline" />
        <div className="vline" />
        <div className="vline" />
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none"
      />

      <header className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" fill="currentColor" />
          <span className="text-sm font-semibold tracking-wider uppercase">PetCare</span>
        </button>
        <Button
          variant="outline"
          onClick={() => navigate('/contato')}
          className="h-9 rounded-lg border-zinc-800 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80"
        >
          <span className="mr-2">Contato</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </header>

      <div className="h-full w-full grid place-items-center px-4">
        {showResetForm ? (
          <Card className="card-animate w-full max-w-sm border-zinc-800 bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
              <CardDescription className="text-zinc-400">
                Digite seu email para receber o link de recuperação
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleResetPassword} className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="reset-email" className="text-zinc-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="voce@exemplo.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className={`pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 ${errors.email ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                >
                  {isLoading ? 'Enviando...' : 'Enviar Link'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowResetForm(false)}
                  className="w-full text-zinc-400 hover:text-zinc-200"
                >
                  Voltar ao login
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="signin" className="card-animate w-full max-w-md">
            <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-center mb-2">
                  <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
                    <Heart className="h-6 w-6 text-white" fill="white" />
                  </div>
                </div>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-0">
                <TabsContent value="signin" className="mt-0">
                  <form onSubmit={handleSignIn} className="grid gap-5">
                    <div className="grid gap-2">
                      <Label htmlFor="signin-email" className="text-zinc-300">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="voce@exemplo.com"
                          value={signInData.email}
                          onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                          className={`pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 ${errors.email ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="signin-password" className="text-zinc-300">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                          className={`pl-10 pr-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 ${errors.password ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-zinc-400 hover:text-zinc-200"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-end">
                      <button 
                        type="button"
                        onClick={() => setShowResetForm(true)}
                        className="text-sm text-zinc-300 hover:text-zinc-100"
                      >
                        Esqueci a senha
                      </button>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-10 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                    >
                      {isLoading ? 'Entrando...' : 'Continuar'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignUp} className="grid gap-5">
                    <div className="grid gap-2">
                      <Label htmlFor="signup-name" className="text-zinc-300">
                        Nome Completo
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome completo"
                          value={signUpData.fullName}
                          onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                          className={`pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 ${errors.fullName ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="signup-email" className="text-zinc-300">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="voce@exemplo.com"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          className={`pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 ${errors.email ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="signup-phone" className="text-zinc-300">
                        Telefone
                      </Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-[120px] bg-zinc-950 border-zinc-800 text-zinc-50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-950 border-zinc-800">
                            {countryCodes.map((country) => (
                              <SelectItem 
                                key={country.code} 
                                value={country.code}
                                className="text-zinc-50 focus:bg-zinc-800 focus:text-zinc-50"
                              >
                                {country.code} {country.country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="(00) 00000-0000"
                            value={signUpData.phone}
                            onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                            className={`pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 ${errors.phone ? 'border-destructive' : ''}`}
                          />
                        </div>
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="signup-password" className="text-zinc-300">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          className={`pl-10 pr-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 ${errors.password ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-zinc-400 hover:text-zinc-200"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-10 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                    >
                      {isLoading ? 'Cadastrando...' : 'Criar Conta'}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        )}
      </div>
    </section>
  );
}
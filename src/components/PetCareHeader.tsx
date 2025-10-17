import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';

export default function PetCareHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();

  const navLinks = [
    { name: 'Início', href: '/' },
    { name: 'Serviços', href: '/servicos' },
    { name: 'Agendar', href: '/agendar' },
    { name: 'Contato', href: '/contato' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Heart className="h-6 w-6 text-white animate-pulse-slow" fill="white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              PetCare
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/minha-conta"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive('/minha-conta')
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Minha Conta
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive('/admin')
                        ? 'bg-secondary text-secondary-foreground shadow-md'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <Button
                  onClick={signOut}
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Link
                to="/auth"
                className="pet-button text-sm"
              >
                Entrar / Cadastrar
              </Link>
            )}
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/minha-conta"
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive('/minha-conta')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Minha Conta
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive('/admin')
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-all"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="block px-4 py-3 rounded-xl text-sm font-medium bg-primary text-primary-foreground text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Entrar / Cadastrar
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Calendar, ShoppingBag, LogOut, LayoutDashboard, Tag, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ui/theme-toggle';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Agendamentos', href: '/admin', icon: Calendar },
    { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
    { name: 'Cupons', href: '/admin/cupons', icon: Tag },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {adminLinks.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            to={link.href}
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              mobile && "w-full justify-start rounded-lg py-3",
              isActive(link.href)
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-4 w-4" />
            {link.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-3 group">
              <div className="p-2 rounded-2xl bg-primary group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6 md:h-7 md:w-7 text-white" fill="white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl md:text-2xl font-bold text-primary block">PetCare</span>
                <span className="text-xs text-muted-foreground">Painel Administrativo</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <NavLinks />
              <ThemeToggle className="ml-2" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/40 bg-background">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <NavLinks mobile />
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 py-3"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        {children}
      </main>
    </div>
  );
}

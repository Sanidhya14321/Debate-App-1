"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { User, LogOut, Trophy, Settings, Menu, Shield } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"

export function Navigation() {
  const pathname = usePathname()
  const { user, token, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const publicLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
  ]

  const privateLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/debates", label: "Debates" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/tournaments", label: "Tournaments" },
    { href: "/analytics", label: "Analytics" },
  ]

  const links = token ? privateLinks : publicLinks

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  const userDropdownItems = (
    <>
      <DropdownMenuItem asChild className="hover:bg-accent/20 hover:text-foreground">
        <Link href="/profile" className="flex items-center gap-2 text-foreground">
          <User className="h-4 w-4" />
          Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="hover:bg-accent/20 hover:text-foreground">
        <Link href="/achievements" className="flex items-center gap-2 text-foreground">
          <Trophy className="h-4 w-4" />
          Achievements
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="hover:bg-accent/20 hover:text-foreground">
        <Link href="/settings" className="flex items-center gap-2 text-foreground">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </DropdownMenuItem>
      {user?.role === 'admin' && (
        <DropdownMenuItem asChild className="hover:bg-accent/20 hover:text-foreground">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-foreground">
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator className="bg-border" />
      <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300">
        <LogOut className="h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </>
  )

  return (
    <header className="w-full sticky top-0 z-50 px-2 py-2 md:px-4 md:py-3">
      <div className="skeuo-panel rounded-2xl border border-border">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-primary hover:text-accent transition-colors duration-300">
          DebAI
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-all duration-300 text-lg font-medium ${
                pathname === href 
                  ? "text-primary font-bold border-b-2 border-primary pb-1" 
                  : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}

          <ThemeSwitcher />

          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="relative h-10 w-10 rounded-full border border-border">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback 
                      className="text-black font-bold text-sm"
                      style={{ backgroundColor: user?.color || 'var(--primary)' }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-foreground">{user?.username}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                {userDropdownItems}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-foreground hover:text-primary hover:bg-accent/20">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground font-semibold hover:opacity-95 transition-all duration-200">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button variant="ghost" asChild className="text-foreground/85 hover:text-primary hover:bg-accent/20">
                <Link href="/admin/login" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          {token && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="relative h-9 w-9 rounded-full border border-border">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback 
                      className="text-black font-bold text-sm"
                      style={{ backgroundColor: user?.color || 'var(--primary)' }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-foreground">{user?.username}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                {userDropdownItems}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-foreground hover:text-primary hover:bg-accent/20">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card border-border">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="px-2 py-1">
                  <h2 className="text-xl font-bold text-primary">Navigation</h2>
                </div>
                <div className="px-2">
                  <ThemeSwitcher />
                </div>
                
                {links.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleLinkClick}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                      pathname === href 
                        ? "bg-accent/20 text-primary border border-border font-bold" 
                        : "text-foreground/85 hover:text-foreground hover:bg-accent/20"
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                {!token && (
                  <>
                    <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                      <Button variant="ghost" asChild className="justify-start text-foreground hover:text-primary hover:bg-accent/20">
                        <Link href="/login" onClick={handleLinkClick}>Login</Link>
                      </Button>
                      <Button asChild className="justify-start bg-primary text-primary-foreground font-semibold transition-all duration-200">
                        <Link href="/register" onClick={handleLinkClick}>Get Started</Link>
                      </Button>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <Button variant="ghost" asChild className="justify-start text-foreground hover:text-primary hover:bg-accent/20">
                        <Link href="/admin/login" onClick={handleLinkClick} className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin Access
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      </div>
    </header>
  )
}

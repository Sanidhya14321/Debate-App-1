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

export function Navigation() {
  const pathname = usePathname()
  const { user, token, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const publicLinks = [
    { href: "/", label: "Home" },
  ]

  const privateLinks = [
    { href: "/", label: "Home" },
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
      <DropdownMenuItem asChild className="hover:bg-[#ff6b35]/10 hover:text-[#ff6b35]">
        <Link href="/profile" className="flex items-center gap-2 text-white">
          <User className="h-4 w-4" />
          Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="hover:bg-[#ff6b35]/10 hover:text-[#ff6b35]">
        <Link href="/achievements" className="flex items-center gap-2 text-white">
          <Trophy className="h-4 w-4" />
          Achievements
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="hover:bg-[#ff6b35]/10 hover:text-[#ff6b35]">
        <Link href="/settings" className="flex items-center gap-2 text-white">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </DropdownMenuItem>
      {user?.role === 'admin' && (
        <DropdownMenuItem asChild className="hover:bg-[#ff6b35]/10 hover:text-[#ff6b35]">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-white">
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator className="bg-[#ff6b35]/20" />
      <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300">
        <LogOut className="h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </>
  )

  return (
    <header className="w-full border-b border-[#ff6b35]/20 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80 sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-[#ff6b35] hover:text-[#00ff88] transition-colors duration-300">
          DebAI
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-all duration-300 hover:text-[#ff6b35] text-lg font-medium ${
                pathname === href 
                  ? "text-[#ff6b35] font-bold border-b-2 border-[#ff6b35] pb-1" 
                  : "text-white/80 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}

          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-[#ff6b35]/30 hover:border-[#ff6b35]">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback 
                      className="text-black font-bold text-sm"
                      style={{ backgroundColor: user?.color || '#ff6b35' }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black border-[#ff6b35]/30" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-white">{user?.username}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-[#ff6b35]/20" />
                {userDropdownItems}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-white hover:text-[#ff6b35] hover:bg-[#ff6b35]/10">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-[#ff6b35] text-black font-semibold hover:bg-[#ff6b35]/90 border border-[#00ff88] hover:border-[#00ff88]/80 transition-all duration-200">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          {token && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border-2 border-[#ff6b35]/30 hover:border-[#ff6b35]">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback 
                      className="text-black font-bold text-sm"
                      style={{ backgroundColor: user?.color || '#ff6b35' }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black border-[#ff6b35]/30" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-white">{user?.username}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-[#ff6b35]/20" />
                {userDropdownItems}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-white hover:text-[#ff6b35] hover:bg-[#ff6b35]/10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black border-[#ff6b35]/30">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="px-2 py-1">
                  <h2 className="text-xl font-bold text-[#ff6b35]">Navigation</h2>
                </div>
                
                {links.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleLinkClick}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                      pathname === href 
                        ? "bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/50 font-bold" 
                        : "text-white/80 hover:text-white hover:bg-[#ff6b35]/10"
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                {!token && (
                  <div className="flex flex-col space-y-3 pt-4 border-t border-[#ff6b35]/20">
                    <Button variant="ghost" asChild className="justify-start text-white hover:text-[#ff6b35] hover:bg-[#ff6b35]/10">
                      <Link href="/login" onClick={handleLinkClick}>Login</Link>
                    </Button>
                    <Button asChild className="justify-start bg-[#ff6b35] text-black font-semibold hover:bg-[#ff6b35]/90 border border-[#00ff88] hover:border-[#00ff88]/80 transition-all duration-200">
                      <Link href="/register" onClick={handleLinkClick}>Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

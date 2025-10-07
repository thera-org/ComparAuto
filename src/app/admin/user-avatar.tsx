"use client"

import { LogOut, LucideUser } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"


interface UserProps {
  email: string
  photoURL?: string
  displayName?: string
}

export default function UserAvatar() {
  const [user, setUser] = useState<UserProps | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        setUser(null);
        setLoading(false);
        return;
      }
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Error fetching user:", error)
        setLoading(false)
        return
      }

      if (user) {
        setUser({
          email: user.email || "",
          photoURL: user.user_metadata?.avatar_url || "",
          displayName: user.user_metadata?.full_name || "",
        })
      } else {
        setUser(null)
      }

      setLoading(false)
    }

    fetchUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-24 hidden md:block" />
      </div>
    )
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
            {user.photoURL ? (
              <Image
                src={user.photoURL || "/placeholder.svg"}
                alt="User avatar"
                fill
                className="object-cover"
                unoptimized={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <span className="font-medium text-muted-foreground">{user.email?.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <span className="hidden md:inline text-sm font-medium">{user.displayName || user.email?.split("@")[0]}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LucideUser className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

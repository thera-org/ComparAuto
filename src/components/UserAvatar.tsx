"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

interface User {
  email: string;
  photoURL?: string;
  displayName?: string;
}

export default function UserAvatar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
        return;
      }

      if (user) {
        setUser({
          email: user.email || "",
          photoURL: user.user_metadata?.avatar_url || "",
          displayName: user.user_metadata?.full_name || "",
        });
      } else {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt="User avatar"
            fill
            className="object-cover"
            unoptimized={true} // Remove se configurou domínios no next.config.js
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <span className="font-medium text-gray-600">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <span className="hidden md:inline">
        {user.displayName || user.email?.split("@")[0]}
      </span>
    </div>
  );
}
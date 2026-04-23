"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function UserMenu({ user }: { user: any }) {
  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      {user.image ? (
        <img
          src={user.image}
          alt={user.name || "Avatar"}
          className="h-10 w-10 rounded-full bg-white/10 object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-medium">
          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <span className="truncate text-sm font-medium text-white">
          {user.name}
        </span>
        <span className="truncate text-xs text-white/60">{user.email}</span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-md p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

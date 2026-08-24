"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return <Button variant="outline" onClick={() => void signOut({ callbackUrl: "/" })}><LogOut size={18} aria-hidden="true" />Выйти</Button>;
}

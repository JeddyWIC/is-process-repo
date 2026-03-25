"use client";

import PasswordGate from "@/components/PasswordGate";

export default function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  return (
    <PasswordGate>
      {children}
    </PasswordGate>
  );
}

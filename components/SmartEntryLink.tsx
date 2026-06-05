"use client";

import { getCurrentUser } from "@/lib/user-store";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export default function SmartEntryLink({
  children,
  className,
  authenticatedHref = "/tools",
  guestHref = "/register"
}: {
  children: ReactNode;
  className: string;
  authenticatedHref?: string;
  guestHref?: string;
}) {
  const [href, setHref] = useState(guestHref);

  useEffect(() => {
    async function refreshHref() {
      setHref((await getCurrentUser()) ? authenticatedHref : guestHref);
    }

    refreshHref();
    window.addEventListener("storage", refreshHref);
    window.addEventListener("ai-toolbox-user-updated", refreshHref);
    return () => {
      window.removeEventListener("storage", refreshHref);
      window.removeEventListener("ai-toolbox-user-updated", refreshHref);
    };
  }, [authenticatedHref, guestHref]);

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

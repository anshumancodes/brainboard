"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "./lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/dashboard");
    } else {
      router.replace("/signin");
    }
  }, [router]);

  return (
    <div className="page-center">
      <div className="bg-mesh" />
      <div className="spinner" />
    </div>
  );
}
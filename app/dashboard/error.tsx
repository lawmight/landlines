"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard failed to load</CardTitle>
          <CardDescription>We could not load your inner circle and call data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset}>Retry dashboard</Button>
        </CardContent>
      </Card>
    </main>
  );
}

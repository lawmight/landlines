"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
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
    <div className="app-shell min-h-screen">
      <main id="main" className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-10">
        <Card className="w-full">
          <CardHeader>
            <p className="label-caps">Application error</p>
            <CardTitle className="display-serif mt-1 text-4xl font-normal">Something went wrong</CardTitle>
            <CardDescription>The page crashed unexpectedly. Try reloading this view.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={reset}>Try again</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

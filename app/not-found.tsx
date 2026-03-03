import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound(): React.JSX.Element {
  return (
    <div className="app-shell min-h-screen">
      <main id="main" className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-10">
        <Card className="w-full">
          <CardHeader>
            <p className="label-caps">404</p>
            <CardTitle className="display-serif mt-1 text-4xl font-normal">Page not found</CardTitle>
            <CardDescription>This route does not exist or may have been moved.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className="landing-btn landing-btn-primary">
              Back to dashboard
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

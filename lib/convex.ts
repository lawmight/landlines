import { ConvexReactClient } from "convex/react";

import { env } from "@/lib/env";

export const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

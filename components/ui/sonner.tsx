"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps): React.JSX.Element {
  const { theme = "system" } = useTheme();

  return <Sonner theme={theme as ToasterProps["theme"]} {...props} />;
}

import { useState, useCallback } from "react";

export const useCopyToClipboard = (text: string | undefined) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  }, [text]);

  return [copied, copy] as const;
};

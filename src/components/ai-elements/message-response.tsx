"use client";

import type { DiagramPlugin, MermaidConfig } from "@streamdown/mermaid";
import type { PluginConfig, StreamdownProps } from "streamdown";
import { Streamdown } from "streamdown";
import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type MessageResponseProps = StreamdownProps;

type CjkPlugin = NonNullable<PluginConfig["cjk"]>;
type CodePlugin = NonNullable<PluginConfig["code"]>;
type MathPlugin = NonNullable<PluginConfig["math"]>;

let cjkPluginPromise: Promise<CjkPlugin> | undefined;
let codePluginPromise: Promise<CodePlugin> | undefined;
let mathPluginPromise: Promise<MathPlugin> | undefined;

function loadCjkPlugin() {
  return (cjkPluginPromise ??= import("@streamdown/cjk").then(
    (module) => module.cjk,
  ));
}

function loadCodePlugin() {
  return (codePluginPromise ??= import("@streamdown/code").then(
    (module) => module.code,
  ));
}

function loadMathPlugin() {
  return (mathPluginPromise ??= import("@streamdown/math").then(
    (module) => module.math,
  ));
}

// Mermaid's engine is only downloaded when an actual Mermaid block renders.
const mermaid: DiagramPlugin = {
  name: "mermaid",
  type: "diagram",
  language: "mermaid",
  getMermaid(initialConfig) {
    let config: MermaidConfig | undefined = initialConfig;
    return {
      initialize(nextConfig) {
        config = nextConfig;
      },
      async render(id, source) {
        const { createMermaidPlugin } = await import("@streamdown/mermaid");
        return createMermaidPlugin().getMermaid(config).render(id, source);
      },
    };
  },
};

export const MessageResponse = memo(
  ({ className, ...props }: MessageResponseProps) => {
    const markdown = typeof props.children === "string" ? props.children : "";
    const needsCjk = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/u.test(
      markdown,
    );
    const needsCode = Array.from(
      markdown.matchAll(/(?:^|\n)\s*(?:```|~~~)\s*([^\s`]*)/g),
    ).some((match) => match[1]?.toLowerCase() !== "mermaid");
    const needsMath =
      markdown.includes("$$") ||
      markdown.includes("\\(") ||
      markdown.includes("\\[");
    const [plugins, setPlugins] = useState<PluginConfig>({ mermaid });

    useEffect(() => {
      const loaded: PluginConfig = {};
      const requests: Promise<void>[] = [];
      let active = true;

      if (needsCjk && !plugins.cjk) {
        requests.push(
          loadCjkPlugin().then((plugin) => {
            loaded.cjk = plugin;
          }),
        );
      }
      if (needsCode && !plugins.code) {
        requests.push(
          loadCodePlugin().then((plugin) => {
            loaded.code = plugin;
          }),
        );
      }
      if (needsMath && !plugins.math) {
        requests.push(
          loadMathPlugin().then((plugin) => {
            loaded.math = plugin;
          }),
        );
      }

      if (requests.length > 0) {
        void Promise.all(requests)
          .then(() => {
            if (active)
              setPlugins((current) => ({ ...current, ...loaded, mermaid }));
          })
          .catch(() => undefined);
      }

      return () => {
        active = false;
      };
    }, [
      needsCjk,
      needsCode,
      needsMath,
      plugins.cjk,
      plugins.code,
      plugins.math,
    ]);

    return (
      <Streamdown
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          className,
        )}
        plugins={plugins}
        {...props}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    nextProps.isAnimating === prevProps.isAnimating,
);

MessageResponse.displayName = "MessageResponse";

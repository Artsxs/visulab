"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const INDICATOR = {
  type: "spring",
  stiffness: 620,
  damping: 42,
  mass: 0.35,
} as const;

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const PANEL = {
  type: "spring",
  stiffness: 460,
  damping: 38,
  mass: 0.8,
} as const;

export type TabItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type TabsActivation = "automatic" | "manual";
export type UseTabsOptions = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  activation?: TabsActivation;
};

export function useTabs({
  items,
  value: controlled,
  defaultValue,
  onValueChange,
  activation = "automatic",
}: UseTabsOptions) {
  const base = useId();
  const nodes = useRef(new Map<string, HTMLButtonElement>());
  const direction = useRef(1);

  const [internal, setInternal] = useState(
    () =>
      defaultValue ??
      items.find((i) => !i.disabled)?.value ??
      items[0]?.value ??
      "",
  );

  const value = controlled ?? internal;

  const emit = useRef(onValueChange);
  emit.current = onValueChange;

  const select = useCallback(
    (next: string) => {
      if (next === value) return;
      const from = items.findIndex((i) => i.value === value);
      const to = items.findIndex((i) => i.value === next);
      direction.current = to < from ? -1 : 1;
      if (controlled === undefined) setInternal(next);
      emit.current?.(next);
    },
    [controlled, items, value],
  );

  const focusAt = useCallback(
    (i: number) => {
      const item = items[i];
      if (!item) return;
      nodes.current.get(item.value)?.focus();
    },
    [items],
  );

  const nextEnabled = useCallback(
    (from: number, dir: number) => {
      const n = items.length;
      let i = from < 0 ? 0 : from;
      for (let k = 0; k < n; k += 1) {
        i = (i + dir + n) % n;
        if (!items[i].disabled) return i;
      }
      return from;
    },
    [items],
  );

  const endStop = useCallback(
    (dir: number) => {
      const n = items.length;
      if (dir > 0) {
        for (let i = 0; i < n; i += 1) if (!items[i].disabled) return i;
      } else {
        for (let i = n - 1; i >= 0; i -= 1) if (!items[i].disabled) return i;
      }
      return 0;
    },
    [items],
  );

  const getTabProps = useCallback(
    (item: TabItem, index: number) => ({
      id: `${base}-tab-${item.value}`,
      role: "tab" as const,
      type: "button" as const,
      "aria-selected": item.value === value,
      "aria-controls": `${base}-panel-${item.value}`,
      "aria-disabled": item.disabled ? (true as const) : undefined,
      tabIndex: item.value === value ? 0 : -1,
      ref: (node: HTMLButtonElement | null) => {
        if (node) nodes.current.set(item.value, node);
        else nodes.current.delete(item.value);
      },
      onClick: () => {
        if (!item.disabled) select(item.value);
      },
      onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const to = nextEnabled(index, e.key === "ArrowRight" ? 1 : -1);
          focusAt(to);
          if (activation === "automatic") select(items[to].value);
          return;
        }
        if (e.key === "Home" || e.key === "End") {
          e.preventDefault();
          const to = endStop(e.key === "Home" ? 1 : -1);
          focusAt(to);
          if (activation === "automatic") select(items[to].value);
          return;
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!item.disabled) select(item.value);
        }
      },
    }),
    [activation, base, endStop, focusAt, items, nextEnabled, select, value],
  );

  const getPanelProps = useCallback(
    (panelValue: string) => ({
      id: `${base}-panel-${panelValue}`,
      role: "tabpanel" as const,
      "aria-labelledby": `${base}-tab-${panelValue}`,
      hidden: panelValue !== value,
      tabIndex: 0,
    }),
    [base, value],
  );

  return {
    value,
    select,
    direction: direction.current,
    getTabProps,
    getPanelProps,
    tablistProps: {
      role: "tablist" as const,
      "aria-orientation": "horizontal" as const,
    },
  };
}

export type TabsProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  activation?: TabsActivation;
  className?: string;
  tablistClassName?: string;
  tabClassName?: string;
  panelClassName?: string;
  renderIndicator?: () => ReactNode;
  children?: (helpers: {
    value: string;
    getPanelProps: (value: string) => {
      id: string;
      role: "tabpanel";
      "aria-labelledby": string;
      hidden: boolean;
      tabIndex: number;
    };
    direction: number;
  }) => ReactNode;
};

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  activation = "automatic",
  className = "",
  tablistClassName = "",
  tabClassName = "",
  panelClassName = "",
  renderIndicator,
  children,
}: TabsProps) {
  const tabs = useTabs({
    items,
    value,
    defaultValue,
    onValueChange,
    activation,
  });

  const shouldReduceMotion = useReducedMotion();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tablistRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const list = tablistRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLButtonElement>(
      `[role="tab"][aria-selected="true"]`,
    );
    if (!active) return;
    const lRect = list.getBoundingClientRect();
    const tRect = active.getBoundingClientRect();
    setIndicatorStyle({
      left: tRect.left - lRect.left,
      width: tRect.width,
    });
  }, [tabs.value, items]);

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={tablistRef}
        {...tabs.tablistProps}
        className={`relative flex items-center gap-1 rounded-xl bg-muted/60 p-1 backdrop-blur-sm border border-border/40 ${tablistClassName}`}
      >
        {items.map((item, index) => {
          const props = tabs.getTabProps(item, index);
          const active = item.value === tabs.value;
          return (
            <button
              key={item.value}
              {...props}
              className={`relative z-10 flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              } ${item.disabled ? "pointer-events-none opacity-40" : ""} ${tabClassName}`}
            >
              {item.label}
            </button>
          );
        })}
        {indicatorStyle.width > 0 && (
          <motion.div
            aria-hidden="true"
            className="absolute top-1 bottom-1 rounded-lg bg-background shadow-xs pointer-events-none"
            initial={false}
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            transition={shouldReduceMotion ? { duration: 0 } : INDICATOR}
          >
            {renderIndicator?.()}
          </motion.div>
        )}
      </div>

      <div className={`mt-3 ${panelClassName}`}>
        {children ? (
          children({
            value: tabs.value,
            getPanelProps: tabs.getPanelProps,
            direction: tabs.direction,
          })
        ) : (
          <div {...tabs.getPanelProps(tabs.value)}>
            {/* Consumer can also provide custom panels via children */}
          </div>
        )}
      </div>
    </div>
  );
}

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Search, RefreshCw, AlertCircle, CheckCircle2, X } from "lucide-react";

import { Input } from "./input";
import { Button } from "./button";
import { Badge } from "./badge";
import { Alert, AlertDescription } from "./alert";
import { Spinner } from "./spinner";

import { cn } from "@/lib/utils";
import {
  useSkuSearchState,
  useSkuSearchActions,
  useConfigurationState,
  useAvailableProductLines,
} from "@/store";
import type { SkuSegmentMatch, SkuSearchResult } from "@/store/types";
import { splitSkuInput } from "@/services/sku-parser";
import {
  createSkuAutocompleteContext,
  fetchBaseSkuSuggestions,
  getSegmentOrderItem,
  getSegmentSuggestionsForContext,
  type BaseSkuSuggestion,
  type SegmentSuggestion,
  type SkuAutocompleteContext,
} from "@/services/sku-autocomplete";

const SEGMENT_STATUS_STYLES: Record<
  SkuSegmentMatch["status"],
  { className: string; icon: ReactNode }
> = {
  exact: {
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    icon: <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
  partial: {
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    icon: <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
  ambiguous: {
    className: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    icon: <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
  not_found: {
    className: "bg-destructive/10 text-destructive",
    icon: <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
  missing: {
    className: "bg-muted text-muted-foreground",
    icon: <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
  skipped: {
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    icon: <RefreshCw className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
};

interface SuggestionItem {
  key: string;
  primary: string;
  secondary?: string | null;
  meta?: string | null;
  type: "base" | "segment";
  base?: BaseSkuSuggestion;
  segment?: SegmentSuggestion;
}

interface SkuSearchInputProps {
  onApplied?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}

function formatTableName(name: string): string {
  if (!name) return "";
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getConfidenceBadgeStyles(
  confidence: SkuSearchResult["confidence"],
): string {
  switch (confidence) {
    case "exact":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "partial":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "ambiguous":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-300";
    case "invalid":
    default:
      return "bg-destructive/10 text-destructive";
  }
}

function buildAiNarrative(result: SkuSearchResult, fullSku: string): string {
  const baseLabel = fullSku;

  const segmentSnippets = result.segments
    .filter((segment) => segment.segment)
    .map((segment) => `${formatTableName(segment.tableName)} ${segment.segment}`);

  let confidenceSummary = "is ready for review.";
  switch (result.confidence) {
    case "exact":
      confidenceSummary = "is a verified match.";
      break;
    case "partial":
      confidenceSummary = "closely matches, but needs a manual confirmation.";
      break;
    case "ambiguous":
      confidenceSummary = "has conflicting matches; review each segment.";
      break;
    case "invalid":
      confidenceSummary = "could not be resolved with the current rules.";
      break;
    default:
      break;
  }

  const segmentSummary = segmentSnippets.length
    ? ` Key segments: ${segmentSnippets.join(", ")}.`
    : "";

  const issueSummary = result.issues.length
    ? ` Attention: ${result.issues.join("; ")}.`
    : "";

  const summary = `${baseLabel} ${confidenceSummary}${segmentSummary}${issueSummary}`.trim();
  return `${summary} Clicking 'Apply configuration' will adjust your SKU search to the closest possible match.`;
}

export function SkuSearchInput({ onApplied, onClose, isOpen }: SkuSearchInputProps): JSX.Element {
  const { skuSearchQuery, skuSearchResults, isSearchingSku, skuSearchError } =
    useSkuSearchState();
  const { searchBySku, applySkuResult, clearSkuSearch } = useSkuSearchActions();
  const { currentProductLine } = useConfigurationState();
  const availableProductLines = useAvailableProductLines();

  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [context, setContext] = useState<SkuAutocompleteContext | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [suggestionHeading, setSuggestionHeading] = useState<string | null>(
    null,
  );
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    setInputValue(skuSearchQuery);
  }, [skuSearchQuery]);

  useEffect(() => {
    if (!isOpen) return;
    setInputValue("");
    setIsInputFocused(false);
    setContext(null);
    setSuggestions([]);
    setSuggestionHeading(null);
    setSuggestionError(null);
    setHighlightedIndex(-1);
    suggestionRefs.current = [];
    clearSkuSearch();
  }, [isOpen, clearSkuSearch]);

  useEffect(() => {
    if (highlightedIndex >= 0) {
      suggestionRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  const segments = useMemo(() => splitSkuInput(inputValue), [inputValue]);
  const activeSegmentIndex = useMemo(
    () => (segments.length === 0 ? 0 : segments.length - 1),
    [segments],
  );
  const activeSegmentValue = segments[activeSegmentIndex] ?? "";
  const baseSegment = segments[0]?.trim() ?? "";
  const segmentOrderIndex = activeSegmentIndex - 1; // Offset for base segment

  useEffect(() => {
    if (!context) return;
    if (baseSegment.toLowerCase() !== context.base.productSku.toLowerCase()) {
      setContext(null);
    }
  }, [baseSegment, context]);

  const productLineNameMap = useMemo(() => {
    const map = new Map<number, string>();
    availableProductLines.forEach((line) => {
      map.set(line.id, line.name);
    });
    return map;
  }, [availableProductLines]);

  const buildBaseSuggestionItems = useCallback(
    (items: BaseSkuSuggestion[]): SuggestionItem[] =>
      items.map((suggestion) => ({
        key: suggestion.id,
        type: "base" as const,
        base: suggestion,
        primary: suggestion.productSku,
        secondary: suggestion.productName,
        meta:
          suggestion.productLineId !== null &&
          suggestion.productLineId !== undefined
            ? (productLineNameMap.get(suggestion.productLineId) ??
              `Line ${suggestion.productLineId}`)
            : null,
      })),
    [productLineNameMap],
  );

  const buildSegmentSuggestionItems = useCallback(
    (items: SegmentSuggestion[]): SuggestionItem[] =>
      items.map((suggestion) => ({
        key: suggestion.id,
        type: "segment" as const,
        segment: suggestion,
        primary: suggestion.label,
        secondary: suggestion.description,
        meta: formatTableName(suggestion.tableName),
      })),
    [],
  );

  const loadSuggestions = useCallback(
    async (segmentIndex: number, query: string) => {
      if (!isInputFocused) {
        return;
      }

      setIsFetchingSuggestions(true);
      setSuggestionError(null);

      try {
        let nextSuggestions: SuggestionItem[] = [];
        let heading: string | null = null;

        if (segmentIndex <= 0) {
          const baseResults = await fetchBaseSkuSuggestions(query);
          nextSuggestions = buildBaseSuggestionItems(baseResults);
          heading = "Products";
        } else if (!context) {
          nextSuggestions = [];
          heading = null;
          setSuggestionError("Select a product base first.");
        } else {
          const orderItem = getSegmentOrderItem(context, segmentIndex - 1);
          if (!orderItem || !orderItem.sku_code_item) {
            nextSuggestions = [];
            heading = null;
          } else {
            const segmentResults = getSegmentSuggestionsForContext(
              context,
              segmentIndex - 1,
              query,
            );
            nextSuggestions = buildSegmentSuggestionItems(segmentResults);
            heading = `Segment: ${formatTableName(orderItem.sku_code_item)}`;

            if (segmentResults.length === 0) {
              setSuggestionError(
                `No available options for ${formatTableName(orderItem.sku_code_item)}.`,
              );
            }
          }
        }

        setSuggestionHeading(heading);
        setSuggestions(nextSuggestions);
        setHighlightedIndex(nextSuggestions.length > 0 ? 0 : -1);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load suggestions.";
        setSuggestionError(message);
        setSuggestions([]);
        setHighlightedIndex(-1);
      } finally {
        setIsFetchingSuggestions(false);
      }
    },
    [
      buildBaseSuggestionItems,
      buildSegmentSuggestionItems,
      context,
      isInputFocused,
    ],
  );

  useEffect(() => {
    if (!isInputFocused) {
      return;
    }

    const handler = window.setTimeout(() => {
      void loadSuggestions(activeSegmentIndex, activeSegmentValue.trim());
    }, 200);

    return () => {
      window.clearTimeout(handler);
    };
  }, [isInputFocused, loadSuggestions, activeSegmentIndex, activeSegmentValue]);

  const disableApplyForResult = useMemo(
    () => (result: SkuSearchResult) =>
      result.confidence === "invalid" || result.confidence === "ambiguous",
    [],
  );

  const handleSuggestionSelect = useCallback(
    async (item: SuggestionItem) => {
      if (item.type === "base" && item.base) {
        setIsFetchingSuggestions(true);
        try {
          const nextContext = await createSkuAutocompleteContext(item.base);
          setContext(nextContext);

          const hasMoreSegments = nextContext.segmentOrder.length > 0;
          const nextValue = hasMoreSegments
            ? `${item.base.productSku}-`
            : item.base.productSku;

          setInputValue(nextValue);
          setSuggestions([]);
          setSuggestionHeading(null);
          setHighlightedIndex(-1);
          setSuggestionError(null);
          setIsInputFocused(true);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load product options for this SKU.";
          setSuggestionError(message);
          setContext(null);
        } finally {
          setIsFetchingSuggestions(false);
        }
        return;
      }

      if (item.type === "segment" && item.segment && context) {
        const orderIndex = segmentOrderIndex;
        if (orderIndex < 0) return;

        const currentSegments = splitSkuInput(inputValue);
        while (currentSegments.length <= activeSegmentIndex) {
          currentSegments.push("");
        }

        currentSegments[activeSegmentIndex] = item.segment.skuCode;
        const truncated = currentSegments.slice(0, activeSegmentIndex + 1);
        let nextValue = truncated.join("-");

        const hasMoreSegments = context.segmentOrder.length > orderIndex + 1;
        if (hasMoreSegments) {
          nextValue = `${nextValue}-`;
        }

        setInputValue(nextValue);
        setSuggestions([]);
        setSuggestionHeading(null);
        setHighlightedIndex(-1);
        setSuggestionError(null);
        setIsInputFocused(hasMoreSegments);
      }
    },
    [activeSegmentIndex, context, inputValue, segmentOrderIndex],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement> | null) => {
      if (event) {
        event.preventDefault();
      }

      const query = inputValue.trim();
      if (!query) {
        clearSkuSearch();
        setContext(null);
        return;
      }

      setIsSubmitting(true);
      try {
        await searchBySku(query);
      } finally {
        setIsSubmitting(false);
        setIsInputFocused(false);
      }
    },
    [clearSkuSearch, inputValue, searchBySku],
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        if (suggestions.length === 0) return;
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev + 1;
          return next >= suggestions.length ? 0 : next;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        if (suggestions.length === 0) return;
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? suggestions.length - 1 : next;
        });
        return;
      }

      if (event.key === "Enter") {
        if (event.metaKey) {
          event.preventDefault();
          void handleSubmit(null);
          return;
        }

        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          event.preventDefault();
          void handleSuggestionSelect(suggestions[highlightedIndex]);
        }
      }

      if (event.key === "Escape") {
        setIsInputFocused(false);
        setSuggestions([]);
        setSuggestionHeading(null);
        setSuggestionError(null);
      }
    },
    [handleSubmit, handleSuggestionSelect, highlightedIndex, suggestions],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      setIsInputFocused(true);
      setSuggestionError(null);
    },
    [],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    setIsInputFocused(false);
    setContext(null);
    clearSkuSearch();
  }, [clearSkuSearch]);

  const showSuggestions =
    isInputFocused &&
    (isFetchingSuggestions ||
      suggestionError !== null ||
      suggestions.length > 0);

  const hasResults = skuSearchResults.length > 0;
  suggestionRefs.current = [];

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          <span className="relative flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        Search Assistant
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close SKU Search"
          onClick={() => onClose?.()}
          className="h-8 w-8 text-slate-500 hover:text-slate-900"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              SKU search assistant
            </h2>
            <p className="text-sm text-slate-600">
              Enter a full or partial SKU to explore likely matches. The assistant surfaces likely SKUs based on the segments you enter.
            </p>
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="sku-search-input"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
              >
                Query
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Search className="h-4 w-4" aria-hidden="true" />
                </div>
                <Input
                  id="sku-search-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Enter a full or partial SKU (e.g. L23i-2436-S-27-N-1-AF)"
                  autoComplete="off"
                  className="h-12 rounded-xl border-slate-200 bg-white pl-10 text-base shadow-sm transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200/70"
                />
                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[200] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    {suggestionHeading && (
                      <div className="border-b border-slate-200/80 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {suggestionHeading}
                      </div>
                    )}
                    {isFetchingSuggestions ? (
                      <div className="flex items-center gap-2 px-4 py-4 text-sm text-slate-500">
                        <Spinner className="h-4 w-4" />
                        Synthesizing suggestions…
                      </div>
                    ) : suggestionError ? (
                      <div className="px-4 py-4 text-sm text-rose-500">
                        {suggestionError}
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-slate-500">
                        No structured suggestions available yet.
                      </div>
                    ) : (
                    <ul className="max-h-64 overflow-y-auto py-2">
                      {suggestions.map((suggestion, index) => (
                        <li key={suggestion.key}>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => void handleSuggestionSelect(suggestion)}
                            ref={(element) => {
                              suggestionRefs.current[index] = element;
                            }}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition",
                              index === highlightedIndex
                                  ? "bg-slate-100"
                                  : "hover:bg-slate-50",
                              )}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900">
                                  {suggestion.primary}
                                </span>
                                {suggestion.secondary && (
                                  <span className="text-xs text-slate-500">
                                    {suggestion.secondary}
                                  </span>
                                )}
                              </div>
                              {suggestion.meta && (
                                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                                  {suggestion.meta}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                disabled={isSearchingSku || isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
              >
                {isSearchingSku || isSubmitting ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Search className="h-4 w-4" aria-hidden="true" />
                )}
                Search
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                disabled={isSearchingSku || (!skuSearchQuery && !inputValue)}
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 sm:w-auto"
              >
                Clear session
              </Button>
            </div>
          </form>

          {!hasResults && (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-slate-900">1. Start with the base segment</span>
                    <p className="text-xs text-slate-500">
                      Type the product line prefix or full SKU to begin your search.
                    </p>
                  </div>
                  <kbd className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    L23i
                  </kbd>
                </li>
                <li className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-slate-900">2. Navigate suggestions</span>
                    <p className="text-xs text-slate-500">
                      Use the arrow keys to highlight auto-suggestions as they appear.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-700">
                    <kbd className="rounded bg-slate-200 px-1.5 py-0.5 font-semibold">↑</kbd>
                    <kbd className="rounded bg-slate-200 px-1.5 py-0.5 font-semibold">↓</kbd>
                  </div>
                </li>
                <li className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-slate-900">3. Press Enter to add segments</span>
                    <p className="text-xs text-slate-500">
                      After each segment, press Enter to confirm it and move to the next.
                    </p>
                  </div>
                  <kbd className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    Enter
                  </kbd>
                </li>
              </ol>
              <p className="mt-3 text-xs text-slate-500">
                <span className="font-semibold">*</span> Results may adjust certain options after applying while we reconcile configuration rules.
              </p>
            </div>
          )}

          {skuSearchError && (
            <Alert variant="destructive" className="border-rose-200 bg-rose-50/80">
              <AlertDescription>{skuSearchError}</AlertDescription>
            </Alert>
          )}

          <div
            className="space-y-6"
            aria-live="polite"
            aria-busy={isSearchingSku}
          >
            {hasResults &&
              skuSearchResults.map((result) => {
                const confidenceLabel =
                  result.confidence.charAt(0).toUpperCase() +
                  result.confidence.slice(1);
                const disableApply = disableApplyForResult(result);
                const fullSkuLabel =
                  (skuSearchQuery && skuSearchQuery.trim()) ||
                  (inputValue && inputValue.trim()) ||
                  result.productSku ||
                  "SKU match";
                const productLineLabel =
                  (typeof result.productLineId === "number"
                    ? productLineNameMap.get(result.productLineId)
                    : undefined) ?? currentProductLine?.name ?? "Product Line";

                const narrative = buildAiNarrative(result, fullSkuLabel);

                return (
                  <article
                    key={result.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-slate-200 hover:shadow-md"
                  >
                    <div className="pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-blue-200/40 via-purple-200/30 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="relative z-10 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {fullSkuLabel}
                          </p>
                          <p className="text-sm text-slate-500">
                            Product Line • {productLineLabel}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                            getConfidenceBadgeStyles(result.confidence),
                          )}
                        >
                          {confidenceLabel}
                        </Badge>
                      </div>

                      <p className="text-sm leading-6 text-slate-600">{narrative}</p>

                      <div className="flex flex-wrap gap-2">
                        {result.segments.map((segment) => {
                          const statusStyle = SEGMENT_STATUS_STYLES[segment.status];
                          const value = segment.segment ?? "—";
                          const label = `${formatTableName(segment.tableName)}: ${value}`;

                          return (
                            <Badge
                              key={`${result.id}-${segment.tableName}-${segment.order}-${value}`}
                              className={cn(
                                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                                statusStyle.className,
                              )}
                            >
                              {statusStyle.icon}
                              {label}
                            </Badge>
                          );
                        })}
                      </div>

                      {result.issues.length > 0 && (
                        <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 text-xs text-amber-800">
                          <p className="mb-1 font-semibold uppercase tracking-[0.2em]">
                            Review required
                          </p>
                          <ul className="list-disc space-y-1 pl-4">
                            {result.issues.map((issue, index) => (
                              <li key={`${result.id}-issue-${index}`}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant={disableApply ? "outline" : "default"}
                          disabled={disableApply}
                          onClick={async () => {
                            await applySkuResult(result);
                            onApplied?.();
                          }}
                          className={cn(
                            "rounded-full px-5 py-2 text-sm font-semibold",
                            disableApply
                              ? "border-slate-200 text-slate-400"
                              : "bg-slate-900 text-white hover:bg-slate-800",
                          )}
                        >
                          {disableApply ? "Resolve issues first" : "Apply configuration"}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

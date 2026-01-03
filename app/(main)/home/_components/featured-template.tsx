"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LayoutTemplateIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";

export const FeaturedTemplate = () => {
  const templates = useQuery(api.documents.getTemplates);
  const router = useRouter();
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeftState, setCanScrollLeftState] = useState(false);
  const [canScrollRightState, setCanScrollRightState] = useState(false);

  const CARD_WIDTH = 240;
  const GAP = 12;
  const VISIBLE_CARDS = 2.8;

  const updateScrollState = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeftState(scrollLeft > 0);
    setCanScrollRightState(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    updateScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollState);
      return () => container.removeEventListener("scroll", updateScrollState);
    }
  }, [templates, updateScrollState]);

  const handleTemplateClick = (templateId: string) => {
    router.push(`/templates/${templateId}`);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = (CARD_WIDTH + GAP) * 2;
    const newScrollLeft =
      direction === "left"
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex justify-center py-8">
      <div className="w-[60%]">
        <div className="flex items-center gap-2 mb-4">
          <LayoutTemplateIcon className="h-4 w-4" />
          <span className="font-medium">Featured templates</span>
        </div>
        <div
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left scroll button */}
          <button
            onClick={() => scroll("left")}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 transition-opacity duration-200",
              isHovered && canScrollLeftState
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Right scroll button */}
          <button
            onClick={() => scroll("right")}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 transition-opacity duration-200",
              isHovered && canScrollRightState
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Gradient fade on right */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-[#1f1f1f] to-transparent z-10 pointer-events-none" />

          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{
              width: `${VISIBLE_CARDS * CARD_WIDTH + (VISIBLE_CARDS - 1) * GAP}px`,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {templates.map((template) => (
              <div
                key={template._id}
                onClick={() => handleTemplateClick(template._id)}
                className="w-[240px] h-[150px] flex-shrink-0 rounded-lg cursor-pointer hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col overflow-hidden"
              >
                <div className="h-[44px] bg-gray-100 dark:bg-gray-900/50 flex items-center px-3">
                  {template.icon ? (
                    <span className="text-2xl">{template.icon}</span>
                  ) : (
                    <LayoutTemplateIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>

                <div className="flex-1 px-3 pb-3 pt-2 flex flex-col justify-between">
                  <p
                    className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-100"
                    title={template.title}
                  >
                    {template.title}
                  </p>

                  <div className="flex items-center gap-1.5 mt-auto">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        By {user?.username}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

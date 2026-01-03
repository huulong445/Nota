import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { FileText, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export const FavoriteDocuments = () => {
  const favorites = useQuery(api.documents.getFavorites);
  const toggleFavorite = useMutation(api.documents.toggleFavorite);
  const router = useRouter();
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeftState, setCanScrollLeftState] = useState(false);
  const [canScrollRightState, setCanScrollRightState] = useState(false);

  const CARD_WIDTH = 144;
  const GAP = 12;
  const VISIBLE_CARDS = 4.5;

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
  }, [favorites, updateScrollState]);

  const handleDocumentClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const handleRemoveFavorite = (e: React.MouseEvent, documentId: string) => {
    e.stopPropagation();
    const promise = toggleFavorite({ id: documentId as Id<"documents"> });
    toast.promise(promise, {
      loading: "Removing from favorites...",
      success: "Removed from favorites",
      error: "Failed to remove from favorites",
    });
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = (CARD_WIDTH + GAP) * 4;
    const newScrollLeft =
      direction === "left"
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  if (!favorites || favorites.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex justify-center py-8">
      <div className="w-[60%]">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">Favorites</span>
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
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-[#1f1f1f] to-transparent z-10 pointer-events-none" />

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
            {favorites.map((doc) => (
              <div
                key={doc._id}
                onClick={() => handleDocumentClick(doc._id)}
                className="w-[144px] h-[144px] flex-shrink-0 rounded-lg cursor-pointer hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col overflow-hidden group/card relative"
              >
                {/* Star button to remove from favorites */}
                <button
                  onClick={(e) => handleRemoveFavorite(e, doc._id)}
                  className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity z-10 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Remove from favorites"
                >
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </button>

                <div className="h-[44px] bg-yellow-50 dark:bg-yellow-900/20 flex items-center px-3">
                  {doc.icon ? (
                    <span className="text-2xl">{doc.icon}</span>
                  ) : (
                    <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>

                <div className="flex-1 px-3 pb-3 pt-2 flex flex-col justify-between">
                  <p
                    className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-100"
                    title={doc.title}
                  >
                    {doc.title}
                  </p>

                  <div className="flex items-center gap-1.5 mt-auto">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
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

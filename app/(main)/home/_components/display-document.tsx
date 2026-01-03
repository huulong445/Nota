import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Clock, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/clerk-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

export const DisplayDocument = () => {
  const documents = useQuery(api.documents.getSearch);
  const router = useRouter();
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const CARD_WIDTH = 144;
  const GAP = 12;
  const VISIBLE_CARDS = 4.5;

  const getTimeAgo = (modifiedTime?: number) => {
    if (!modifiedTime) return "Unknown";

    const now = Date.now();
    const diff = now - modifiedTime;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(modifiedTime).toLocaleDateString();
  };

  const handleDocumentClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
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

  const canScrollLeft = () => {
    if (!scrollContainerRef.current) return false;
    return scrollContainerRef.current.scrollLeft > 0;
  };

  const canScrollRight = () => {
    if (!scrollContainerRef.current || !documents) return false;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    return scrollLeft < scrollWidth - clientWidth - 10;
  };

  return (
    <div className="w-full flex justify-center py-8">
      <div className="w-[60%]">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Recently visited</span>
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
              isHovered && canScrollLeft()
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
              isHovered && canScrollRight()
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
            {documents?.map((doc) => (
              <div
                key={doc._id}
                onClick={() => handleDocumentClick(doc._id)}
                className="w-[144px] h-[144px] flex-shrink-0 rounded-lg cursor-pointer hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col overflow-hidden"
              >
                <div className="h-[44px] bg-gray-100 dark:bg-gray-900/50 flex items-center px-3">
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
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getTimeAgo(doc.modifiedTime)}
                    </span>
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

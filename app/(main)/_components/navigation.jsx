"use client";

import { ChevronLeft, MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { ElementRef, useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import { cn } from "@/lib/utils";
import path from "path";

import UserItem from "./user-item";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Navigation() {
  const isMobile = useMediaQuery("(max-width:768px)");
  const pathName = usePathname(); // collapse the sidebar whenever clicking on a document

  const isResizingRef = useRef(false);
  const sidebarRef = useRef(null);
  const navbarRef = useRef(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapse, setIsCollapse] = useState(isMobile); // mobile = collapse

  const documents = useQuery(api.documents.get);

  const resetWidth = useCallback(
    (resetSize) => {
      if (sidebarRef.current && navbarRef.current) {
        setIsCollapse(resetSize === 0);
        setIsResetting(true);

        sidebarRef.current.style.width = isMobile
          ? resetSize === 0
            ? "0"
            : "100%"
          : `${resetSize}px`;
        navbarRef.current.style.setProperty(
          "width",
          isMobile
            ? resetSize === 0
              ? "100%"
              : "0"
            : `calc(100% - ${resetSize}px)`
        );
        navbarRef.current.style.setProperty(
          "left",
          isMobile ? "0" : `${resetSize}px`
        );
        setTimeout(() => setIsResetting(false), 300);
      }
    },
    [isMobile]
  );

  useEffect(() => {
    if (isMobile) {
      resetWidth(0);
    } else {
      resetWidth(240);
    }
  }, [isMobile, resetWidth]);

  useEffect(() => {
    if (isMobile) {
      resetWidth(0);
    }
  }, [pathName, isMobile, resetWidth]);

  function handleMouseDown(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleMouseMove(evt) {
    if (!isResizingRef.current) return;
    let newWidth = evt.clientX;

    // sidebar limit
    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    //changing sidebar size
    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  }

  function handleMouseUp() {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  return (
    <>
      {/* navbar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-screen bg-gray-200 overflow-y-auto relative flex w-60 flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        {/* collapse button */}
        <div
          onClick={() => resetWidth(0)}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </div>

        {/*  nav bar content */}
        <div>
          <UserItem />
        </div>
        <div className="mt-4">
          {documents?.map((document) => (
            <p key={document._id}>{document.title}</p>
          ))}

          {/* sidebar */}
          <div
            onMouseDown={handleMouseDown}
            onClick={() => resetWidth(240)}
            className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
          />
        </div>
      </aside>

      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
        <nav className="bg-transparent px-3 py-2 w-full">
          {isCollapse && (
            <MenuIcon
              onClick={() => resetWidth(240)}
              role="button"
              className="h-6 w-6 text-muted-foreground"
            />
          )}
        </nav>
      </div>
    </>
  );
}

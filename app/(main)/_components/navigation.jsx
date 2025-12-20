"use client";

import {
  ChevronLeft,
  Home,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
  Trash2,
} from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ElementRef, useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useSearch } from "@/hooks/useSearch";
import { useSettings } from "@/hooks/useSettings";

import { cn } from "@/lib/utils";
import path from "path";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import Item from "./item";

import UserItem from "./user-item";
import DocumentList from "./document-list";
import { TrashBox } from "./trash-box";
import { Navbar } from "./navbar";

export default function Navigation() {
  const router = useRouter();
  const settings = useSettings();
  const search = useSearch();
  const params = useParams();
  const isMobile = useMediaQuery("(max-width:768px)");
  const pathName = usePathname(); // collapse the sidebar whenever clicking on a document

  const isResizingRef = useRef(false);
  const sidebarRef = useRef(null);
  const navbarRef = useRef(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapse, setIsCollapse] = useState(isMobile); // mobile = collapse

  const create = useMutation(api.documents.create);

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

  function handleCreate() {
    const promise = create({ title: "Unititled" });
    toast.promise(promise, {
      loading: "Creating new note...",
      success: "New note created",
      error: "Failed to create a new note",
    });
  }

  return (
    <>
      {/* navbar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-screen bg-gray-200 dark:bg-gray-950 overflow-y-auto relative flex w-60 flex-col z-[99999]",
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
          <div className="cursor-pointer">
            <Item
              label="Home"
              icon={Home}
              onClick={() => router.push("/home")}
            />
            <Item
              label="Search"
              icon={Search}
              isSearch
              onClick={search.onOpen}
            />
            <Item label="Settings" icon={Settings} onClick={settings.onOpen} />
            <Item onClick={handleCreate} label="New page" icon={PlusCircle} />
          </div>
        </div>
        <div className="mt-4">
          <DocumentList />
          <div className="cursor-pointer">
            <Item onClick={handleCreate} icon={Plus} label="Add a page" />
          </div>
          <Popover>
            <PopoverTrigger className="w-full mt-4">
              <Item label="Trash" icon={Trash2} />
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-72"
              side={isMobile ? "bottom" : "right"}
            >
              <TrashBox />
            </PopoverContent>
          </Popover>
        </div>

        {/* sidebar */}
        <div
          onMouseDown={handleMouseDown}
          onClick={() => resetWidth(240)}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>

      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
        {!!params.documentId ? (
          <Navbar
            isCollapsed={isCollapse}
            onResetWidth={() => resetWidth(240)}
          />
        ) : (
          <nav className="bg-transparent dark:bg-[#1f1f1f] px-3 py-2 w-full">
            {isCollapse && (
              <MenuIcon
                onClick={() => resetWidth(240)}
                role="button"
                className="h-6 w-6 text-muted-foreground dark:text-gray-400"
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
}

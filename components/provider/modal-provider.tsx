"use client";
import { useEffect, useState } from "react";
import { SettingsModal } from "../modals/settings-modal";
import { CoverImageModal } from "../modals/cover-image-modal";
import { TemplateModal } from "../modals/template-modal";
import { SiteSettingsModal } from "../modals/site-settings-modal";
import { MoveCommand } from "../move-command";

export function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <>
      <SettingsModal />
      <CoverImageModal />
      <TemplateModal />
      <SiteSettingsModal />
      <MoveCommand />
    </>
  );
}

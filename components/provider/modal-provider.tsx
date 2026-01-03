"use client";
import { useState, useSyncExternalStore } from "react";
import { SettingsModal } from "../modals/settings-modal";
import { CoverImageModal } from "../modals/cover-image-modal";
import { TemplateModal } from "../modals/template-modal";
import { SiteSettingsModal } from "../modals/site-settings-modal";
import { MoveCommand } from "../move-command";

// SSR-safe way to check if mounted
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ModalProvider() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

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

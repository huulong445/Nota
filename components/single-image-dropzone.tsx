"use client";

import { SingleImageDropzone } from "@/components/upload/single-image";
import {
  UploaderProvider,
  type UploadFn,
} from "@/components/upload/uploader-provider";
import { useEdgeStore } from "@/lib/edgestore";
import * as React from "react";

interface SingleImageDropzoneUsageProps {
  className?: string;
  disabled?: boolean;
  onChange?: (url: string) => void;
  replaceTargetUrl?: string;
}

export function SingleImageDropzoneUsage({
  className,
  disabled,
  onChange,
  replaceTargetUrl,
}: SingleImageDropzoneUsageProps) {
  const { edgestore } = useEdgeStore();

  const uploadFn: UploadFn = React.useCallback(
    async ({ file, onProgressChange, signal }) => {
      const res = await edgestore.publicFiles.upload({
        file,
        signal,
        onProgressChange,
        options: {
          replaceTargetUrl,
        },
      });
      console.log("Upload result:", res);
      // Call onChange with the uploaded URL
      if (onChange) {
        onChange(res.url);
      }
      return res;
    },
    [edgestore, onChange, replaceTargetUrl]
  );

  return (
    <UploaderProvider uploadFn={uploadFn} autoUpload>
      <div className={className}>
        <SingleImageDropzone
          disabled={disabled}
          height={200}
          width={400}
          dropzoneOptions={{
            maxSize: 1024 * 1024 * 10, // 10 MB
          }}
        />
      </div>
    </UploaderProvider>
  );
}

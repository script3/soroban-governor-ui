import Link from "next/link";
import React, { useRef, useState } from "react";
import { useImageUpload } from "@/hooks/upload";
import Image from "next/image";

interface TextAreaProps {
  preview: boolean;
  bodyLimit: number;
  onChange: (text: string) => void;
  value: string;
}

const MarkdownTextArea: React.FC<TextAreaProps> = ({
  preview,
  bodyLimit,
  value,
  onChange,
}) => {
  const [imageDragging, setImageDragging] = useState(false);
  const textAreaEl = useRef<HTMLTextAreaElement>(null);
  const visitedBodyInput = useRef(false);
  const { upload, isUploadingImage, imageUploadError } = useImageUpload();
  const injectImageToBody = (image: { name: string; url: string }) => {
    console.log("INJECTING");
    const cursorPosition = textAreaEl.current?.selectionStart;
    const currentBody = textAreaEl.current?.value;
    const currentBodyWithImage = `${currentBody?.substring(
      0,
      cursorPosition
    )} \n![${image.name}](${image.url})
    ${currentBody?.substring(cursorPosition || 0)}`;

    onChange(currentBodyWithImage);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    console.log("PASTED");
    for (const item of e.clipboardData.items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        upload(
          new File([file as Blob], "image", { type: file?.type }),
          injectImageToBody
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    console.log("DROPPED");
    e.preventDefault();
    for (const item of e.dataTransfer.files) {
      if (item.type.startsWith("image/")) {
        upload(item, injectImageToBody);
      }
    }
  };

  return (
    <div className="mb-5 px-4 md:px-0">
      <div className="flex flex-col space-y-3">
        <div
          onDrop={handleDrop}
          onDragOver={() => setImageDragging(true)}
          onDragLeave={() => setImageDragging(false)}
          className="group"
        >
          <div className=" min-h-[240px] overflow-hidden p-2 rounded-t-xl border  border-snapBorder focus-within:border-snapLink outline-none">
            <textarea
              ref={textAreaEl}
              value={value}
              className="s-input mt-0 h-full min-h-[240px] w-full !rounded-xl border-none pt-0 text-base  outline-none"
              maxLength={bodyLimit}
              data-testid="input-proposal-body"
              onPaste={handlePaste}
              onBlur={() => (visitedBodyInput.current = true)}
              onFocus={() => (visitedBodyInput.current = false)}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>

          <label className="relative flex items-center justify-between rounded-b-xl border border-t-0 border-snapBorder px-2 py-1 group-focus-within:border-snapLink">
            <input
              accept="image/jpg, image/jpeg, image/png"
              type="file"
              className="absolute bottom-0 left-0 right-0 top-0 ml-0 w-full p-[5px] opacity-0"
              onChange={(e) => upload(e.target.files?.[0], injectImageToBody)}
            />

            <span className="pointer-events-none relative pl-1 text-sm">
              {isUploadingImage ? (
                <span className="flex">uploading file...</span>
              ) : imageUploadError !== "" ? (
                <span>{imageUploadError}</span>
              ) : (
                <span>
                  Attach images by dragging & dropping, selecting or pasting
                  them.
                </span>
              )}
            </span>
            <Link
              href="https://docs.github.com/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
              className="relative inline"
              target="_blank"
            >
              <Image
                src="/icons/markdown.svg"
                width={22}
                height={22}
                alt="markdown"
                className="fill-snapLink"
              />
            </Link>
          </label>
        </div>
      </div>
    </div>
  );
};

export default MarkdownTextArea;

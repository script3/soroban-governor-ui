import { getIpfsUrl } from "@/utils/getIpfsUrl";
import { copyToClipboard } from "@/utils/string";
import { useEffect, useMemo } from "react";
import { Remarkable } from "remarkable";
import { linkify } from "remarkable/linkify";
import copy from "../../public/icons/copy.svg"
import "viewerjs/dist/viewer.css";
import Viewer from "viewerjs";

export const remarkable = new Remarkable({
  html: false,
  breaks: true,
  typographer: false,
  linkTarget: "_blank",
}).use(linkify);
export function MarkdownPreview({
  body,
  className,
}: {
  body: string;
  className?: string;
}) {
  const bodyToRender = useMemo(() => {
    // Add the ipfs gateway to markdown images that start with ipfs://
    function replaceIpfsUrl(match: string, p1: string) {
      return match.replace(p1, getIpfsUrl(p1) || "");
    }
    const toRender = body.replace(
      /!\[.*?\]\((ipfs:\/\/[a-zA-Z0-9]+?)\)/g,
      replaceIpfsUrl
    );

    return remarkable.render(toRender);
  }, [body]);

  useEffect(() => {
    const body = document.getElementById("md-body");

    if (body !== null) {
      body.querySelectorAll("pre>code").forEach(function (code) {
        const copyBtn = document.getElementById("copyBtn");
        if (copyBtn) {
          return;
        }
        const parent = code.parentElement;
        if (parent !== null) parent.classList.add("rounded-lg");
        const copyButton = document.createElement("a");
        copyButton.setAttribute("id", "copyBtn");
        copyButton.innerHTML = copy;
        copyButton.classList.add("copy");
        copyButton.classList.add("cursor-pointer");
        copyButton.classList.add("active:opacity-50");
        copyButton.addEventListener("click", function () {
          if (parent !== null) copyToClipboard(parent.innerText.trim());
        });
        code.appendChild(copyButton);
      });
      new Viewer(body, {
        navbar: false,
        toolbar: false,
      });
    }
  }, []);
  return (
    <div
      className={`markdown-body break-words ${className || ""}}`}
      dangerouslySetInnerHTML={{ __html: bodyToRender }}
      id="md-body"
    ></div>
  );
}

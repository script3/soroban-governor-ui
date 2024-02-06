import { getIpfsUrl } from "@/utils/getIpfsUrl";
import { copyToClipboard } from "@/utils/string";
import { useEffect, useMemo } from "react";
import { Remarkable } from "remarkable";
import { linkify } from "remarkable/linkify";

import "viewerjs/dist/viewer.css";
import Viewer from "viewerjs";

const remarkable = new Remarkable({
  html: false,
  breaks: true,
  typographer: false,
  linkTarget: "_blank",
}).use(linkify);
const copyIcon = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#8b949e" width="24px" height="24px" viewBox="0 0 32 32" id="icon" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .cls-1 {
        fill: none;
      }
    </style>
  </defs>
  <path d="M28,10H22V4a2.0023,2.0023,0,0,0-2-2H4A2.0023,2.0023,0,0,0,2,4V20a2.0023,2.0023,0,0,0,2,2h6v6a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V12A2,2,0,0,0,28,10ZM4,20,3.9985,4H20v6H12a2,2,0,0,0-2,2v8Z"/>
  <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/>
</svg>`;
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
        copyButton.innerHTML = copyIcon;
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

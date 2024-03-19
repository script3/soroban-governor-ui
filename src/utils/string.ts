import { remarkable } from "@/components/MarkdownPreview";

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}


export function stripMarkdown(text:string){
  const htmlText = remarkable.render(text)
  return htmlText.replace(/<[^>]*>?/gm, '');
}
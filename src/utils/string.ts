export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

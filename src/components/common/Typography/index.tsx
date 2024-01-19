import { Tiny } from "./Tiny";
import { Small } from "./Small";
import { P } from "./P";
import { Huge } from "./Huge";
import { Medium } from "./Medium";
import { Big } from "./Big";

export interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Typography = { Tiny, Small, P, Big, Huge, Medium };
export default Typography;

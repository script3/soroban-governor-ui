import { SideBar } from "../Nav/Sidebar";
import { TopBar } from "../Nav/Topbar";
import { Footer } from "./Footer";
export interface MainLayoutProps {
  children: React.ReactNode;
}
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-row">
      <SideBar />
      <div className="w-full">
        <TopBar />
        {children}
        <Footer />
      </div>
    </div>
  );
}

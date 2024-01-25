import { Tab, TabProps, tabDecoPositions } from "./Tab";
export interface TabItem {
  name: string;
  className?: string;
  route?: string;
}

export interface TabBarProps {
  className?: string;
  activeTabName?: string;
  onClick: (tab: TabItem) => void;
  tabs: TabItem[];
  position?: tabDecoPositions;
}

export function TabBar({
  className,
  activeTabName,
  onClick,
  tabs,
  position = "bottom",
}: TabBarProps) {
  return (
    <div className={`flex flex-row items-center gap-3 ${className}`}>
      {tabs.map((tab, index) => (
        <Tab
          position={position}
          key={"tab-" + index}
          active={activeTabName === tab.name}
          onClick={() => onClick(tab)}
          className={tab.className}
        >
          {tab.name}
        </Tab>
      ))}
    </div>
  );
}

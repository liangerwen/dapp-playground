"use client";

import { cn } from "@/lib/utils";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Nav from "./nav";
import { WEB_TITLE } from "@/constants";

interface LayoutContextValue {
  setLayoutClassname: (classname: string) => void;
}

interface LayoutConfig {
  className: string;
}

const LayoutContext = createContext<LayoutContextValue>({
  setLayoutClassname: () => {},
});

const useLayoutConfig = ({ className }: LayoutConfig) => {
  const { setLayoutClassname } = useContext(LayoutContext);
  useEffect(() => {
    setLayoutClassname(className);
  }, [className, setLayoutClassname]);
};

const LayoutProvider = ({ children }: PropsWithChildren) => {
  const [layoutClassname, setLayoutClassname] = useState<string>();
  return (
    <LayoutContext.Provider value={{ setLayoutClassname }}>
      <div className={cn("w-full flex flex-col items-center h-screen")}>
        <Nav />
        <div className="flex-1 overflow-auto w-full flex flex-col items-center">
          <main className={cn("p-5 flex-grow w-full", layoutClassname)}>
            {children}
          </main>
          <footer className="w-full h-16 bg-background text-secondary-foreground flex items-center justify-center flex-shrink-0">
            <p>
              Copyright ©2021 - {new Date().getFullYear()} By {WEB_TITLE}
            </p>
          </footer>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default LayoutProvider;

export { useLayoutConfig };

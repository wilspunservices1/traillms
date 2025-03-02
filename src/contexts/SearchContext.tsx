import React, { createContext, useState, useContext } from "react";

// Define the context and a custom hook to access it
interface SearchContextProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

// Provider component
export const SearchProvider: React.FC = ({ children }: { children: React.ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, isDrawerOpen, toggleDrawer }}>
      {children}
    </SearchContext.Provider>
  );
};

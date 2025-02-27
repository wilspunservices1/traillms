import { useState } from "react";

const SearchDropdown: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  return (
    <div className="bg-gray-100 font-sans leading-normal tracking-normal">
      <nav className="fixed w-full bg-gray-200 border-b border-grey-light z-10">
        <div onClick={toggleSearch} className="cursor-pointer pl-6">
          
        </div>

        {searchOpen && (
          <div className="w-full bg-white shadow-xl">
            <div className="container mx-auto py-4 text-black">
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-grey-800 p-2 leading-normal text-xl focus:outline-none"
              />
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default SearchDropdown;

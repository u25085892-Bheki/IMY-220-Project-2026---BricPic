import { useState } from "react";
import Navigation from "../components/General/Navigation";
import SearchInput from "../components/Home_Page/SearchInput";
import Feed from "../components/Home_Page/Feed";

function Home() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="home-page-container app-page">
      <Navigation />
      <main className="home-layout">
        <SearchInput
          onFilter={setFilter}
          onSearch={setSearchQuery}
        />
        <Feed filter={filter} searchQuery={searchQuery} />
      </main>
    </div>
  );
}

export default Home;
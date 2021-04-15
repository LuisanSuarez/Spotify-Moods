import React, { useContext, useState } from "react";

const TagsContext = React.createContext();
const TagsUpdatingContext = React.createContext();

export function useTags() {
  return useContext(TagsContext);
}

export function useTagsUpdating() {
  return useContext(TagsUpdatingContext);
}

export function TagsProvider({ children }) {
  const [tags, setTags] = useState({ tags: [], uri: "" });
  function updateTags(tags) {
    console.log({ tags });
    setTags(tags);
  }

  return (
    <TagsContext.Provider value={tags}>
      <TagsUpdatingContext.Provider value={updateTags}>
        {children}
      </TagsUpdatingContext.Provider>
    </TagsContext.Provider>
  );
}

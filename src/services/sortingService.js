export default function sortingService() {
  const filterName = (a, b) => {
    return a.name.localeCompare(b.name);
  };

  const filterArtistName = (a, b) => {
    return a.artists[0].name.localeCompare(b.artists[0].name);
  };

  const filterTags = (a, b) => {
    const aTags = [...a.tags];
    const bTags = [...b.tags];

    return aTags[0].localeCompare(bTags[0]);
  };

  return {
    filterName,
    filterArtistName,
    filterTags,
  };
}

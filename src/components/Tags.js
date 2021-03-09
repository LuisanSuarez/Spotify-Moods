import styled from "styled-components";
import VirtualizedList from "./utilities/VirtualizedList";

const TagsContainer = styled.div`
  display: flex;
`;

const NoTagsContaienr = styled.div`
  display: flex;
  width: 200px;
`;

const NoTagsText = styled.p`
  width: 90%;
  text-align: center;
`;

export default function Tags({ tags, deleteTag, editTag }) {
  return (
    <TagsContainer>
      {tags[0] ? (
        <VirtualizedList items={tags} deleteTag={deleteTag} editTag={editTag} />
      ) : (
        <NoTagsContaienr>
          <NoTagsText>Set a mood =></NoTagsText>
        </NoTagsContaienr>
      )}
    </TagsContainer>
  );
}

import styled from "styled-components";
import Tag from "./Tag";

const TagsContainer = styled.div`
  display: flex;
`;
const NewTag = styled.input`
  width: 50%;
`;

export default function Tags({ tags, deleteTag, editTag }) {
  return (
    <TagsContainer>
      {tags.map((tag, index) => (
        <Tag
          tag={tag}
          index={index}
          key={index}
          deleteTag={deleteTag}
          editTag={editTag}
        />
      ))}
    </TagsContainer>
  );
}

import styled from "styled-components";

const TagContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const TagTitle = styled.p`
  margin: 0;
`;

const DeleteTag = styled.div`
  margin-right: 7px;
`;

export default function Tag({ tag, deleteTag, editTag, index }) {
  return (
    <TagContainer onClick={() => editTag(index)}>
      <TagTitle>{`#${tag}`}</TagTitle>
      <DeleteTag onClick={() => deleteTag(index)}>X</DeleteTag>
    </TagContainer>
  );
}

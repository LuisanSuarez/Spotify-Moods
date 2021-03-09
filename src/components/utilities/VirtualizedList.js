import ListItem from "@material-ui/core/ListItem";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import { FixedSizeList } from "react-window";
import Tag from "../Tag";
const HEIGHT = 60;
const WIDTH = 200;
const ITEM_SIZE = 28;
const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    height: HEIGHT,
    maxWidth: WIDTH,
    backgroundColor: "transparent",
  },
}));

function renderRow(props) {
  const { index, style, data } = props;
  console.log({ index, style, data });
  const item = data[index];

  return (
    <ListItem button style={style} key={index}>
      {/* <ListItemText primary={data[index]} /> */}
      <Tag
        tag={item.item}
        index={index}
        deleteTag={item.deleteTag}
        editTag={item.editTag}
      />
    </ListItem>
  );
}

renderRow.propTypes = {
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
};

export default function VirtualizedList({ items, deleteTag, editTag }) {
  const classes = useStyles();
  const functionItems = items.map(item => {
    return { item, deleteTag, editTag };
  });
  console.log({ functionItems });

  return (
    <div className={classes.root}>
      <FixedSizeList
        height={HEIGHT}
        width={WIDTH}
        itemSize={ITEM_SIZE}
        itemCount={items.length}
        itemData={functionItems}
        deleteTag={deleteTag}
      >
        {renderRow}
      </FixedSizeList>
    </div>
  );
}

import ListItem from "@material-ui/core/ListItem";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import { FixedSizeList } from "react-window";
import Tag from "../Tag";

const HEIGHT = 60;
const WIDTH = "26vw";
const MAX_WIDTH = "102%";
const ITEM_SIZE = 28;

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    height: HEIGHT,
    // maxWidth: WIDTH,
    backgroundColor: "transparent",
  },
}));

function renderRow(props) {
  const { index, style, data } = props;
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

  return (
    <div className={classes.root + " hola virtualized-list-override"}>
      <FixedSizeList
        height={HEIGHT}
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

import Chip from "@material-ui/core/Chip";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import React from "react";

const useStyles = makeStyles(theme => ({
  root: {
    width: 300,
    "& > * + *": {
      marginTop: theme.spacing(3),
      marginRight: theme.spacing(3),
    },
  },
}));

type AppProps = {
  options: Array<string>;
  type: string;
  label: string;
  submit: any;
};

const filter = createFilterOptions<string>();

const TagsSelection = ({ options, type, label, submit }: AppProps) => {
  const [value, setValue] = React.useState<string | null>(null);
  const classes = useStyles();
  const ADD_LABEL = "Add ";

  return (
    <div className={classes.root}>
      {/* <Autocomplete
        multiple
        id="tags-standard"
        options={top100Films}
        getOptionLabel={option => option.title}
        defaultValue={"chooseADefaultValue"}
        onChange={(event, value) => handleSubmit(value)}
        renderInput={params => (
          <TextField
            {...params}
            variant="standard"
            label="Multiple values"
            placeholder="Favorites"
          />
        )}
      /> */}
      {type === "createPlaylist" ? (
        <Autocomplete
          multiple
          id="tags-outlined"
          options={options}
          getOptionLabel={option => option}
          filterSelectedOptions
          onChange={(e, value) => submit(value)}
          renderInput={params => (
            <TextField
              {...params}
              variant="standard"
              label={label}
              placeholder="Favorites"
            />
          )}
        />
      ) : (
        ""
      )}
      {type === "prolyWontUse" ? (
        <Autocomplete
          multiple
          id="tags-filled"
          options={options}
          freeSolo
          onChange={(e, value) => submit(value)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={params => (
            <TextField
              {...params}
              variant="filled"
              label={label}
              placeholder="Favorites"
            />
          )}
        />
      ) : (
        ""
      )}
      {type === "addTags" ? (
        <Autocomplete
          onChange={(e, value) => {
            if (!value) return;
            value =
              value.length > ADD_LABEL.length &&
              value.slice(0, ADD_LABEL.length) === ADD_LABEL
                ? value.slice(ADD_LABEL.length)
                : value;

            submit(value);
          }}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);
            // Suggest the creation of a new value
            if (params.inputValue !== "") {
              filtered.push(ADD_LABEL + params.inputValue);
            }

            return filtered;
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          id="free-solo-with-text-demo"
          options={options}
          getOptionLabel={option => option}
          renderOption={option => option}
          style={{ width: 300 }}
          freeSolo
          renderInput={params => (
            <TextField
              {...params}
              label="Free solo with text demo"
              variant="outlined"
            />
          )}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default TagsSelection;

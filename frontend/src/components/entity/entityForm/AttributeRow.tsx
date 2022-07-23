import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupIcon from "@mui/icons-material/Group";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Input,
  MenuItem,
  Select,
  TableCell,
  Theme,
  TableRow,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { FC, useMemo } from "react";
import { Link } from "react-router-dom";

import { aclPath } from "Routes";
import {
  Entity,
  EntityAttrUpdate,
  EntityUpdate,
} from "apiclient/autogenerated";
import { AutoCompletedField } from "components/common/AutoCompletedField";
import { AttributeTypes } from "utils/Constants";

const useStyles = makeStyles<Theme>((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: "white",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#607D8B0A",
    },
  },
  highlightedTableRow: {
    backgroundColor: "yellow",

    // TODO reset the animation with considering rerendering
    // animation: `$highlighted ease 1s 1`,
    // "&:nth-of-type(odd)": {
    //   backgroundColor: "white",
    // },
    // "&:nth-of-type(even)": {
    //   backgroundColor: "#607D8B0A",
    // },
  },

  "@keyframes highlighted": {
    "0%": {
      backgroundColor: "yellow",
    },
  },
}));

interface Props {
  index?: number;
  currentAttr?: { [key: string]: any };
  allAttrs: EntityAttrUpdate[];
  referralEntities: Entity[];
  entityInfo: EntityUpdate;
  setEntityInfo: (entityInfo: EntityUpdate) => void;
  latestChangedIndex?: number;
  setLatestChangedIndex: (latestChangedIndex: number) => void;
}

export const AttributeRow: FC<Props> = ({
  index,
  currentAttr,
  allAttrs,
  referralEntities,
  entityInfo,
  setEntityInfo,
  latestChangedIndex,
  setLatestChangedIndex,
}) => {
  const classes = useStyles();

  const handleAppendAttribute = (nextTo) => {
    allAttrs.splice(nextTo + 1, 0, {
      name: "",
      type: AttributeTypes.string.type,
      isMandatory: false,
      isDeleteInChain: false,
      isDeleted: false,
      referral: [],
    });
    setEntityInfo({ ...entityInfo, attrs: [...allAttrs] });
  };

  const handleChangeOrderAttribute = (index: number, order: number) => {
    const newIndex = index - order;
    const oldIndex = index;
    const x = allAttrs[newIndex];
    allAttrs[newIndex] = allAttrs[oldIndex];
    allAttrs[oldIndex] = x;
    allAttrs[newIndex].index = index + 1 - order;
    allAttrs[oldIndex].index = index + 1;
    setLatestChangedIndex(newIndex);
    setEntityInfo({ ...entityInfo, attrs: [...allAttrs] });
  };

  const handleDeleteAttribute = (index: number) => {
    allAttrs[index] = {
      ...allAttrs[index],
      isDeleted: true,
    };
    setEntityInfo({ ...entityInfo, attrs: [...allAttrs] });
  };

  const attributeTypeMenuItems = useMemo(() => {
    return Object.keys(AttributeTypes).map((typename, index) => (
      <MenuItem key={index} value={AttributeTypes[typename].type}>
        {AttributeTypes[typename].name}
      </MenuItem>
    ));
  }, []);

  const handleChangeAttributeValue = (
    index: number,
    key: string,
    value: any
  ) => {
    allAttrs[index][key] = value;
    setEntityInfo({ ...entityInfo, attrs: [...allAttrs] });
  };

  return (
    <TableRow
      className={
        index === latestChangedIndex
          ? classes.highlightedTableRow
          : classes.tableRow
      }
    >
      <TableCell>
        {index !== undefined && (
          <Input
            type="text"
            value={currentAttr.name}
            placeholder="属性名"
            sx={{ width: "100%" }}
            onChange={(e) =>
              handleChangeAttributeValue(index, "name", e.target.value)
            }
            error={currentAttr.name === ""}
          />
        )}
      </TableCell>

      <TableCell>
        {index !== undefined && (
          <Box>
            <Box minWidth={100} marginX={1}>
              <Select
                fullWidth={true}
                value={currentAttr.type}
                disabled={currentAttr.id != null}
                onChange={(e) =>
                  handleChangeAttributeValue(index, "type", e.target.value)
                }
              >
                {attributeTypeMenuItems}
              </Select>
            </Box>
            {(currentAttr.type & AttributeTypes.object.type) > 0 && (
              <Box minWidth={100} marginX={1}>
                <Typography>エンティティを選択</Typography>

                <AutoCompletedField
                  options={referralEntities}
                  getOptionLabel={(option: Entity) => option.name}
                  defaultValue={referralEntities.filter((e) =>
                    currentAttr.referral.includes(e.id)
                  )}
                  handleChangeSelectedValue={(value: Entity[]) => {
                    handleChangeAttributeValue(
                      index,
                      "referral",
                      value.map((i) => i.id)
                    );
                  }}
                  multiple
                />
              </Box>
            )}
          </Box>
        )}
      </TableCell>

      <TableCell>
        {index !== undefined && (
          <Checkbox
            checked={currentAttr.is_mandatory}
            onChange={(e) =>
              handleChangeAttributeValue(
                index,
                "is_mandatory",
                e.target.checked
              )
            }
          />
        )}
      </TableCell>

      <TableCell>
        {index !== undefined && (
          <Checkbox
            checked={currentAttr.is_delete_in_chain}
            onChange={(e) =>
              handleChangeAttributeValue(
                index,
                "is_delete_in_chain",
                e.target.checked
              )
            }
          />
        )}
      </TableCell>

      <TableCell>
        {index !== undefined && (
          <Box display="flex" flexDirection="column">
            <IconButton
              disabled={index === 0}
              className={classes.button}
              onClick={(e) => handleChangeOrderAttribute(index, 1)}
            >
              <ArrowUpwardIcon />
            </IconButton>

            <IconButton
              disabled={index === allAttrs.length - 1}
              className={classes.button}
              onClick={(e) => handleChangeOrderAttribute(index, -1)}
            >
              <ArrowDownwardIcon />
            </IconButton>
          </Box>
        )}
      </TableCell>

      <TableCell>
        {index !== undefined && (
          <IconButton
            className={classes.button}
            onClick={(e) => handleDeleteAttribute(index)}
          >
            <DeleteOutlineIcon />
          </IconButton>
        )}
      </TableCell>

      {/* This is a button to add new Attribute */}
      <TableCell>
        <IconButton
          className={classes.button}
          onClick={() => handleAppendAttribute(index)}
        >
          <AddIcon />
        </IconButton>
      </TableCell>

      <TableCell>
        {index !== undefined && (
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<GroupIcon />}
            component={Link}
            to={aclPath(currentAttr.id)}
            disabled={currentAttr.id == null}
          >
            ACL
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

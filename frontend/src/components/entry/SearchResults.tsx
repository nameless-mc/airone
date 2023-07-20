import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Box,
  IconButton,
  List,
  ListItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { ChangeEvent, FC, useState, useReducer } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";

import { formatAdvancedSearchPrams } from "../../services/entry/AdvancedSearch";

import { SearchResultControlMenuForEntry } from "./SearchResultControlMenuForEntry";
import { SearchResultControlMenuForReferral } from "./SearchResultControlMenuForReferral";

import { entryDetailsPath } from "Routes";
import {
  AdvancedSearchResultAttrInfoFilterKeyEnum,
  AdvancedSearchResultValue,
} from "apiclient/autogenerated";
import { AttributeValue } from "components/entry/AttributeValue";
import { SearchResultControlMenu } from "components/entry/SearchResultControlMenu";

export type AttrsFilter = Record<
  string,
  { filterKey: AdvancedSearchResultAttrInfoFilterKeyEnum; keyword: string }
>;

const StyledBox = styled(Box)({
  margin: "24px",
});

const HeaderBox = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const StyledTableRow = styled(TableRow)({
  "&:nth-of-type(odd)": {
    backgroundColor: "#F9FAFA",
  },
  "&:nth-of-type(even)": {
    backgroundColor: "#FFFFFF",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "& td": {
    padding: "8px 16px",
  },
});

interface Props {
  results: Array<AdvancedSearchResultValue>;
  page: number;
  maxPage: number;
  hasReferral: boolean;
  handleChangePage: (page: number) => void;
  defaultEntryFilter?: string;
  defaultReferralFilter?: string;
  defaultAttrsFilter?: AttrsFilter;
}

export const SearchResults: FC<Props> = ({
  results,
  page,
  maxPage,
  handleChangePage,
  hasReferral,
  defaultEntryFilter,
  defaultReferralFilter,
  defaultAttrsFilter = {},
}) => {
  const location = useLocation();
  const history = useHistory();

  const isFiltered: Record<string, boolean> = Object.fromEntries(
    Object.keys(defaultAttrsFilter ?? {}).map((attrName: string) => {
      const attrFilter = defaultAttrsFilter[attrName];
      switch (attrFilter.filterKey) {
        case AdvancedSearchResultAttrInfoFilterKeyEnum.EMPTY:
        case AdvancedSearchResultAttrInfoFilterKeyEnum.NON_EMPTY:
        case AdvancedSearchResultAttrInfoFilterKeyEnum.DUPLICATED:
          return [attrName, true];
        case AdvancedSearchResultAttrInfoFilterKeyEnum.TEXT_CONTAINED:
          return [attrName, attrFilter.keyword !== ""];
      }
      return [attrName, false];
    })
  );

  const [entryFilter, entryFilterDispatcher] = useReducer(
    (
      _state: string,
      event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => event.target.value,
    defaultEntryFilter ?? ""
  );
  const [referralFilter, referralFilterDispatcher] = useReducer(
    (
      _state: string,
      event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => event.target.value,
    defaultReferralFilter ?? ""
  );
  const [attrsFilter, setAttrsFilter] = useState<AttrsFilter>(
    defaultAttrsFilter ?? {}
  );

  const [attributeMenuEls, setAttributeMenuEls] = useState<{
    [key: string]: HTMLButtonElement | null;
  }>({});
  const [entryMenuEls, setEntryMenuEls] = useState<HTMLButtonElement | null>(
    null
  );
  const [referralMenuEls, setReferralMenuEls] =
    useState<HTMLButtonElement | null>(null);

  const handleSelectFilterConditions = (
    overwriteAttrsFilter?: AttrsFilter,
    overwriteEntryName?: string,
    overwriteReferral?: string
  ) => {
    const newParams = formatAdvancedSearchPrams({
      attrFilter: overwriteAttrsFilter ?? attrsFilter,
      entryName: overwriteEntryName ?? entryFilter,
      referralName: overwriteReferral ?? referralFilter,
      baseParams: new URLSearchParams(location.search),
    });

    // simply reload with the new params
    history.push({
      pathname: location.pathname,
      search: "?" + newParams.toString(),
    });
    history.go(0);
  };

  return (
    <StyledBox>
      <TableContainer component={Paper} sx={{ overflowX: "inherit" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.dark" }}>
              <TableCell
                sx={{
                  color: "primary.contrastText",
                  minWidth: "300px",
                  backgroundColor: "inherit",
                  outline: "1px solid #FFFFFF",
                }}
              >
                <HeaderBox>
                  <Typography>エントリ名</Typography>
                  <IconButton
                    color="inherit"
                    onClick={(e) => {
                      setEntryMenuEls(e.currentTarget);
                    }}
                  >
                    {defaultEntryFilter ? (
                      <FilterAltIcon />
                    ) : (
                      <FilterListIcon />
                    )}
                  </IconButton>
                  <SearchResultControlMenuForEntry
                    entryFilter={entryFilter}
                    anchorElem={entryMenuEls}
                    handleClose={() => setEntryMenuEls(null)}
                    entryFilterDispatcher={entryFilterDispatcher}
                    handleSelectFilterConditions={handleSelectFilterConditions}
                    handleClear={() =>
                      handleSelectFilterConditions(undefined, "")
                    }
                  />
                </HeaderBox>
              </TableCell>
              {Object.keys(attrsFilter).map((attrName) => (
                <TableCell
                  sx={{ color: "primary.contrastText", minWidth: "300px" }}
                  key={attrName}
                >
                  <HeaderBox>
                    <Typography>{attrName}</Typography>
                    <IconButton
                      color="inherit"
                      onClick={(e) => {
                        setAttributeMenuEls({
                          ...attributeMenuEls,
                          [attrName]: e.currentTarget,
                        });
                      }}
                    >
                      {isFiltered[attrName] ?? false ? (
                        <FilterAltIcon />
                      ) : (
                        <FilterListIcon />
                      )}
                    </IconButton>
                    <SearchResultControlMenu
                      attrName={attrName}
                      attrsFilter={attrsFilter}
                      anchorElem={attributeMenuEls[attrName]}
                      handleClose={(name: string) =>
                        setAttributeMenuEls({
                          ...attributeMenuEls,
                          [name]: null,
                        })
                      }
                      setAttrsFilter={setAttrsFilter}
                      handleSelectFilterConditions={
                        handleSelectFilterConditions
                      }
                    />
                  </HeaderBox>
                </TableCell>
              ))}
              {hasReferral && (
                <TableCell
                  sx={{
                    color: "primary.contrastText",
                    minWidth: "300px",
                    backgroundColor: "inherit",
                    outline: "1px solid #FFFFFF",
                  }}
                >
                  <HeaderBox>
                    <Typography>参照エントリ</Typography>
                    <IconButton
                      color="inherit"
                      onClick={(e) => {
                        setReferralMenuEls(e.currentTarget);
                      }}
                    >
                      {defaultReferralFilter ? (
                        <FilterAltIcon />
                      ) : (
                        <FilterListIcon />
                      )}
                    </IconButton>
                    <SearchResultControlMenuForReferral
                      referralFilter={referralFilter}
                      anchorElem={referralMenuEls}
                      handleClose={() => setReferralMenuEls(null)}
                      referralFilterDispatcher={referralFilterDispatcher}
                      handleSelectFilterConditions={
                        handleSelectFilterConditions
                      }
                      handleClear={() =>
                        handleSelectFilterConditions(undefined, undefined, "")
                      }
                    />
                  </HeaderBox>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result, index) => (
              <StyledTableRow key={index}>
                <TableCell
                  sx={{
                    backgroundColor: "inherit",
                    minWidth: "300px",
                  }}
                >
                  <Box
                    component={Link}
                    to={entryDetailsPath(0, result.entry.id)}
                  >
                    {result.entry.name}
                  </Box>
                </TableCell>
                {Object.keys(attrsFilter).map((attrName) => (
                  <TableCell sx={{ minWidth: "300px" }} key={attrName}>
                    {(() => {
                      const info = result.attrs[attrName];
                      if (info != null) {
                        return (
                          <>
                            {info.isReadable ? (
                              <AttributeValue attrInfo={info} />
                            ) : (
                              <Typography>Permission denied.</Typography>
                            )}
                          </>
                        );
                      }
                    })()}
                  </TableCell>
                ))}
                {hasReferral && (
                  <TableCell sx={{ minWidth: "300px" }}>
                    <List>
                      {result.referrals?.map((referral) => (
                        <ListItem key={referral.id}>
                          <Box
                            component={Link}
                            to={entryDetailsPath(0, referral.id)}
                          >
                            {referral.name}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </TableCell>
                )}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" my="30px">
        <Stack spacing={2}>
          <Pagination
            count={maxPage}
            page={page}
            onChange={(e, page) => handleChangePage(page)}
            color="primary"
          />
        </Stack>
      </Box>
    </StyledBox>
  );
};

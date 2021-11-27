import { Divider } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import React, { FC, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAsync } from "react-use";

import {
  aclPath,
  entitiesPath,
  entityPath,
  importEntriesPath,
  newEntryPath,
  topPath,
} from "../Routes";
import { AironeBreadcrumbs } from "../components/common/AironeBreadcrumbs";
import { CreateButton } from "../components/common/CreateButton";
import { EditButton } from "../components/common/EditButton";
import { Loading } from "../components/common/Loading";
import { EntryList } from "../components/entry/EntryList";
import { exportEntries, getEntries } from "../utils/AironeAPIClient";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  entryName: {
    margin: theme.spacing(1),
  },
}));

export const Entry: FC = () => {
  const classes = useStyles();
  const { entityId } = useParams<{ entityId: number }>();

  const [tabValue, setTabValue] = useState(1);

  const entries = useAsync(async () => {
    const resp = await getEntries(entityId, true);
    const data = await resp.json();
    return data.results;
  });

  const deletedEntries = useAsync(async () => {
    const resp = await getEntries(entityId, false);
    const data = await resp.json();
    return data.results;
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div>
      <AironeBreadcrumbs>
        <Typography component={Link} to={topPath()}>
          Top
        </Typography>
        <Typography component={Link} to={entitiesPath()}>
          エンティティ一覧
        </Typography>
        <Typography color="textPrimary">エントリ一覧</Typography>
      </AironeBreadcrumbs>

      <div className="row">
        <div className="col">
          <div className="float-left">
            <CreateButton to={newEntryPath(entityId)}>
              エントリ作成
            </CreateButton>
            <EditButton to={entityPath(entityId)}>エンティティ編集</EditButton>
            <Button
              variant="contained"
              className={classes.button}
              component={Link}
              to={aclPath(entityId)}
            >
              エンティティの ACL
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.button}
              onClick={() => exportEntries(entityId, "YAML")}
            >
              YAML でエクスポート
            </Button>
            <Button
              variant="contained"
              className={classes.button}
              onClick={() => exportEntries(entityId, "YAML")}
            >
              CSV でエクスポート
            </Button>
            <Button
              className={classes.button}
              variant="outlined"
              color="secondary"
              component={Link}
              to={importEntriesPath(entityId)}
            >
              インポート
            </Button>
          </div>
        </div>
      </div>

      <Divider />

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="ダッシュボード" />
        <Tab label="エントリ一覧" />
        <Tab label="ダッシュボードの設定" />
        <Tab label="削除エントリの復旧" />
      </Tabs>

      <div hidden={tabValue !== 0}>ダッシュボード</div>

      <div hidden={tabValue !== 1}>
        {entries.loading ? (
          <Loading />
        ) : (
          <EntryList
            entityId={entityId}
            entries={entries.value}
            restoreMode={false}
          />
        )}
      </div>

      <div hidden={tabValue !== 2}>ダッシュボードの設定</div>

      <div hidden={tabValue !== 3}>
        {!deletedEntries.loading && (
          <EntryList
            entityId={entityId}
            entries={deletedEntries.value}
            restoreMode={true}
          />
        )}
      </div>
    </div>
  );
};

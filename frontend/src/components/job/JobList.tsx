import {
  Box,
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { FC } from "react";
import { useHistory } from "react-router-dom";

import { JobSerializers } from "../../apiclient/autogenerated";
import { cancelJob, rerunJob } from "../../utils/AironeAPIClient";
import { JobOperations, JobStatuses } from "../../utils/Constants";
import { formatDate } from "../../utils/DateUtil";
import { jobOperationLabel } from "../../utils/JobUtil";
import { Confirmable } from "../common/Confirmable";

const useStyles = makeStyles<Theme>((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  entityName: {
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
}));

interface Props {
  jobs: JobSerializers[];
}

export const JobList: FC<Props> = ({ jobs }) => {
  const classes = useStyles();
  const history = useHistory();

  const handleRerun = async (jobId: number) => {
    await rerunJob(jobId);
    history.go(0);
  };

  const handleCancel = async (jobId: number) => {
    await cancelJob(jobId);
    history.go(0);
  };

  return (
    <Table>
      <TableHead>
        <TableRow sx={{ backgroundColor: "#455A64" }}>
          <TableCell sx={{ color: "#FFFFFF" }}>対象エントリ</TableCell>
          <TableCell sx={{ color: "#FFFFFF" }}>状況</TableCell>
          <TableCell sx={{ color: "#FFFFFF" }}>操作</TableCell>
          <TableCell sx={{ color: "#FFFFFF" }}>実行時間</TableCell>
          <TableCell sx={{ color: "#FFFFFF" }}>実行日時</TableCell>
          <TableCell sx={{ color: "#FFFFFF" }}>備考</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id} className={classes.tableRow}>
            <TableCell>
              <Typography>{job.target?.name ?? ""}</Typography>
            </TableCell>
            <TableCell>
              <Box display="flex" alignItems="center">
                <Box display="flex" alignItems="center">
                  {(() => {
                    switch (job.status) {
                      case JobStatuses.PREPARING:
                        return (
                          <>
                            <Box
                              width="16px"
                              height="16px"
                              mx="4px"
                              sx={{
                                backgroundColor: "white",
                                borderRadius: "8px",
                              }}
                            />
                            <Typography>処理前</Typography>
                          </>
                        );
                      case JobStatuses.DONE:
                        return (
                          <>
                            <Box
                              width="16px"
                              height="16px"
                              mx="4px"
                              sx={{
                                backgroundColor: "#607D8B",
                                borderRadius: "8px",
                              }}
                            />
                            <Typography>完了</Typography>
                          </>
                        );
                      case JobStatuses.ERROR:
                        return (
                          <>
                            <Box
                              width="16px"
                              height="16px"
                              mx="4px"
                              sx={{
                                backgroundColor: "#B00020",
                                borderRadius: "8px",
                              }}
                            />
                            <Typography>失敗</Typography>
                          </>
                        );
                      case JobStatuses.TIMEOUT:
                        return (
                          <>
                            <Box
                              width="16px"
                              height="16px"
                              mx="4px"
                              sx={{
                                backgroundColor: "#B00020",
                                borderRadius: "8px",
                              }}
                            />
                            <Typography>タイムアウト</Typography>
                          </>
                        );
                      case JobStatuses.PROCESSING:
                        return (
                          <>
                            <Box
                              width="16px"
                              height="16px"
                              mx="4px"
                              sx={{
                                backgroundColor: "#90CAF9",
                                borderRadius: "8px",
                              }}
                            />
                            <Typography>処理中</Typography>
                          </>
                        );
                      case JobStatuses.CANCELED:
                        return (
                          <>
                            <Box
                              width="16px"
                              height="16px"
                              mx="4px"
                              sx={{
                                backgroundColor: "#607D8B",
                                borderRadius: "8px",
                              }}
                            />
                            <Typography>キャンセル</Typography>
                          </>
                        );
                      default:
                        return (
                          <>
                            <Box
                              width="16px"
                              height="16px"
                              mx="4px"
                              sx={{
                                backgroundColor: "black",
                                borderRadius: "8px",
                              }}
                            />
                            <Typography>不明</Typography>
                          </>
                        );
                    }
                  })()}
                </Box>
                <Box mx="12px">
                  {![
                    JobStatuses.DONE,
                    JobStatuses.PROCESSING,
                    JobStatuses.CANCELED,
                  ].includes(job.status) && (
                    <Button
                      variant="contained"
                      color="error"
                      className={classes.button}
                      onClick={() => handleRerun(job.id)}
                    >
                      再実行
                    </Button>
                  )}
                  {![JobStatuses.DONE, JobStatuses.CANCELED].includes(
                    job.status
                  ) && (
                    <Confirmable
                      componentGenerator={(handleOpen) => (
                        <Button
                          variant="contained"
                          color="secondary"
                          className={classes.button}
                          onClick={handleOpen}
                        >
                          キャンセル
                        </Button>
                      )}
                      dialogTitle="本当にキャンセルしますか？"
                      onClickYes={() => handleCancel(job.id)}
                    />
                  )}
                </Box>
              </Box>
            </TableCell>
            <TableCell>
              <Typography>{jobOperationLabel(job.operation)}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{job.passedTime} s</Typography>
            </TableCell>
            <TableCell>
              <Typography>{formatDate(job.createdAt)}</Typography>
            </TableCell>
            <TableCell>
              {(job.operation == JobOperations.EXPORT_ENTRY ||
                job.operation == JobOperations.EXPORT_SEARCH_RESULT) &&
              job.status == JobStatuses.DONE ? (
                <Link href={`/job/download/${job.id}`}>Download</Link>
              ) : (
                <Typography>{job.text}</Typography>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

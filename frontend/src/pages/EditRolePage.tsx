import { Box, Container, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import React, { FC, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, Prompt, useHistory } from "react-router-dom";
import { useAsync } from "react-use";

import { Role, RoleCreateUpdate } from "../apiclient/autogenerated";
import { Loading } from "../components/common/Loading";
import { PageHeader } from "../components/common/PageHeader";
import { RoleForm } from "../components/role/RoleForm";
import { useTypedParams } from "../hooks/useTypedParams";
import { ExtractAPIException } from "../services/AironeAPIErrorUtil";

import { topPath, rolesPath } from "Routes";
import { aironeApiClientV2 } from "apiclient/AironeApiClientV2";
import { AironeBreadcrumbs } from "components/common/AironeBreadcrumbs";
import { SubmitButton } from "components/common/SubmitButton";

export const EditRolePage: FC = () => {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const { roleId } = useTypedParams<{ roleId?: number }>();

  // TODO try to validate values with zod
  const {
    formState: { isDirty, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    control,
  } = useForm<Role>();

  const role = useAsync(async () => {
    return roleId != null ? await aironeApiClientV2.getRole(roleId) : undefined;
  }, [roleId]);

  useEffect(() => {
    !role.loading && role.value != null && reset(role.value);
  }, [role.value]);

  useEffect(() => {
    isSubmitSuccessful && history.push(rolesPath());
  }, [isSubmitSuccessful]);

  const handleSubmitOnValid = useCallback(
    async (role: Role) => {
      const roleCreateUpdate: RoleCreateUpdate = {
        ...role,
        users: role.users.map((user) => user.id),
        groups: role.groups.map((group) => group.id),
        adminUsers: role.adminUsers.map((user) => user.id),
        adminGroups: role.adminGroups.map((group) => group.id),
      };

      const willCreate = roleId == null;
      const operationName = willCreate ? "作成" : "更新";

      try {
        if (willCreate) {
          await aironeApiClientV2.createRole(roleCreateUpdate);
        } else {
          await aironeApiClientV2.updateRole(roleId, roleCreateUpdate);
        }
        enqueueSnackbar(`ロールの${operationName}に成功しました`, {
          variant: "success",
        });
      } catch (e) {
        if (e instanceof Response) {
          await ExtractAPIException<Role>(
            e,
            (message) => {
              enqueueSnackbar(
                `ロールの${operationName}に失敗しました。詳細: "${message}"`,
                {
                  variant: "error",
                }
              );
            },
            (name, message) =>
              setError(name, { type: "custom", message: message })
          );
        } else {
          enqueueSnackbar(`ロールの${operationName}に失敗しました。`, {
            variant: "error",
          });
        }
      }
    },
    [roleId]
  );

  const handleCancel = async () => {
    history.goBack();
  };

  if (role.loading) {
    return <Loading />;
  }

  return (
    <Box className="container-fluid">
      <AironeBreadcrumbs>
        <Typography component={Link} to={topPath()}>
          Top
        </Typography>
        <Typography component={Link} to={rolesPath()}>
          ロール管理
        </Typography>
        <Typography color="textPrimary">ロール編集</Typography>
      </AironeBreadcrumbs>

      <PageHeader
        title={role.value != null ? role.value.name : "新規ロールの作成"}
        description={role.value != null ? "ロール編集" : undefined}
      >
        <SubmitButton
          name="保存"
          disabled={isSubmitting || isSubmitSuccessful} // FIXME check validation state
          handleSubmit={handleSubmit(handleSubmitOnValid)}
          handleCancel={handleCancel}
        />
      </PageHeader>

      <Container>
        <RoleForm control={control} setValue={setValue} getValues={getValues} />
      </Container>

      <Prompt
        when={isDirty && !isSubmitSuccessful}
        message="編集した内容は失われてしまいますが、このページを離れてもよろしいですか？"
      />
    </Box>
  );
};

import { Box } from "@mui/material";
import React, { FC, useEffect } from "react";

import { AttributesFields } from "./entityForm/AttributesFields";
import { BasicFields } from "./entityForm/BasicFields";

import { Entity, EntityWithAttr } from "apiclient/autogenerated";
import { DjangoContext } from "utils/DjangoContext";

interface Props {
  entity?: EntityWithAttr;
  entityInfo: {
    name: string;
    note: string;
    isTopLevel: boolean;
    attributes: { [key: string]: any }[];
  };
  setEntityInfo: (entityInfo: {
    name: string;
    note: string;
    isTopLevel: boolean;
    attributes: { [key: string]: any }[];
  }) => void;
  referralEntities?: Entity[];
  setSubmittable: (isSubmittable: boolean) => void;
}

export const EntityForm: FC<Props> = ({
  entity,
  entityInfo,
  setEntityInfo,
  referralEntities,
  setSubmittable,
}) => {
  const checkSubmittable = () => {
    if (entityInfo.name === "") {
      return false;
    }
    if (entityInfo.attributes.some((a) => a.name === "")) {
      return false;
    }

    const dc = DjangoContext.getInstance();
    if (
      entityInfo.attributes.some(
        (a) =>
          (Number(a.type) & Number(dc.attrTypeValue.object)) > 0 &&
          a.refIds.length === 0
      )
    ) {
      return false;
    }
    return true;
  };
  useEffect(() => {
    setSubmittable(checkSubmittable());
  });

  return (
    <Box>
      <Box>
        <Box sx={{ mb: "100px" }}>
          <BasicFields entityInfo={entityInfo} setEntityInfo={setEntityInfo} />

          <AttributesFields
            entityInfo={entityInfo}
            setEntityInfo={setEntityInfo}
            referralEntities={referralEntities}
          />
        </Box>
      </Box>
    </Box>
  );
};

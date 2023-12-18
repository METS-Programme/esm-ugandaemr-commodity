import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import {
  Button,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextArea,
} from "@carbon/react";
import styles from "./stock-operations-dialog.scss";
import {
  StopOperationAction,
  StopOperationActionType,
} from "../../core/api/types/stockOperation/StockOperationAction";
import { executeStockOperationAction } from "../stock-operations.resource";
import { showNotification, showToast } from "@openmrs/esm-framework";

interface StockOperationDialogProps {
  title: string;
  operation: StockOperationDTO;
  closeModal: () => void;
}

const StockOperationDialog: React.FC<StockOperationDialogProps> = ({
  title,
  operation,
  closeModal,
}) => {
  const confirmType = title.toLocaleLowerCase();

  const { t } = useTranslation();

  const [notes, setNotes] = useState("");

  const handleClick = async (event) => {
    event.preventDefault();

    let actionName: StopOperationActionType | null = null;

    switch (confirmType) {
      case "cancel":
        actionName = "CANCEL";
        break;
      case "reject":
        actionName = "REJECT";
        break;
      case "return":
        actionName = "RETURN";
        break;
      case "approve":
        actionName = "APPROVE";
        break;
      case "dispatchapproval":
        // messagePrefix = "dispatch";
        actionName = "DISPATCH";
        break;
    }
    if (!actionName) {
      return;
    }

    const payload: StopOperationAction = {
      name: actionName,
      uuid: operation.uuid,
      reason: notes,
    };

    // submit action
    executeStockOperationAction(payload).then(
      () => {
        showToast({
          critical: true,
          title: t("title", `${title} Operation`),
          kind: "success",
          description: t(
            "successMessage",
            `You have successfully ${title} operation `
          ),
        });
        closeModal();
      },
      (err) => {
        showNotification({
          title: t(`errorMessage`, `Error ${title} operation`),
          kind: "error",
          critical: true,
          description: err?.message,
        });
      }
    );
  };

  return (
    <div>
      <Form onSubmit={handleClick}>
        <ModalHeader
          closeModal={closeModal}
          title={t("title", `${title} Operation`)}
        />
        <ModalBody>
          <div className={styles.modalBody}>
            <section className={styles.section}>
              <h5 className={styles.section}>
                Would you really like to {title} the operation ?
              </h5>
            </section>
            <br />
            {title !== "Approve" && (
              <section className={styles.section}>
                <TextArea
                  labelText={t("notes", "Please explain the reason:")}
                  id="nextNotes"
                  name="nextNotes"
                  invalidText="Required"
                  maxCount={500}
                  enableCounter
                  onChange={(e) => setNotes(e.target.value)}
                />
              </section>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t("cancel", "Cancel")}
          </Button>
          <Button type="submit">{t("submit", "Submit")}</Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default StockOperationDialog;

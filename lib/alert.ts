import $ from "jquery";

enum AlertType {
  DANGER = "danger",
  SUCCESS = "success",
  WARNING = "warning",
}

// Helper function to show an alert.
const showAlert = function(msg: string, alertType: AlertType): void {
  for (const alertType of Object.values(AlertType)) {
    $(".alert").removeClass(`alert-${alertType}`);
  }
  $(".alert").addClass(`alert-${alertType}`);
  $(".alert").show();
  $(".alert-text").html(msg);
};

export const showErrorAlert = function(msg: string) {
  showAlert(msg, AlertType.DANGER);
};

export const showSuccessAlert = function(msg: string) {
  showAlert(msg, AlertType.SUCCESS);
};

export const showWarningAlert = function(msg: string) {
  showAlert(msg, AlertType.WARNING);
};

export const hideAlert = function(): void {
  $(".alert").hide();
  $(".alert-text").html();
};

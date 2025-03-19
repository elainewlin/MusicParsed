import $ from "jquery";

export enum AlertType {
  DANGER = "danger",
  SUCCESS = "success",
  WARNING = "warning",
}

// Helper function to show an alert.
export const showAlert = function(msg: string, alertType: AlertType): void {
  for (const alertType of Object.values(AlertType)) {
    $(".alert").removeClass(`alert-${alertType}`);
  }
  $(".alert").addClass(`alert-${alertType}`);
  $(".alert").show();
  $(".alert-text").text(msg);
};

export const hideAlert = function(): void {
  $(".alert").fadeOut();
  $(".alert-text").text();
};

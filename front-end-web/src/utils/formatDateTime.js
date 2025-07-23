// Fungsi format tanggal ke format yang diinginkan
export function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
}

// Fungsi untuk format waktu dari string ISO
export const formatTime = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);

  const time = date.toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const offset = date.getTimezoneOffset();
  const timeOffset = -offset / 60;

  let zone = "WIB";
  if (timeOffset === 8) zone = "WITA";
  else if (timeOffset === 9) zone = "WIT";

  return `${time} ${zone}`;
};

export const formatDateInputSafe = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};

export const formatAddress = (address: string) => {
  if (!address) return "";
  return address.slice(0, 6) + "..." + address.slice(-4);
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getFormattedDate(
  date: any,
  prefomattedDate = false as any,
  hideYear = false
) {
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  let minutes = date.getMinutes();
  if (minutes < 10) {
    // Adding leading zero to minutes
    minutes = `0${minutes}`;
  }
  if (prefomattedDate) {
    return `${prefomattedDate} at ${hours}:${minutes}`;
  }
  if (hideYear) {
    return `${day}. ${month} at ${hours}:${minutes}`;
  }
  // 10. January 2017. at 10:20
  return `${day}. ${month} ${year}. at ${hours}:${minutes}`;
}

export function formatDate(dateParam: any) {
  if (!dateParam) {
    return null;
  }
  const date =
    typeof dateParam === "object" ? dateParam : new Date(dateParam * 1000);
  const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
  const today: any = new Date();
  const yesterday = new Date(today - DAY_IN_MS);
  const seconds = Math.round((today - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const isToday = today.toDateString() === date.toDateString();
  const isYesterday = yesterday.toDateString() === date.toDateString();
  const isThisYear = today.getFullYear() === date.getFullYear();
  if (seconds < 0) {
    return new Date(dateParam).toLocaleDateString();
  } else if (seconds < 5) {
    return "Now";
  } else if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (seconds < 90) {
    return "About a minute ago";
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (isToday) {
    return getFormattedDate(date, "Today"); // Today at 10:20
  } else if (isYesterday) {
    return getFormattedDate(date, "Yesterday"); // Yesterday at 10:20
  } else if (isThisYear) {
    return getFormattedDate(date, false, true); // 10. January at 10:20
  }
  return getFormattedDate(date); // 10. January 2017. at 10:20
}

export const numberWithCommas = (x: number) => {
  x = Number(Number(x).toFixed(3));
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

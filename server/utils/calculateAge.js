module.exports = (cnp) => {
  if (typeof cnp !== "string" || !/^[1-6]\d{12}$/.test(cnp)) {
    return null;
  }

  const prefix = Number(cnp[0]);
  const century = prefix <= 2 ? 1900 : prefix <= 4 ? 1800 : 2000;

  const year = century + Number(cnp.slice(1, 3));
  const month = Number(cnp.slice(3, 5));
  const day = Number(cnp.slice(5, 7));

  const birthDate = new Date(Date.UTC(year, month - 1, day));

  if (
    birthDate.getUTCFullYear() !== year ||
    birthDate.getUTCMonth() !== month - 1 ||
    birthDate.getUTCDate() !== day
  ) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type) =>
    Number(parts.find((part) => part.type === type).value);

  const currentYear = getPart("year");
  const currentMonth = getPart("month");
  const currentDay = getPart("day");

  let age = currentYear - year;

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--;
  }

  return age < 0 ? null : age;
};

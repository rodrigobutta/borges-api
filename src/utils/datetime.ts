const pad2 = (n: number) => (n < 10 ? '0' + n : n);

const datetimeStamp = (date: Date | null = null) => {
  const dateObj = date || new Date();
  return (
    String(dateObj.getFullYear()) +
    pad2(dateObj.getMonth() + 1) +
    pad2(dateObj.getDate()) +
    pad2(dateObj.getHours()) +
    pad2(dateObj.getMinutes()) +
    pad2(dateObj.getSeconds())
  );
};

export { datetimeStamp };

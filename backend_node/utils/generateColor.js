// utils/generateColor.js
export default function generateColor() {
  // ensure 6 hex characters
  const color = Math.floor(Math.random() * 16777215).toString(16);
  return `#${color.padStart(6, "0")}`;
}

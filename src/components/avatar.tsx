/**
 * Colour is derived from the email so a given person is always the same colour
 * across the dashboard, header, and share dialog. Every pairing below meets
 * 4.5:1 against white text.
 */
const PALETTE = [
  "#4c5ce0",
  "#0f7b52",
  "#a3475f",
  "#1f6f8b",
  "#7a4bb5",
  "#a35a10",
];

function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function Avatar({
  name,
  email,
  size = "md",
}: {
  name: string;
  email: string;
  size?: "sm" | "md" | "lg";
}) {
  const dimensions = {
    sm: "h-7 w-7 text-[11px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  }[size];

  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: colorFor(email) }}
      className={`${dimensions} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

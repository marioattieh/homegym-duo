export type Member = {
  email: string;
  name: string;
  color: string;
  hex: string;
};

export const MEMBERS: Member[] = [
  { email: "mario.attieh.2@gmail.com", name: "Mario", color: "var(--color-mario)", hex: "#1f9be0" },
  { email: "tansimanuella@gmail.com", name: "Manuella", color: "var(--color-manuella)", hex: "#e85a87" },
];

export function isMember(email: string | null | undefined): boolean {
  if (!email) return false;
  return MEMBERS.some((m) => m.email === email.toLowerCase());
}

export function memberByEmail(email: string): Member | undefined {
  return MEMBERS.find((m) => m.email === email.toLowerCase());
}

export const MEMBER_ROLE_GUIDE_HINT =
  "Pour découvrir toute l'application, commencez par un manager.";

export const MEMBER_ROLE_EXPLANATIONS = [
  {
    role: "member",
    isExternal: false,
    description: "consulte ses congés et soumet des demandes.",
  },
  {
    role: "member",
    isExternal: true,
    description: "idem, et renseigne ses jours travaillés chaque mois.",
  },
  {
    role: "manager",
    isExternal: false,
    description:
      "approuve les demandes, corrige directement les congés des membres, gère les équipes et les membres.",
  },
  {
    role: "manager",
    isExternal: true,
    description: "idem, et renseigne ses jours travaillés.",
  },
] as const;

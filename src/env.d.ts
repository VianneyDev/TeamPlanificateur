/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    member: {
      id: string;
      name: string;
      role: string;
      isExternal: boolean;
      archived: boolean;
      teams: { id: string; name: string }[];
    } | null;
  }
}

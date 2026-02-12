/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    member: {
      id: string;
      name: string;
      role: string;
      teams: { id: string; name: string }[];
    } | null;
  }
}

/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    member: {
      id: string;
      name: string;
      role: string;
      team: {
        id: string;
        name: string;
      };
    } | null;
  }
}

import type { APIRoute } from "astro";
import app from "@/lib/api/app";

export const prerender = false;

export const ALL: APIRoute = ({ request }) => app.fetch(request);

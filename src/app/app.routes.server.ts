import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Parameterized routes must be Server-rendered (not prerendered)
  { path: 'products/:plan', renderMode: RenderMode.Server },
  { path: 'blog/:id',       renderMode: RenderMode.Server },

  // All other routes can be prerendered
  { path: '**', renderMode: RenderMode.Prerender }
];

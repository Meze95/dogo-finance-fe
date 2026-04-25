import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Authentication routes should be server-rendered to handle dynamic query params correctly in SSR
  { path: 'login',          renderMode: RenderMode.Server },
  { path: 'register',       renderMode: RenderMode.Server },
  { path: 'verify-email',   renderMode: RenderMode.Server },
  { path: 'forgot-password', renderMode: RenderMode.Server },
  { path: 'reset-password',  renderMode: RenderMode.Server },

  // Parameterized and Secured routes must be Server-rendered
  { path: 'products/:plan', renderMode: RenderMode.Server },
  { path: 'blog/:id',       renderMode: RenderMode.Server },
  { path: 'admin/**',       renderMode: RenderMode.Server },
  { path: 'client/**',      renderMode: RenderMode.Server },

  // All other routes can be prerendered
  { path: '**', renderMode: RenderMode.Prerender }
];

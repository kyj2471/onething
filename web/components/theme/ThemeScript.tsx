/**
 * Inline pre-hydration script that sets `html.dark` before React renders,
 * preventing a light-theme flash. Reads the `onething_theme` cookie with
 * a `prefers-color-scheme` fallback.
 */
export function ThemeScript() {
  const js = `
(function(){try{
  var m=document.cookie.match(/(?:^|; )onething_theme=([^;]+)/);
  var v=m?decodeURIComponent(m[1]):"system";
  var isDark=v==="dark"||(v!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  var h=document.documentElement;
  if(isDark)h.classList.add("dark");else h.classList.remove("dark");
  h.dataset.theme=v;
}catch(e){}})();
`.trim();
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

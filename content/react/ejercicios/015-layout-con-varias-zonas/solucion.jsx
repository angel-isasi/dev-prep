export function Layout({ encabezado, children, pie }) {
  return (
    <>
      <header>{encabezado}</header>
      <main>{children}</main>
      {/* El pie es opcional: sin `pie` no se pinta el <footer>. */}
      {pie && <footer>{pie}</footer>}
    </>
  );
}

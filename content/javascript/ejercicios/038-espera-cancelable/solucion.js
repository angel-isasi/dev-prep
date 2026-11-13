export function esperarCancelable(ms, signal) {
  return new Promise((resolver, rechazar) => {
    if (signal.aborted) {
      rechazar(new Error("Cancelado"));
      return;
    }

    const id = setTimeout(resolver, ms);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        rechazar(new Error("Cancelado"));
      },
      { once: true },
    );
  });
}

export function sleep(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

export function conTimeout(promesa, ms) {
  let id;
  const limite = new Promise((_, rechazar) => {
    id = setTimeout(() => rechazar(new Error("Tiempo agotado")), ms);
  });

  return Promise.race([promesa, limite]).finally(() => clearTimeout(id));
}

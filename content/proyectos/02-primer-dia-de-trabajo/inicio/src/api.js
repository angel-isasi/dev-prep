// Cliente de la API de MesaYa.
//
// En producción esto llama a la API REST del backend. Para desarrollo local (y para los
// tests) usamos este mock en memoria, con la misma forma de respuesta y un pequeño retraso
// para que se parezca a la red real. No le agregues lógica de pantalla: aquí solo van datos.
//
//   getOrders()                        GET   /orders            -> Promise<Order[]>
//   updateOrderStatus(id, status)      PATCH /orders/:id        -> Promise<Order>
//   getMenu()                          GET   /menu              -> Promise<Dish[]>
//   setDishAvailability(id, available) PATCH /menu/:id          -> Promise<Dish>
//
// Todas devuelven copias: si modificas lo que te llega, el "servidor" no se entera.
import { initialMenu } from "./data/menu.js";
import { initialOrders } from "./data/orders.js";

const DELAY_MS = 30;

let orders = [];
let menu = [];
let failNext = null;

const copyOrder = (order) => ({ ...order, items: order.items.map((item) => ({ ...item })) });

/** Deja el mock como nuevo. Los tests lo llaman antes de cada caso. */
export function resetDatabase(data = {}) {
  orders = (data.orders ?? initialOrders).map(copyOrder);
  menu = (data.menu ?? initialMenu).map((dish) => ({ ...dish }));
  failNext = null;
}

/**
 * Hace que la próxima petición falle, como si se cayera la red.
 * Sin argumento falla la próxima petición, sea cual sea; con un nombre ("getOrders",
 * "getMenu", "updateOrderStatus" o "setDishAvailability") falla solo la próxima de ese tipo.
 */
export function failNextRequest(endpoint = "any") {
  failNext = endpoint;
}

resetDatabase();

function respond(endpoint, handler) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failNext === "any" || failNext === endpoint) {
        failNext = null;
        reject(new Error("Error de red: el servidor no respondió"));
        return;
      }
      try {
        resolve(handler());
      } catch (error) {
        reject(error);
      }
    }, DELAY_MS);
  });
}

export function getOrders() {
  return respond("getOrders", () => orders.map(copyOrder));
}

export function updateOrderStatus(id, status) {
  return respond("updateOrderStatus", () => {
    const order = orders.find((o) => o.id === id);
    if (!order) throw new Error(`Error 404: no existe el pedido ${id}`);
    order.status = status;
    return copyOrder(order);
  });
}

export function getMenu() {
  return respond("getMenu", () => menu.map((dish) => ({ ...dish })));
}

export function setDishAvailability(id, available) {
  return respond("setDishAvailability", () => {
    const dish = menu.find((d) => d.id === id);
    if (!dish) throw new Error(`Error 404: no existe el plato ${id}`);
    dish.available = available;
    return { ...dish };
  });
}

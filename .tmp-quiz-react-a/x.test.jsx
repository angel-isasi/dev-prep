// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useState, Fragment } from "react";

afterEach(cleanup);

// ---------- T1 ----------
test("T1 lowercase component", () => {
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  function saludo() { return <p>Hola</p>; }
  function App() { return <saludo />; }
  const { container } = render(<App />);
  console.log("T1 lowercase:", JSON.stringify(container.innerHTML), err.mock.calls.map(c => String(c[0]).slice(0, 80)));
  err.mockRestore();
});

test("T1 booleans", () => {
  const { container } = render(<p>{true}{false}{null}{undefined}{0}{"hola"}</p>);
  console.log("T1 booleans:", JSON.stringify(container.textContent));
});

test("T1 object child", () => {
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  const usuario = { nombre: "Ana" };
  let msg = "";
  try { render(<p>{usuario}</p>); } catch (e) { msg = e.message; }
  console.log("T1 object child:", msg.slice(0, 120));
  err.mockRestore();
});

test("T1 style string", () => {
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  let msg = "";
  try { render(<p style="color: red">x</p>); } catch (e) { msg = e.message; }
  console.log("T1 style string:", msg.slice(0, 120));
  err.mockRestore();
});

test("T1 class attr", () => {
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  const { container } = render(<label class="campo" for="x">C</label>);
  console.log("T1 class:", container.innerHTML, err.mock.calls.map(c => String(c[0]).slice(0, 80)));
  err.mockRestore();
});

test("T1 onclick lowercase", () => {
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  const f = vi.fn();
  render(<button onclick={f}>b</button>);
  fireEvent.click(screen.getByText("b"));
  console.log("T1 onclick lowercase called:", f.mock.calls.length, err.mock.calls.map(c => String(c[0]).slice(0, 80)));
  err.mockRestore();
});

// ---------- T2 ----------
test("T2 default with null", () => {
  function Precio({ monto = 0, moneda = "S/" }) { return <p>{moneda} {monto}</p>; }
  const { container } = render(<Precio monto={null} />);
  console.log("T2 null default:", JSON.stringify(container.textContent));
});

test("T2 children ignored", () => {
  function Caja({ titulo }) { return <h2>{titulo}</h2>; }
  const { container } = render(<Caja titulo="Promo"><p>2x1</p></Caja>);
  console.log("T2 children ignored:", container.innerHTML);
});

test("T2 onClick called at render", () => {
  const log = vi.fn();
  function Boton({ onClick }) { return <button onClick={onClick}>Ok</button>; }
  function App() { const avisar = () => log("clic"); return <Boton onClick={avisar()} />; }
  render(<App />);
  const antes = log.mock.calls.length;
  fireEvent.click(screen.getByText("Ok"));
  console.log("T2 avisar(): at render", antes, "after click", log.mock.calls.length);
});

test("T2 mutate props", () => {
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  function Saludo(props) { props.nombre = props.nombre.toUpperCase(); return <p>{props.nombre}</p>; }
  let msg = "ok";
  try { render(<Saludo nombre="ana" />); } catch (e) { msg = e.message; }
  console.log("T2 mutate props:", msg.slice(0, 120));
  err.mockRestore();
});

test("T2 no destructuring", () => {
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  function Saludo(nombre) { return <p>Hola, {nombre}</p>; }
  let msg = "ok";
  try { render(<Saludo nombre="Ana" />); } catch (e) { msg = e.message; }
  console.log("T2 no destructuring:", msg.slice(0, 140));
  err.mockRestore();
});

// ---------- T3 ----------
test("T3 triple set", () => {
  function C() { const [n, setN] = useState(0); return <button onClick={() => { setN(n + 1); setN(n + 1); setN(n + 1); }}>{n}</button>; }
  render(<C />);
  fireEvent.click(screen.getByRole("button"));
  console.log("T3 triple set:", screen.getByRole("button").textContent);
});

test("T3 triple updater", () => {
  function C() { const [n, setN] = useState(0); return <button onClick={() => { setN((p) => p + 1); setN((p) => p + 1); setN((p) => p + 1); }}>{n}</button>; }
  render(<C />);
  fireEvent.click(screen.getByRole("button"));
  console.log("T3 triple updater:", screen.getByRole("button").textContent);
});

test("T3 log after set", () => {
  const log = vi.fn();
  function C() { const [n, setN] = useState(0); return <button onClick={() => { setN(n + 1); log(n); }}>{n}</button>; }
  render(<C />);
  fireEvent.click(screen.getByRole("button"));
  console.log("T3 log after set: logged", log.mock.calls[0][0], "screen", screen.getByRole("button").textContent);
});

test("T3 push mutate", () => {
  function L() {
    const [items, setItems] = useState(["pan"]);
    return <div><button onClick={() => { items.push("leche"); setItems(items); }}>add</button><p>{items.length}</p></div>;
  }
  const { container } = render(<L />);
  fireEvent.click(screen.getByText("add"));
  console.log("T3 push mutate:", container.querySelector("p").textContent);
});

test("T3 plain variable", () => {
  function C() { let contador = 0; return <button onClick={() => { contador = contador + 1; }}>Clics: {contador}</button>; }
  render(<C />);
  fireEvent.click(screen.getByRole("button"));
  fireEvent.click(screen.getByRole("button"));
  console.log("T3 plain var:", screen.getByRole("button").textContent);
});

test("T3 object state lost field", () => {
  function F() {
    const [form, setForm] = useState({ nombre: "", edad: 20 });
    return <div><input aria-label="n" value={form.nombre} onChange={(e) => setForm({ nombre: e.target.value })} /><p>Edad: {form.edad}</p></div>;
  }
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  const { container } = render(<F />);
  fireEvent.change(screen.getByLabelText("n"), { target: { value: "A" } });
  console.log("T3 object lost:", JSON.stringify(container.querySelector("p").textContent));
  err.mockRestore();
});

test("T3 object state spread", () => {
  function F() {
    const [form, setForm] = useState({ nombre: "", edad: 20 });
    return <div><input aria-label="n" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /><p>{form.nombre} {form.edad}</p></div>;
  }
  const { container } = render(<F />);
  fireEvent.change(screen.getByLabelText("n"), { target: { value: "A" } });
  console.log("T3 object spread:", JSON.stringify(container.querySelector("p").textContent));
});

// ---------- T4 ----------
test("T4 zero &&", () => {
  function C({ cantidad }) { return <div>{cantidad && <p>Tienes {cantidad}</p>}</div>; }
  const { container } = render(<C cantidad={0} />);
  console.log("T4 0&&:", JSON.stringify(container.innerHTML));
});

test("T4 empty length &&", () => {
  const items = [];
  const { container } = render(<div>{items.length && <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>}</div>);
  console.log("T4 length&&:", JSON.stringify(container.innerHTML));
});

test("T4 map braces no return", () => {
  const items = ["a", "b"];
  const { container } = render(<ul>{items.map((item) => { <li key={item}>{item}</li>; })}</ul>);
  console.log("T4 map braces:", JSON.stringify(container.innerHTML));
});

test("T4 key index inputs", () => {
  function Lista() {
    const [nombres, setNombres] = useState(["Ana", "Luis"]);
    return (
      <div>
        <button onClick={() => setNombres(["Rosa", ...nombres])}>Agregar</button>
        <ul>{nombres.map((n, i) => <li key={i}>{n} <input aria-label={"in" + i} /></li>)}</ul>
      </div>
    );
  }
  const { container } = render(<Lista />);
  const inputs = container.querySelectorAll("input");
  inputs[0].value = "hola";
  fireEvent.click(screen.getByText("Agregar"));
  const lis = [...container.querySelectorAll("li")].map((li) => li.textContent.trim() + "=" + li.querySelector("input").value);
  console.log("T4 key index:", lis);
});

test("T4 key with id inputs", () => {
  function Lista() {
    const [nombres, setNombres] = useState(["Ana", "Luis"]);
    return (
      <div>
        <button onClick={() => setNombres(["Rosa", ...nombres])}>Agregar</button>
        <ul>{nombres.map((n) => <li key={n}>{n} <input /></li>)}</ul>
      </div>
    );
  }
  const { container } = render(<Lista />);
  container.querySelectorAll("input")[0].value = "hola";
  fireEvent.click(screen.getByText("Agregar"));
  const lis = [...container.querySelectorAll("li")].map((li) => li.textContent.trim() + "=" + li.querySelector("input").value);
  console.log("T4 key id:", lis);
});

test("T4 key inside child warning", () => {
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  function Item({ texto }) { return <li key={texto}>{texto}</li>; }
  function Lista() { return <ul>{["a", "b"].map((t) => <Item texto={t} />)}</ul>; }
  render(<Lista />);
  console.log("T4 key inside child:", err.mock.calls.map((c) => String(c[0]).slice(0, 90)));
  err.mockRestore();
});

test("T4 key prop undefined", () => {
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  function Item(props) { return <li>{String(props.key)}</li>; }
  const { container } = render(<ul>{["a"].map((t) => <Item key={t} />)}</ul>);
  console.log("T4 props.key:", container.textContent, err.mock.calls.map((c) => String(c[0]).slice(0, 90)));
  err.mockRestore();
});

test("T4 ternary nested and early return", () => {
  function Aviso({ mensaje }) { if (!mensaje) return null; return <p>{mensaje}</p>; }
  const { container } = render(<div><Aviso mensaje="" /></div>);
  console.log("T4 early return:", JSON.stringify(container.innerHTML));
});

test("T4 fragment key", () => {
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  const terms = [{ id: 1, t: "A", d: "x" }];
  const { container } = render(<dl>{terms.map((x) => <Fragment key={x.id}><dt>{x.t}</dt><dd>{x.d}</dd></Fragment>)}</dl>);
  console.log("T4 fragment key:", container.innerHTML, err.mock.calls.length);
  err.mockRestore();
});

test("T4 NaN &&", () => {
  const { container } = render(<div>{NaN && <p>x</p>}{"" && <p>y</p>}</div>);
  console.log("T4 NaN/empty str:", JSON.stringify(container.innerHTML));
});

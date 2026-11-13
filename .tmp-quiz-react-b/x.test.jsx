// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import {
  StrictMode, useState, useEffect, useRef, useReducer, useCallback, createContext, useContext, memo,
} from "react";
import { createPortal } from "react-dom";

afterEach(cleanup);

test("efecto sin arreglo: montar + 2 clics", () => {
  const log = [];
  function C() {
    const [n, setN] = useState(0);
    useEffect(() => { log.push("efecto"); });
    return <button onClick={() => setN(n + 1)}>{n}</button>;
  }
  render(<C />);
  fireEvent.click(screen.getByRole("button"));
  fireEvent.click(screen.getByRole("button"));
  expect(log.length).toBe(3);
});

test("strictmode efecto con limpieza", () => {
  const log = [];
  function C() {
    useEffect(() => { log.push("efecto"); return () => log.push("limpieza"); }, []);
    return null;
  }
  render(<StrictMode><C /></StrictMode>);
  expect(log).toEqual(["efecto", "limpieza", "efecto"]);
});

test("intervalo con closure viejo", () => {
  vi.useFakeTimers();
  function C() {
    const [seg, setSeg] = useState(0);
    useEffect(() => {
      const t = setInterval(() => setSeg(seg + 1), 1000);
      return () => clearInterval(t);
    }, []);
    return <p>{seg}</p>;
  }
  render(<C />);
  act(() => { vi.advanceTimersByTime(5000); });
  expect(screen.getByRole("paragraph").textContent).toBe("1");
  vi.useRealTimers();
});

test("estado derivado con efecto: renders", () => {
  let renders = 0;
  function C({ nombre }) {
    const [completo, setCompleto] = useState("");
    useEffect(() => { setCompleto(nombre + "!"); }, [nombre]);
    renders++;
    return <p>{completo}</p>;
  }
  const { rerender } = render(<C nombre="a" />);
  const antes = renders;
  rerender(<C nombre="b" />);
  expect(renders - antes).toBe(2);
});

test("useRef no re-renderiza", () => {
  function C() {
    const clics = useRef(0);
    return (<><button onClick={() => { clics.current++; }}>+</button><p>{clics.current}</p></>);
  }
  render(<C />);
  for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("paragraph").textContent).toBe("0");
});

test("reducer que muta", () => {
  function reducer(estado, accion) {
    if (accion.tipo === "sumar") { estado.cuenta++; return estado; }
    return estado;
  }
  function C() {
    const [e, d] = useReducer(reducer, { cuenta: 0 });
    return (<><button onClick={() => d({ tipo: "sumar" })}>+</button><p>Cuenta: {e.cuenta}</p></>);
  }
  render(<C />);
  fireEvent.click(screen.getByRole("button"));
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("paragraph").textContent).toBe("Cuenta: 0");
});

test("context anidado", () => {
  const Ctx = createContext("claro");
  function H() { return <span>{useContext(Ctx)} </span>; }
  const { container } = render(
    <div>
      <Ctx value="oscuro"><H /><Ctx value="azul"><H /></Ctx></Ctx>
      <H />
    </div>,
  );
  expect(container.textContent).toBe("oscuro azul claro ");
});

test("useCallback con [] ve el valor viejo", () => {
  const log = [];
  function C() {
    const [cuenta, setCuenta] = useState(0);
    const mostrar = useCallback(() => log.push(cuenta), []);
    return (<><button onClick={() => setCuenta((c) => c + 1)}>sumar</button><button onClick={mostrar}>mostrar</button></>);
  }
  render(<C />);
  fireEvent.click(screen.getByText("sumar"));
  fireEvent.click(screen.getByText("sumar"));
  fireEvent.click(screen.getByText("mostrar"));
  expect(log).toEqual([0]);
});

test("memo con objeto en línea", () => {
  let renders = 0;
  const Fila = memo(function Fila({ estilo }) { renders++; return <span style={estilo}>fila</span>; });
  function P() {
    const [n, setN] = useState(0);
    return (<><button onClick={() => setN(n + 1)}>{n}</button><Fila estilo={{ color: "red" }} /></>);
  }
  render(<P />);
  fireEvent.click(screen.getByRole("button"));
  expect(renders).toBe(2);
});

test("memo con prop primitiva no re-renderiza", () => {
  let renders = 0;
  const Fila = memo(function Fila({ texto }) { renders++; return <span>{texto}</span>; });
  function P() {
    const [n, setN] = useState(0);
    return (<><button onClick={() => setN(n + 1)}>{n}</button><Fila texto="hola" /></>);
  }
  render(<P />);
  fireEvent.click(screen.getByRole("button"));
  expect(renders).toBe(1);
});

test("portal: el evento sube por el árbol de React", () => {
  const log = [];
  function C() {
    return (
      <div onClick={() => log.push("padre")}>
        {createPortal(<button>X</button>, document.body)}
      </div>
    );
  }
  render(<C />);
  fireEvent.click(screen.getByRole("button"));
  expect(log).toEqual(["padre"]);
});

test("FormData con checkbox marcado sin value", () => {
  let datos;
  function F() {
    return (
      <form onSubmit={(e) => { e.preventDefault(); datos = Object.fromEntries(new FormData(e.currentTarget)); }}>
        <input name="nombre" defaultValue="Ana" />
        <input type="checkbox" name="promo" defaultChecked />
        <input type="checkbox" name="factura" />
        <button>Enviar</button>
      </form>
    );
  }
  render(<F />);
  fireEvent.click(screen.getByRole("button"));
  expect(datos).toEqual({ nombre: "Ana", promo: "on" });
});

test("setForm sin spread pierde campos", () => {
  function F() {
    const [form, setForm] = useState({ nombre: "", email: "" });
    return (
      <>
        <input aria-label="n" name="nombre" value={form.nombre ?? ""} onChange={(e) => setForm({ [e.target.name]: e.target.value })} />
        <p>{JSON.stringify(form)}</p>
      </>
    );
  }
  render(<F />);
  fireEvent.change(screen.getByLabelText("n"), { target: { value: "A" } });
  expect(screen.getByRole("paragraph").textContent).toBe('{"nombre":"A"}');
});

test("input con value y sin onChange no cambia", () => {
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  function F() {
    const [n] = useState("Ana");
    return <input aria-label="n" value={n} />;
  }
  render(<F />);
  const input = screen.getByLabelText("n");
  fireEvent.change(input, { target: { value: "Pepe" } });
  expect(input.value).toBe("Ana");
  expect(err).toHaveBeenCalled();
  err.mockRestore();
});

test("number input da string", () => {
  function F() {
    const [c, setC] = useState(1);
    return (<><input aria-label="c" type="number" value={c} onChange={(e) => setC(e.target.value)} /><p>{c + 1}</p></>);
  }
  render(<F />);
  fireEvent.change(screen.getByLabelText("c"), { target: { value: "2" } });
  expect(screen.getByRole("paragraph").textContent).toBe("21");
});

test("custom hook: estado independiente", () => {
  function useContador() { const [n, setN] = useState(0); return [n, () => setN((x) => x + 1)]; }
  function A({ label }) { const [n, inc] = useContador(); return <button onClick={inc}>{label}{n}</button>; }
  render(<><A label="a" /><A label="b" /></>);
  fireEvent.click(screen.getByText("a0"));
  fireEvent.click(screen.getByText("a1"));
  expect(screen.getByText("a2")).toBeTruthy();
  expect(screen.getByText("b0")).toBeTruthy();
});

test("useEffect [] no se re-ejecuta al cambiar prop", () => {
  const llamadas = [];
  function C({ id }) {
    useEffect(() => { llamadas.push(id); }, []);
    return null;
  }
  const { rerender } = render(<C id={1} />);
  rerender(<C id={2} />);
  expect(llamadas).toEqual([1]);
});

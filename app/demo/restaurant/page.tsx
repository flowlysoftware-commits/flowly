"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Beer,
  CheckCircle2,
  Coffee,
  CreditCard,
  Euro,
  LogOut,
  Plus,
  Receipt,
  Send,
  ShoppingCart,
  Store,
  Utensils,
  XCircle,
} from "lucide-react";

type Tab = "Dashboard" | "Mesas" | "TPV" | "Pedidos" | "Estadísticas";
type TableStatus = "Libre" | "Ocupada" | "Cuenta";
type OrderStatus = "Abierto" | "En cocina" | "Cobrado";

type RestaurantTable = {
  id: number;
  name: string;
  status: TableStatus;
};

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
};

type CartItem = Product & {
  quantity: number;
};

type Order = {
  id: number;
  table: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
};

const initialTables: RestaurantTable[] = [
  { id: 1, name: "Mesa 1", status: "Libre" },
  { id: 2, name: "Mesa 2", status: "Ocupada" },
  { id: 3, name: "Mesa 3", status: "Libre" },
  { id: 4, name: "Mesa 4", status: "Cuenta" },
  { id: 5, name: "Terraza 1", status: "Libre" },
  { id: 6, name: "Terraza 2", status: "Ocupada" },
  { id: 7, name: "Barra 1", status: "Libre" },
  { id: 8, name: "Barra 2", status: "Ocupada" },
];

const products: Product[] = [
  { id: 1, name: "Cerveza", category: "Bebidas", price: 3 },
  { id: 2, name: "Coca Cola", category: "Bebidas", price: 2.5 },
  { id: 3, name: "Agua", category: "Bebidas", price: 1.8 },
  { id: 4, name: "Hamburguesa", category: "Comida", price: 12 },
  { id: 5, name: "Patatas bravas", category: "Comida", price: 6 },
  { id: 6, name: "Ensalada César", category: "Comida", price: 9 },
  { id: 7, name: "Tarta queso", category: "Postres", price: 5 },
  { id: 8, name: "Brownie", category: "Postres", price: 5.5 },
  { id: 9, name: "Café solo", category: "Cafés", price: 1.4 },
  { id: 10, name: "Café con leche", category: "Cafés", price: 1.8 },
];

const initialOrders: Order[] = [
  {
    id: 1,
    table: "Mesa 2",
    items: [
      { ...products[0], quantity: 2 },
      { ...products[3], quantity: 1 },
    ],
    total: 18,
    status: "En cocina",
  },
  {
    id: 2,
    table: "Mesa 4",
    items: [
      { ...products[1], quantity: 2 },
      { ...products[6], quantity: 1 },
    ],
    total: 10,
    status: "Abierto",
  },
];

export default function RestaurantDemoPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedTable, setSelectedTable] = useState("Mesa 1");
  const [category, setCategory] = useState("Bebidas");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const access = localStorage.getItem("flowly_demo_access");
    if (access !== "true") router.push("/demo/login");
  }, [router]);

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const logout = () => {
    localStorage.removeItem("flowly_demo_access");
    router.push("/");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const openOrders = orders.filter((order) => order.status !== "Cobrado");
  const todayRevenue = orders
    .filter((order) => order.status === "Cobrado")
    .reduce((sum, order) => sum + order.total, 0) + 2450;

  const ticketAverage = Math.round(todayRevenue / 87);

  const addProduct = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  const sendToKitchen = () => {
    if (!cart.length) return alert("Añade productos primero");

    const order: Order = {
      id: Date.now(),
      table: selectedTable,
      items: cart,
      total: cartTotal,
      status: "En cocina",
    };

    setOrders([order, ...orders]);
    setTables((current) =>
      current.map((table) =>
        table.name === selectedTable ? { ...table, status: "Ocupada" } : table
      )
    );
    setCart([]);
    setActiveTab("Pedidos");
    notify("Comanda enviada a cocina");
  };

  const chargeTable = () => {
    if (!cart.length) return alert("Añade productos primero");

    const order: Order = {
      id: Date.now(),
      table: selectedTable,
      items: cart,
      total: cartTotal,
      status: "Cobrado",
    };

    setOrders([order, ...orders]);
    setTables((current) =>
      current.map((table) =>
        table.name === selectedTable ? { ...table, status: "Libre" } : table
      )
    );
    setCart([]);
    notify("Mesa cobrada correctamente");
  };

  const updateOrderStatus = (id: number, status: OrderStatus) => {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status } : order))
    );
    notify(`Pedido actualizado: ${status}`);
  };

  const filteredProducts = products.filter((item) => item.category === category);

  return (
    <main className="flowly-demo-shell min-h-screen">
      {toast && (
        <div className="fixed right-6 top-6 z-[60] rounded-full bg-neutral-950 px-5 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="flowly-demo-sidebar hidden w-72 p-6 md:block">
          <h1 className="text-xl font-semibold text-white">Flowly POS</h1>
          <p className="mt-1 text-sm text-white/45">Restaurantes y bares</p>

          <nav className="mt-10 space-y-2 text-sm">
            {[
              ["Dashboard", BarChart3],
              ["Mesas", Store],
              ["TPV", ShoppingCart],
              ["Pedidos", Receipt],
              ["Estadísticas", Euro],
            ].map(([label, Icon]) => (
              <button
                key={String(label)}
                onClick={() => setActiveTab(label as Tab)}
                className={
                  activeTab === label
                    ? "flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-950/30"
                    : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-white/62 hover:bg-white/10 hover:text-white"
                }
              >
                <Icon size={18} />
                {label as string}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1 px-6 py-8 text-white">
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-cyan-200">Demo · TPV</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight">Flowly POS Restaurante</h2>
              <p className="mt-2 text-white/58">
                Gestiona mesas, comandas, productos, cobros y tickets.
              </p>
            </div>

            <button onClick={logout} className="flowly-secondary rounded-full px-5 py-3 text-white">
              <LogOut size={18} className="inline" /> Salir
            </button>
          </header>

          <div className="mb-6 flex gap-2 overflow-x-auto md:hidden">
            {["Dashboard", "Mesas", "TPV", "Pedidos", "Estadísticas"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={
                  activeTab === tab
                    ? "rounded-full bg-neutral-950 px-4 py-2 text-sm text-white"
                    : "rounded-full border bg-white px-4 py-2 text-sm text-neutral-600"
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Dashboard" && (
            <>
              <section className="mb-8 grid gap-4 md:grid-cols-4">
                <Card icon={<Euro />} label="Ventas hoy" value={`${todayRevenue} €`} />
                <Card icon={<Receipt />} label="Tickets" value="87" />
                <Card icon={<CreditCard />} label="Ticket medio" value={`${ticketAverage} €`} />
                <Card icon={<Store />} label="Pedidos abiertos" value={openOrders.length} />
              </section>

              <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <Panel title="Mesas activas">
                  <TableGrid tables={tables} selectTable={setSelectedTable} />
                </Panel>

                <Panel dark title="Actividad del turno">
                  <div className="space-y-3 text-sm text-white/75">
                    <div className="rounded-2xl bg-white/10 p-4">
                      Cocina tiene {orders.filter((o) => o.status === "En cocina").length} comandas pendientes.
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      Producto más vendido: cerveza.
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      Mesa con cuenta pendiente: Mesa 4.
                    </div>
                  </div>
                </Panel>
              </section>
            </>
          )}

          {activeTab === "Mesas" && (
            <Panel title="Plano de mesas">
              <p className="mb-5 text-sm text-neutral-500">
                Selecciona una mesa para abrir el TPV.
              </p>
              <TableGrid
                tables={tables}
                selectTable={(table) => {
                  setSelectedTable(table);
                  setActiveTab("TPV");
                }}
              />
            </Panel>
          )}

          {activeTab === "TPV" && (
            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Panel title={`TPV · ${selectedTable}`}>
                <div className="mb-5 flex flex-wrap gap-3">
                  {["Bebidas", "Comida", "Postres", "Cafés"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={
                        category === cat
                          ? "rounded-full bg-neutral-950 px-4 py-2 text-sm text-white"
                          : "rounded-full border px-4 py-2 text-sm"
                      }
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addProduct(product)}
                      className="rounded-3xl border border-neutral-100 bg-white p-5 text-left transition hover:bg-neutral-50"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                        {product.category === "Bebidas" && <Beer />}
                        {product.category === "Comida" && <Utensils />}
                        {product.category === "Postres" && <SparkIcon />}
                        {product.category === "Cafés" && <Coffee />}
                      </div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="mt-1 text-sm text-white/45">{product.price.toFixed(2)} €</p>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel title="Pedido actual">
                {cart.length === 0 ? (
                  <div className="rounded-3xl border border-dashed p-8 text-center text-neutral-500">
                    Añade productos para crear una comanda.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between rounded-2xl bg-neutral-50 p-4">
                        <span>{item.quantity}x {item.name}</span>
                        <strong>{(item.price * item.quantity).toFixed(2)} €</strong>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 rounded-3xl bg-neutral-950 p-5 text-white">
                  <p className="text-sm text-white/50">Total</p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight">{cartTotal.toFixed(2)} €</p>
                </div>

                <div className="mt-5 grid gap-3">
                  <button onClick={sendToKitchen} className="rounded-full bg-violet-600 px-5 py-3 text-white">
                    <Send size={16} className="inline" /> Enviar a cocina
                  </button>
                  <button onClick={chargeTable} className="flowly-primary rounded-full px-5 py-3 font-semibold">
                    <CreditCard size={16} className="inline" /> Cobrar mesa
                  </button>
                  <button onClick={() => notify("Cuenta dividida en 2 pagos")} className="rounded-full border px-5 py-3">
                    Dividir cuenta
                  </button>
                </div>
              </Panel>
            </section>
          )}

          {activeTab === "Pedidos" && (
            <Panel title="Pedidos y comandas">
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-neutral-100 p-5">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <p className="text-lg font-semibold">{order.table}</p>
                        <p className="mt-1 text-sm text-white/45">
                          {order.items.map((item) => `${item.quantity}x ${item.name}`).join(" · ")}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs">
                          {order.status}
                        </span>
                        <strong>{order.total.toFixed(2)} €</strong>

                        {order.status !== "Cobrado" && (
                          <button
                            onClick={() => updateOrderStatus(order.id, "Cobrado")}
                            className="rounded-full border border-green-200 px-3 py-2 text-xs text-green-700"
                          >
                            <CheckCircle2 size={14} className="inline" /> Cobrar
                          </button>
                        )}

                        <button
                          onClick={() => updateOrderStatus(order.id, "En cocina")}
                          className="rounded-full border px-3 py-2 text-xs"
                        >
                          Cocina
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === "Estadísticas" && (
            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <Panel title="Ventas por hora">
                <div className="flex h-72 items-end gap-3">
                  {[30, 55, 42, 78, 65, 92, 70, 88].map((value, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-3">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-violet-600 to-pink-300"
                        style={{ height: `${value}%` }}
                      />
                      <p className="text-xs text-neutral-500">{10 + index}:00</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Top productos">
                <div className="space-y-3">
                  {["Cerveza", "Hamburguesa", "Café con leche", "Patatas bravas"].map((item, index) => (
                    <div key={item} className="rounded-2xl bg-neutral-50 p-4">
                      <p className="font-medium">#{index + 1} {item}</p>
                      <p className="mt-1 text-sm text-white/45">{42 - index * 7} unidades vendidas</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

function TableGrid({
  tables,
  selectTable,
}: {
  tables: RestaurantTable[];
  selectTable: (table: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {tables.map((table) => (
        <button
          key={table.id}
          onClick={() => selectTable(table.name)}
          className="rounded-3xl border border-neutral-100 bg-neutral-50 p-5 text-left transition hover:bg-white hover:shadow-sm"
        >
          <p className="text-lg font-semibold">{table.name}</p>
          <span
            className={
              table.status === "Libre"
                ? "mt-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                : table.status === "Ocupada"
                ? "mt-4 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
                : "mt-4 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700"
            }
          >
            {table.status}
          </span>
        </button>
      ))}
    </div>
  );
}

function SparkIcon() {
  return <span className="text-xl">🍰</span>;
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        {icon}
      </div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, children, dark = false }: { title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={dark ? "rounded-[2rem] bg-neutral-950 p-6 text-white shadow-sm" : "rounded-[2rem] bg-white p-6 shadow-sm"}>
      <h3 className="mb-5 text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

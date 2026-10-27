import { established } from "./data/load";
import { BrandTable } from "./components/BrandTable";

export default function App() {
  return (
    <main className="page">
      <h1>Brands</h1>
      <BrandTable data={established} />
    </main>
  );
}

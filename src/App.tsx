import { useCallback, useState } from 'react';
import Map from './components/Map';
import { Globe2 } from 'lucide-react';

function App() {
  // const [amount,setAmount]=useState(1)
  // const increment=useCallback(()=>{
  //   console.log("increment called")
  //   setAmount((prev)=>prev+1)
  // },[])
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Globe2 className="text-blue-500" size={24} />
            <h1 className="text-xl font-bold text-gray-900">GeoExplorer</h1>
          </div>
          {/* <button onClick={increment}>Increment</button>
          <p>Amount: {amount}</p> */}
        </div>
      </header>
      <main className="flex-1">
        <Map />
      </main>
    </div>
  );
}

export default App;
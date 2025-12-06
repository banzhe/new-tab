import { SearchBar } from "./components/SearchBar"

function App() {
  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center">
      {/* 搜索栏 */}
      <SearchBar placeholder="搜索 Google..." />
    </div>
  )
}

export default App

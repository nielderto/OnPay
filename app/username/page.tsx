export default function UsernamePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-4 relative">
        {/* Background elements */}
        <div className="fixed inset-0 z-[-1]">
          {/* Hexagon grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fillRule='evenodd' stroke='%230000FF' strokeWidth='2' fill='none'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="flex justify-center items-center p-4 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center justify-center w-80">
                <h1 className="text-2xl font-bold mb-4">Create Username</h1>
                <div className="relative w-full">
                    <input 
                        type="text" 
                        placeholder="eg.. Shiro123" 
                        className="w-full p-2 pr-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">.lisk</span>
                </div>
                <button className="w-full p-2 border rounded-md bg-blue-500 text-white mt-4 hover:bg-blue-600 transition-colors">Create</button>
            </div>
        </div>
      </div>
    </main>
  );
}

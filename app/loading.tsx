export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative w-20 h-20">
        {/* Outer ring */}
        <div className="absolute w-full h-full border-4 border-blue-500/20 rounded-full"></div>
        {/* Spinning ring */}
        <div className="absolute w-full h-full border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    </div>
  );
}


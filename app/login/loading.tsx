export default function LoginLoading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-[22px] h-[22px] rounded-full bg-[#4285F5] mx-[10px] animate-bounceY"></div>
      <div className="w-[22px] h-[22px] rounded-full bg-[#EA4436] mx-[10px] animate-bounceY [animation-delay:0.25s]"></div>
      <div className="w-[22px] h-[22px] rounded-full bg-[#FBBD06] mx-[10px] animate-bounceY [animation-delay:0.5s]"></div>
      <div className="w-[22px] h-[22px] rounded-full bg-[#34A952] mx-[10px] animate-bounceY [animation-delay:0.75s]"></div>
    </div>
  );
} 
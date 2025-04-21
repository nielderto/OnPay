import Logout from "./Logout";
import Topup from "./Topup";
import Send from "./Send";
import Home from "./Home";

export default function Navbar(){
    return (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center p-4 bg-white border-t border-gray-200 shadow-lg max-w-screen">
            <div className="flex items-center gap-4">
                <Home />
                <Send />
                <Topup />
                <Logout />
            </div>
        </div>
    )
}

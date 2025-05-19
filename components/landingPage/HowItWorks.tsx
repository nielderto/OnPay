import { LogIn, PlusCircle, Send } from "lucide-react"

export default function HowItWorks() {
    const steps = [
        {
            icon: <LogIn className="h-8 w-8 text-blue-500"/>,
            title: "Login",
            description: "Sign in with your email, Google, or social accounts. New users get an instant account setup with zero technical hurdles."
        },
        {
            icon: <PlusCircle className="h-8 w-8 text-blue-500"/>,
            title: "Add funds",
            description: "Topup IDRX to your account using bank transfer (BNI, BRI, BCA, etc)."
        },
        {
            icon: <Send className="h-8 w-8 text-blue-500"/>,
            title: "Send",
            description: "Transfer money to anyone, anywhere with just a few clicks. Fast, secure, and hassle-free."
        }
    ]
    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-2">HOW IT WORKS</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Payments done in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              three steps
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We've simplified the payment process so you can focus on what matters most.
          </p>
        </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          {/* Connection lines between steps */}
          <div className="hidden md:block absolute top-1/3 left-1/3 w-1/3 border-t-2 border-dashed border-blue-200"></div>
          <div className="hidden md:block absolute top-1/3 right-1/3 w-1/3 border-t-2 border-dashed border-blue-200"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
            >
              <div className="mb-6 p-4 bg-blue-50 rounded-full mx-auto w-20 h-20 flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">{step.title}</h3>
              <p className="text-gray-600 text-center">{step.description}</p>
            </div>
          ))}
        </div>
    </section>
    )
}

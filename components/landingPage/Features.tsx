import { Shield, Zap, Smartphone, Clock} from "lucide-react"

export default function Features() {
    const features = [
        {
            icon: <Shield  className="h-8 w-8 text-blue-500"/>,
            title: "Security",
            description: "Blockchain-based security ensures that your transactions are secure and cannot be tampered with."
        },
        {
            icon: <Zap  className="h-8 w-8 text-blue-500"/>,
            title: "Speed",
            description: "Instant transactions and pay using IDRX only."
        },
        {
            icon: <Smartphone  className="h-8 w-8 text-blue-500"/>,
            title: "Mobile",
            description: "Send and receive payments on the go on mobile or desktop."
        },
        {
            icon: <Clock  className="h-8 w-8 text-blue-500"/>,
            title: "24/7 Availability",
            description: "Access your account and make transfers any time, day or night."
        },
    ]

    return (
        <section className="py-24 bg-gray-50 relative overflow-hidden h-screen">
            <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-2">WHY CHOOSE ONPAY</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Features you'll{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">love</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We've built OnPay with your needs in mind. Here's what makes us different.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="mb-4 p-3 bg-blue-50 rounded-lg inline-block group-hover:bg-blue-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    );
}

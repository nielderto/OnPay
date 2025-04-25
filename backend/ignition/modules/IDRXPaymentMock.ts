import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const IDRXPaymentMock = buildModule("IDRXPaymentMock", (m) =>{
    const idrxTokenMock = m.contract("MockIDRX"); // IDRX mock token address
    const metaTxForwarder = m.contract("MetaTxForwarder");
    
    const idrxPayment = m.contract("IDRXPayment", [idrxTokenMock, metaTxForwarder]);

    return { idrxTokenMock, metaTxForwarder, idrxPayment };
});

export default IDRXPaymentMock;
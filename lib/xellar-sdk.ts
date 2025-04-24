import { XellarSDK } from '@xellar/sdk';
 
const xellar = new XellarSDK({
   clientSecret: '14635b7fab48a95cd522bea6eec6b982614f93c38eab8efb03ed4950ee835cd5',
   env: 'sandbox',
});

export default xellar;
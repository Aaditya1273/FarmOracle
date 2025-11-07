import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'FarmOracle',
  projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: [sepolia, mainnet],
  ssr: false, // Disable SSR for Create React App
});

export const chains = [sepolia, mainnet];
import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Container,
  HStack,
  VStack,
  Heading,
  Text,
  Image,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";

import theme from "./theme";

import Button from "./components/Button";
import Card from "./components/card";
import Modal from "./components/Modal";

import Control from "./components/Control";

import "./App.css";

function App() {
  const [walletConnect, setWalletConnect] = useState([]);

  const isConnect = Boolean(walletConnect[0]);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Setup Listeners on Metamast event changes
    if (window.ethereum) {
      // Add Listener when accounts switch
      window.ethereum.on("accountsChanged", (accounts) => {
        toast({
          title: "Account Change",
          description: "Account changed. Confirm address",
          status: "info",
          duration: 5000,
          isClosable: true,
        });

        setWalletConnect(accounts);
      });
      // Do something when chain changes
      window.ethereum.on("chainChanged", (chainId) => {
        toast({
          title: "Network Change",
          description: "Log in again to switch to the new network",
          status: "info",
          duration: 5000,
          isClosable: true,
        });

        setWalletConnect([]);
      });
    } else {
      toast({
        title: "Metamask Required",
        description: "Metamask required to run this app",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [walletConnect]);

  async function loginWithMetaMask() {
    if (window.ethereum.chainId !== "0x89") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          // params: [{ chainId: "0x89" }],
          params: [{ chainId: "0x13881" }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x13881",
                  blockExplorerUrls: ["https://polygonscan.com/"],
                  chainName: "Matic Mainnet",
                  iconUrls: "",
                  nativeCurrency: {
                    name: "MATIC",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                  rpcUrls: [" https://rpc-mumbai.matic.today"],
                },
              ],
            });
          } catch (addError) {
            // handle "add" error
          }
        }
        // handle other "switch" errors
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletConnect(accounts);
    } else {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setWalletConnect(accounts);
    }
  }

  async function switchWallets() {
    if (window.ethereum) {
      onClose();
      const accounts = await window.ethereum
        .request({
          method: "wallet_requestPermissions",
          params: [
            {
              eth_accounts: {},
            },
          ],
        })
        .then(() =>
          window.ethereum.request({
            method: "eth_requestAccounts",
          })
        );
      setWalletConnect(accounts);
    }
  }

  const connect = () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
    } else {
      isConnect ? disconnect() : loginWithMetaMask();
    }
  };

  const openModal = () => {
    onOpen();
  };

  const disconnect = () => {
    console.log("disconnect");
    // onClose();
    setWalletConnect([]);
  };

  return (
    <ChakraProvider theme={theme}>
      <Box bg="#1D1E21" h="100vh">
        {/* <Modal
          onOpen={onOpen}
          onClose={onClose}
          isOpen={isOpen}
          title=""
          action={disconnect}
          actionName="disconnect"
        >
          <HStack spacing="20px" align="center" justify="center">
            <Button onClick={disconnect}>Disconnect</Button>
            <Button onClick={switchWallets}>Switch Accounts</Button>
          </HStack>
        </Modal> */}
        <Container maxW="container.xl">
          <VStack align="center" py="60px" spacing="30px">
            <Box w="100%" align="center">
              <Heading as="h1" size="xl" color="#fff" mb="15px">
                Stake your ECLA Tokens
              </Heading>
              <Box borderTop="1px solid #555b6e" w="100%" />
            </Box>

            <Box
              bg="rgba(85, 91, 110, 0.35)"
              color=""
              backdropFilter="blur(7.6px)"
              p="10px"
              w="20rem"
              align="center"
              cursor="pointer"
              borderRadius="sm"
              onClick={connect}
            >
              {isConnect ? (
                <HStack align="center" justify="center" w="100%">
                  <MetamastSvg />

                  <Text
                    bgGradient="linear(295.85deg,#0cf1e3 10.34%,#3facfc 93.54%)"
                    bgClip="text"
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    {`${walletConnect[0].slice(
                      0,
                      10
                    )}...${walletConnect[0].slice(30)}`}
                  </Text>
                </HStack>
              ) : (
                <HStack align="center" justify="center" w="100%">
                  <Image
                    src="https://peppy-sawine-4d9328.netlify.app/assets/icons/eclaWallet.svg"
                    alt=""
                    w="2.5rem"
                    h="2.5rem"
                  ></Image>

                  <Text
                    bgGradient="linear(295.85deg,#0cf1e3 10.34%,#3facfc 93.54%)"
                    bgClip="text"
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    Connect Wallet
                  </Text>
                </HStack>
              )}
            </Box>
            {isConnect ? (
              <Control walletConnect={walletConnect}></Control>
            ) : null}
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

function MetamastSvg() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      className="Button_icon__IZiil"
    >
      <path
        d="M32.6924 4.23413L20.8248 13.0483L23.0194 7.84807L32.6924 4.23413Z"
        fill="#E2761B"
        stroke="#E2761B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M5.29565 4.23413L17.0678 13.1318L14.9805 7.84807L5.29565 4.23413Z"
        fill="#E4761B"
        stroke="#E4761B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M28.4225 24.6654L25.2618 29.5078L32.0246 31.3685L33.9687 24.7727L28.4225 24.6654Z"
        fill="#E4761B"
        stroke="#E4761B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M4.04333 24.7727L5.97554 31.3685L12.7383 29.5078L9.57755 24.6654L4.04333 24.7727Z"
        fill="#E4761B"
        stroke="#E4761B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M12.3565 16.4834L10.472 19.334L17.187 19.6321L16.9485 12.4162L12.3565 16.4834Z"
        fill="#E4761B"
        stroke="#E4761B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M25.6315 16.4834L20.9799 12.3327L20.8248 19.6321L27.5279 19.334L25.6315 16.4834Z"
        fill="#E4761B"
        stroke="#E4761B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M12.7383 29.5078L16.7697 27.5398L13.2869 24.8204L12.7383 29.5078Z"
        fill="#E4761B"
        stroke="#E4761B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M21.2185 27.5398L25.2618 29.5078L24.7012 24.8204L21.2185 27.5398Z"
        fill="#E4761B"
        stroke="#E4761B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M25.2618 29.5078L21.2185 27.5399L21.5405 30.1758L21.5048 31.285L25.2618 29.5078Z"
        fill="#D7C1B3"
        stroke="#D7C1B3"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M12.7383 29.5078L16.4953 31.285L16.4715 30.1758L16.7697 27.5399L12.7383 29.5078Z"
        fill="#D7C1B3"
        stroke="#D7C1B3"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M16.5549 23.0791L13.1914 22.0891L15.5649 21.0038L16.5549 23.0791Z"
        fill="#233447"
        stroke="#233447"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M21.4331 23.0791L22.4231 21.0038L24.8085 22.0891L21.4331 23.0791Z"
        fill="#233447"
        stroke="#233447"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M12.7382 29.5078L13.3107 24.6654L9.57751 24.7727L12.7382 29.5078Z"
        fill="#CD6116"
        stroke="#CD6116"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M24.6892 24.6654L25.2617 29.5078L28.4224 24.7727L24.6892 24.6654Z"
        fill="#CD6116"
        stroke="#CD6116"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M27.5279 19.334L20.8248 19.6322L21.445 23.0791L22.435 21.0038L24.8204 22.0892L27.5279 19.334Z"
        fill="#CD6116"
        stroke="#CD6116"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M13.1914 22.0892L15.5769 21.0038L16.5549 23.0791L17.187 19.6322L10.472 19.334L13.1914 22.0892Z"
        fill="#CD6116"
        stroke="#CD6116"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M10.472 19.334L13.2869 24.8205L13.1914 22.0892L10.472 19.334Z"
        fill="#E4751F"
        stroke="#E4751F"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M24.8204 22.0892L24.7012 24.8205L27.5279 19.334L24.8204 22.0892Z"
        fill="#E4751F"
        stroke="#E4751F"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M17.1871 19.6321L16.5549 23.0791L17.3421 27.1463L17.521 21.791L17.1871 19.6321Z"
        fill="#E4751F"
        stroke="#E4751F"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M20.8248 19.6321L20.5028 21.779L20.6459 27.1463L21.4451 23.0791L20.8248 19.6321Z"
        fill="#E4751F"
        stroke="#E4751F"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M21.4451 23.0791L20.646 27.1463L21.2185 27.5398L24.7012 24.8204L24.8205 22.0891L21.4451 23.0791Z"
        fill="#F6851B"
        stroke="#F6851B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M13.1914 22.0891L13.2868 24.8204L16.7696 27.5398L17.3421 27.1463L16.5549 23.0791L13.1914 22.0891Z"
        fill="#F6851B"
        stroke="#F6851B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M21.5048 31.285L21.5405 30.1757L21.2424 29.9133H16.7458L16.4715 30.1757L16.4953 31.285L12.7383 29.5078L14.0503 30.5813L16.71 32.43H21.2781L23.9498 30.5813L25.2618 29.5078L21.5048 31.285Z"
        fill="#C0AD9E"
        stroke="#C0AD9E"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M21.2185 27.5398L20.646 27.1462H17.3421L16.7696 27.5398L16.4714 30.1757L16.7458 29.9133H21.2423L21.5405 30.1757L21.2185 27.5398Z"
        fill="#161616"
        stroke="#161616"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M33.1934 13.6208L34.2072 8.75453L32.6925 4.23413L21.2185 12.7501L25.6316 16.4833L31.8695 18.3082L33.253 16.698L32.6567 16.2687L33.6108 15.398L32.8714 14.8255L33.8255 14.0979L33.1934 13.6208Z"
        fill="#763D16"
        stroke="#763D16"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M3.79285 8.75453L4.80666 13.6208L4.16259 14.0979L5.11677 14.8255L4.38921 15.398L5.34338 16.2687L4.74702 16.698L6.11865 18.3082L12.3566 16.4833L16.7696 12.7501L5.29567 4.23413L3.79285 8.75453Z"
        fill="#763D16"
        stroke="#763D16"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M31.8694 18.3082L25.6315 16.4833L27.5279 19.3339L24.7012 24.8204L28.4225 24.7727H33.9686L31.8694 18.3082Z"
        fill="#F6851B"
        stroke="#F6851B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M12.3566 16.4833L6.11866 18.3082L4.04333 24.7727H9.57755L13.2869 24.8204L10.4721 19.3339L12.3566 16.4833Z"
        fill="#F6851B"
        stroke="#F6851B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M20.8249 19.6321L21.2185 12.7502L23.0314 7.84808H14.9806L16.7697 12.7502L17.1871 19.6321L17.3302 21.8029L17.3422 27.1463H20.646L20.6699 21.8029L20.8249 19.6321Z"
        fill="#F6851B"
        stroke="#F6851B"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}

export default App;

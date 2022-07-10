import React, { useState, useEffect } from "react";
import { Heading, Text, HStack, VStack, Spinner } from "@chakra-ui/react";
import { ethers } from "ethers";
import Button from "../Button";
import Card from "../card";

import EclaStaking from "../../abis/EclaStaking.json";
import Ecla from "../../abis/Ecla.json";

function Index({ walletConnect }) {
  const [userDetails, setUserDetails] = useState({});
  const [userRewards, setUserRewards] = useState("");
  const [userTokenBalance, setUserTokenBalance] = useState("");
  const [minStakePeriod, setMinStakePeriod] = useState("");

  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [days, setDays] = useState(0);

  useEffect(() => {
    availableRewards();
    stakerDetails();
    tokenBalance();
    calculateDuration();
  }, [walletConnect]);

  const isConnect = Boolean(walletConnect[0]);
  const eclaStaking = "0x92eeD80959Bc36e12dC4998D389be5f577526B32";
  const eclaToken = "0xd5D3dcAAAe3D9Ad0e842d6B3EF3A99f4BAef2706";

  const availableRewards = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const stakingContract = new ethers.Contract(
        eclaStaking,
        EclaStaking.abi,
        signer
      );

      const result = await stakingContract.functions.availableRewards(
        walletConnect[0]
      );
      console.log(result.toString());
      setUserRewards(result.toString());
    }
  };

  const stakerDetails = async () => {
    console.log(walletConnect[0]);
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const stakingContract = new ethers.Contract(
        eclaStaking,
        EclaStaking.abi,
        signer
      );

      // const result = await stakingContract.functions.getStakerDetails(
      //   walletConnect[0]
      // );
      const result = await stakingContract.functions.stakers(walletConnect[0]);
      console.log(result);
      setUserDetails({
        amountStaked: result[0].toString(),
        timeOfLastUpdate: result[1].toString(),
        unclaimedRewards: result[2].toString(),
      });

      const stakingPeriod = await stakingContract.minimumStakePeriod();
      console.log(stakingPeriod.toNumber() / 60 / 60 / 24);
      setMinStakePeriod(stakingPeriod.toNumber());
    }
  };

  const stake = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const tokenContract = new ethers.Contract(eclaToken, Ecla.abi, signer);
      const stakingContract = new ethers.Contract(
        eclaStaking,
        EclaStaking.abi,
        signer
      );

      // Approve the contract to spend the token
      await tokenContract.functions.approve(
        eclaStaking,
        ethers.utils.parseEther("1")
      );

      // Stake the token
      await stakingContract.functions.stake(ethers.utils.parseEther("1"));
    }
  };

  const withdraw = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
    }
  };

  const unstake = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
    }
  };

  const tokenBalance = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const tokenContract = new ethers.Contract(eclaToken, Ecla.abi, signer);

      const result = await tokenContract.balanceOf(walletConnect[0]);
      console.log(result.toString());
      setUserTokenBalance(result.toString());
    }
  };

  const calculateDuration = async () => {
    const now = new Date().getTime();
    const lastUpdate = Number(userDetails.timeOfLastUpdate) * 1000; // convert to milliseconds
    const diff = now - lastUpdate;

    const stakingDuration = Number(minStakePeriod * 1000); // convert to milliseconds
    console.log(stakingDuration);

    const dateToClaim = lastUpdate + stakingDuration;
    console.log(new Date(now), new Date(lastUpdate), new Date(dateToClaim));
    console.log(now, lastUpdate, dateToClaim - now);
    console.log(now, lastUpdate, dateToClaim);
    // Update the count down every 1 second
    let x = setInterval(function () {
      // Get today's date and time
      let now = new Date().getTime();

      // Find the distance between now and the count down date
      let distance = dateToClaim - now;

      // Time calculations for days, hours, minutes and seconds
      let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      let hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setSeconds(seconds);
      setMinutes(minutes);
      setHours(hours);
      setDays(days);

      // If the count down is finished, write some text
      // if (distance < 0) {
      //   clearInterval(x);
      //   document.getElementById("demo").innerHTML = "EXPIRED";
      // }
    }, 1000);
  };

  return (
    <>
      <HStack>
        <Card>
          <VStack align="center" justify="center">
            <Text color="#3facfc" fontSize="lg">
              Total Staked
            </Text>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
            <Heading as="h2" size="lg" color="#fff">
              {userDetails.amountStaked / 10 ** 18} ECLA
            </Heading>
          </VStack>
        </Card>
        <Card>
          <VStack align="center" justify="center">
            <Text color="#3facfc" fontSize="lg">
              Available Reward
            </Text>
            <Heading as="h2" size="lg" color="#fff">
              {userRewards} ECLA
            </Heading>
          </VStack>
        </Card>
        <Card>
          <VStack align="center" justify="center">
            <Text color="#3facfc" fontSize="lg">
              Staking Duration
            </Text>
            <Heading as="h2" size="lg" color="#fff">
              {days}D {hours}H {minutes}M {seconds}S
            </Heading>
          </VStack>
        </Card>
      </HStack>

      <HStack>
        <Button>Stake</Button>
        <Button>Withdraw</Button>
        <Button>Claim</Button>
      </HStack>

      <Heading as="h5" size="md" color="#fff">
        Token Balance : {userTokenBalance / 10 ** 18} ECLA
      </Heading>
    </>
  );
}

export default Index;

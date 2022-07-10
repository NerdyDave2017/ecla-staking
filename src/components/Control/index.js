import React, { useState, useEffect, useRef } from "react";
import {
  Heading,
  Text,
  HStack,
  VStack,
  Spinner,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import Button from "../Button";
import Card from "../card";
import Modal from "../Modal";

import EclaStaking from "../../abis/EclaStaking.json";
import Ecla from "../../abis/Ecla.json";

function Control({ walletConnect }) {
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [userRewards, setUserRewards] = useState(0);
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [minStakePeriod, setMinStakePeriod] = useState(0);

  const [stakeAmount, setStakeAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [days, setDays] = useState(0);

  useEffect(() => {
    setLoading(true);
    availableRewards();
    stakerDetails();
    tokenBalance();
    getStakingDuration();
    setLoading(false);
  }, [walletConnect]);

  useEffect(() => {
    startTimer();
    // // countdownTimer();
    return () => {
      clearInterval(interval.current);
    };
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();

  let interval = useRef();

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
      setUserRewards(parseInt(result.toString()));
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
        amountStaked: parseInt(result[0].toString()),
        timeOfLastUpdate: parseInt(result[1].toString()),
        unclaimedRewards: parseInt(result[2].toString()),
      });
    }
  };
  const getStakingDuration = async () => {
    console.log(walletConnect[0]);
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const stakingContract = new ethers.Contract(
        eclaStaking,
        EclaStaking.abi,
        signer
      );

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
      const amountToApprove = stakeAmount * 10;
      const approve = await tokenContract.functions.approve(
        eclaStaking,
        ethers.utils.parseEther(stakeAmount + `${amountToApprove}`)
      );
      if (approve) {
        // Stake the token
        const result = await stakingContract.functions.stake(
          ethers.utils.parseEther(stakeAmount)
        );
        console.log(result);
        availableRewards();
        onClose();
      }
    }
  };

  const withdraw = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const stakingContract = new ethers.Contract(
        eclaStaking,
        EclaStaking.abi,
        signer
      );

      const result = await stakingContract.functions.withdraw(
        ethers.utils.parseEther
      );
      console.log(result);
    }
  };

  const unstake = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const stakingContract = new ethers.Contract(
        eclaStaking,
        EclaStaking.abi,
        signer
      );

      const result = await stakingContract.functions.unStake();
      console.log(result);
      availableRewards();
    }
  };

  const claimRewards = async () => {
    console.log("claiming rewards");
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const stakingContract = new ethers.Contract(
        eclaStaking,
        EclaStaking.abi,
        signer
      );

      const result = await stakingContract.functions.claimRewards();
      console.log(result);
      availableRewards();
    }
  };

  const tokenBalance = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const tokenContract = new ethers.Contract(eclaToken, Ecla.abi, signer);
      const result = await tokenContract.functions.balanceOf(walletConnect[0]);
      setUserTokenBalance(parseInt(result.toString()));
    }
  };

  const startTimer = async () => {
    console.log(minStakePeriod, userDetails.timeOfLastUpdate);
    let duration = minStakePeriod * 1000;
    let dateStaked = userDetails.timeOfLastUpdate * 1000;

    let countDownDate = dateStaked + duration;
    console.log(countDownDate);
    console.log(new Date(countDownDate));

    interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance < 0) {
        // stop our timer
        clearInterval(interval.current);
      } else {
        // update timer
        setDays(days);
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);
      }
    }, 1000);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        action={stake}
        actionName="Stake"
      >
        <FormControl>
          <FormLabel>Enter Amount</FormLabel>
          <Input
            label="amount"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder=""
            type="text"
          />
        </FormControl>
      </Modal>

      <HStack>
        <Card>
          <VStack align="center" justify="center">
            <Text color="#3facfc" fontSize="lg">
              Total Staked
            </Text>
            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            ) : (
              <Heading as="h2" size="lg" color="#fff">
                {isConnect ? userDetails.amountStaked / 10 ** 18 : 0} ECLA
              </Heading>
            )}
          </VStack>
        </Card>
        <Card>
          <VStack align="center" justify="center">
            <Text color="#3facfc" fontSize="lg">
              Available Reward
            </Text>
            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            ) : (
              <Heading as="h2" size="lg" color="#fff">
                {isConnect ? userRewards / 10 ** 18 : 0} ECLA
              </Heading>
            )}
          </VStack>
        </Card>
        <Card>
          <VStack align="center" justify="center">
            <Text color="#3facfc" fontSize="lg">
              Staking Duration
            </Text>
            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            ) : (
              <Heading as="h2" size="lg" color="#fff">
                {isConnect
                  ? `${days}D ${hours}H ${minutes}M ${seconds}S`
                  : `0D 0H 0M 0S`}
              </Heading>
            )}
          </VStack>
        </Card>
      </HStack>

      <HStack>
        <Button onClick={onOpen}>Stake</Button>
        <Button onClick={unstake}>Withdraw</Button>
        <Button onClick={claimRewards}>Claim</Button>
      </HStack>

      <Heading as="h5" size="md" color="#fff">
        Token Balance : {isConnect ? userTokenBalance / 10 ** 18 : 0} ECLA
      </Heading>
    </>
  );
}

export default Control;

import React from "react";
import { Button } from "@chakra-ui/react";

function index({ children, ...props }) {
  return (
    <Button
      w="10rem"
      color="#fff"
      borderRadius="3xl"
      bgGradient="linear(295.85deg,#0cf1e3 10.34%,#3facfc 93.54%)"
      _hover={{ bg: "linear(295.85deg,#0cf1e3 10.34%,#3facfc 93.54%)" }}
      _active={{ bg: "linear(295.85deg,#0cf1e3 10.34%,#3facfc 93.54%)" }}
      {...props}
    >
      {children}
    </Button>
  );
}

export default index;

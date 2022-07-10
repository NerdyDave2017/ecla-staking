import React from "react";
import { Box } from "@chakra-ui/react";

function index({ children }) {
  return (
    <Box
      border="2px solid rgba(85, 91, 110, 0.35)"
      background="rgba(85, 91, 110, 0.35)"
      backdropFilter="blur(7.6px)"
      borderRadius="md"
      w="20rem"
      h="8.5rem"
      p="10px 15px"
    >
      {children}
    </Box>
  );
}

export default index;

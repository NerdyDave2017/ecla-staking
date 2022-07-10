import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react";

function Index({
  children,
  action,
  onOpen,
  isOpen,
  onClose,
  actionName,
  title,
}) {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="#1D1E21" color="#fff">
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{children}</ModalBody>

          <ModalFooter>
            {/* <Button
              colorScheme="blue"
              mr={3}
              onClick={onClose}
              bgGradient="linear(295.85deg,#0cf1e3 10.34%,#3facfc 93.54%)"
            >
              Close
            </Button> */}
            {action && (
              <Button
                variant="ghost"
                onClick={action}
                bgGradient="linear(295.85deg,#0cf1e3 10.34%,#3facfc 93.54%)"
                _hover={{
                  bg: "linear(295.85deg,#0cf1e3 10.34%,#3facfc 93.54%)",
                }}
                _active={{
                  bg: "linear(295.85deg,#0cf1e3 10.34%,#3facfc 93.54%)",
                }}
              >
                {actionName}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Index;

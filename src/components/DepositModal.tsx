// HybridAI/src/components/DepositModal.tsx

"use client";

import { Modal, Box, Typography, Button } from "@mui/material";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

const DepositModal = ({ open, onClose }: DepositModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 1,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Deposit Funds
        </Typography>
        <Typography variant="body1" gutterBottom>
          This feature is not yet implemented.
        </Typography>
        <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default DepositModal;

// HybridAI/src/pages/account.tsx

import { useState } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import AccountInfo from "@/components/AccountInfo";
import DepositModal from "@/components/DepositModal";
import AuthButtons from "@/components/AuthButtons";

export default function Account() {
  const [depositOpen, setDepositOpen] = useState(false);

  const handleDepositClick = () => setDepositOpen(true);
  const handleCloseDeposit = () => setDepositOpen(false);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Account Management
      </Typography>
      <AccountInfo />
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleDepositClick}>
          Deposit Funds
        </Button>
      </Box>
      <DepositModal open={depositOpen} onClose={handleCloseDeposit} />
      <Box sx={{ mt: 4 }}>
        <AuthButtons />
      </Box>
    </Container>
  );
}

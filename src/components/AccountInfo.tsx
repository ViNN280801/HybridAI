// HybridAI/src/components/AccountInfo.tsx

"use client";

import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { usePrivy } from "@privy-io/react-auth";
import useSolana from "@/hooks/useSolana";

const AccountInfo = () => {
  const { user } = usePrivy();
  const { solBalance, fetchBalance } = useSolana();

  useEffect(() => {
    if (user?.wallet?.address) {
      fetchBalance(user.wallet.address);
    }
  }, [user, fetchBalance]);

  return (
    <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
      <Typography variant="body1">
        <strong>User ID:</strong> {user?.id || "Not available"}
      </Typography>
      <Typography variant="body1">
        <strong>Wallet Address:</strong>{" "}
        {user?.wallet?.address || "Not connected"}
      </Typography>
      <Typography variant="body1">
        <strong>SOL Balance:</strong> {solBalance} SOL
      </Typography>
    </Box>
  );
};

export default AccountInfo;

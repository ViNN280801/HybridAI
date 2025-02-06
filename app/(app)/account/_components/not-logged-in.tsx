"use client";

import React from "react";

import { useLogin } from "@privy-io/react-auth";

import { Button, Card } from "@/components/ui";

const NotLoggedIn: React.FC = () => {
  const { login } = useLogin();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Card className="w-full max-w-md p-4 flex flex-col gap-4 items-center justify-center">
        <h1 className="text-2xl font-bold">Not Logged In</h1>
        <p className="text-sm text-muted-foreground">
          Please log in to view your account.
        </p>
        <Button variant="brand" onClick={() => login()}>
          Log in
        </Button>
      </Card>
    </div>
  );
};

export default NotLoggedIn;

"use client";

import React from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Logo,
} from "@/components/ui";

import { useExperimentalConfirmed } from "@/app/(app)/_hooks";

const ExperimentalAlertDialog: React.FC = () => {
  const { confirmed, confirm } = useExperimentalConfirmed();

  return (
    <AlertDialog open={!confirmed}>
      <AlertDialogHeader className="hidden">
        <AlertDialogTitle>Confirm Experimental Features</AlertDialogTitle>
        <AlertDialogDescription>
          Please confirm to continue
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogContent className="flex flex-col items-center justify-center text-center z-[100]">
        <Logo className="w-16 h-16" />
        <h1 className="text-2xl font-bold">The Hive is Experimental</h1>
        <p className="text-sm text-gray-500">
          We&apos;ve decided to build in public to gather as much feedback as
          possible.
        </p>
        <p className="text-sm text-gray-500">
          Please confirm you understand and want to continue.
        </p>
        <Button
          variant="brand"
          onClick={() => {
            confirm();
          }}
        >
          Confirm
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExperimentalAlertDialog;

import React from "react";
import Stack from "@mui/material/Stack";

export interface LayoutProps {}

export default function Layout(props: React.PropsWithChildren<LayoutProps>) {
  return (
    <React.Fragment>
      <Stack direction="column" spacing={2} padding={2}>
        {props.children}
      </Stack>
    </React.Fragment>
  );
}

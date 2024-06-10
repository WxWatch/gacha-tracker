import React from "react";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

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

function Navbar(props: React.PropsWithChildren<{ title?: React.ReactNode }>) {
  return (
    <React.Fragment>
      <AppBar
        component="nav"
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: (theme) => theme.palette.divider,
        }}
      >
        <Toolbar
          component={Stack}
          direction="row"
          maxHeight={64}
          padding={2}
          disableGutters
        >
          {props.title && (
            <Typography component="h2" variant="h6" flexGrow={1} noWrap>
              {props.title}
            </Typography>
          )}
          {props.children}
        </Toolbar>
      </AppBar>
      <Toolbar disableGutters />
    </React.Fragment>
  );
}

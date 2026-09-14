import React from "react";
import { Account, resolveAccountDisplayName } from "@/interfaces/account";
import { useSetSelectedAccountFn } from "@/hooks/useStatefulAccount";
import AccountAvatar from "@/components/account/AccountAvatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonAddIcon from "@mui/icons-material/PersonAddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { borderRadius, spacing } from "@/theme/tokens";

export interface AccountMenuDrawerProps {
  title: React.ReactNode;
  open: boolean;
  anchorEl: HTMLElement | null;
  accounts: Record<Account["uid"], Account>;
  selectedAccountUid: Account["uid"] | null;
  onClose?: () => void;
  onClickAddAccount?: IconButtonProps["onClick"];
  onClickEditAccount?: IconButtonProps["onClick"];
}

export default function AccountMenuDrawer(props: AccountMenuDrawerProps) {
  const {
    open,
    anchorEl,
    accounts,
    selectedAccountUid,
    onClose,
    onClickAddAccount,
    onClickEditAccount,
  } = props;
  const setSelectedAccount = useSetSelectedAccountFn();

  const handleSelect = React.useCallback(
    (uid: string) => {
      if (selectedAccountUid !== uid) {
        setSelectedAccount(uid);
      }
      onClose?.();
    },
    [selectedAccountUid, onClose, setSelectedAccount]
  );

  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
          minWidth: 280,
          maxWidth: 320,
          mt: 1,
          borderRadius: `${borderRadius.lg}px`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: `${spacing.md}px`,
          py: `${spacing.sm}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
          Accounts
        </Typography>
        <Tooltip title="Add Account" arrow>
          <IconButton
            onClick={(e) => {
              onClickAddAccount?.(e);
              onClose?.();
            }}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              width: 28,
              height: 28,
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
            size="small"
          >
            <PersonAddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      {/* Account List */}
      {Object.values(accounts).length === 0 ? (
        <Box sx={{ p: `${spacing.lg}px`, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No accounts yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Click + to add an account
          </Typography>
        </Box>
      ) : (
        Object.values(accounts).map((account) => {
          const isSelected = selectedAccountUid === account.uid;
          return (
            <MenuItem
              key={account.uid}
              onClick={() => handleSelect(account.uid)}
              selected={isSelected}
              sx={{
                py: `${spacing.sm}px`,
                px: `${spacing.md}px`,
                mx: `${spacing.xs}px`,
                my: `${spacing.xs}px`,
                borderRadius: `${borderRadius.md}px`,
                transition: "all 0.2s ease-out",
                "&.Mui-selected": {
                  bgcolor: "primary.50",
                  "&:hover": {
                    bgcolor: "primary.100",
                  },
                },
              }}
            >
              <ListItemAvatar sx={{ minWidth: 48 }}>
                <AccountAvatar facet={account.facet} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      fontWeight={isSelected ? 600 : 500}
                      color={isSelected ? "primary.dark" : "text.primary"}
                    >
                      {resolveAccountDisplayName(account)}
                    </Typography>
                    {isSelected && (
                      <CheckCircleIcon
                        sx={{ fontSize: 16, color: "primary.main", ml: 0.5 }}
                      />
                    )}
                  </Box>
                }
                secondary={`UID: ${account.uid}`}
                secondaryTypographyProps={{
                  fontSize: "0.75rem",
                  color: "text.secondary",
                }}
              />
              <ListItemIcon sx={{ minWidth: "auto", ml: 1 }}>
                <Tooltip title="Edit">
                  <IconButton
                    value={account.uid}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickEditAccount?.(e);
                      onClose?.();
                    }}
                    size="small"
                    sx={{
                      opacity: isSelected ? 1 : 0.6,
                      "&:hover": {
                        opacity: 1,
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItemIcon>
            </MenuItem>
          );
        })
      )}
    </Menu>
  );
}
